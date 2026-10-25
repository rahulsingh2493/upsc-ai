import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useChat } from '../hooks/useChat';
import Composer from '../components/Composer';
import Message from '../components/Message';
import Sidebar from '../components/Sidebar';
import { SUBJECTS } from '../types';

const STARTERS = [
  'Explain the basic structure doctrine with key cases',
  'Compare the Moderates and Extremists in the freedom movement',
  'Why do monsoons vary across India?',
  'Write a 150-word Mains answer on cooperative federalism',
];

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { chats, active, streaming, send, stop, newChat, select } = useChat(user!.email);
  const [subject, setSubject] = useState<string>('General');
  const [menu, setMenu] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const messages = active?.messages ?? [];

  useEffect(() => { feed.current?.scrollTo({ top: feed.current.scrollHeight }); }, [messages, active?.id]);

  return (
    <div className="app">
      <Sidebar chats={chats} activeId={active?.id ?? null} user={user!} open={menu}
        onSelect={select} onNew={newChat} onLogout={logout} onClose={() => setMenu(false)} />
      <main>
        <div className="topbar">
          <button className="menu" onClick={() => setMenu((m) => !m)} aria-label="Toggle menu" aria-expanded={menu}>Menu</button>
          <div className="subjects" role="group" aria-label="Subject">
            {SUBJECTS.map((s) => (
              <button key={s} className={s === subject ? 'on' : ''} aria-pressed={s === subject} onClick={() => setSubject(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="feed" ref={feed}>
          <div className="col">
            {messages.length === 0 ? (
              <div className="empty">
                <h2>What are you studying today?</h2>
                <p>Pick a subject above, then ask anything from the UPSC syllabus.</p>
                <div className="prompts">
                  {STARTERS.map((s) => <button key={s} onClick={() => void send(s, subject)}>{s}</button>)}
                </div>
              </div>
            ) : messages.map((m, i) => (
              <Message key={m.id} message={m} pending={streaming && i === messages.length - 1 && !m.content} />
            ))}
          </div>
        </div>
        <Composer streaming={streaming} onSend={(t) => void send(t, subject)} onStop={stop} />
      </main>
    </div>
  );
}
