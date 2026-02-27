'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Quotation } from '@/types';
import { getQuotationById } from '@/lib/storage';
import { formatMoney, formatQuotationText, formatPhone } from '@/lib/format';

export default function PreviewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [q, setQ] = useState<Quotation | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const data = getQuotationById(id);
    setQ(data);
  }, [id]);

  if (!q) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">견적서를 불러오는 중...</p>
      </div>
    );
  }

  const text = formatQuotationText(q);
  const wallpaperLabel = q.wallpaperType === '직접입력' ? q.wallpaperTypeCustom : q.wallpaperType;

  // 카카오톡 공유
  async function handleKakaoShare() {
    setSending(true);
    try {
      const Kakao = (window as any).Kakao;
      if (Kakao?.isInitialized()) {
        // 앱키 설정 완료 → 카카오 공유 팝업
        Kakao.Share.sendDefault({
          objectType: 'text',
          text,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        });
      } else {
        // 앱키 미설정 → 네이티브 공유 시트 폴백
        await fallbackShare();
      }
    } catch {
      await fallbackShare();
    } finally {
      setSending(false);
    }
  }

  // 네이티브 공유 시트 (카카오톡 선택 가능) 또는 클립보드
  async function fallbackShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e: any) {
        // AbortError = 사용자가 공유 시트를 그냥 닫은 것 → 무시
        if (e?.name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API 없을 때 (구형 브라우저 / iOS Safari 일부)
      // ClipboardItem 방식으로 재시도
      try {
        const item = new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }) });
        await navigator.clipboard.write([item]);
      } catch {
        return; // 복사 불가 환경이면 조용히 실패
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // SMS 전송
  function handleSMS() {
    const phone = q?.customerPhone.replace(/\D/g, '') ?? '';
    const encoded = encodeURIComponent(text);
    // iOS: sms:번호&body=내용 / Android: sms:번호?body=내용
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(`sms:${phone}${isIOS ? '&' : '?'}body=${encoded}`);
  }

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-500 text-xl p-1 -ml-1">←</button>
        <h1 className="text-lg font-bold text-slate-800">견적서 미리보기</h1>
        <button
          onClick={() => router.push(`/form/${q.id}`)}
          className="ml-auto text-sm text-blue-600 font-medium"
        >
          수정
        </button>
      </header>

      <div className="px-4 py-5 space-y-4">

        {/* 견적서 카드 */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* 상단 배너 */}
          <div className="bg-blue-600 px-5 py-5">
            <p className="text-blue-200 text-xs mb-1">도배 견적서</p>
            <p className="text-white font-bold text-2xl">{formatMoney(q.totalAmount)}</p>
            <p className="text-blue-200 text-sm mt-1">{q.workDate ? `시공 예정: ${q.workDate}` : '시공일 협의 예정'}</p>
          </div>

          {/* 고객 정보 */}
          <div className="px-5 py-4 border-b border-slate-50">
            <Row label="고객명" value={q.customerName || '-'} />
            <Row label="연락처" value={q.customerPhone ? formatPhone(q.customerPhone) : '-'} />
            <Row label="시공 주소" value={q.address || '-'} />
          </div>

          {/* 시공 정보 */}
          <div className="px-5 py-4 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 mb-3">시공 정보</p>
            <Row label="시공 범위" value={q.workScope} />
            <Row label="도배지 종류" value={wallpaperLabel || '-'} />
            <Row label="시공 면적" value={`${q.totalArea}평`} />
            <Row label="기존 벽지 철거" value={q.removeOldWallpaper ? '포함' : '미포함'} />
          </div>

          {/* 금액 명세 */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 mb-3">금액 명세</p>
            {q.materialCost > 0 && <Row label="재료비" value={formatMoney(q.materialCost)} />}
            {q.laborCost > 0 && <Row label="시공비" value={formatMoney(q.laborCost)} />}
            {q.removeCost > 0 && <Row label="철거비" value={formatMoney(q.removeCost)} />}
            {q.otherCost > 0 && <Row label="기타" value={formatMoney(q.otherCost)} />}
            {q.discountAmount > 0 && (
              <Row label="할인" value={`-${formatMoney(q.discountAmount)}`} valueClass="text-rose-500" />
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">최종 견적금액</span>
              <span className="text-blue-600 font-bold text-lg">{formatMoney(q.totalAmount)}</span>
            </div>
          </div>

          {/* 특이사항 */}
          {q.notes && (
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 mb-1.5">특이사항</p>
              <p className="text-sm text-slate-600 whitespace-pre-line">{q.notes}</p>
            </div>
          )}
        </div>

        {/* 전송 버튼들 */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400">고객에게 전송하기</p>

          {/* 카카오톡 공유 */}
          <button
            onClick={handleKakaoShare}
            disabled={sending}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl">💬</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">카카오톡으로 공유</p>
              <p className="text-xs text-slate-400 mt-0.5">견적 내용을 카카오톡으로 전송</p>
            </div>
            <span className="ml-auto text-slate-300">›</span>
          </button>

          {/* SMS */}
          {q.customerPhone && (
            <button
              onClick={handleSMS}
              className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl">💬</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">문자(SMS)로 전송</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatPhone(q.customerPhone)}으로 문자 앱 열기</p>
              </div>
              <span className="ml-auto text-slate-300">›</span>
            </button>
          )}

          {/* 클립보드 복사 */}
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${copied ? 'bg-green-100' : 'bg-slate-100'}`}>
              {copied ? '✅' : '📋'}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">{copied ? '복사 완료!' : '텍스트 복사'}</p>
              <p className="text-xs text-slate-400 mt-0.5">견적 내용을 클립보드에 복사</p>
            </div>
            <span className="ml-auto text-slate-300">›</span>
          </button>
        </div>

        {/* 미리보기 텍스트 */}
        <details className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <summary className="px-4 py-4 text-sm font-medium text-slate-600 cursor-pointer select-none">
            전송될 텍스트 미리보기
          </summary>
          <pre className="px-4 pb-4 text-xs text-slate-500 whitespace-pre-wrap leading-relaxed font-sans">{text}</pre>
        </details>

      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-3 bg-gradient-to-t from-white to-transparent">
        <button
          onClick={handleKakaoShare}
          disabled={sending}
          className="w-full bg-yellow-400 text-yellow-900 py-4 rounded-2xl text-base font-semibold shadow-lg shadow-yellow-200 active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <span>💬</span>
          <span>{sending ? '공유 중...' : '카카오톡으로 보내기'}</span>
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-xs text-slate-400 shrink-0 mr-3">{label}</span>
      <span className={`text-sm text-slate-700 text-right ${valueClass}`}>{value}</span>
    </div>
  );
}
