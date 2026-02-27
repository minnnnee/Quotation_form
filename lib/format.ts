import { Quotation } from '@/types';

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
  const sub =
    (q.materialCost ?? 0) +
    (q.laborCost ?? 0) +
    (q.removeCost ?? 0) +
    (q.otherCost ?? 0);
  return Math.max(0, sub - (q.discountAmount ?? 0));
}

export function formatQuotationText(q: Quotation): string {
  const wallpaperLabel = q.wallpaperType === '직접입력' ? q.wallpaperTypeCustom : q.wallpaperType;
  const lines: string[] = [];

  lines.push('📋 도배 견적서');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`👤 고객명: ${q.customerName || '-'}`);
  lines.push(`📍 시공 주소: ${q.address || '-'}`);
  lines.push(`📅 시공 예정일: ${q.workDate || '협의 후 결정'}`);
  lines.push('');
  lines.push('[ 시공 내역 ]');
  lines.push(`∙ 시공 범위: ${q.workScope}`);
  lines.push(`∙ 도배지 종류: ${wallpaperLabel || '-'}`);
  lines.push(`∙ 시공 면적: ${q.totalArea || 0}평`);
  lines.push(`∙ 기존 벽지 철거: ${q.removeOldWallpaper ? '포함' : '미포함'}`);
  lines.push('');
  lines.push('[ 견적 금액 ]');
  if (q.materialCost > 0) lines.push(`∙ 재료비: ${formatMoney(q.materialCost)}`);
  if (q.laborCost > 0) lines.push(`∙ 시공비: ${formatMoney(q.laborCost)}`);
  if (q.removeCost > 0) lines.push(`∙ 철거비: ${formatMoney(q.removeCost)}`);
  if (q.otherCost > 0) lines.push(`∙ 기타: ${formatMoney(q.otherCost)}`);
  if (q.discountAmount > 0) lines.push(`∙ 할인: -${formatMoney(q.discountAmount)}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`💰 최종 견적금액: ${formatMoney(q.totalAmount)}`);

  if (q.notes) {
    lines.push('');
    lines.push('[ 특이사항 ]');
    lines.push(q.notes);
  }

  lines.push('');
  lines.push('감사합니다 🙏 문의사항은 언제든지 연락 주세요.');

  return lines.join('\n');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
