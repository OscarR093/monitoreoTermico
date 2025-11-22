import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mockear bcrypt para evitar problemas con múltiples tests
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUsersService = {
      findByUsername: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      const mockUser = {
        _id: 'userId',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedPassword',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
      };

      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true as never);
      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'testpass');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('testuser', { lean: true });
      expect(bcrypt.compare).toHaveBeenCalledWith('testpass', 'hashedPassword');
      expect(result).toEqual({
        _id: 'userId',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
      });
      expect((result as any).password).toBeUndefined();
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('nonexistent', { lean: true });
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser = {
        username: 'testuser',
        password: 'hashedPassword',
      };

      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(false as never);
      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'wrongpass');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpass', 'hashedPassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const mockUser = {
        _id: 'userId',
        username: 'testuser',
        email: 'test@example.com',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: false,
      };

      mockJwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'userId',
        username: 'testuser',
      });
      expect(result).toEqual({
        access_token: 'fake-jwt-token',
      });
    });
  });
});
