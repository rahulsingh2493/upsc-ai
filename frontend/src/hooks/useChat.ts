import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat } from '../api/chat';
import { HISTORY_LIMIT, MAX_CHATS } from '../config';
import type { Chat, ChatMessage } from '../types';

const uid = () => crypto.randomUUID();

function load(key: string): Chat[] {
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? (data as Chat[]) : [];
  } catch {
    return [];
  }
}

export function useChat(userKey: string) {
  const storageKey = `upscdesk:chats:${userKey}`;
  const [chats, setChats] = useState<Chat[]>(() => load(storageKey));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const active = chats.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (streaming) return;
    try { localStorage.setItem(storageKey, JSON.stringify(chats.slice(0, MAX_CHATS))); } catch { /* quota or private mode */ }
  }, [chats, streaming, storageKey]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = (chatId: string, msgId: string, fn: (m: ChatMessage) => ChatMessage) =>
    setChats((prev) => prev.map((c) => c.id !== chatId ? c : {
      ...c, updatedAt: Date.now(), messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)),
    }));

  const send = useCallback(async (text: string, subject: string) => {
    const message = text.trim();
    if (!message || streaming) return;

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: message };
    const aiMsg: ChatMessage = { id: uid(), role: 'assistant', content: '' };
    const history = (active?.messages ?? [])
      .filter((m) => !m.error && m.content)
      .slice(-HISTORY_LIMIT)
      .map(({ role, content }) => ({ role, content }));
    const chatId = active?.id ?? uid();

    setChats((prev) => active
      ? prev.map((c) => c.id === chatId ? { ...c, updatedAt: Date.now(), messages: [...c.messages, userMsg, aiMsg] } : c)
      : [{ id: chatId, title: message.slice(0, 48), messages: [userMsg, aiMsg], updatedAt: Date.now() }, ...prev]);
    setActiveId(chatId);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await streamChat({ message, subject, history },
        (chunk) => patch(chatId, aiMsg.id, (m) => ({ ...m, content: m.content + chunk })), ctrl.signal);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        patch(chatId, aiMsg.id, (m) => ({ ...m, content: (e as Error).message || 'Something went wrong.', error: true }));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [active, streaming]);

  return {
    chats, active, streaming, send,
    stop: () => abortRef.current?.abort(),
    newChat: () => { if (!streaming) setActiveId(null); },
    select: (id: string) => { if (!streaming) setActiveId(id); },
  };
}
