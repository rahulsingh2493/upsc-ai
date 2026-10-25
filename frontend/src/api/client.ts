import { API_BASE } from '../config';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setToken = (t: string | null) => { token = t; };
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    let message = `Request failed (${res.status}).`;
    try {
      const data = await res.json();
      if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        message = data.detail
          .map((d: { loc?: unknown[]; msg?: string }) => `${d.loc?.slice(1).join('.')}: ${d.msg}`)
          .join('; ');
      }
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, message);
  }
  return res;
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await send(path, { method: 'POST', body: JSON.stringify(body) });
  return (await res.json()) as T;
}

export async function postForm<T>(path: string, fields: Record<string, string>): Promise<T> {
  const res = await send(path, {
    method: 'POST',
    body: new URLSearchParams(fields),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return (await res.json()) as T;
}

export const postRaw = (path: string, body: unknown, signal?: AbortSignal) =>
  send(path, { method: 'POST', body: JSON.stringify(body), signal });

export async function get<T>(path: string): Promise<T> {
  const res = await send(path, { method: 'GET' });
  return (await res.json()) as T;
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await send(path, { method: 'PUT', body: JSON.stringify(body) });
  return (await res.json()) as T;
}