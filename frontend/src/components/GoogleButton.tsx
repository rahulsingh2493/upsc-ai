import { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../config';

interface GoogleId {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
  disableAutoSelect: () => void;
}
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }

interface Props { onCredential: (credential: string) => void; onError: (message: string) => void }

export default function GoogleButton({ onCredential, onError }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    const init = () => {
      if (cancelled || !ref.current || !window.google) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r) => onCredential(r.credential) });
      window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large',shape : 'rectangular', text: 'continue_with', logo_alignment : "center", width: Math.min(400, ref.current.offsetWidth || 400) });
    };
    const fail = () => onError('Could not load Google sign-in. Use email instead.');

    if (window.google) { init(); return; }
    let script = document.querySelector<HTMLScriptElement>('script[data-gsi]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.dataset.gsi = '1';
      document.head.appendChild(script);
    }
    script.addEventListener('load', init);
    script.addEventListener('error', fail);
    return () => { cancelled = true; script?.removeEventListener('load', init); script?.removeEventListener('error', fail); };
  }, [onCredential, onError]);

  if (!GOOGLE_CLIENT_ID) {
    return <button type="button" className="btn google" disabled title="Set VITE_GOOGLE_CLIENT_ID to enable">Continue with Google</button>;
  }
  return <div ref={ref} className="gbtn" />;
}
