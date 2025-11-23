import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        fullName: 'Test User',
        cellPhone: '+1234567890',
      };

      const mockRequest = {
        user: { userId: 'adminId', admin: true }
      };

      const expectedResult = {
        _id: '6739f1e4b8c8d8e8f8a1b2c3',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        cellPhone: '+1234567890',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult as any);

      const result = await controller.create(createUserDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto, { admin: false, isSuperAdmin: false });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedUsers = [
        {
          _id: '6739f1e4b8c8d8e8f8a1b2c3',
          username: 'user1',
          email: 'user1@example.com',
          fullName: 'User One',
          cellPhone: '+1234567890',
          admin: false,
          isSuperAdmin: false,
          mustChangePassword: true,
        },
        {
          _id: '6739f1e4b8c8d8e8f8a1b2c4',
          username: 'user2',
          email: 'user2@example.com',
          fullName: 'User Two',
          cellPhone: '+0987654321',
          admin: true,
          isSuperAdmin: false,
          mustChangePassword: false,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedUsers as any);

      const result = await controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });



  describe('updateLegacy', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockRequest = {
        user: { _id: '6739f1e4b8c8d8e8f8a1b2c3', admin: true }
      };

      const expectedUser = {
        _id: '6739f1e4b8c8d8e8f8a1b2c3',
        username: 'testuser',
        email: 'updated@example.com',
        fullName: 'Updated Name',
        cellPhone: '+1234567890',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedUser as any);

      const result = await controller.updateLegacy('6739f1e4b8c8d8e8f8a1b2c3', updateUserDto, mockRequest);

      expect(result).toEqual(expectedUser);
      expect(service.update).toHaveBeenCalledWith('6739f1e4b8c8d8e8f8a1b2c3', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockRequest = {
        user: { _id: 'adminId', admin: true, isSuperAdmin: true }
      };

      const mockUser = {
        _id: '6739f1e4b8c8d8e8f8a1b2c3',
        username: 'testuser',
        isSuperAdmin: false,
      };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'remove').mockResolvedValue(true);

      await controller.remove('6739f1e4b8c8d8e8f8a1b2c3', mockRequest);

      expect(service.remove).toHaveBeenCalledWith('6739f1e4b8c8d8e8f8a1b2c3');
    });

    it('should throw error if user not found for deletion', async () => {
      const mockRequest = {
        user: { _id: 'adminId', admin: true, isSuperAdmin: true }
      };

      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(controller.remove('nonexistent', mockRequest)).rejects.toThrow();
    });
  });
});