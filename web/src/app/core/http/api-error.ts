import { HttpErrorResponse } from '@angular/common/http';

/** Mirrors the backend error body (backend/.../common/error/ApiError.java, ADR-012). */
export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  errors?: { field: string; message: string }[];
}

/** Error code used when the server could not be reached or did not return an ApiError body. */
export const NETWORK_ERROR = 'NETWORK_ERROR';

function isApiError(body: unknown): body is ApiError {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as ApiError).code === 'string' &&
    typeof (body as ApiError).message === 'string'
  );
}

/** Normalizes any HTTP failure into an ApiError so features handle a single error shape. */
export function toApiError(response: HttpErrorResponse): ApiError {
  if (isApiError(response.error)) {
    return response.error;
  }
  const unreachable = response.status === 0;
  return {
    timestamp: new Date().toISOString(),
    status: response.status,
    code: unreachable ? NETWORK_ERROR : 'UNKNOWN_ERROR',
    message: unreachable
      ? 'Unable to reach the server. Check your connection and try again.'
      : 'Something went wrong. Please try again.',
    path: response.url ?? '',
  };
}
