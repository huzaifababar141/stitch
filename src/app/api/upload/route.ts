import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 Environment Credentials
const r2AccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const r2AccessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const r2BucketName =
  process.env.CLOUDFLARE_R2_BUCKET_NAME || 'tailorlink-stock';
const r2PublicUrl =
  process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, '') ||
  'https://pub-d1f02cdddbd841058f6213d44986fe04.r2.dev';

const isR2Configured = Boolean(r2AccountId && r2AccessKey && r2SecretKey);

const s3Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKey!,
        secretAccessKey: r2SecretKey!,
      },
    })
  : null;

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

    const uploadedUrls: string[] = [];
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB limit per image

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        throw AppError.badRequest(
          `File "${file.name}" is not a valid image format.`
        );
      }

      if (file.size > MAX_SIZE) {
        throw AppError.badRequest(
          `File "${file.name}" exceeds the 15MB file size limit.`
        );
      }

      // Generate unique safe file name
      const ext = path.extname(file.name) || '.jpg';
      const safeName = `stock_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${ext}`;
      const r2Key = `stock/${safeName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isR2Configured && s3Client) {
        // Upload directly to Cloudflare R2
        await s3Client.send(
          new PutObjectCommand({
            Bucket: r2BucketName,
            Key: r2Key,
            Body: buffer,
            ContentType: file.type || 'image/jpeg',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );

        const cdnUrl = `${r2PublicUrl}/${r2Key}`;
        uploadedUrls.push(cdnUrl);
      } else {
        // Graceful local fallback if R2 credentials are absent
        const uploadDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'stock'
        );
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, safeName);
        await fs.writeFile(filePath, buffer);

        const publicUrl = `/uploads/stock/${safeName}`;
        uploadedUrls.push(publicUrl);
      }
    }

    return apiSuccess({ urls: uploadedUrls }, 201, {
      message: `Successfully uploaded ${uploadedUrls.length} image(s) to ${
        isR2Configured ? 'Cloudflare R2 CDN' : 'local storage'
      }.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
