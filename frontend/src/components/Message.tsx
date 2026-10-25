import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChakraIcon } from './Logo';
import type { ChatMessage } from '../types';

function MessageView({ message, pending }: { message: ChatMessage; pending: boolean }) {
  if (message.role === 'user') {
    return <div className="msg user"><div className="bubble">{message.content}</div></div>;
  }
  return (
    <div className="msg ai">
      <div className="mark"><ChakraIcon size={18} /></div>
      <div className={`bubble${message.error ? ' error' : ''}`}>
        {pending
          ? <span className="typing" role="status" aria-label="Thinking"><i /><i /><i /></span>
          : <ReactMarkdown>{message.content}</ReactMarkdown>}
      </div>
    </div>
  );
}

export default memo(MessageView);
