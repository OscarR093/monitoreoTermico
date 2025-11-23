import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  const mockUsersService = {
    findAll: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getEnv', () => {
    it('should return environment variables', () => {
      const result = appController.getEnv();
      expect(result).toHaveProperty('APP_ENV');
      expect(result).toHaveProperty('WS_HOST');
    });
  });
});
