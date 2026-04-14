import React from 'react';
import type { PlanMain, TabId } from '../types';
import { getDayStatus } from '../utils';

interface DashboardProps {
  planTotal: number;
  actualTotal: number;
  tripName: string;
  planMains: PlanMain[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  planTotal, 
  actualTotal, 
  tripName, 
  planMains, 
  activeTab, 
  onTabChange 
}) => {
  const diff = planTotal - actualTotal;
  const percent = Math.min(100, Math.round((actualTotal / planTotal) * 100)) || 0;
  const isOverBudget = diff < 0;

  return (
    <section className="mt-4 mb-8">
      {/* Trip Header & Progress */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="flex-1 min-w-0 pr-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Your Journey to</span>
          <h2 className="font-headline font-extrabold text-3xl text-secondary tracking-tight truncate leading-tight">{tripName}</h2>
        </div>
        <div className="relative shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
              className="text-japan-red" strokeDasharray={176} strokeDashoffset={176 - (176 * percent) / 100} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black italic text-japan-red">{percent}%</span>
          </div>
        </div>
      </div>

      {/* Budget Summary Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-between h-28 group transition-all hover:shadow-md">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">track_changes</span>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Budget Goal</p>
            <p className="text-xl font-headline font-extrabold text-secondary">฿{planTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="sakura-gradient p-4 rounded-3xl shadow-xl shadow-japan-red/10 flex flex-col justify-between h-28 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2">
            <span className="material-symbols-outlined text-4xl">payments</span>
          </div>
          <div className="flex justify-between items-start z-10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">wallet</span>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm ${
              isOverBudget ? "bg-white text-japan-red" : "bg-white/20 text-white"
             }`}>
              {isOverBudget ? "Over" : "Left: " + (diff > 1000 ? Math.floor(diff/1000) + "k" : diff)}
            </div>
          </div>
          <div className="z-10">
            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Actual Spent</p>
            <p className="text-xl font-headline font-extrabold">฿{actualTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Calendar-style Horizontal Navigation */}
      <div className="px-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Itinerary Schedule</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pt-4 pb-4">
          {/* Wallet/Summary Item */}
          <button 
            onClick={() => onTabChange('summary')}
            className={`flex flex-col overflow-hidden rounded-2xl min-w-[76px] h-[92px] transition-all border shrink-0 group ${
              activeTab === 'summary'
                ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20 scale-105'
                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className={`h-5 w-full flex items-center justify-center ${activeTab === 'summary' ? 'bg-white/10' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
              <span className="text-[8px] font-black uppercase tracking-tighter">Budget</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-1">
              <span className="material-symbols-outlined text-xl mb-0.5">account_balance_wallet</span>
              <span className="text-[10px] font-black uppercase leading-none">Wallet</span>
            </div>
          </button>

          {/* Plan Main Items (Calendar Page Style) */}
          {planMains.map((pm, idx) => {
            const isActive = activeTab === pm.id;
            const dayStatus = getDayStatus(pm.date);
            const isPast = dayStatus === 'past';
            const isToday = dayStatus === 'today';
            const [d, m] = pm.date?.split('/') || ['', ''];
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const monthLabel = m ? (monthNames[parseInt(m) - 1] || m) : "DAY";

            return (
              <button
                key={pm.id}
                onClick={() => onTabChange(pm.id)}
                className={`relative flex flex-col overflow-hidden rounded-2xl min-w-[76px] h-[92px] transition-all border shrink-0 group ${
                  isActive
                    ? 'bg-white border-secondary shadow-lg shadow-secondary/20 scale-105'
                    : isPast
                    ? 'bg-gray-50 border-gray-100 opacity-50 hover:opacity-80'
                    : isToday
                    ? 'bg-white border-japan-red shadow-lg shadow-japan-red/20 scale-105'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Today pulse ring */}
                {isToday && !isActive && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-japan-red animate-ping opacity-30 pointer-events-none" />
                )}

                {/* Header Strip */}
                <div className={`h-5 w-full flex items-center justify-center transition-colors ${
                  isActive ? 'sakura-gradient text-white'
                  : isToday ? 'bg-japan-red/10 text-japan-red'
                  : isPast ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                }`}>
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                    {isToday && !isActive ? '● TODAY' : monthLabel}
                  </span>
                </div>

                {/* Day Number */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <span className={`text-2xl font-headline font-black leading-none ${
                    isActive ? 'text-secondary'
                    : isToday ? 'text-japan-red'
                    : isPast ? 'text-gray-300'
                    : 'text-gray-300'
                  }`}>
                    {d || idx + 1}
                  </span>
                  {/* Past checkmark */}
                  {isPast && (
                    <span className="material-symbols-outlined text-gray-300 filled" style={{ fontSize: '12px' }}>
                      check_circle
                    </span>
                  )}
                </div>

                {/* Footer Title */}
                <div className={`py-1.5 px-1 w-full text-center transition-colors ${
                  isActive ? 'bg-secondary text-white'
                  : isToday ? 'bg-japan-red/10 text-japan-red'
                  : 'bg-transparent text-gray-400'
                }`}>
                  <span className="text-[8px] font-black uppercase leading-none block truncate">
                    {pm.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
