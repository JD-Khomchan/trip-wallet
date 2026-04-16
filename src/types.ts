// ─── Plan Data (shared, admin-managed, stored in trips/main) ──────────────────

export interface SummaryItem {
  id: string;
  title: string;
  amount: number;
  currency: 'thb' | 'jpy';
  type: string;
  desc?: string;
  image?: string;
  mapUrl?: string;
  guide?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  amount: number;
  currency: 'thb' | 'jpy';
  type: string;
  desc?: string;
  image?: string;
  mapUrl?: string;
  guide?: string;
}

export interface PlanMain {
  id: string;
  title: string;
  date?: string;
  type: string;
  desc?: string;
  image?: string;
  mapUrl?: string;
  guide?: string;
  schedules: ScheduleItem[];
}

export interface TripInfo {
  id: string;
  name: string;
  destination: string;
}

export interface TripBlueprint {
  trip: TripInfo;
  summary: SummaryItem[];
  planMains: PlanMain[];
}

// ─── User Tracking Data (per-user, stored in users/{uid}) ────────────────────

export interface PlannedItem {
  paid: boolean;
  // null  = user ยังไม่ได้กำหนด → ใช้ plan amount อัตโนมัติ
  // 0     = user จ่ายจริง 0 บาท/เยน
  // n > 0 = user จ่ายจริง n บาท/เยน
  actual: number | null;
  currency: 'thb' | 'jpy';
}

export interface ExtraItem {
  id: string;
  time: string;
  title: string;
  amount: number;
  currency: 'thb' | 'jpy';
  type: string;
  desc?: string;
  planMainId?: string;
}

export interface WalletState {
  thb: number;
  jpy: number;
}

export interface ExchangeRecord {
  id: string;
  date: string;
  thb: number;
  jpy: number;
  rate: number;
}

export interface TopupRecord {
  id: string;
  date: string;
  amount: number;
  currency: 'thb' | 'jpy';
}

export interface UserState {
  planned: Record<string, PlannedItem>;
  extras: ExtraItem[];
  wallet: WalletState;
  exchanges: ExchangeRecord[];
  topups?: TopupRecord[];
}

export type TabId = 'summary' | string;
