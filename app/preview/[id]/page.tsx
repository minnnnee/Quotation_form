'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Quotation } from '@/types';
import { getQuotationById, createShareLink } from '@/lib/storage';
import { formatMoney, formatQuotationText, formatPhone } from '@/lib/format';
import { getSettings, AppSettings } from '@/lib/settings';

export default function PreviewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [q, setQ] = useState<Quotation | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  useEffect(() => {
    getQuotationById(id).then(setQ);
    setSettings(getSettings());
  }, [id]);

  if (!q) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">견적서를 불러오는 중...</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const text = formatQuotationText(q, settings.bagCount, settings);
  const wallpaperLabel = q.wallpaperType === '직접입력' ? q.wallpaperTypeCustom : q.wallpaperType;

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

  // 링크 공유 — Supabase에 저장 후 짧은 URL 반환
  async function buildShareUrl(): Promise<string> {
    const biz = {
      bizName: settings.bizName,
      bizOwner: settings.bizOwner,
      bizRegNo: settings.bizRegNo,
      bizPhone: settings.bizPhone,
      bizEmail: settings.bizEmail,
      quoteValidDays: settings.quoteValidDays,
      bagCount: settings.bagCount,
    };
    const shareId = await createShareLink(q!, biz);
    return `${window.location.origin}/share/${shareId}`;
  }

  async function handleShareLink() {
    const url = await buildShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  // SMS — 링크 전송
  async function handleSMS() {
    const phone = q?.customerPhone.replace(/\D/g, '') ?? '';
    const url = await buildShareUrl();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(`sms:${phone}${isIOS ? '&' : '?'}body=${encodeURIComponent(url)}`);
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

          {/* 문서 헤더 — 수신 / 업체 정보 */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-x-4 gap-y-0">
              {/* 왼쪽: 수신 / 견적일 / 유효기간 */}
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">수신</p>
                  <p className="text-sm font-bold text-slate-800">{q.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">견적일</p>
                  <p className="text-sm text-slate-700">{todayStr}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">유효기간</p>
                  <p className="text-sm text-slate-700">견적일로부터 {settings.quoteValidDays}일</p>
                </div>
              </div>
              {/* 오른쪽: 업체 정보 */}
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">상호</p>
                  <p className="text-sm font-semibold text-slate-800">{settings.bizName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">대표자</p>
                  <p className="text-sm text-slate-700">{settings.bizOwner}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">사업자번호</p>
                  <p className="text-sm text-slate-700">{settings.bizRegNo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">연락처</p>
                  <p className="text-sm text-slate-700">{settings.bizPhone}</p>
                  {settings.bizEmail && (
                    <p className="text-xs text-slate-500 mt-0.5">{settings.bizEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

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
          </div>

          {/* 금액 명세 */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 mb-3">금액 명세</p>
            <Row
              label="결제 방식"
              value={q.paymentMethod === '카드' ? '💳 부가세(VAT)' : '💵 현금'}
            />
            <Row label="벽지 · 인건비 · 부자재" value={formatMoney(q.workCost)} />
            {q.paymentMethod === '카드' && q.workCost > 0 && (
              <Row
                label="부가세 (VAT 10%)"
                value={`+${formatMoney(Math.round(q.workCost * 0.1))}`}
                valueClass="text-amber-600"
              />
            )}
            {q.contractDeposit > 0 && (
              <Row label="계약금" value={`-${formatMoney(q.contractDeposit)}`} valueClass="text-rose-500" />
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

          {/* 고정 안내문 */}
          <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
            <div className="mb-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">💳 입금계좌</p>
              <p className="text-sm text-amber-900 font-medium">신한은행 110-312-878821</p>
              <p className="text-sm text-amber-900 font-medium">예금주: 이정숙</p>
            </div>
            <p className="text-xs font-semibold text-amber-700 mb-2">📌 안내사항</p>
            <ul className="space-y-1.5 text-xs text-amber-800 leading-relaxed">
              <li>∙ <span className="font-medium">폐기물 처리:</span> 원활한 현장 정리를 위해 75리터 쓰레기봉투 ({settings.bagCount}장)을 반드시 사전에 준비해 주시기 바랍니다.</li>
              <li>∙ <span className="font-medium">부가세 별도:</span> 본 견적은 부가세 미포함 금액입니다. (카드 결제 및 현금영수증 발행 시 10% 추가)</li>
              <li>∙ <span className="font-medium">예약금 규정:</span> 계약 확정 후 단순 변심으로 인한 해지시, 예약금은 반환되지 않습니다.</li>
              <li>∙ <span className="font-medium">시공 제외 구역:</span> 시스템형 및 붙박이 가구가 설치된 구역은 도배 시공이 불가합니다. (필요 시 사전 해체 필수)</li>
              <li>∙ <span className="font-medium">하자 책임:</span> 기존 벽지 상태나 천장 구조 결함 등 사전 고지된 사항 외 문제에 대해서는 책임지지 않습니다.</li>
            </ul>
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs font-bold text-red-600">※ 누수 및 결로로 인한 하자는 책임지지 않습니다.</p>
            </div>
          </div>
        </div>

        {/* 전송 버튼들 */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400">고객에게 전송하기</p>

          {/* 카카오톡 공유 */}
          <button
            onClick={handleShareLink}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl">💬</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">카카오톡으로 공유</p>
              <p className="text-xs text-slate-400 mt-0.5">링크를 보내 고객이 견적서를 확인</p>
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

          {/* 링크 공유 */}
          <button
            onClick={handleShareLink}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${linkCopied ? 'bg-green-100' : 'bg-blue-100'}`}>
              {linkCopied ? '✅' : '🔗'}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">{linkCopied ? '링크 복사 완료!' : '링크로 공유'}</p>
              <p className="text-xs text-slate-400 mt-0.5">고객이 링크를 열면 견적서가 표시됩니다</p>
            </div>
            <span className="ml-auto text-slate-300">›</span>
          </button>

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
          onClick={handleShareLink}
          className="w-full bg-yellow-400 text-yellow-900 py-4 rounded-2xl text-base font-semibold shadow-lg shadow-yellow-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>💬</span>
          <span>카카오톡으로 보내기</span>
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
