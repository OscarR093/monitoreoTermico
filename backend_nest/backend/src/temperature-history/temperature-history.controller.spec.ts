import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TemperatureHistoryController } from './temperature-history.controller';
import { TemperatureHistoryService } from './temperature-history.service';

describe('TemperatureHistoryController', () => {
  let controller: TemperatureHistoryController;
  let service: TemperatureHistoryService;

  const mockTemperatureHistory = {
    _id: 'someId',
    timestamp: new Date(),
    temperatura: 725.5,
    equipo: 'Torre Fusora',
  };

  const mockStats = {
    count: 150,
    avgTemperature: 725.50,
    minTemperature: 700.2,
    maxTemperature: 750.8,
    lastReading: new Date(),
  };

  const mockService = {
    getHistory: jest.fn(),
    findByFilters: jest.fn(),
    findByEquipment: jest.fn(),
    getUniqueEquipmentList: jest.fn(),
    getEquipmentStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemperatureHistoryController],
      providers: [
        {
          provide: TemperatureHistoryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TemperatureHistoryController>(TemperatureHistoryController);
    service = module.get<TemperatureHistoryService>(TemperatureHistoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHistory', () => {
    it('should return temperature history with filters', async () => {
      const getHistoryDto = { equipment: 'Torre Fusora', limit: 50, sort: -1 };
      const mockHistories = [mockTemperatureHistory];

      mockService.getHistory.mockResolvedValue(mockHistories as any);

      const result = await controller.getHistory(getHistoryDto);
      expect(result).toEqual(mockHistories);
      expect(service.getHistory).toHaveBeenCalledWith(getHistoryDto);
    });
  });

  describe('getFilteredHistory', () => {
    it('should return filtered temperature history', async () => {
      const filterDto = {
        equipment: 'Torre Fusora',
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        minTemperature: 700,
        maxTemperature: 800,
        limit: 100,
      };
      const mockHistories = [mockTemperatureHistory];

      mockService.findByFilters.mockResolvedValue(mockHistories as any);

      const result = await controller.getFilteredHistory(filterDto);
      expect(result).toEqual(mockHistories);
      expect(service.findByFilters).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('getHistoryByEquipment', () => {
    it('should return temperature history for a specific equipment', async () => {
      const equipmentName = 'Torre Fusora';
      const mockHistories = [mockTemperatureHistory];

      mockService.findByEquipment.mockResolvedValue(mockHistories as any);

      const result = await controller.getHistoryByEquipment(equipmentName);
      expect(result).toEqual(mockHistories);
      expect(service.findByEquipment).toHaveBeenCalledWith(equipmentName, undefined);
    });

    it('should return temperature history with limit', async () => {
      const equipmentName = 'Torre Fusora';
      const limit = '10';
      const mockHistories = [mockTemperatureHistory];

      mockService.findByEquipment.mockResolvedValue(mockHistories as any);

      const result = await controller.getHistoryByEquipment(equipmentName, limit);
      expect(result).toEqual(mockHistories);
      expect(service.findByEquipment).toHaveBeenCalledWith(equipmentName, 10);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      const equipmentName = 'Torre Fusora';
      const invalidLimit = 'invalid';

      await expect(controller.getHistoryByEquipment(equipmentName, invalidLimit))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when no records found', async () => {
      const equipmentName = 'NonExistentEquipment';
      mockService.findByEquipment.mockResolvedValue([]);

      await expect(controller.getHistoryByEquipment(equipmentName))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getEquipmentList', () => {
    it('should return list of unique equipment names', async () => {
      const mockEquipmentList = ['Torre Fusora', 'Linea 1', 'Linea 2'];
      mockService.getUniqueEquipmentList.mockResolvedValue(mockEquipmentList);

      const result = await controller.getEquipmentList();
      expect(result).toEqual(mockEquipmentList);
      expect(service.getUniqueEquipmentList).toHaveBeenCalled();
    });
  });

  describe('getEquipmentStats', () => {
    it('should return statistics for a specific equipment', async () => {
      const equipmentName = 'Torre Fusora';
      mockService.getEquipmentStats.mockResolvedValue(mockStats);

      const result = await controller.getEquipmentStats(equipmentName);
      expect(result).toEqual(mockStats);
      expect(service.getEquipmentStats).toHaveBeenCalledWith(equipmentName);
    });

    it('should throw NotFoundException when no records found for equipment', async () => {
      const equipmentName = 'NonExistentEquipment';
      mockService.getEquipmentStats.mockResolvedValue({
        count: 0,
        avgTemperature: 0,
        minTemperature: 0,
        maxTemperature: 0,
        lastReading: null,
      });

      await expect(controller.getEquipmentStats(equipmentName))
        .rejects.toThrow(NotFoundException);
    });
  });
});