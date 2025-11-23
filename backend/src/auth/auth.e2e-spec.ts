import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/auth/register -> /auth/login', async () => {
    const user = { username: 'testuser', password: '123456', email: 't@t.com', fullName: 'Test User' };

    await request(app.getHttpServer()).post('/auth/register').send(user).expect(201);

    const login = await request(app.getHttpServer()).post('/auth/login').send({
      username: 'testuser', password: '123456'
    }).expect(201);

    expect(login.body.access_token).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});

