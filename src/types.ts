export interface SummaryItem {
  id: string;
  title: string;
  jpy: number;
  thb: number;
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
  jpy: number;
  thb: number;
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
  jpy: number;
  thb: number;
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

export interface PlannedItem {
  paid: boolean;
  actual: number;
  currency: 'thb' | 'jpy';
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

export interface UserState {
  planned: Record<string, PlannedItem>;
  extras: ExtraItem[];
  wallet: WalletState;
  exchanges: ExchangeRecord[];
}

export type TabId = 'summary' | string;
