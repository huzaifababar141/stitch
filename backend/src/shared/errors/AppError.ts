export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Access forbidden') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(resource = 'Resource') {
    return new AppError(404, 'NOT_FOUND', `${resource} not found`);
  }

  static conflict(message: string) {
    return new AppError(409, 'CONFLICT', message);
  }

  static unprocessable(message: string, details?: any) {
    return new AppError(422, 'UNPROCESSABLE_ENTITY', message, details);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new AppError(429, 'TOO_MANY_REQUESTS', message);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
