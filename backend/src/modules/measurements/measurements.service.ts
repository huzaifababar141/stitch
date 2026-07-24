import { Prisma } from '@prisma/client';
import { db } from '../../config/database';
import config from '../../config';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../config/logger';
import { CreateMeasurementInput, UpdateMeasurementInput } from './measurements.validator';

export class MeasurementsService {
  /**
   * Helper to convert number to Prisma Decimal or null
   */
  private toDecimal(val: number | null | undefined): Prisma.Decimal | null | undefined {
    if (val === undefined) return undefined;
    if (val === null) return null;
    return new Prisma.Decimal(val);
  }

  /**
   * List all active non-deleted measurement profiles for a user, default profile first
   */
  async list(userId: string) {
    return db.measurementProfile.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a specific measurement profile by ID and verify ownership
   */
  async getById(userId: string, profileId: string) {
    const profile = await db.measurementProfile.findFirst({
      where: { id: profileId, userId, deletedAt: null },
    });

    if (!profile) {
      throw AppError.notFound('Measurement profile not found');
    }

    return profile;
  }

  /**
   * Create a new measurement profile for user
   */
  async create(userId: string, data: CreateMeasurementInput) {
    const profile = await db.$transaction(async (tx) => {
      const existingCount = await tx.measurementProfile.count({
        where: { userId, deletedAt: null },
      });

      // Force as default if user has no existing profiles or explicitly requested
      const shouldBeDefault = existingCount === 0 || data.isDefault === true;

      if (shouldBeDefault) {
        await tx.measurementProfile.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const created = await tx.measurementProfile.create({
        data: {
          userId,
          label: data.label ?? 'My Measurements',
          isDefault: shouldBeDefault,

          // Upper body
          chest: this.toDecimal(data.chest),
          waist: this.toDecimal(data.waist),
          hips: this.toDecimal(data.hips),
          shoulderWidth: this.toDecimal(data.shoulderWidth),
          backLength: this.toDecimal(data.backLength),
          frontLength: this.toDecimal(data.frontLength),
          sleeveLength: this.toDecimal(data.sleeveLength),
          armhole: this.toDecimal(data.armhole),
          bicep: this.toDecimal(data.bicep),
          wrist: this.toDecimal(data.wrist),
          neckCircumference: this.toDecimal(data.neckCircumference),

          // Lower body
          trouserLength: this.toDecimal(data.trouserLength),
          thigh: this.toDecimal(data.thigh),
          knee: this.toDecimal(data.knee),
          calf: this.toDecimal(data.calf),
          ankle: this.toDecimal(data.ankle),
          trouserWaist: this.toDecimal(data.trouserWaist),
          seat: this.toDecimal(data.seat),

          // Style lengths
          kameezLength: this.toDecimal(data.kameezLength),
          galaDepth: this.toDecimal(data.galaDepth),

          // Notes & media
          notes: data.notes ?? null,
          photoUrls: data.photoUrls ?? [],
        },
      });

      return created;
    });

    // Trigger AI validation asynchronously without blocking HTTP response
    this.validateWithAI(profile.id).catch((err) => {
      logger.warn(`Background AI validation failed for profile ${profile.id}:`, err);
    });

    return profile;
  }

  /**
   * Update an existing measurement profile (supports versioning history)
   */
  async update(userId: string, profileId: string, data: UpdateMeasurementInput) {
    const existing = await this.getById(userId, profileId);

    return db.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.measurementProfile.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const updated = await tx.measurementProfile.update({
        where: { id: profileId },
        data: {
          label: data.label !== undefined ? data.label : undefined,
          isDefault: data.isDefault !== undefined ? data.isDefault : undefined,

          // Upper body
          chest: this.toDecimal(data.chest),
          waist: this.toDecimal(data.waist),
          hips: this.toDecimal(data.hips),
          shoulderWidth: this.toDecimal(data.shoulderWidth),
          backLength: this.toDecimal(data.backLength),
          frontLength: this.toDecimal(data.frontLength),
          sleeveLength: this.toDecimal(data.sleeveLength),
          armhole: this.toDecimal(data.armhole),
          bicep: this.toDecimal(data.bicep),
          wrist: this.toDecimal(data.wrist),
          neckCircumference: this.toDecimal(data.neckCircumference),

          // Lower body
          trouserLength: this.toDecimal(data.trouserLength),
          thigh: this.toDecimal(data.thigh),
          knee: this.toDecimal(data.knee),
          calf: this.toDecimal(data.calf),
          ankle: this.toDecimal(data.ankle),
          trouserWaist: this.toDecimal(data.trouserWaist),
          seat: this.toDecimal(data.seat),

          // Style lengths
          kameezLength: this.toDecimal(data.kameezLength),
          galaDepth: this.toDecimal(data.galaDepth),

          // Notes & Media
          notes: data.notes !== undefined ? data.notes : undefined,
          photoUrls: data.photoUrls !== undefined ? data.photoUrls : undefined,

          // Versioning: increment version and link previous version ID
          version: existing.version + 1,
          previousVersionId: existing.id,
        },
      });

      return updated;
    });
  }

  /**
   * Soft delete a measurement profile and promote next available profile to default if needed
   */
  async delete(userId: string, profileId: string) {
    const existing = await this.getById(userId, profileId);

    return db.$transaction(async (tx) => {
      await tx.measurementProfile.update({
        where: { id: profileId },
        data: {
          deletedAt: new Date(),
          isDefault: false,
        },
      });

      if (existing.isDefault) {
        const nextProfile = await tx.measurementProfile.findFirst({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });

        if (nextProfile) {
          await tx.measurementProfile.update({
            where: { id: nextProfile.id },
            data: { isDefault: true },
          });
        }
      }

      return { message: 'Measurement profile deleted successfully' };
    });
  }

  /**
   * Set a measurement profile as default for user
   */
  async setDefault(userId: string, profileId: string) {
    await this.getById(userId, profileId);

    return db.$transaction(async (tx) => {
      await tx.measurementProfile.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      const updated = await tx.measurementProfile.update({
        where: { id: profileId },
        data: { isDefault: true },
      });

      return updated;
    });
  }

  /**
   * Validate measurement profile values using AI anomaly checks
   */
  async validateWithAI(profileId: string) {
    const profile = await db.measurementProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw AppError.notFound('Measurement profile not found');
    }

    const flags: string[] = [];
    let score = 1.0;

    const chest = profile.chest ? Number(profile.chest) : null;
    const waist = profile.waist ? Number(profile.waist) : null;
    const hips = profile.hips ? Number(profile.hips) : null;
    const shoulder = profile.shoulderWidth ? Number(profile.shoulderWidth) : null;

    // Rule-based anomaly verification
    if (chest && waist && waist > chest * 1.4) {
      flags.push('Waist measurement appears unusually larger than chest');
      score -= 0.2;
    }
    if (chest && hips && chest > hips * 1.5) {
      flags.push('Chest to hip ratio is outside standard proportions');
      score -= 0.15;
    }
    if (shoulder && chest && shoulder > chest) {
      flags.push('Shoulder width is larger than chest circumference');
      score -= 0.25;
    }

    const finalScore = Math.max(0, Math.min(1.0, score));

    const updatedProfile = await db.measurementProfile.update({
      where: { id: profileId },
      data: {
        aiValidationScore: new Prisma.Decimal(finalScore.toFixed(2)),
        aiFlags: flags,
        aiValidatedAt: new Date(),
      },
    });

    return {
      profileId,
      score: finalScore,
      flags,
      validatedAt: updatedProfile.aiValidatedAt,
    };
  }
}

export const measurementsService = new MeasurementsService();
