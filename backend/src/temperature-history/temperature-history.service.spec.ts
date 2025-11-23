import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TemperatureHistoryService } from './temperature-history.service';
import { TemperatureHistory } from './schemas/temperature-history.schema';
import { AlertsService } from '../alerts/alerts.service';

describe('TemperatureHistoryService', () => {
  let service: TemperatureHistoryService;
  let model: Model<TemperatureHistory>;
  let alertsService: AlertsService;

  const mockTemperatureHistory = {
    _id: 'someId',
    timestamp: new Date(),
    temperatura: 725.5,
    equipo: 'Torre Fusora',
    save: jest.fn().mockReturnThis(),
  };

  const mockModel = {
    // Mock para métodos estáticos
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
    create: jest.fn(),
    distinct: jest.fn(),
    aggregate: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockAlertsService = {
    checkAndNotify: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemperatureHistoryService,
        {
          provide: getModelToken(TemperatureHistory.name),
          useValue: mockModel,
        },
        {
          provide: AlertsService,
          useValue: mockAlertsService,
        },
      ],
    }).compile();

    service = module.get<TemperatureHistoryService>(TemperatureHistoryService);
    model = module.get<Model<TemperatureHistory>>(getModelToken(TemperatureHistory.name));
    alertsService = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveTemperatureReading', () => {
    it('should save a temperature reading', async () => {
      const mockNewReading = {
        ...mockTemperatureHistory,
        timestamp: new Date(),
        temperatura: 730.2,
        equipo: 'Linea 1',
      };

      jest.spyOn(model, 'create').mockResolvedValueOnce(mockNewReading as any);

      const result = await service.saveTemperatureReading('Linea 1', 730.2);
      expect(result).toEqual(mockNewReading);
      expect(model.create).toHaveBeenCalledWith({
        timestamp: expect.any(Date),
        temperatura: 730.2,
        equipo: 'Linea 1',
      });
    });
  });

  describe('findByEquipment', () => {
    it('should find temperature histories by equipment', async () => {
      const mockHistories = [mockTemperatureHistory];
      mockModel.find.mockReturnThis();
      mockModel.exec.mockResolvedValueOnce(mockHistories);

      const result = await service.findByEquipment('Torre Fusora');
      expect(result).toEqual(mockHistories);
      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ equipo: 'Torre Fusora' }),
        null,
        expect.objectContaining({ sort: { timestamp: -1 }, select: 'temperatura timestamp -_id' })
      );
    });

    it('should find temperature histories by equipment with limit', async () => {
      const mockHistories = [mockTemperatureHistory];
      mockModel.find.mockReturnThis();
      mockModel.exec.mockResolvedValueOnce(mockHistories);

      const result = await service.findByEquipment('Torre Fusora', 10);
      expect(result).toEqual(mockHistories);
      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ equipo: 'Torre Fusora' }),
        null,
        expect.objectContaining({ sort: { timestamp: -1 }, limit: 10, select: 'temperatura timestamp -_id' })
      );
    });
  });

  describe('findByFilters', () => {
    it('should find temperature histories by filters', async () => {
      const mockHistories = [mockTemperatureHistory];
      const filterDto = {
        equipment: 'Torre Fusora',
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        minTemperature: 700,
        maxTemperature: 800,
        limit: 100,
      };

      mockModel.find.mockReturnThis();
      mockModel.exec.mockResolvedValueOnce(mockHistories);

      const result = await service.findByFilters(filterDto);
      expect(result).toEqual(mockHistories);
    });
  });

  describe('getEquipmentStats', () => {
    it('should return equipment statistics', async () => {
      const mockStats = [{
        _id: 'Torre Fusora',
        count: 150,
        avgTemperature: 725.5,
        minTemperature: 700.2,
        maxTemperature: 750.8,
        lastReading: new Date(),
      }];

      mockModel.aggregate.mockReturnThis();
      mockModel.exec.mockResolvedValueOnce(mockStats);

      const result = await service.getEquipmentStats('Torre Fusora');
      expect(result).toEqual({
        count: 150,
        avgTemperature: 725.50,
        minTemperature: 700.2,
        maxTemperature: 750.8,
        lastReading: mockStats[0].lastReading,
      });
    });

    it('should return zero values when no stats found', async () => {
      mockModel.aggregate.mockReturnThis();
      mockModel.exec.mockResolvedValueOnce([]);

      const result = await service.getEquipmentStats('NonExistentEquipment');
      expect(result).toEqual({
        count: 0,
        avgTemperature: 0,
        minTemperature: 0,
        maxTemperature: 0,
        lastReading: null,
      });
    });
  });
});