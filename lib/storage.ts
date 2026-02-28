import { Quotation } from '@/types';
import { supabase } from './supabase';

// DB row (snake_case) → Quotation (camelCase)
function toQ(row: Record<string, unknown>): Quotation {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    address: row.address as string,
    workScope: row.work_scope as Quotation['workScope'],
    wallpaperType: row.wallpaper_type as Quotation['wallpaperType'],
    wallpaperTypeCustom: row.wallpaper_type_custom as string,
    totalArea: Number(row.total_area),
    paymentMethod: (row.payment_method as Quotation['paymentMethod']) ?? '현금',
    workCost: Number(row.work_cost),
    contractDeposit: Number(row.contract_deposit),
    totalAmount: Number(row.total_amount),
    workDate: row.work_date as string,
    notes: row.notes as string,
  };
}

// Quotation (camelCase) → DB row (snake_case)
function toRow(q: Quotation) {
  return {
    id: q.id,
    created_at: q.createdAt,
    customer_name: q.customerName,
    customer_phone: q.customerPhone,
    address: q.address,
    work_scope: q.workScope,
    wallpaper_type: q.wallpaperType,
    wallpaper_type_custom: q.wallpaperTypeCustom,
    total_area: q.totalArea,
    payment_method: q.paymentMethod,
    work_cost: q.workCost,
    contract_deposit: q.contractDeposit,
    total_amount: q.totalAmount,
    work_date: q.workDate,
    notes: q.notes,
  };
}

export async function getAllQuotations(): Promise<Quotation[]> {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toQ);
}

export async function saveQuotation(q: Quotation): Promise<void> {
  const { error } = await supabase
    .from('quotations')
    .upsert(toRow(q));
  if (error) throw error;
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return toQ(data);
}

export async function deleteQuotation(id: string): Promise<void> {
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export type BizSnap = {
  bizName: string; bizOwner: string; bizRegNo: string;
  bizPhone: string; bizEmail: string;
  quoteValidDays: number; bagCount: number;
};

// 공유 링크 생성 → DB에 저장하고 짧은 ID 반환
export async function createShareLink(q: Quotation, biz: BizSnap): Promise<string> {
  const { data, error } = await supabase
    .from('share_links')
    .insert({ quotation: q, biz, sent_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export type ShareLinkData = { quotation: Quotation; biz: BizSnap; sentAt: string };

export async function getShareLink(id: string): Promise<ShareLinkData | null> {
  const { data, error } = await supabase
    .from('share_links')
    .select('quotation, biz, sent_at')
    .eq('id', id)
    .single();
  if (error) return null;
  return { quotation: data.quotation as Quotation, biz: data.biz as BizSnap, sentAt: data.sent_at as string };
}
