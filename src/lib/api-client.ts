/**
 * Thin typed fetch wrapper for the admin panel. Unwraps the standard API
 * envelope ({ success, data, error }) and throws a typed error on failure so
 * React Query surfaces a useful message. Requests are same-origin, so the
 * Supabase auth cookie is sent automatically.
 */

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiClientError(
      'Network error — please check your connection.',
      'NETWORK_ERROR',
      0
    );
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new ApiClientError(
      json?.error?.message || `Request failed (${res.status})`,
      json?.error?.code || 'UNKNOWN_ERROR',
      res.status,
      json?.error?.details
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  del: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
