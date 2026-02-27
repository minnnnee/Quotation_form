import { Quotation } from '@/types';

const KEY = 'quotations_v1';

export function getAllQuotations(): Quotation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuotation(q: Quotation): void {
  const all = getAllQuotations();
  const idx = all.findIndex(x => x.id === q.id);
  if (idx >= 0) {
    all[idx] = q;
  } else {
    all.unshift(q);
  }
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getQuotationById(id: string): Quotation | null {
  return getAllQuotations().find(q => q.id === id) ?? null;
}

export function deleteQuotation(id: string): void {
  const filtered = getAllQuotations().filter(q => q.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filtered));
}
