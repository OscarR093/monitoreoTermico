import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

// Mockear bcrypt para evitar problemas con múltiples tests
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;
  let mockConfigService: any;

  beforeEach(async () => {
    // Mockear el modelo de usuario para que funcione como constructor
    const mockUserInstance = {
      save: jest.fn(),
    };

    mockUserModel = jest.fn().mockImplementation((userData) => {
      return {
        ...userData,
        save: jest.fn().mockResolvedValue({ ...userData, _id: 'testId' }),
      };
    });

    mockUserModel.findOne = jest.fn();
    mockUserModel.findById = jest.fn();

    mockConfigService = {
      get: jest.fn().mockReturnValue(10), // valor por defecto para salt rounds
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user with encrypted password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'testpass',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      // Simular que no existe un usuario con el mismo email/username
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        $or: [
          { username: 'testuser' },
          { email: 'test@example.com' },
        ],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('testpass', 10);
      expect(result.username).toBe('testuser');
      expect(result.password).toBe('hashedPassword');
      expect(result.admin).toBe(false);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.mustChangePassword).toBe(true);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'testpass',
        email: 'existing@example.com',
        fullName: 'Existing User',
      };

      // Simular que ya existe un usuario
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          username: 'existinguser',
          email: 'existing@example.com',
        }),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Usuario o email ya existe',
      );
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = { username: 'testuser', email: 'test@example.com' };
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByUsername('testuser');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(result).toEqual(mockUser);
    });

    it('should return lean user when lean option is enabled', async () => {
      const mockUser = { username: 'testuser', email: 'test@example.com' };
      mockUserModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByUsername('testuser', { lean: true });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = { _id: 'someId', username: 'testuser', email: 'test@example.com' };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById('someId');
      expect(mockUserModel.findById).toHaveBeenCalledWith('someId');
      expect(result).toEqual(mockUser);
    });
  });
});

