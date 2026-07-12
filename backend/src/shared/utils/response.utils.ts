interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const success = <T>(data: T, meta?: any): ApiResponse<T> => {
  return { success: true, data, meta };
};

export const error = (code: string, message: string, details?: any): ApiResponse<any> => {
  return { success: false, error: { code, message, details } };
};

export const paginate = <T>(data: T, total: number, page: number, limit: number): ApiResponse<T> => {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
