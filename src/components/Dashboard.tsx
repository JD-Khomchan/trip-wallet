import React from 'react';
import type { PlanMain, TabId } from '../types';
import { getDayStatus } from '../utils';

interface CurrencyStat { 
  plan: number; 
  actual: number; 
}

interface DashboardProps {
  activeCurrency: 'thb' | 'jpy';
  onSwitchCurrency: (currency: 'thb' | 'jpy') => void;
  stats: {
    thb: CurrencyStat;
    jpy: CurrencyStat;
  };
  tripName: string;
  planMains: PlanMain[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  walletStats: {
    thbRemaining: number;
    jpyRemaining: number;
    thbDeposited: number;
    jpyDeposited: number;
  };
  onOpenTopup: () => void;
  onOpenExchange: () => void;
  exchangeRate: number | null;
}

const Dashboard: React.FC<DashboardProps> = ({
  activeCurrency,
  onSwitchCurrency,
  stats,
  tripName,
  planMains,
  activeTab,
  onTabChange,
  walletStats,
  onOpenTopup,
  onOpenExchange,
  exchangeRate,
}) => {
  const calcPercent = (actual: number, plan: number) => 
    Math.min(100, Math.round((actual / (plan || 1)) * 100)) || 0;

  const thbPercent = calcPercent(stats.thb.actual, stats.thb.plan);
  const jpyPercent = calcPercent(stats.jpy.actual, stats.jpy.plan);

  const isJpy = activeCurrency === 'jpy';
  const inactiveCurrency = isJpy ? 'thb' : 'jpy';
  const currentPercent = isJpy ? jpyPercent : thbPercent;

  return (
    <section className="mt-4 mb-6">
      {/* Header Compact */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="min-w-0 pr-2">
          <h2 className="font-headline font-black text-2xl text-secondary tracking-tight truncate">{tripName}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Wallet Switcher</span>
            <div className="h-0.5 w-4 bg-gray-100"></div>
          </div>
        </div>
        <button onClick={onOpenExchange} 
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-blue-500 hover:bg-gray-50 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-lg">currency_exchange</span>
        </button>
      </div>

      {/* Modern Wallet Switcher Layout */}
      <div className="flex gap-4 mb-8 items-stretch h-[160px]">
        {/* --- Active Wallet Card (Big One) --- */}
        <div className="flex-3 bg-white rounded-4xl p-6 shadow-2xl shadow-secondary/10 border border-gray-100 relative overflow-hidden card-enter">
          {/* Background Decor */}
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] ${isJpy ? 'bg-blue-500' : 'bg-japan-red'}`}></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                  {isJpy ? 'Japanese Yen' : 'Thai Baht'} Wallet
                </p>
                <h3 className={`text-3xl font-headline font-black ${isJpy ? 'text-blue-500' : 'text-japan-red'} truncate`}>
                  {isJpy ? '¥' : '฿'}{walletStats[`${activeCurrency}Remaining`].toLocaleString()}
                </h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenTopup(); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 transition-all shadow-sm active:scale-90 ${
                    isJpy ? 'bg-blue-50 text-blue-500 hover:bg-blue-100' : 'bg-red-50 text-japan-red hover:bg-red-100'
                }`}>
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Spent / Plan</p>
                  <p className="text-[12px] font-black text-secondary truncate">
                    {isJpy ? '¥' : '฿'}{stats[activeCurrency].actual.toLocaleString()}
                    <span className="text-gray-300 font-bold ml-1 font-headline">/ {isJpy ? '¥' : '฿'}{stats[activeCurrency].plan.toLocaleString()}</span>
                  </p>
                </div>
                <span className={`text-[11px] font-black ${isJpy ? 'text-blue-500' : 'text-japan-red'}`}>
                  {currentPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${isJpy ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-japan-red shadow-[0_0_8px_rgba(200,34,50,0.5)]'}`}
                     style={{ width: `${currentPercent}%` }}></div>
              </div>
              {exchangeRate && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Est. Total Plan</p>
                  <p className={`text-[11px] font-black ${isJpy ? 'text-blue-500' : 'text-japan-red'}`}>
                    {isJpy ? '¥' : '฿'}
                    {isJpy
                      ? Math.round(stats.jpy.plan + stats.thb.plan * exchangeRate).toLocaleString()
                      : Math.round(stats.thb.plan + stats.jpy.plan / exchangeRate).toLocaleString()}
                    <span className="text-gray-300 font-normal text-[8px] ml-1">@ {isJpy ? `฿1=¥${exchangeRate}` : `¥1=฿${(1/exchangeRate).toFixed(2)}`}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Inactive Wallet Card (Small One - Clickable Switcher) --- */}
        <button 
          onClick={() => onSwitchCurrency(inactiveCurrency)}
          className="flex-1 bg-gray-50/50 rounded-4xl border border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-solid hover:shadow-xl hover:shadow-secondary/10 transition-all group opacity-80 hover:opacity-100 active:scale-95"
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110 group-hover:rotate-12 ${inactiveCurrency === 'thb' ? 'bg-japan-red shadow-japan-red/20' : 'bg-blue-500 shadow-blue-500/20'}`}>
            <span className="text-xl font-black">{inactiveCurrency === 'thb' ? '฿' : '¥'}</span>
          </div>
          <div className="text-center overflow-hidden w-full">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Switch to</p>
            <p className="text-[11px] font-black text-secondary truncate px-1">
              {inactiveCurrency === 'thb' ? '฿' : '¥'}{walletStats[`${inactiveCurrency}Remaining`].toLocaleString()}
            </p>
          </div>
        </button>
      </div>

      {/* Horizontal Nav - Wrapper for containing negative margins */}
      <div className="overflow-hidden -mx-5 px-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Itinerary Schedule</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pt-3 pb-4">
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

          {planMains.map((pm, idx) => {
            const isActive = activeTab === pm.id;
            const dayStatus = getDayStatus(pm.date);
            const isPast = dayStatus === 'past';
            const isToday = dayStatus === 'today';
            const [d, m] = pm.date?.split('/') || ['', ''];
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const monthLabel = m ? (monthNames[parseInt(m) - 1] || "MAY") : "MAY";

            return (
              <button
                key={pm.id}
                onClick={() => onTabChange(pm.id)}
                className={`relative flex flex-col overflow-hidden rounded-2xl min-w-[76px] h-[92px] transition-all shrink-0 group border-2 ${
                  isActive
                    ? 'bg-white border-secondary shadow-lg shadow-secondary/30 -translate-y-1 scale-105'
                    : isToday
                    ? 'bg-white border-japan-red shadow-japan-red/20 scale-105'
                    : 'bg-white border-gray-100 hover:border-secondary/30'
                }`}
              >
                {isToday && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-japan-red animate-ping opacity-20 pointer-events-none" />
                )}
                <div className="h-5 w-full flex items-center justify-center sakura-gradient text-white">
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                    {isToday ? '● TODAY' : monthLabel}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <span className={`text-2xl font-headline font-black leading-none ${
                    isActive ? 'text-secondary' : isToday ? 'text-japan-red' : 'text-gray-400'
                  }`}>
                    {d || idx + 1}
                  </span>
                </div>
                <div className={`py-1.5 px-1 w-full text-center transition-colors ${
                  isActive ? 'bg-secondary text-white' : 'bg-gray-50 text-gray-400'
                }`}>
                  <span className="text-[8px] font-black uppercase leading-none block truncate">
                    {isPast ? 'DONE' : pm.title}
                  </span>
                  {isPast && !isActive && (
                    <div className="absolute top-6 right-1">
                      <span className="material-symbols-outlined text-primary filled" style={{ fontSize: '14px' }}>
                        check_circle
                      </span>
                    </div>
                  )}
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
