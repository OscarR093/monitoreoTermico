import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TemperatureHistory, TemperatureHistorySchema } from '../../src/temperature-history/schemas/temperature-history.schema';

describe('TemperatureHistoryController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forFeature([
          { name: TemperatureHistory.name, schema: TemperatureHistorySchema }
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/temperature-history (POST)', async () => {
    const createHistoryDto = {
      timestamp: new Date().toISOString(),
      temperatura: 725.5,
      equipo: 'Torre Fusora',
    };

    return request(app.getHttpServer())
      .post('/temperature-history')
      .send(createHistoryDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('_id');
        expect(res.body.timestamp).toEqual(createHistoryDto.timestamp);
        expect(res.body.temperatura).toEqual(createHistoryDto.temperatura);
        expect(res.body.equipo).toEqual(createHistoryDto.equipo);
      });
  });

  it('/temperature-history (GET)', async () => {
    return request(app.getHttpServer())
      .get('/temperature-history')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  it('/temperature-history/equipment-list (GET)', async () => {
    return request(app.getHttpServer())
      .get('/temperature-history/equipment-list')
      .expect(200)
      .expect('Content-Type', /json/);
  });
});