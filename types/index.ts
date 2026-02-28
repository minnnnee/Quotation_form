export type WallpaperType = '합지' | '실크' | '합지(소폭)' | '직접입력';
export type WorkScope = '전체' | '부분';
export type PaymentMethod = '현금' | '카드';

export interface Quotation {
  id: string;
  createdAt: string;
  // 고객 정보
  customerName: string;
  customerPhone: string;
  address: string;
  // 시공 정보
  workScope: WorkScope;
  wallpaperType: WallpaperType;
  wallpaperTypeCustom: string;
  totalArea: number;
  // 비용 (원 단위) - 벽지·인건비·부자재 합산, 계약금
  paymentMethod: PaymentMethod; // 결제 방식 (카드 시 VAT 10% 포함)
  workCost: number;      // 벽지 · 인건비 · 부자재 포함
  contractDeposit: number; // 계약금 (차감)
  totalAmount: number;   // 최종 견적금액 (카드: workCost*1.1 - 계약금, 현금: workCost - 계약금)
  // 일정
  workDate: string;
  // 메모
  notes: string;
}
