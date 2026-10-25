import { Link } from 'react-router-dom';
import Logo from './Logo';
import type { Chat, User } from '../types';

interface Props {
  chats: Chat[]; activeId: string | null; user: User; open: boolean;
  onSelect: (id: string) => void; onNew: () => void; onLogout: () => void; onClose: () => void;
}

export default function Sidebar({ chats, activeId, user, open, onSelect, onNew, onLogout, onClose }: Props) {
  const pick = (fn: () => void) => () => { fn(); onClose(); };
  return (
    <aside className={open ? 'open' : ''} aria-label="Chat history">
      <Logo />
      <button className="newchat" onClick={pick(onNew)}>+ New chat</button>
      <Link className="newchat" to="/settings">Settings</Link>
      <div className="side-h">Recent</div>
      <nav className="history">
        {chats.length === 0 && <span className="side-h">No chats yet</span>}
        {chats.map((c) => (
          <button key={c.id} className={c.id === activeId ? 'on' : ''} onClick={pick(() => onSelect(c.id))}>{c.title}</button>
        ))}
      </nav>
      <div className="me">
        <div className="avatar" aria-hidden="true">{(user.name || user.email).charAt(0).toUpperCase()}</div>
        <div className="who"><b>{user.name}</b><span>{user.email}</span></div>
        <button onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
}