const KEY = 'app_settings_v1';

export interface AppSettings {
  bagCount: number;
  // 업체 정보
  bizName: string;        // 상호
  bizOwner: string;       // 대표자
  bizRegNo: string;       // 사업자번호
  bizPhone: string;       // 연락처
  bizEmail: string;       // 이메일
  quoteValidDays: number; // 유효기간 (일)
  appPin: string;         // 앱 잠금 PIN (빈 문자열이면 비활성)
}

const DEFAULT: AppSettings = {
  bagCount: 10,
  bizName: '감성도배',
  bizOwner: '이정숙',
  bizRegNo: '550-44-01153',
  bizPhone: '010-3222-1992',
  bizEmail: 'seswotn11@naver.com',
  quoteValidDays: 7,
  appPin: '',
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
