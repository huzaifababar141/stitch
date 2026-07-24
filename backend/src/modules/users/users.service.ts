import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '../../config/database';
import config from '../../config';
import { AppError } from '../../shared/errors/AppError';
import { UpdateProfileInput, CreateAddressInput, UpdateAddressInput } from './users.validator';

// Configure Cloudinary if credentials are present
if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
}

export class UsersService {
  /**
   * Get user profile along with default address and measurement profiles
   */
  async getProfile(userId: string) {
    const user = await db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerified: true,
        emailVerified: true,
        role: true,
        firstName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        profileImageUrl: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          where: { deletedAt: null },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
        measurementProfiles: {
          where: { isDefault: true },
          select: { id: true, label: true, isDefault: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User profile not found');
    }

    return user;
  }

  /**
   * Update user basic profile information
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await db.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    const updatePayload: Record<string, any> = {};
    if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
    if (data.gender !== undefined) updatePayload.gender = data.gender;
    if (data.dateOfBirth !== undefined) {
      updatePayload.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updatePayload,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        profileImageUrl: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Upload & process profile image with Sharp (400x400 WebP) and store via Cloudinary/DataURI
   */
  async uploadProfileImage(userId: string, fileBuffer: Buffer, mimeType: string) {
    const user = await db.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Process image with Sharp: Resize to 400x400 cover and encode to WebP format
    const processedBuffer = await sharp(fileBuffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    let imageUrl: string;

    const isCloudinaryConfigured = Boolean(
      config.CLOUDINARY_CLOUD_NAME &&
      config.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
      config.CLOUDINARY_CLOUD_NAME !== 'demo' &&
      config.CLOUDINARY_API_KEY &&
      config.CLOUDINARY_API_SECRET
    );

    if (isCloudinaryConfigured) {
      imageUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile-images',
            public_id: `user_${userId}_${Date.now()}`,
            resource_type: 'image',
            format: 'webp',
          },
          (error, result) => {
            if (error || !result) {
              return reject(AppError.internal('Cloudinary image upload failed'));
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(processedBuffer);
      });
    } else {
      // Fallback for local development when Cloudinary is unconfigured
      const base64Image = processedBuffer.toString('base64');
      imageUrl = `data:image/webp;base64,${base64Image}`;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageUrl },
      select: {
        id: true,
        profileImageUrl: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * List all active (non-deleted) addresses for a user, default address first
   */
  async listAddresses(userId: string) {
    return db.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Create a new address for user
   */
  async createAddress(userId: string, data: CreateAddressInput) {
    return db.$transaction(async (tx) => {
      const existingCount = await tx.address.count({
        where: { userId, deletedAt: null },
      });

      // If user has no existing address or isDefault is true, set as default
      const shouldBeDefault = existingCount === 0 || data.isDefault === true;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await tx.address.create({
        data: {
          userId,
          label: data.label ?? null,
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 ?? null,
          landmark: data.landmark ?? null,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode ?? null,
          country: data.country ?? 'Pakistan',
          isDefault: shouldBeDefault,
        },
      });

      return address;
    });
  }

  /**
   * Update an existing address belonging to user
   */
  async updateAddress(userId: string, addressId: string, data: UpdateAddressInput) {
    const existing = await db.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!existing) {
      throw AppError.notFound('Address not found');
    }

    return db.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const updated = await tx.address.update({
        where: { id: addressId },
        data: {
          ...(data.label !== undefined && { label: data.label }),
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
          ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
          ...(data.landmark !== undefined && { landmark: data.landmark }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.province !== undefined && { province: data.province }),
          ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
          ...(data.country !== undefined && { country: data.country }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        },
      });

      return updated;
    });
  }

  /**
   * Soft delete an address and promote next address to default if deleted address was default
   */
  async deleteAddress(userId: string, addressId: string) {
    const existing = await db.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!existing) {
      throw AppError.notFound('Address not found');
    }

    return db.$transaction(async (tx) => {
      // Soft delete address
      await tx.address.update({
        where: { id: addressId },
        data: {
          deletedAt: new Date(),
          isDefault: false,
        },
      });

      // If deleted address was default, set next available address as default
      if (existing.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return { message: 'Address deleted successfully' };
    });
  }

  /**
   * Explicitly set an address as default for the user
   */
  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await db.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!existing) {
      throw AppError.notFound('Address not found');
    }

    return db.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      const updated = await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      return updated;
    });
  }
}

export const usersService = new UsersService();
