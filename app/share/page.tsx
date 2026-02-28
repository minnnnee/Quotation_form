'use client';
import { useEffect, useState } from 'react';
import { Quotation } from '@/types';
import { formatMoney, formatPhone } from '@/lib/format';

type BizSnap = {
  bizName: string;
  bizOwner: string;
  bizRegNo: string;
  bizPhone: string;
  bizEmail: string;
  quoteValidDays: number;
  bagCount: number;
};

type Payload = { q: Quotation; biz: BizSnap; sentAt: string };

function decodePayload(str: string): Payload {
  // URL-safe base64 → 표준 base64로 복원
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, m => m.codePointAt(0)!);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default function SharePage() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const d = params.get('d');
      if (!d) throw new Error('no data');
      setPayload(decodePayload(d));
    } catch {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-slate-700 font-semibold text-lg">견적서를 불러올 수 없어요</p>
        <p className="text-sm text-slate-400 mt-2">링크가 잘못되었거나 만료된 링크예요</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">견적서를 불러오는 중...</p>
      </div>
    );
  }

  const { q, biz, sentAt } = payload;
  const sentDateStr = new Date(sentAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const wallpaperLabel = q.wallpaperType === '직접입력' ? q.wallpaperTypeCustom : q.wallpaperType;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-12">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-100 px-4 pt-12 pb-4">
        <p className="text-xs text-slate-400 mb-0.5">도배 견적서</p>
        <h1 className="text-lg font-bold text-slate-800">{biz.bizName}</h1>
      </header>

      <div className="px-4 py-5">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

          {/* 문서 헤더 — 수신 / 업체 정보 */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-x-4">
              {/* 왼쪽 */}
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">수신</p>
                  <p className="text-sm font-bold text-slate-800">{q.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">견적일</p>
                  <p className="text-sm text-slate-700">{sentDateStr}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">유효기간</p>
                  <p className="text-sm text-slate-700">견적일로부터 {biz.quoteValidDays}일</p>
                </div>
              </div>
              {/* 오른쪽 */}
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">상호</p>
                  <p className="text-sm font-semibold text-slate-800">{biz.bizName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">대표자</p>
                  <p className="text-sm text-slate-700">{biz.bizOwner}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">사업자번호</p>
                  <p className="text-sm text-slate-700">{biz.bizRegNo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">연락처</p>
                  <p className="text-sm text-slate-700">{biz.bizPhone}</p>
                  {biz.bizEmail && (
                    <p className="text-xs text-slate-500 mt-0.5">{biz.bizEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 금액 배너 */}
          <div className="bg-blue-600 px-5 py-5">
            <p className="text-blue-200 text-xs mb-1">도배 견적서</p>
            <p className="text-white font-bold text-2xl">{formatMoney(q.totalAmount)}</p>
            <p className="text-blue-200 text-sm mt-1">
              {q.workDate ? `시공 예정: ${q.workDate}` : '시공일 협의 예정'}
            </p>
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
              value={q.paymentMethod === '카드' ? '💳 카드' : '💵 현금'}
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
              <Row
                label="계약금"
                value={`-${formatMoney(q.contractDeposit)}`}
                valueClass="text-rose-500"
              />
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

          {/* 안내문 */}
          <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
            <div className="mb-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">💳 입금계좌</p>
              <p className="text-sm text-amber-900 font-medium">신한은행 110-312-878821</p>
              <p className="text-sm text-amber-900 font-medium">예금주: 이정숙</p>
            </div>
            <p className="text-xs font-semibold text-amber-700 mb-2">📌 안내사항</p>
            <ul className="space-y-1.5 text-xs text-amber-800 leading-relaxed">
              <li>∙ <span className="font-medium">폐기물 처리:</span> 원활한 현장 정리를 위해 75리터 쓰레기봉투 ({biz.bagCount}장)을 반드시 사전에 준비해 주시기 바랍니다.</li>
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
