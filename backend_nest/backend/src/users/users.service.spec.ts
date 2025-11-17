import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

// Mockear bcrypt en el nivel superior
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;
  let configService: ConfigService;

  // Mock del modelo
  const mockUserModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUser = {
    _id: '6739f1e4b8c8d8e8f8a1b2c3',
    username: 'testuser',
    password: 'hashedPassword',
    email: 'test@example.com',
    fullName: 'Test User',
    admin: false,
    isSuperAdmin: false,
    cellPhone: '+1234567890',
    mustChangePassword: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Configurar bcrypt mock
    (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>)
      .mockResolvedValue('hashed_test_password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
        fullName: 'New User',
        cellPhone: '+1234567890',
      };

      mockConfigService.get.mockReturnValue(10);
      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(null);
      
      // Simular la creación exitosa
      const createdUser = {
        ...mockUser,
        ...createUserDto,
        password: 'hashed_test_password',
        toObject: jest.fn().mockReturnValue({
          ...mockUser,
          ...createUserDto,
          password: undefined,
        }),
      };
      userModel.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result.username).toBe('newuser');
      expect(result.email).toBe('newuser@example.com');
      // Verificar que bcrypt.hash ha sido llamado
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed_test_password',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
      });
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
      };

      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should set default values correctly', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
      };

      mockConfigService.get.mockReturnValue(10);
      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(null);
      
      // Simular la creación exitosa
      const createdUser = {
        ...mockUser,
        ...createUserDto,
        password: 'hashed_test_password',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
        toObject: jest.fn().mockReturnValue({
          ...mockUser,
          ...createUserDto,
          password: undefined,
          admin: false,
          isSuperAdmin: false,
          mustChangePassword: true,
        }),
      };
      userModel.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result.admin).toBe(false);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.mustChangePassword).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [
        {
          ...mockUser,
          toObject: jest.fn().mockReturnValue({ ...mockUser, password: undefined })
        },
        {
          ...mockUser,
          _id: '6739f1e4b8c8d8e8f8a1b2c4',
          username: 'user2',
          toObject: jest.fn().mockReturnValue({ ...mockUser, _id: '6739f1e4b8c8d8e8f8a1b2c4', username: 'user2', password: undefined })
        }
      ];
      
      userModel.find.mockReturnThis();
      userModel.exec.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findById', () => {
    it('should return a user by ID without password', async () => {
      const resultUser = {
        ...mockUser,
        toObject: jest.fn().mockReturnValue({
          ...mockUser,
          password: undefined
        })
      };
      
      userModel.findById.mockReturnThis();
      userModel.exec.mockResolvedValue(resultUser);

      const result = await service.findById('6739f1e4b8c8d8e8f8a1b2c3');

      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('testuser');
    });

    it('should return null if user not found', async () => {
      userModel.findById.mockReturnThis();
      userModel.exec.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found by username', async () => {
      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
        email: 'updated@example.com'
      };

      userModel.findById.mockReturnThis();
      userModel.exec.mockResolvedValue(mockUser);
      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(null); // No conflict with other users
      userModel.findByIdAndUpdate.mockReturnThis();
      
      const updatedUser = { 
        ...mockUser, 
        fullName: 'Updated Name', 
        email: 'updated@example.com',
        toObject: jest.fn().mockReturnValue({
          ...mockUser, 
          fullName: 'Updated Name', 
          email: 'updated@example.com',
          password: undefined
        })
      };
      userModel.exec.mockResolvedValue(updatedUser);

      const result = await service.update('6739f1e4b8c8d8e8f8a1b2c3', updateUserDto);

      expect(result.fullName).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userModel.findById.mockReturnThis();
      userModel.exec.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as UpdateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if username is already in use by another user', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'existinguser'
      };

      userModel.findById.mockReturnThis();
      userModel.exec.mockResolvedValue(mockUser);
      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(mockUser); // Found existing user with this username

      await expect(service.update('6739f1e4b8c8d8e8f8a1b2c3', updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should hash password when updating', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword123'
      };

      userModel.findById.mockReturnThis();
      userModel.exec.mockResolvedValue(mockUser);
      userModel.findOne.mockReturnThis();
      userModel.exec.mockResolvedValue(null); // No conflict
      mockConfigService.get.mockReturnValue(10);
      userModel.findByIdAndUpdate.mockReturnThis();
      
      const updatedUser = { 
        ...mockUser, 
        password: 'hashed_test_password',
        toObject: jest.fn().mockReturnValue({
          ...mockUser, 
          password: undefined
        })
      };
      userModel.exec.mockResolvedValue(updatedUser);

      const result = await service.update('6739f1e4b8c8d8e8f8a1b2c3', updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      userModel.findByIdAndDelete.mockReturnThis();
      userModel.exec.mockResolvedValue(mockUser);

      const result = await service.remove('6739f1e4b8c8d8e8f8a1b2c3');

      expect(result).toBe(true);
    });

    it('should return false if user not found for deletion', async () => {
      userModel.findByIdAndDelete.mockReturnThis();
      userModel.exec.mockResolvedValue(null);

      const result = await service.remove('nonexistent');

      expect(result).toBe(false);
    });
  });
});