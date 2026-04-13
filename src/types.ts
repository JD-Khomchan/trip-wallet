export interface SummaryItem {
  id: string;
  title: string;
  jpy: number;
  thb: number;
  type: string;
  desc?: string;
}

export interface DayItem {
  id: string;
  time: string;
  title: string;
  jpy: number;
  thb: number;
  type: string;
  desc?: string;
  isExtra?: boolean;
}

export interface DayPlan {
  date: string;
  items: DayItem[];
}

export interface UserState {
  planned: Record<string, { paid: boolean; actual: number }>;
  extras: DayItem[];
}

export type TabId = 'summary' | string;

export interface TripBlueprint {
  summary: SummaryItem[];
  days: DayPlan[];
}
