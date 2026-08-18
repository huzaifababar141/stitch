import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      throw AppError.badRequest('No image file provided');
    }

    // Validate size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw AppError.badRequest('Image must be less than 5MB');
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      throw AppError.badRequest('File must be an image');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('profile-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw AppError.internal('Failed to upload image');
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('profile-images').getPublicUrl(fileName);

    // Update user profile in DB
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: publicUrl },
    });

    return apiSuccess({ profileImageUrl: updatedUser.profileImageUrl }, 200, {
      message: 'Profile image updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
