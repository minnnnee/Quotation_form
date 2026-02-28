import type { Metadata } from 'next';
import { getShareLink } from '@/lib/storage';
import { formatMoney } from '@/lib/format';
import ShareView from './ShareView';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getShareLink(id);
  if (!data) return { title: '도배 견적서' };

  const { quotation: q, biz } = data;
  const title = `[도배 견적서] ${q.customerName ? q.customerName + '님' : biz.bizName}`;
  const description = `${biz.bizName} · ${q.totalArea}평 ${q.workScope} · ${formatMoney(q.totalAmount)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const data = await getShareLink(id);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-slate-700 font-semibold text-lg">견적서를 불러올 수 없어요</p>
        <p className="text-sm text-slate-400 mt-2">링크가 잘못되었거나 이미 삭제된 링크예요</p>
      </div>
    );
  }

  const diffDays = (Date.now() - new Date(data.sentAt).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > data.biz.quoteValidDays) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <p className="text-5xl mb-4">⏰</p>
        <p className="text-slate-700 font-semibold text-lg">견적 유효기간이 지났어요</p>
        <p className="text-sm text-slate-400 mt-2">담당자에게 새 견적서를 요청해 주세요</p>
      </div>
    );
  }

  return <ShareView data={data} />;
}
