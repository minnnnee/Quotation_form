'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSettings } from '@/lib/settings';

const SESSION_KEY = 'app_authed';

export default function PinGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'open' | 'locked'>('loading');
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  // /share/* 경로는 PIN 불필요
  const isShareRoute = pathname.startsWith('/share');

  useEffect(() => {
    if (isShareRoute) { setStatus('open'); return; }
    const settings = getSettings();
    if (!settings.appPin) { setStatus('open'); return; }
    if (sessionStorage.getItem(SESSION_KEY) === 'true') { setStatus('open'); return; }
    setStatus('locked');
  }, [isShareRoute]);

  function handleSubmit() {
    const settings = getSettings();
    if (input === settings.appPin) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setStatus('open');
    } else {
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  }

  if (status === 'loading') return null;
  if (status === 'open') return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8">
      <p className="text-4xl mb-6">🔒</p>
      <h1 className="text-lg font-bold text-slate-800 mb-1">앱 잠금</h1>
      <p className="text-sm text-slate-400 mb-8">PIN 번호를 입력해주세요</p>
      <div className={`w-full max-w-xs transition-transform ${shake ? 'animate-shake' : ''}`}>
        <input
          type="password"
          inputMode="numeric"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="PIN 번호"
          autoFocus
          className="w-full text-center text-xl tracking-[0.4em] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors"
        />
        <button
          onClick={handleSubmit}
          className="mt-3 w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
        >
          확인
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
