'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Quotation, WallpaperType, WorkScope, PaymentMethod } from '@/types';
import { saveQuotation, getQuotationById } from '@/lib/storage';
import { calcTotal, generateId } from '@/lib/format';

const WALLPAPER_TYPES: WallpaperType[] = ['합지', '실크', '합지(소폭)', '직접입력'];
const WORK_SCOPES: WorkScope[] = ['전체', '부분'];
const PAYMENT_METHODS: PaymentMethod[] = ['현금', '카드'];

function emptyForm(): Omit<Quotation, 'id' | 'createdAt'> {
  return {
    customerName: '',
    customerPhone: '',
    address: '',
    workScope: '전체',
    wallpaperType: '실크',
    wallpaperTypeCustom: '',
    totalArea: 0,
    paymentMethod: '현금',
    workCost: 0,
    contractDeposit: 0,
    totalAmount: 0,
    workDate: '',
    notes: '',
  };
}

export default function FormPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      const q = getQuotationById(id);
      if (q) {
        const { id: _id, createdAt: _ca, ...rest } = q;
        setForm({ ...rest, paymentMethod: rest.paymentMethod ?? '현금' });
      }
    }
  }, [id, isNew]);

  // 합계 자동 계산
  useEffect(() => {
    setForm(prev => ({ ...prev, totalAmount: calcTotal(prev) }));
  }, [form.workCost, form.contractDeposit, form.paymentMethod]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.customerName.trim()) {
      alert('고객명을 입력해주세요');
      return;
    }
    setSaving(true);
    const quotation: Quotation = {
      id: isNew ? generateId() : id,
      createdAt: isNew ? new Date().toISOString() : (getQuotationById(id)?.createdAt ?? new Date().toISOString()),
      ...form,
      totalAmount: calcTotal(form),
    };
    saveQuotation(quotation);
    router.push(`/preview/${quotation.id}`);
  }

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-500 text-xl p-1 -ml-1">←</button>
        <h1 className="text-lg font-bold text-slate-800">{isNew ? '새 견적서 작성' : '견적서 수정'}</h1>
      </header>

      <div className="px-4 py-5 space-y-6">

        {/* 고객 정보 */}
        <Section title="고객 정보">
          <Field label="고객명 *">
            <input
              type="text"
              value={form.customerName}
              onChange={e => set('customerName', e.target.value)}
              placeholder="홍길동"
              className={inputClass}
            />
          </Field>
          <Field label="휴대폰 번호">
            <input
              type="tel"
              value={form.customerPhone}
              onChange={e => set('customerPhone', e.target.value)}
              placeholder="010-0000-0000"
              className={inputClass}
            />
          </Field>
          <Field label="시공 주소">
            <input
              type="text"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="서울시 강남구 ..."
              className={inputClass}
            />
          </Field>
        </Section>

        {/* 시공 정보 */}
        <Section title="시공 정보">
          <Field label="시공 범위">
            <div className="flex gap-2">
              {WORK_SCOPES.map(s => (
                <button
                  key={s}
                  onClick={() => set('workScope', s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.workScope === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="도배지 종류">
            <div className="flex gap-2 flex-wrap">
              {WALLPAPER_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => set('wallpaperType', t)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    form.wallpaperType === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {form.wallpaperType === '직접입력' && (
              <input
                type="text"
                value={form.wallpaperTypeCustom}
                onChange={e => set('wallpaperTypeCustom', e.target.value)}
                placeholder="도배지 종류 직접 입력"
                className={`${inputClass} mt-2`}
              />
            )}
          </Field>

          <Field label="시공 면적 (평)">
            <input
              type="number"
              inputMode="decimal"
              value={form.totalArea || ''}
              onChange={e => set('totalArea', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className={inputClass}
            />
          </Field>

          <Field label="시공 예정일">
            <input
              type="date"
              value={form.workDate}
              onChange={e => set('workDate', e.target.value)}
              className={inputClass}
            />
          </Field>
        </Section>

        {/* 견적 금액 */}
        <Section title="견적 금액">
          <Field label="결제 방식">
            <div className="flex gap-2">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m}
                  onClick={() => set('paymentMethod', m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.paymentMethod === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'
                  }`}
                >
                  {m === '카드' ? '💳 카드' : '💵 현금'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="벽지 · 인건비 · 부자재 포함">
            <MoneyInput value={form.workCost} onChange={v => set('workCost', v)} />
          </Field>

          {form.paymentMethod === '카드' && form.workCost > 0 && (
            <Field label="부가세 (VAT 10%)">
              <div className="flex items-center justify-between px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-xs text-amber-600">카드·현금영수증 발행 시 추가</span>
                <span className="text-sm font-semibold text-amber-700">
                  +{Math.round(form.workCost * 0.1).toLocaleString('ko-KR')}원
                </span>
              </div>
            </Field>
          )}

          <Field label="계약금">
            <MoneyInput value={form.contractDeposit} onChange={v => set('contractDeposit', v)} prefix="-" />
          </Field>

          {/* 합계 */}
          <div className="mx-4 mb-4 bg-blue-600 rounded-2xl px-4 py-4 flex justify-between items-center">
            <span className="text-blue-100 font-medium">최종 견적금액</span>
            <span className="text-white font-bold text-xl">
              {calcTotal(form).toLocaleString('ko-KR')}원
            </span>
          </div>
        </Section>

        {/* 특이사항 */}
        <Section title="특이사항">
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="특이사항, 요청사항 등을 입력하세요"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Section>

      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-3 bg-gradient-to-t from-white to-transparent">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장하고 미리보기 →'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function MoneyInput({ value, onChange, prefix }: { value: number; onChange: (v: number) => void; prefix?: string }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
      <input
        type="text"
        inputMode="numeric"
        value={value ? value.toLocaleString('ko-KR') : ''}
        onChange={e => onChange(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
        placeholder="0"
        className={`${inputClass} ${prefix ? 'pl-7' : ''} pr-8`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">원</span>
    </div>
  );
}

const inputClass =
  'w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors placeholder:text-slate-300';
