import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockUsersService: any;

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
      setCookieToken: jest.fn(),
    };

    mockUsersService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'testpass',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const createdUser = {
        _id: 'userId',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedPassword', // This will be removed in the response
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
      };

      mockUsersService.create.mockResolvedValue({
        toObject: jest.fn().mockReturnValue(createdUser),
      });

      const result = await controller.register(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
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
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto = { username: 'testuser', password: 'testpass' };
      const mockUser = { username: 'testuser', email: 'test@example.com' };
      const mockToken = { access_token: 'jwt-token' };
      
      // Mock del objeto de respuesta
      const mockResponse = {
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await controller.login(loginDto, mockResponse);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith('testuser', 'testpass');
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(mockAuthService.setCookieToken).toHaveBeenCalledWith(mockResponse, 'jwt-token');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpass' };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow('Credenciales inválidas');
    });
  });
});
