import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'super_admin');

    const formData = await request.formData();
    const files: File[] = [];

    // Collect all uploaded files (handles 'files', 'file', and array uploads)
    const allFiles = formData.getAll('files');
    if (allFiles.length > 0) {
      for (const f of allFiles) {
        if (f instanceof File) files.push(f);
      }
    }

    const singleFile = formData.get('file');
    if (singleFile instanceof File && !files.includes(singleFile)) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      throw AppError.badRequest('No image files were provided for upload.');
    }

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'stock');
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit per image

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        throw AppError.badRequest(`File "${file.name}" is not a valid image format.`);
      }

      if (file.size > MAX_SIZE) {
        throw AppError.badRequest(`File "${file.name}" exceeds the 10MB file size limit.`);
      }

      // Generate unique safe file name
      const ext = path.extname(file.name) || '.jpg';
      const safeName = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, safeName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/stock/${safeName}`;
      uploadedUrls.push(publicUrl);
    }

    return apiSuccess({ urls: uploadedUrls }, 201, {
      message: `Successfully uploaded ${uploadedUrls.length} image(s).`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
