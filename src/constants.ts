import type { SummaryItem, PlanMain, TripBlueprint } from './types';

export const TRIP_BLUEPRINT: TripBlueprint = {
  trip: {
    id: 'japan2026',
    name: 'MEE Japan 2026',
    destination: 'Japan',
  },
  summary: [
    { id: 's1', title: "ตั๋วเครื่องบิน (Ticket)", jpy: 0, thb: 35670, type: "flight", desc: "BKK ➔ HND (ไป-กลับ)" },
    { id: 's2', title: "Toyoko Inn Matsumoto", jpy: 9828, thb: 2112, type: "hotel", desc: "Matsumoto Eki Higashi Guchi" },
    { id: 's3', title: "Dai-ichi Inn Ikebukuro", jpy: 0, thb: 0, type: "hotel", desc: "Tokyo - 5 คืน" },
    { id: 's4', title: "Mo-Mo-Paradise", jpy: 17000, thb: 3455, type: "food", desc: "Dinner Shinjuku" },
    { id: 's5', title: "Train Backup", jpy: 15000, thb: 3000, type: "other", desc: "เงินสำรองเดินทาง" }
  ] as SummaryItem[],
  planMains: [
    {
      id: 'pm1', title: "Flight Day", date: "17/05", jpy: 0, thb: 0,
      type: "flight", desc: "HuaHin → Bangkok → HND",
      schedules: [
        { id: 'p1_1', time: '14:00', title: "HuaHin → Bangkok", jpy: 0, thb: 0, type: "transport", desc: "ขับรถไป BKK" },
        { id: 'p1_2', time: '18:00', title: "Way to Suvarnabhumi", jpy: 0, thb: 0, type: "transport", desc: "มุ่งหน้าสนามบิน" },
        { id: 'p1_3', time: '21:35', title: "Boarding", jpy: 0, thb: 35670, type: "flight", desc: "BKK → HND" },
      ]
    },
    {
      id: 'pm2', title: "Arrival Day", date: "18/05", jpy: 1460, thb: 5320,
      type: "transport", desc: "HND → Matsumoto",
      schedules: [
        { id: 'p2_1', time: '06:00', title: "Landing Haneda", jpy: 0, thb: 0, type: "flight", desc: "Haneda Airport" },
        { id: 'p2_2', time: '07:00', title: "HND → Shinjuku", jpy: 1460, thb: 320, type: "transport", desc: "Tokyo Monorail → Yamanote" },
        { id: 'p2_3', time: '09:00', title: "Shinjuku → Matsumoto", jpy: 0, thb: 5000, type: "transport", desc: "Ltd. Express Azusa" },
        { id: 'p2_4', time: '15:00', title: "Check in Toyoko Inn", jpy: 9828, thb: 2112, type: "hotel", desc: "Matsumoto Eki Higashi Guchi" },
        { id: 'p2_5', time: '17:00', title: "Walk Matsumoto City", jpy: 0, thb: 0, type: "activity", desc: "เดินเล่นรอบเมือง" },
      ]
    },
    {
      id: 'pm3', title: "Kamikōchi", date: "19/05", jpy: 80706, thb: 21510,
      type: "activity", desc: "Matsumoto → Kamikōchi → Shinjuku",
      schedules: [
        { id: 'p3_1', time: '05:30', title: "Matsumoto Bus Station", jpy: 0, thb: 0, type: "transport", desc: "เดินทางไปสถานีบัส" },
        { id: 'p3_2', time: '07:00', title: "Arrived Kamikōchi", jpy: 7420, thb: 1510, type: "activity", desc: "Bus + Hiking" },
        { id: 'p3_3', time: '12:00', title: "Back to Matsumoto", jpy: 0, thb: 0, type: "transport", desc: "นั่งบัสกลับ" },
        { id: 'p3_4', time: '13:45', title: "Matsumoto → Shinjuku", jpy: 73286, thb: 15000, type: "car", desc: "รถเช่ากลับ Shinjuku" },
        { id: 'p3_5', time: '16:30', title: "Arrived Shinjuku", jpy: 0, thb: 0, type: "transport", desc: "Shinjuku Station" },
        { id: 'p3_6', time: '17:00', title: "Check in Dai-ichi Inn", jpy: 0, thb: 0, type: "hotel", desc: "Ikebukuro" },
        { id: 'p3_7', time: '17:30', title: "Walk/Eat Higashi Shinjuku", jpy: 17000, thb: 3455, type: "food", desc: "Mo-Mo-Paradise" },
      ]
    },
    {
      id: 'pm4', title: "Kimono Day", date: "20/05", jpy: 15640, thb: 3180,
      type: "activity", desc: "Asakusa & Kimono",
      schedules: [
        { id: 'p4_1', time: '09:30', title: "Go to Asakusa", jpy: 440, thb: 90, type: "transport", desc: "Subway to Asakusa" },
        { id: 'p4_2', time: '11:00', title: "Asakusa Kimono", jpy: 14760, thb: 3000, type: "activity", desc: "Kimono Experience" },
        { id: 'p4_3', time: '15:00', title: "Asakusa → Hotel", jpy: 440, thb: 90, type: "transport", desc: "กลับโรงแรม" },
      ]
    },
    {
      id: 'pm5', title: "teamLab", date: "21/05", jpy: 13320, thb: 2708,
      type: "activity", desc: "Digital Art Museum",
      schedules: [
        { id: 'p5_1', time: '10:00', title: "Hotel → teamLab", jpy: 1020, thb: 207, type: "transport", desc: "Toyosu Station" },
        { id: 'p5_2', time: '14:00', title: "teamLab Ticket", jpy: 10400, thb: 2115, type: "activity", desc: "teamLab Planets" },
        { id: 'p5_3', time: '18:00', title: "Back to Hotel", jpy: 1900, thb: 386, type: "transport", desc: "กลับโรงแรม" },
      ]
    },
    {
      id: 'pm6', title: "Nakameguro", date: "22/05", jpy: 0, thb: 0,
      type: "activity", desc: "Nakameguro Canal",
      schedules: [
        { id: 'p6_1', time: '10:00', title: "Hotel → Nakameguro", jpy: 0, thb: 0, type: "transport", desc: "Subway to Nakameguro" },
        { id: 'p6_2', time: '11:00', title: "Nakameguro Walk", jpy: 0, thb: 0, type: "activity", desc: "เดินริมคลอง" },
      ]
    },
    {
      id: 'pm7', title: "Free / Shopping", date: "23/05", jpy: 0, thb: 0,
      type: "other", desc: "อิสระ / ช้อปปิ้ง",
      schedules: [
        { id: 'p7_1', time: '10:00', title: "Free Day", jpy: 0, thb: 0, type: "other", desc: "อิสระทำกิจกรรมตามชอบ" },
      ]
    },
    {
      id: 'pm8', title: "Shopping", date: "24/05", jpy: 0, thb: 0,
      type: "other", desc: "ช้อปปิ้งวันสุดท้าย",
      schedules: [
        { id: 'p8_1', time: '10:00', title: "Shopping Day", jpy: 0, thb: 0, type: "other", desc: "ช้อปปิ้งก่อนบิน" },
      ]
    },
    {
      id: 'pm9', title: "Flight Back", date: "25/05", jpy: 0, thb: 0,
      type: "flight", desc: "HND → BKK",
      schedules: [
        { id: 'p9_1', time: '12:00', title: "Check out → Airport", jpy: 0, thb: 0, type: "transport", desc: "เช็คเอาท์ มุ่งหน้าสนามบิน" },
        { id: 'p9_2', time: '19:10', title: "Boarding", jpy: 0, thb: 0, type: "flight", desc: "HND → BKK" },
      ]
    },
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
