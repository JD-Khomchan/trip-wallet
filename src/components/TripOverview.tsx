import React, { useState } from 'react';
import type { TripBlueprint } from '../types';
import { getIcon } from '../constants';
import { getDayStatus } from '../utils';

interface TripOverviewProps {
  plan: TripBlueprint;
  onBack: () => void;
}

const DAY_COLORS: Record<string, { border: string; badge: string; dot: string }> = {
  past:    { border: 'border-l-primary',    badge: 'bg-primary/10 text-primary',       dot: 'bg-primary' },
  today:   { border: 'border-l-accent',     badge: 'bg-accent/10 text-accent',         dot: 'bg-accent dot-pulse' },
  future:  { border: 'border-l-gray-200',   badge: 'bg-gray-100 text-gray-400',        dot: 'bg-gray-300' },
};

const TripOverview: React.FC<TripOverviewProps> = ({ plan, onBack }) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const totalThb = [
    ...(plan.summary || []),
    ...(plan.planMains || []).flatMap(pm => pm.schedules || []),
  ].reduce((s, i) => s + (i.thb || 0), 0);

  const totalJpy = [
    ...(plan.summary || []),
    ...(plan.planMains || []).flatMap(pm => pm.schedules || []),
  ].reduce((s, i) => s + (i.jpy || 0), 0);

  const sortedMains = [...(plan.planMains || [])].sort((a, b) => {
    const toNum = (d?: string) => {
      if (!d) return 9999;
      const [dd, mm] = d.split('/').map(Number);
      return (mm || 0) * 100 + (dd || 0);
    };
    return toNum(a.date) - toNum(b.date);
  });

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-header border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-secondary transition-colors shrink-0">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-headline font-extrabold text-lg text-secondary leading-none truncate">
              {plan.trip.name}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Trip Overview</p>
          </div>
          {/* Budget pills */}
          <div className="flex gap-2 shrink-0">
            {totalThb > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-3 py-1.5 text-center">
                <p className="text-[8px] font-black text-japan-red uppercase tracking-wider leading-none">THB</p>
                <p className="text-[13px] font-headline font-black text-japan-red leading-tight">
                  ฿{totalThb.toLocaleString()}
                </p>
              </div>
            )}
            {totalJpy > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-3 py-1.5 text-center">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-wider leading-none">JPY</p>
                <p className="text-[13px] font-headline font-black text-blue-500 leading-tight">
                  ¥{totalJpy.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-32 space-y-3"
        style={{ paddingTop: 'calc(5.5rem + env(safe-area-inset-top))' }}>

        {/* Fixed Expenses */}
        {(plan.summary || []).length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => toggle('__summary')}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors">
              <div className="w-9 h-9 rounded-2xl bg-secondary/5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>payments</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-extrabold text-[14px] text-secondary">Fixed Expenses</p>
                <p className="text-[10px] font-bold text-gray-400">
                  {plan.summary.length} items
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-300 transition-transform duration-300"
                style={{ transform: collapsed.has('__summary') ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                expand_more
              </span>
            </button>

            {!collapsed.has('__summary') && (
              <div className="border-t border-gray-50 divide-y divide-gray-50">
                {plan.summary.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="material-symbols-outlined text-gray-300" style={{ fontSize: '16px' }}>
                      {getIcon(item.type)}
                    </span>
                    <p className="flex-1 text-[13px] font-bold text-secondary truncate">{item.title}</p>
                    <p className={`text-[13px] font-black shrink-0 ${item.jpy > 0 ? 'text-blue-500' : 'text-japan-red'}`}>
                      {item.jpy > 0 ? `¥${item.jpy.toLocaleString()}` : `฿${item.thb.toLocaleString()}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Day Cards */}
        {sortedMains.map((pm) => {
          const status = getDayStatus(pm.date);
          const colors = DAY_COLORS[status];
          const isOpen = !collapsed.has(pm.id);
          const dayThb = (pm.schedules || []).reduce((s, i) => s + (i.thb || 0), 0);
          const dayJpy = (pm.schedules || []).reduce((s, i) => s + (i.jpy || 0), 0);
          const [d, mo] = pm.date?.split('/') || [];
          const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
          const monthLabel = mo ? (monthNames[parseInt(mo) - 1] || '') : '';

          return (
            <div key={pm.id}
              className={`bg-white rounded-3xl border-y border-r border-gray-100 border-l-[5px] shadow-sm overflow-hidden ${colors.border}`}>
              {/* Day Header */}
              <button
                onClick={() => toggle(pm.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/30 transition-colors">
                {/* Date block */}
                {pm.date ? (
                  <div className="shrink-0 w-10 flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase">{monthLabel}</span>
                    <span className="text-2xl font-headline font-black text-secondary leading-none">{d}</span>
                  </div>
                ) : (
                  <div className={`w-3 h-3 rounded-full shrink-0 ${colors.dot}`} />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-headline font-extrabold text-[14px] text-secondary truncate">{pm.title}</p>
                    {status === 'today' && (
                      <span className="text-[8px] font-black bg-accent text-white px-2 py-0.5 rounded-full uppercase shrink-0">Today</span>
                    )}
                    {status === 'past' && (
                      <span className="material-symbols-outlined text-primary filled shrink-0" style={{ fontSize: '14px' }}>check_circle</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                    {(pm.schedules || []).length} stops
                    {dayThb > 0 && <span className="text-japan-red ml-2">฿{dayThb.toLocaleString()}</span>}
                    {dayJpy > 0 && <span className="text-blue-400 ml-2">¥{dayJpy.toLocaleString()}</span>}
                  </p>
                </div>

                <span className="material-symbols-outlined text-gray-300 shrink-0 transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </button>

              {/* Schedule Items */}
              {isOpen && (pm.schedules || []).length > 0 && (
                <div className="border-t border-gray-50">
                  {pm.schedules.map((item, idx) => (
                    <div key={item.id}
                      className={`flex items-center gap-3 px-5 py-3 ${idx < pm.schedules.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      {/* Time */}
                      <span className="text-[11px] font-black text-gray-300 w-10 shrink-0 text-right">{item.time}</span>
                      {/* Icon */}
                      <span className="material-symbols-outlined text-gray-300 shrink-0" style={{ fontSize: '16px' }}>
                        {getIcon(item.type)}
                      </span>
                      {/* Title */}
                      <p className="flex-1 text-[13px] font-bold text-secondary truncate">{item.title}</p>
                      {/* Price */}
                      {(item.thb > 0 || item.jpy > 0) && (
                        <p className={`text-[12px] font-black shrink-0 ${item.jpy > 0 ? 'text-blue-500' : 'text-japan-red'}`}>
                          {item.jpy > 0 ? `¥${item.jpy.toLocaleString()}` : `฿${item.thb.toLocaleString()}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isOpen && (pm.schedules || []).length === 0 && (
                <div className="border-t border-gray-50 py-5 text-center">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No schedules</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Grand Total */}
        <div className="bg-secondary rounded-3xl p-5 shadow-xl shadow-secondary/20">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Grand Total Plan</p>
          <div className="flex gap-4">
            {totalThb > 0 && (
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase">Thai Baht</p>
                <p className="text-2xl font-headline font-black text-white">฿{totalThb.toLocaleString()}</p>
              </div>
            )}
            {totalJpy > 0 && (
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase">Japanese Yen</p>
                <p className="text-2xl font-headline font-black text-blue-300">¥{totalJpy.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default TripOverview;
