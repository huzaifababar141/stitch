import { usersService } from './users.service';
import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

// Mock Prisma DB client methods
jest.mock('../../config/database', () => ({
  db: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    address: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(db)),
  },
}));

describe('Users Module — Service Tests', () => {
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockAddressId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile if user exists', async () => {
      const mockUserData = {
        id: mockUserId,
        email: 'user@example.com',
        phone: '+923001234567',
        firstName: 'Huzaifa',
        lastName: 'Babar',
        addresses: [],
      };

      (db.user.findFirst as jest.Mock).mockResolvedValue(mockUserData);

      const result = await usersService.getProfile(mockUserId);
      expect(result).toEqual(mockUserData);
      expect(db.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockUserId, deletedAt: null } })
      );
    });

    it('should throw notFound error if user does not exist', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(usersService.getProfile(mockUserId)).rejects.toThrow(AppError);
    });
  });

  describe('updateProfile', () => {
    it('should update user first_name, last_name, gender, date_of_birth', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({ id: mockUserId });
      (db.user.update as jest.Mock).mockResolvedValue({
        id: mockUserId,
        firstName: 'UpdatedName',
        lastName: 'UpdatedLast',
        gender: 'male',
      });

      const updateData = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLast',
        gender: 'male' as const,
      };

      const result = await usersService.updateProfile(mockUserId, updateData);

      expect(result.firstName).toBe('UpdatedName');
      expect(db.user.update).toHaveBeenCalled();
    });
  });

  describe('createAddress', () => {
    it('should create address and automatically set default if first address', async () => {
      (db.address.count as jest.Mock).mockResolvedValue(0);
      (db.address.create as jest.Mock).mockResolvedValue({
        id: mockAddressId,
        userId: mockUserId,
        fullName: 'Huzaifa',
        isDefault: true,
      });

      const addressData = {
        fullName: 'Huzaifa',
        phone: '+923001234567',
        addressLine1: 'Main Boulevard',
        city: 'Lahore',
        province: 'Punjab',
      };

      const result = await usersService.createAddress(mockUserId, addressData);

      expect(result.isDefault).toBe(true);
      expect(db.address.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isDefault: true }),
        })
      );
    });
  });

  describe('listAddresses', () => {
    it('should list all active non-deleted addresses default first', async () => {
      const mockAddresses = [
        { id: '1', isDefault: true },
        { id: '2', isDefault: false },
      ];

      (db.address.findMany as jest.Mock).mockResolvedValue(mockAddresses);

      const result = await usersService.listAddresses(mockUserId);
      expect(result).toHaveLength(2);
      expect(db.address.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, deletedAt: null },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });

  describe('setDefaultAddress', () => {
    it('should unset all defaults and set targeted address as default', async () => {
      (db.address.findFirst as jest.Mock).mockResolvedValue({
        id: mockAddressId,
        userId: mockUserId,
      });
      (db.address.update as jest.Mock).mockResolvedValue({
        id: mockAddressId,
        isDefault: true,
      });

      const result = await usersService.setDefaultAddress(mockUserId, mockAddressId);

      expect(db.address.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true },
        data: { isDefault: false },
      });
      expect(result.isDefault).toBe(true);
    });
  });

  describe('deleteAddress', () => {
    it('should soft delete address and promote next address to default if deleted was default', async () => {
      (db.address.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: mockAddressId, userId: mockUserId, isDefault: true })
        .mockResolvedValueOnce({ id: '33333333-3333-3333-3333-333333333333' }); // Next address

      const result = await usersService.deleteAddress(mockUserId, mockAddressId);

      expect(db.address.update).toHaveBeenCalledWith({
        where: { id: mockAddressId },
        data: expect.objectContaining({ isDefault: false }),
      });
      expect(result.message).toBe('Address deleted successfully');
    });
  });
});
