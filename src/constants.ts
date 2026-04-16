import type { SummaryItem, PlanMain, TripBlueprint } from './types';

export const TRIP_BLUEPRINT: TripBlueprint = {
  trip: {
    id: 'trip1',
    name: 'My Trip',
    destination: '',
  },
  summary: [] as SummaryItem[],
  planMains: [] as PlanMain[],
};

export const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    transport: 'directions_subway',
    flight: 'flight_takeoff',
    hotel: 'bed',
    food: 'restaurant',
    car: 'directions_car',
    activity: 'local_activity',
    other: 'payments'
  };
  return icons[type] || 'payments';
};
