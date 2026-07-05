export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UNSUPPORTED_PARAMETER_FOR_TANK_CLASS: 'UNSUPPORTED_PARAMETER_FOR_TANK_CLASS',
  TANK_CLASS_CHANGE_CONFLICT: 'TANK_CLASS_CHANGE_CONFLICT',
} as const;
export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export interface ErrorResponse {
  status: number;
  code: ErrorCode;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface AppError {
  status: number;
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
}
