import { http } from './http';
import type { ApiEnvelope, AuthResponse } from '../types';

// Backend contract:
// POST /auth/signup { name, email, password } -> { message }              (no session — sign up, then log in)
// POST /auth/login  { email, password }       -> { message, data: { user, token } }
// POST /auth/logout    (optional, if you invalidate refresh tokens server-side)

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerRequest(payload: RegisterPayload): Promise<ApiEnvelope<void>> {
  return http.post<ApiEnvelope<void>>('/auth/signup', payload);
}

export function loginRequest(payload: LoginPayload): Promise<ApiEnvelope<AuthResponse>> {
  return http.post<ApiEnvelope<AuthResponse>>('/auth/login', payload);
}

export async function logoutRequest(): Promise<void> {
  try {
    await http.post('/auth/logout');
  } catch {
    // Logout is best-effort client-side; ignore network/server errors here.
  }
}
