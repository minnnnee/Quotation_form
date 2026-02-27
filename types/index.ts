export type WallpaperType = '합지' | '실크' | '실크고급' | '한지' | '직접입력';
export type WorkScope = '전체' | '부분';

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
  removeOldWallpaper: boolean;
  totalArea: number;
  // 비용 (원 단위)
  materialCost: number;
  laborCost: number;
  removeCost: number;
  otherCost: number;
  discountAmount: number;
  totalAmount: number;
  // 일정
  workDate: string;
  // 메모
  notes: string;
}
