import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

interface Props { streaming: boolean; onSend: (text: string) => void; onStop: () => void }

export default function Composer({ streaming, onSend, onStop }: Props) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text]);

  const submit = () => {
    if (!text.trim() || streaming) return;
    onSend(text);
    setText('');
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
  };

  return (
    <div className="composer">
      <div className="col">
        <div className="box">
          <textarea ref={ref} rows={1} value={text} maxLength={4000} onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey} aria-label="Your question" placeholder="Ask a UPSC question, e.g. Explain the basic structure doctrine" />
          {streaming
            ? <button className="send" onClick={onStop} aria-label="Stop response" type="button"><span className="stop" /></button>
            : <button className="send" onClick={submit} disabled={!text.trim()} aria-label="Send question" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1203" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>}
        </div>
        <p className="note">Enter to send, Shift+Enter for a new line. Verify facts against standard sources.</p>
      </div>
    </div>
  );
}
