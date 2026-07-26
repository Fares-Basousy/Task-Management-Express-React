import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function getToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

function clearSession(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new CustomEvent('auth:expired'));
}

async function parseErrorMessage(res: Response): Promise<{ message: string; payload: unknown }> {
  try {
    const data = await res.json();
    return { message: data?.message || res.statusText, payload: data };
  } catch {
    return { message: res.statusText || 'Something went wrong.', payload: null };
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  isForm?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, isForm, headers, ...rest } = options;
  const token = getToken();

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };
  if (!isForm) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    ...rest,
    headers: finalHeaders,
    body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearSession();
    const { message, payload } = await parseErrorMessage(res);
    throw new ApiError(message || 'Your session has expired. Please sign in again.', 401, payload);
  }

  if (!res.ok) {
    const { message, payload } = await parseErrorMessage(res);
    throw new ApiError(message, res.status, payload);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const http = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>(`${path}${params ? toQueryString(params) : ''}`, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),


  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData, isForm: true }),
};
