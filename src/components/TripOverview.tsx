import React from 'react';
import type { TripBlueprint, PlanMain } from '../types';
import { getDayStatus } from '../utils';

interface TripOverviewProps {
  plan: TripBlueprint;
  onBack: () => void;
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getDayOfWeek(dateStr?: string): string {
  if (!dateStr) return '';
  const [d, m] = dateStr.split('/').map(Number);
  const year = 2025;
  const date = new Date(year, m - 1, d);
  return DAY_NAMES[date.getDay()];
}

function getMonthName(dateStr?: string): string {
  if (!dateStr) return '';
  const [, m] = dateStr.split('/').map(Number);
  return MONTH_NAMES[m - 1] || '';
}

const TripOverview: React.FC<TripOverviewProps> = ({ plan, onBack }) => {
  const sortedMains: PlanMain[] = [...(plan.planMains || [])].sort((a, b) => {
    const toNum = (d?: string) => {
      if (!d) return 9999;
      const [dd, mm] = d.split('/').map(Number);
      return mm * 100 + dd;
    };
    return toNum(a.date) - toNum(b.date);
  });

  const totalThb = [...(plan.summary || []), ...sortedMains.flatMap(p => p.schedules || [])]
    .reduce((s, i) => s + (i.thb || 0), 0);
  const totalJpy = [...(plan.summary || []), ...sortedMains.flatMap(p => p.schedules || [])]
    .reduce((s, i) => s + (i.jpy || 0), 0);

  // Find cover image per day (first item with image)
  const getDayImage = (pm: PlanMain) => {
    if (pm.image) return pm.image;
    return (pm.schedules || []).find(s => s.image)?.image || null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal back button */}
      <button
        onClick={onBack}
        className="fixed top-0 left-0 z-50 m-4 mt-[calc(1rem+env(safe-area-inset-top))] w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md border border-gray-100 text-secondary hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined text-xl">arrow_back</span>
      </button>

      <div className="max-w-lg mx-auto px-6 pb-32"
        style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>

        {/* Trip Name — editorial header */}
        <div className="mb-10 pt-4">
          <div className="flex items-baseline gap-0 leading-none mb-1">
            <span
              className="font-headline font-black text-secondary tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.8rem, 12vw, 4.5rem)' }}
            >
              {plan.trip.name.split(' ')[0].toUpperCase()}
            </span>
            <span
              className="text-secondary ml-2"
              style={{
                fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                fontSize: 'clamp(2rem, 9vw, 3.5rem)',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              {plan.trip.name.split(' ').slice(1).join(' ') || plan.trip.destination}
            </span>
          </div>
          {/* Budget summary */}
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

        {/* Fixed Expenses (if any) */}
        {(plan.summary || []).length > 0 && (
          <div className="mb-8">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3">Fixed Expenses</p>
            {plan.summary.map(item => (
              <div key={item.id} className="flex items-baseline gap-3 py-1.5">
                <span className="text-[12px] text-secondary flex-1 font-medium">{item.title}</span>
                <span className={`text-[12px] font-black shrink-0 ${item.jpy > 0 && item.thb === 0 ? 'text-blue-500' : 'text-japan-red'}`}>
                  {item.jpy > 0 && item.thb === 0 ? `¥${item.jpy.toLocaleString()}` : `฿${item.thb.toLocaleString()}`}
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
          const [dayNum] = pm.date?.split('/') || [''];
          const monthName = getMonthName(pm.date);
          const coverImg = getDayImage(pm);
          const isPast = status === 'past';
          const isToday = status === 'today';

          return (
            <div key={pm.id}>
              {/* Day row */}
              <div className="flex gap-5 py-5">
                {/* Left col — day label + date */}
                <div className="shrink-0 w-16">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[8px] font-black tracking-[0.18em] text-gray-400 uppercase">DAY</span>
                    <span className="text-[8px] font-black tracking-[0.18em] text-gray-400">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {pm.date && (
                    <div className="space-y-0">
                      {dayOfWeek && (
                        <p className="text-[7px] font-black tracking-[0.2em] text-gray-300 uppercase leading-tight">
                          {dayOfWeek}
                        </p>
                      )}
                      <p className="text-[7px] font-black tracking-[0.2em] text-gray-300 uppercase leading-tight">
                        DAY
                      </p>
                      <p className="text-[9px] font-black tracking-[0.1em] text-gray-400 mt-1">
                        {dayNum}/{monthName}
                      </p>
                    </div>
                  )}
                  {/* Status dot */}
                  {isToday && (
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent dot-pulse" />
                  )}
                  {isPast && (
                    <span className="material-symbols-outlined text-primary filled mt-1" style={{ fontSize: '14px' }}>
                      check_circle
                    </span>
                  )}
                </div>

                {/* Right col — content */}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      {/* Day title */}
                      <h2
                        className={`font-headline font-black uppercase tracking-wide leading-tight mb-1 ${
                          isToday ? 'text-accent' : isPast ? 'text-gray-300' : 'text-secondary'
                        }`}
                        style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', letterSpacing: '0.04em' }}
                      >
                        {pm.title}
                      </h2>
                      {pm.desc && (
                        <p className="text-[11px] font-bold text-japan-red mb-3 leading-snug">{pm.desc}</p>
                      )}
                    </div>

                    {/* Cover image */}
                    {coverImg && (
                      <div className="shrink-0 w-24 h-28 rounded-xl overflow-hidden shadow-md ml-2">
                        <img
                          src={coverImg}
                          alt={pm.title}
                          className="w-full h-full object-cover"
                          onError={e => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Schedule items */}
                  <div className="space-y-2.5 mt-1">
                    {(pm.schedules || []).map(item => (
                      <div key={item.id} className="flex items-baseline gap-3">
                        <span className="font-headline font-black text-[13px] text-secondary shrink-0 w-10 text-right">
                          {item.time}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[13px] leading-snug ${isPast ? 'text-gray-400' : 'text-secondary'}`}>
                            {item.title}
                          </span>
                          {item.desc && (
                            <p className="text-[11px] text-gray-400 italic mt-0.5 ml-0">{item.desc}</p>
                          )}
                        </div>
                        {(item.thb > 0 || item.jpy > 0) && (
                          <span className={`text-[11px] font-black shrink-0 ${item.jpy > 0 && item.thb === 0 ? 'text-blue-400' : 'text-japan-red'}`}>
                            {item.jpy > 0 && item.thb === 0 ? `¥${item.jpy.toLocaleString()}` : `฿${item.thb.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mx-16" />
            </div>
          );
        })}

        {/* Footer total */}
        {(totalThb > 0 || totalJpy > 0) && (
          <div className="mt-10 pt-6 border-t border-gray-100">
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
                  <p className="font-headline font-black text-2xl text-blue-500">¥{totalJpy.toLocaleString()}</p>
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
