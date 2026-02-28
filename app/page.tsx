'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quotation } from '@/types';
import { getAllQuotations, deleteQuotation } from '@/lib/storage';
import { formatMoney } from '@/lib/format';
import { getSettings, saveSettings } from '@/lib/settings';

export default function HomePage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [query, setQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [bagCount, setBagCount] = useState(10);
  const [bagCountStr, setBagCountStr] = useState('10');
  const [bizName, setBizName] = useState('');
  const [bizOwner, setBizOwner] = useState('');
  const [bizRegNo, setBizRegNo] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [quoteValidDays, setQuoteValidDays] = useState(7);
  const [appPin, setAppPin] = useState('');

  useEffect(() => {
    getAllQuotations().then(setQuotations).catch(() => {});
    const s = getSettings();
    setBagCount(s.bagCount);
    setBagCountStr(String(s.bagCount));
    setBizName(s.bizName);
    setBizOwner(s.bizOwner);
    setBizRegNo(s.bizRegNo);
    setBizPhone(s.bizPhone);
    setBizEmail(s.bizEmail);
    setQuoteValidDays(s.quoteValidDays);
    setAppPin(s.appPin ?? '');
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('견적서를 삭제할까요?')) return;
    await deleteQuotation(id);
    getAllQuotations().then(setQuotations).catch(() => {});
  }

  // 검색 필터: 주소 또는 평수
  const filtered = query.trim()
    ? quotations.filter(q => {
        const q2 = query.trim().toLowerCase();
        const addressMatch = q.address.toLowerCase().includes(q2);
        const areaMatch = String(q.totalArea).includes(q2);
        const nameMatch = q.customerName.toLowerCase().includes(q2);
        return addressMatch || areaMatch || nameMatch;
      })
    : quotations;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-200 text-sm mb-0.5">견적 관리</p>
            <h1 className="text-2xl font-bold">도배 견적서</h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full bg-blue-500/60 flex items-center justify-center text-lg active:bg-blue-500/80"
            title="설정"
          >
            ⚙️
          </button>
        </div>

        {/* 검색창 */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-base">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="주소, 평수, 고객명으로 검색"
            className="w-full bg-blue-500/60 text-white placeholder:text-blue-300 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:bg-blue-500/80 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 text-lg"
            >
              ×
            </button>
          )}
        </div>
      </header>

      {/* 결과 수 */}
      {query.trim() && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-600">
            검색 결과 <span className="font-bold">{filtered.length}건</span>
          </p>
        </div>
      )}

      {/* 목록 */}
      <main className="flex-1 px-4 py-4 space-y-3 pb-32">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
            <span className="text-6xl mb-4">{query ? '🔍' : '📋'}</span>
            <p className="text-lg font-medium text-slate-500">
              {query ? '검색 결과가 없어요' : '작성된 견적서가 없어요'}
            </p>
            <p className="text-sm mt-1">
              {query ? '다른 키워드로 검색해보세요' : '아래 버튼을 눌러 견적서를 만들어보세요'}
            </p>
          </div>
        ) : (
          filtered.map(q => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden"
            >
              <button
                onClick={() => router.push(`/preview/${q.id}`)}
                className="w-full text-left px-4 py-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-semibold text-slate-800 text-base">
                      {highlight(q.customerName || '고객명 미입력', query)}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5 truncate">
                      {highlight(q.address || '주소 미입력', query)}
                    </p>
                  </div>
                  <span className="text-blue-600 font-bold text-base shrink-0">{formatMoney(q.totalAmount)}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
                    {q.wallpaperType === '직접입력' ? q.wallpaperTypeCustom : q.wallpaperType}
                  </span>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    query && String(q.totalArea).includes(query.trim())
                      ? 'bg-yellow-100 text-yellow-700 font-medium'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {q.totalArea}평
                  </span>
                  {q.workDate && (
                    <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
                      {q.workDate}
                    </span>
                  )}
                </div>
              </button>
              <div className="border-t border-slate-50 flex">
                <button
                  onClick={() => router.push(`/form/${q.id}`)}
                  className="flex-1 py-3 text-sm text-blue-600 font-medium active:bg-slate-50"
                >
                  수정
                </button>
                <div className="w-px bg-slate-50" />
                <button
                  onClick={() => handleDelete(q.id)}
                  className="flex-1 py-3 text-sm text-rose-500 font-medium active:bg-slate-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* 새 견적 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-3 bg-gradient-to-t from-white to-transparent">
        <button
          onClick={() => router.push('/form/new')}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          + 새 견적서 작성
        </button>
      </div>

      {/* 설정 모달 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 딤 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSettings(false)}
          />
          {/* 시트 */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-10 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <h2 className="text-base font-bold text-slate-800">⚙️ 설정</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4">
              {/* 봉투 수량 */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">폐기물 처리 — 쓰레기봉투 수량</p>
                <p className="text-xs text-slate-400 mb-3">견적서 안내문에 표시되는 봉투 장 수</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const next = Math.max(1, bagCount - 1);
                      setBagCount(next);
                      setBagCountStr(String(next));
                    }}
                    className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-600 text-xl font-bold active:bg-slate-100 shrink-0"
                  >
                    −
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={bagCountStr}
                      onChange={e => {
                        setBagCountStr(e.target.value);
                        const parsed = parseInt(e.target.value);
                        if (!isNaN(parsed) && parsed >= 1) setBagCount(parsed);
                      }}
                      onBlur={() => {
                        const parsed = parseInt(bagCountStr);
                        const valid = !isNaN(parsed) && parsed >= 1 ? parsed : 1;
                        setBagCount(valid);
                        setBagCountStr(String(valid));
                      }}
                      className="w-full text-center text-xl font-bold text-slate-800 bg-white border border-slate-200 rounded-xl py-2 pr-7 outline-none focus:border-blue-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">장</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = bagCount + 1;
                      setBagCount(next);
                      setBagCountStr(String(next));
                    }}
                    className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-600 text-xl font-bold active:bg-slate-100 shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 업체 정보 */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500">업체 정보 — 견적서 헤더에 표시</p>
                {[
                  { label: '상호', value: bizName, set: setBizName, placeholder: '경성도배' },
                  { label: '대표자', value: bizOwner, set: setBizOwner, placeholder: '홍길동' },
                  { label: '사업자번호', value: bizRegNo, set: setBizRegNo, placeholder: '000-00-00000' },
                  { label: '연락처', value: bizPhone, set: setBizPhone, placeholder: '010-0000-0000' },
                  { label: '이메일', value: bizEmail, set: setBizEmail, placeholder: 'example@email.com' },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <input
                      type="text"
                      value={value}
                      onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400"
                    />
                  </div>
                ))}
                <div>
                  <p className="text-xs text-slate-400 mb-1">유효기간 (일)</p>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={quoteValidDays}
                      onChange={e => setQuoteValidDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 text-sm text-slate-800 outline-none focus:border-blue-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">일</span>
                  </div>
                </div>
              </div>

              {/* 앱 잠금 PIN */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">🔒 앱 잠금 PIN</p>
                <p className="text-xs text-slate-400 mb-3">설정하면 앱 진입 시 PIN 입력이 필요합니다. 비워두면 잠금 해제.</p>
                <input
                  type="password"
                  inputMode="numeric"
                  value={appPin}
                  onChange={e => setAppPin(e.target.value)}
                  placeholder="PIN 번호 (예: 1234)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const parsed = parseInt(bagCountStr);
                const valid = !isNaN(parsed) && parsed >= 1 ? parsed : 1;
                saveSettings({ bagCount: valid, bizName, bizOwner, bizRegNo, bizPhone, bizEmail, quoteValidDays, appPin });
                setShowSettings(false);
              }}
              className="mt-4 shrink-0 w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-semibold active:scale-95 transition-transform"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 검색어 하이라이트 (JSX 반환)
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.trim().toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}
