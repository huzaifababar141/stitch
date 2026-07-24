import { measurementsService } from './measurements.service';
import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

// Mock Prisma DB client methods
jest.mock('../../config/database', () => ({
  db: {
    measurementProfile: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(db)),
  },
}));

describe('Measurements Module — Service Tests', () => {
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockProfileId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of measurement profiles for user, default first', async () => {
      const mockProfiles = [
        { id: '1', label: 'Default Fit', isDefault: true },
        { id: '2', label: 'Slim Fit', isDefault: false },
      ];
      (db.measurementProfile.findMany as jest.Mock).mockResolvedValue(mockProfiles);

      const result = await measurementsService.list(mockUserId);
      expect(result).toEqual(mockProfiles);
      expect(db.measurementProfile.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, deletedAt: null },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });

  describe('getById', () => {
    it('should return measurement profile if found and owned by user', async () => {
      const mockProfile = { id: mockProfileId, userId: mockUserId, label: 'Custom Kameez' };
      (db.measurementProfile.findFirst as jest.Mock).mockResolvedValue(mockProfile);

      const result = await measurementsService.getById(mockUserId, mockProfileId);
      expect(result).toEqual(mockProfile);
    });

    it('should throw notFound error if profile does not exist or deleted', async () => {
      (db.measurementProfile.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(measurementsService.getById(mockUserId, mockProfileId)).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create measurement profile and auto-set default if first profile', async () => {
      (db.measurementProfile.count as jest.Mock).mockResolvedValue(0);
      (db.measurementProfile.create as jest.Mock).mockResolvedValue({
        id: mockProfileId,
        userId: mockUserId,
        label: 'My Measurements',
        isDefault: true,
      });

      const input = {
        label: 'My Measurements',
        chest: 40,
        waist: 34,
        hips: 42,
      };

      const result = await measurementsService.create(mockUserId, input);
      expect(result.isDefault).toBe(true);
      expect(db.measurementProfile.create).toHaveBeenCalled();
    });

    it('should unset previous defaults if isDefault=true requested', async () => {
      (db.measurementProfile.count as jest.Mock).mockResolvedValue(2);
      (db.measurementProfile.create as jest.Mock).mockResolvedValue({
        id: mockProfileId,
        isDefault: true,
      });

      const input = {
        label: 'New Default',
        isDefault: true,
        chest: 42,
      };

      await measurementsService.create(mockUserId, input);
      expect(db.measurementProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true },
        data: { isDefault: false },
      });
    });
  });

  describe('update', () => {
    it('should update profile, increment version and track previousVersionId', async () => {
      const existingProfile = { id: mockProfileId, userId: mockUserId, version: 1 };
      (db.measurementProfile.findFirst as jest.Mock).mockResolvedValue(existingProfile);
      (db.measurementProfile.update as jest.Mock).mockResolvedValue({
        id: mockProfileId,
        chest: 44,
        version: 2,
        previousVersionId: mockProfileId,
      });

      const result = await measurementsService.update(mockUserId, mockProfileId, { chest: 44 });
      expect(result.version).toBe(2);
      expect(db.measurementProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: 2, previousVersionId: mockProfileId }),
        })
      );
    });
  });

  describe('delete', () => {
    it('should soft delete profile and set next available as default if deleted was default', async () => {
      const existingProfile = { id: mockProfileId, userId: mockUserId, isDefault: true };
      (db.measurementProfile.findFirst as jest.Mock)
        .mockResolvedValueOnce(existingProfile) // getById call
        .mockResolvedValueOnce({ id: '33333333-3333-3333-3333-333333333333' }); // nextProfile call

      const result = await measurementsService.delete(mockUserId, mockProfileId);
      expect(db.measurementProfile.update).toHaveBeenCalledWith({
        where: { id: mockProfileId },
        data: { deletedAt: expect.any(Date), isDefault: false },
      });
      expect(result.message).toBe('Measurement profile deleted successfully');
    });
  });

  describe('setDefault', () => {
    it('should swap defaults in transaction', async () => {
      (db.measurementProfile.findFirst as jest.Mock).mockResolvedValue({ id: mockProfileId, userId: mockUserId });
      (db.measurementProfile.update as jest.Mock).mockResolvedValue({ id: mockProfileId, isDefault: true });

      const result = await measurementsService.setDefault(mockUserId, mockProfileId);
      expect(db.measurementProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true },
        data: { isDefault: false },
      });
      expect(result.isDefault).toBe(true);
    });
  });

  describe('validateWithAI', () => {
    it('should calculate anomaly score and update aiFlags on profile', async () => {
      const mockProfile = {
        id: mockProfileId,
        chest: 36,
        waist: 55, // unusually larger than chest (triggers flag)
        hips: 40,
        shoulderWidth: 38,
      };

      (db.measurementProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (db.measurementProfile.update as jest.Mock).mockResolvedValue({
        id: mockProfileId,
        aiValidatedAt: new Date(),
      });

      const result = await measurementsService.validateWithAI(mockProfileId);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(1.0);
      expect(db.measurementProfile.update).toHaveBeenCalled();
    });

    it('should return perfect score 1.0 for normal proportions', async () => {
      const mockNormalProfile = {
        id: mockProfileId,
        chest: 40,
        waist: 34,
        hips: 42,
        shoulderWidth: 18,
      };

      (db.measurementProfile.findUnique as jest.Mock).mockResolvedValue(mockNormalProfile);
      (db.measurementProfile.update as jest.Mock).mockResolvedValue({
        id: mockProfileId,
        aiValidatedAt: new Date(),
      });

      const result = await measurementsService.validateWithAI(mockProfileId);
      expect(result.flags.length).toBe(0);
      expect(result.score).toBe(1.0);
    });
  });
});
