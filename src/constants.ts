import type { SummaryItem, PlanMain, TripBlueprint } from './types';

export const TRIP_BLUEPRINT: TripBlueprint = {
  trip: {
    id: 'japan2026',
    name: 'Japan May 2026',
    destination: 'Japan',
  },
  summary: [
    { id: 's1', title: "ตั๋วเครื่องบิน (Ticket)", jpy: 0, thb: 35670, type: "flight", desc: "BKK ➔ NRT (ไป-กลับ)" },
    { id: 's2', title: "Sotetsu Fresa Inn", jpy: 83830, thb: 18015, type: "hotel", desc: "Higashi Shinjuku" },
    { id: 's3', title: "Toyoko Inn Matsumoto", jpy: 9828, thb: 2112, type: "hotel", desc: "Matsumoto Station" },
    { id: 's4', title: "Mo-Mo-Paradise", jpy: 17000, thb: 3455.22, type: "food", desc: "Dinner at Shinjuku" },
    { id: 's5', title: "Train Backup", jpy: 15000, thb: 3000, type: "other", desc: "เงินสำรองเดินทาง" }
  ] as SummaryItem[],
  planMains: [
    {
      id: 'pm1', title: "Arrival Day", date: "18/05", jpy: 1460, thb: 5320,
      type: "transport", desc: "BKK → Matsumoto",
      schedules: [
        { id: 'd1_1', time: '08:00', title: "HND > Shinjuku", jpy: 1460, thb: 320, type: "transport", desc: "Tokyo Monorail" },
        { id: 'd1_2', time: '11:00', title: "Shinjuku > Matsumoto", jpy: 0, thb: 5000, type: "transport", desc: "Ltd. Express Azusa" }
      ]
    },
    {
      id: 'pm2', title: "Kamikochi", date: "19/05", jpy: 80706, thb: 21510,
      type: "activity", desc: "Matsumoto → Kamikochi",
      schedules: [
        { id: 'd2_1', time: '08:30', title: "Rent a Car", jpy: 73286, thb: 15000, type: "car", desc: "รับรถที่ Matsumoto" },
        { id: 'd2_2', time: '10:00', title: "Kamikochi Tour", jpy: 7420, thb: 1510, type: "transport", desc: "Bus + Hiking" },
        { id: 'd2_3', time: '17:00', title: "Return Car", jpy: 0, thb: 5000, type: "transport", desc: "Back to Shinjuku" }
      ]
    },
    {
      id: 'pm3', title: "Asakusa", date: "20/05", jpy: 15640, thb: 3180,
      type: "activity", desc: "Senso-ji & Kimono",
      schedules: [
        { id: 'd3_1', time: '09:00', title: "Hotel > Senso-ji", jpy: 440, thb: 90, type: "transport", desc: "Asakusa Temple" },
        { id: 'd3_2', time: '11:00', title: "Asakusa (Kimono)", jpy: 14760, thb: 3000, type: "activity", desc: "Experience" },
        { id: 'd3_3', time: '15:00', title: "Senso-ji > Hotel", jpy: 440, thb: 90, type: "transport", desc: "Shopping Return" }
      ]
    },
    {
      id: 'pm4', title: "teamLab", date: "21/05", jpy: 13320, thb: 2708.48,
      type: "activity", desc: "Digital Art + Departure",
      schedules: [
        { id: 'd4_1', time: '10:00', title: "Hotel > teamLab", jpy: 1020, thb: 207.31, type: "transport", desc: "Toyosu Sta." },
        { id: 'd4_2', time: '14:00', title: "teamLab Ticket", jpy: 10400, thb: 2115, type: "activity", desc: "Digital Art" },
        { id: 'd4_3', time: '18:00', title: "Hotel > Airport", jpy: 1900, thb: 386.17, type: "transport", desc: "HND Departure" }
      ]
    }
  ] as PlanMain[]
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
