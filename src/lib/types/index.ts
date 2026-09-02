import type { User as PrismaUser } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type * from '@prisma/client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type AuthUser = SupabaseUser & {
  user_metadata: {
    role?: string;
    [key: string]: any;
  };
};

export type FullUser = PrismaUser;
