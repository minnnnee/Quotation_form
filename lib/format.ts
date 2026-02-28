import { Quotation } from '@/types';
import type { AppSettings } from './settings';

type BizInfo = Pick<AppSettings, 'bizName' | 'bizOwner' | 'bizRegNo' | 'bizPhone' | 'bizEmail' | 'quoteValidDays'>;

const DEFAULT_BIZ: BizInfo = {
  bizName: '경성도배',
  bizOwner: '이정숙',
  bizRegNo: '550-44-01153',
  bizPhone: '010-3222-1992',
  bizEmail: 'seswotn11@naver.com',
  quoteValidDays: 7,
};

export function formatMoney(amount: number): string {
  if (!amount) return '0원';
  return amount.toLocaleString('ko-KR') + '원';
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

export function calcTotal(q: Partial<Quotation>): number {
  const base = q.workCost ?? 0;
  const vat = q.paymentMethod === '카드' ? Math.round(base * 0.1) : 0;
  return Math.max(0, base + vat - (q.contractDeposit ?? 0));
}

// 견적서 하단 고정 안내 문구 (봉투 수량 동적)
export function buildNoticeText(bagCount: number): string {
  return `━━━━━━━━━━━━━━━━━━━━
💳 입금계좌: 신한은행 110-312-878821
    예금주: 이정숙

📌 안내사항
∙ 폐기물 처리: 원활한 현장 정리를 위해 75리터 쓰레기봉투 (${bagCount}장)을 반드시 사전에 준비해 주시기 바랍니다.
∙ 부가세 별도: 본 견적은 부가세 미포함 금액입니다. (카드 결제 및 현금영수증 발행 시 10% 추가)
∙ 예약금 규정: 계약 확정 후 단순 변심으로 인한 해지시, 예약금은 반환되지 않습니다.
∙ 시공 제외 구역: 시스템형 및 붙박이 가구가 설치된 구역은 도배 시공이 불가합니다. (필요 시 사전 해체 필수)
∙ 하자 책임: 기존 벽지 상태나 천장 구조 결함 등 사전 고지된 사항 외 문제에 대해서는 책임지지 않습니다.
※ 누수 및 결로로 인한 하자는 책임지지 않습니다.`;
}

export function formatQuotationText(q: Quotation, bagCount = 10, biz: BizInfo = DEFAULT_BIZ): string {
  const wallpaperLabel = q.wallpaperType === '직접입력' ? q.wallpaperTypeCustom : q.wallpaperType;
  const todayStr = today();
  const lines: string[] = [];

  lines.push('📋 도배 견적서');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`수신: ${q.customerName || '-'}`);
  lines.push(`견적일: ${todayStr} | 유효기간: 견적일로부터 ${biz.quoteValidDays}일`);
  lines.push(`상호: ${biz.bizName} | 대표자: ${biz.bizOwner}`);
  lines.push(`사업자번호: ${biz.bizRegNo}`);
  lines.push(`연락처: ${biz.bizPhone}${biz.bizEmail ? ` | ${biz.bizEmail}` : ''}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`📍 시공 주소: ${q.address || '-'}`);
  lines.push(`📅 시공 예정일: ${q.workDate || '협의 후 결정'}`);
  lines.push('');
  lines.push('[ 시공 내역 ]');
  lines.push(`∙ 시공 범위: ${q.workScope}`);
  lines.push(`∙ 도배지 종류: ${wallpaperLabel || '-'}`);
  lines.push(`∙ 시공 면적: ${q.totalArea || 0}평`);
  lines.push('');
  lines.push('[ 견적 금액 ]');
  lines.push(`∙ 결제 방식: ${q.paymentMethod || '현금'}`);
  lines.push(`∙ 벽지 · 인건비 · 부자재: ${formatMoney(q.workCost)}`);
  if (q.paymentMethod === '카드') {
    lines.push(`∙ 부가세 (VAT 10%): +${formatMoney(Math.round(q.workCost * 0.1))}`);
  }
  if (q.contractDeposit > 0) lines.push(`∙ 계약금: -${formatMoney(q.contractDeposit)}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`💰 최종 견적금액: ${formatMoney(q.totalAmount)}`);

  if (q.notes) {
    lines.push('');
    lines.push('[ 특이사항 ]');
    lines.push(q.notes);
  }

  lines.push('');
  lines.push(buildNoticeText(bagCount));

  return lines.join('\n');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
