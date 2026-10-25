const base = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE = (base ?? 'http://localhost:8000').replace(/\/$/, '');
export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '';
export const HISTORY_LIMIT = 12;
export const MAX_CHATS = 50;
