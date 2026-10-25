import { post, postForm } from './client';
import type { AuthResponse } from '../types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const r = await postForm<Partial<AuthResponse>>('/auth/login', { username: email, password });
  return {
    access_token: r.access_token as string,
    user: r.user ?? { name: email.split('@')[0], email },
  };
}

export const register = (name: string, email: string, password: string) =>
  post<AuthResponse>('/auth/register', { name, email, password });

export const loginWithGoogle = (credential: string) =>
  post<AuthResponse>('/auth/google', { credential });