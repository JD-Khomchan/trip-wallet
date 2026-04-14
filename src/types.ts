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
  jpy: number;
  thb: number;
  type: string;
  desc?: string;
  image?: string;
  mapUrl?: string;
  guide?: string;
  planMainId?: string;
}

export interface UserState {
  planned: Record<string, { paid: boolean; actual: number }>;
  extras: ExtraItem[];
}

export type TabId = 'summary' | string;
