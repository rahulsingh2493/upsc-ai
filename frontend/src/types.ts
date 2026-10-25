export type Role = 'user' | 'assistant';

export interface ChatMessage { id: string; role: Role; content: string; error?: boolean }
export interface Chat { id: string; title: string; messages: ChatMessage[]; updatedAt: number }
export interface User { name: string; email: string }
export interface AuthResponse { access_token: string; user: User }
export interface ChatRequest {
  message: string;
  subject: string;
  history: { role: Role; content: string }[];
}

export const SUBJECTS = [
  'General', 'Polity', 'History', 'Geography', 'Economy', 'Environment',
  'Ethics', 'Science & Tech', 'Current Affairs', 'CSAT',
] as const;
