import React from 'react';
import type { TripBlueprint, PlanMain } from '../types';
import { getDayStatus, formatAmount } from '../utils';

interface TripOverviewProps {
  plan: TripBlueprint;
  onBack: () => void;
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getDayOfWeek(dateStr?: string): string {
  if (!dateStr) return '';
  const [d, m] = dateStr.split('/').map(Number);
  const date = new Date(new Date().getFullYear(), m - 1, d);
  return DAY_NAMES[date.getDay()];
}

function getMonthName(dateStr?: string): string {
  if (!dateStr) return '';
  const [, m] = dateStr.split('/').map(Number);
  return MONTH_NAMES[m - 1] ?? '';
}

const TripOverview: React.FC<TripOverviewProps> = ({ plan, onBack }) => {
  const sortedMains: PlanMain[] = [...(plan.planMains ?? [])].sort((a, b) => {
    const toNum = (d?: string) => {
      if (!d) return 9999;
      const [dd, mm] = d.split('/').map(Number);
      return mm * 100 + dd;
    };
    return toNum(a.date) - toNum(b.date);
  });

  const allItems = [...(plan.summary ?? []), ...sortedMains.flatMap(p => p.schedules ?? [])];
  const totalThb = allItems.filter(i => i.currency === 'thb').reduce((s, i) => s + i.amount, 0);
  const totalJpy = allItems.filter(i => i.currency === 'jpy').reduce((s, i) => s + i.amount, 0);

  const getDayImage = (pm: PlanMain) =>
    pm.image ?? (pm.schedules ?? []).find(s => s.image)?.image ?? null;

  return (
    <div className="min-h-screen bg-white">
      <button
        onClick={onBack}
        className="fixed top-0 left-0 z-50 m-4 mt-[calc(1rem+env(safe-area-inset-top))] w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md border border-gray-100 text-secondary hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined text-xl">arrow_back</span>
      </button>

      <div className="max-w-lg mx-auto px-6 pb-32" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>

        {/* Trip header */}
        <div className="mb-10 pt-4">
          <div className="flex items-baseline gap-0 leading-none mb-1">
            <span className="font-headline font-black text-secondary tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.8rem, 12vw, 4.5rem)' }}>
              {plan.trip.name.split(' ')[0].toUpperCase()}
            </span>
            <span className="text-secondary ml-2"
              style={{ fontFamily: '"Dancing Script", "Brush Script MT", cursive', fontSize: 'clamp(2rem, 9vw, 3.5rem)', fontStyle: 'italic', fontWeight: 600 }}>
              {plan.trip.name.split(' ').slice(1).join(' ') || plan.trip.destination}
            </span>
          </div>
          <div className="flex gap-3 mt-4">
            {totalThb > 0 && (
              <span className="text-[11px] font-bold text-gray-400">
                ฿<span className="text-secondary font-black ml-0.5">{totalThb.toLocaleString()}</span>
              </span>
            )}
            {totalThb > 0 && totalJpy > 0 && <span className="text-gray-200">·</span>}
            {totalJpy > 0 && (
              <span className="text-[11px] font-bold text-gray-400">
                ¥<span className="text-secondary font-black ml-0.5">{totalJpy.toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Fixed Expenses */}
        {(plan.summary ?? []).length > 0 && (
          <div className="mb-8">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3">Fixed Expenses</p>
            {plan.summary.map(item => (
              <div key={item.id} className="flex items-baseline gap-3 py-1.5">
                <span className="text-[12px] text-secondary flex-1 font-medium">{item.title}</span>
                <span className="text-[12px] font-black shrink-0 text-japan-red">
                  {formatAmount(item.amount, item.currency)}
                </span>
              </div>
            ))}
            <div className="mt-4 h-px bg-gray-100" />
          </div>
        )}

        {/* Days */}
        {sortedMains.map((pm, idx) => {
          const status = getDayStatus(pm.date);
          const dayOfWeek = getDayOfWeek(pm.date);
          const [dayNum] = pm.date?.split('/') ?? [''];
          const monthName = getMonthName(pm.date);
          const coverImg = getDayImage(pm);
          const isPast = status === 'past';
          const isToday = status === 'today';

          return (
            <div key={pm.id} className="relative group overflow-hidden -mx-6 mb-0">
              {coverImg && (
                <div className="absolute inset-y-0 right-0 w-[45%] z-0 pointer-events-none transition-transform duration-1000 group-hover:scale-105">
                  <img src={coverImg} alt="" className="w-full h-full object-cover opacity-30" onError={e => e.currentTarget.style.display = 'none'} />
                  <div className="absolute inset-0 bg-linear-to-r from-white via-white/20 to-transparent"></div>
                  <div className="absolute inset-0 bg-linear-to-b from-white from-0% via-transparent via-[8%] via-transparent via-[92%] to-white to-100%"></div>
                </div>
              )}

              <div className="relative z-10 flex gap-5 py-10 px-6 border-b border-gray-50/50">
                <div className="shrink-0 w-16 pt-1">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">DAY</span>
                    <span className="text-[11px] font-black tracking-widest text-gray-400">{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  {pm.date && (
                    <div className="space-y-0.5">
                      {dayOfWeek && <p className="text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase leading-tight">{dayOfWeek}</p>}
                      <p className="text-[11px] font-black tracking-[0.05em] text-gray-500 mt-1">{dayNum} {monthName}</p>
                    </div>
                  )}
                  <div className="mt-3">
                    {isToday && <div className="w-2 h-2 rounded-full bg-japan-red dot-pulse" />}
                    {isPast && <span className="material-symbols-outlined text-primary filled" style={{ fontSize: '18px' }}>check_circle</span>}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className={`font-headline font-black uppercase tracking-wide leading-tight mb-1.5 ${isToday ? 'text-japan-red' : isPast ? 'text-gray-300' : 'text-secondary'}`}
                    style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.5rem)', letterSpacing: '0.02em' }}>
                    {pm.title}
                  </h2>
                  {pm.desc && <p className="text-[11px] font-bold text-gray-400 mb-4 leading-snug">{pm.desc}</p>}

                  <div className="space-y-3 mt-2">
                    {(pm.schedules ?? []).map(item => (
                      <div key={item.id} className="flex items-baseline gap-3">
                        <span className="font-headline font-black text-[12px] text-gray-300 shrink-0 w-10 text-right">{item.time}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[13px] font-medium leading-snug ${isPast ? 'text-gray-300' : 'text-secondary/80'}`}>
                            {item.title}
                          </span>
                        </div>
                        {item.amount > 0 && (
                          <span className="text-[11px] font-black shrink-0 text-japan-red/60">
                            {formatAmount(item.amount, item.currency)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Total */}
        {(totalThb > 0 || totalJpy > 0) && (
          <div className="mt-10 pt-10 border-t border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Total Budget</p>
            <div className="flex gap-6">
              {totalThb > 0 && (
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Thai Baht</p>
                  <p className="font-headline font-black text-2xl text-japan-red">฿{totalThb.toLocaleString()}</p>
                </div>
              )}
              {totalJpy > 0 && (
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Japanese Yen</p>
                  <p className="font-headline font-black text-2xl text-japan-red">¥{totalJpy.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripOverview;
