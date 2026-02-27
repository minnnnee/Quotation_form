'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quotation } from '@/types';
import { getAllQuotations, deleteQuotation } from '@/lib/storage';
import { formatMoney } from '@/lib/format';

export default function HomePage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setQuotations(getAllQuotations());
  }, []);

  function handleDelete(id: string) {
    if (!confirm('견적서를 삭제할까요?')) return;
    deleteQuotation(id);
    setQuotations(getAllQuotations());
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white px-4 pt-12 pb-5 safe-top">
        <p className="text-blue-200 text-sm mb-0.5">견적 관리</p>
        <h1 className="text-2xl font-bold">도배 견적서</h1>
      </header>

      {/* 목록 */}
      <main className="flex-1 px-4 py-4 space-y-3">
        {quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
            <span className="text-6xl mb-4">📋</span>
            <p className="text-lg font-medium text-slate-500">작성된 견적서가 없어요</p>
            <p className="text-sm mt-1">아래 버튼을 눌러 견적서를 만들어보세요</p>
          </div>
        ) : (
          quotations.map(q => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden"
            >
              <button
                onClick={() => router.push(`/preview/${q.id}`)}
                className="w-full text-left px-4 py-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800 text-base">{q.customerName || '고객명 미입력'}</p>
                    <p className="text-sm text-slate-400 mt-0.5 truncate max-w-48">{q.address || '주소 미입력'}</p>
                  </div>
                  <span className="text-blue-600 font-bold text-base ml-2">{formatMoney(q.totalAmount)}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{q.wallpaperType === '직접입력' ? q.wallpaperTypeCustom : q.wallpaperType}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{q.totalArea}평</span>
                  {q.workDate && <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{q.workDate}</span>}
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
      <div className="sticky bottom-0 px-4 pb-8 pt-3 bg-gradient-to-t from-white to-transparent">
        <button
          onClick={() => router.push('/form/new')}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          + 새 견적서 작성
        </button>
      </div>
    </div>
  );
}
