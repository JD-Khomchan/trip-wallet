import React, { useRef, useState, useEffect } from 'react';
import type { PlanMain, TabId } from '../types';
import { getDayStatus } from '../utils';

interface DashboardProps {
  tripName: string;
  planMains: PlanMain[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  tripName,
  planMains,
  activeTab,
  onTabChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [planMains]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mt-6 mb-0">

      {/* Main Trip Identity */}
      <div className="relative mb-0 pt-0 pb-1">
        <div className="max-w-2xl mx-auto">
          <div className="px-1 mb-5">
            <h2 className="font-headline font-black text-3xl text-secondary tracking-tight leading-none uppercase">
              {tripName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Voyage Itinerary</span>
            </div>
          </div>

          <div className="relative group">
            {/* Scroll Button Left */}
            {canScrollLeft && (
              <div className="absolute left-[-15px] top-[54px] -translate-y-1/2 z-30 pointer-events-none">
                <button 
                  onClick={() => scroll('left')}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl flex items-center justify-center text-secondary hover:bg-white/60 hover:scale-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
              </div>
            )}

            {/* Scroll Button Right */}
            {canScrollRight && (
              <div className="absolute right-[-15px] top-[54px] -translate-y-1/2 z-30 pointer-events-none">
                <button 
                  onClick={() => scroll('right')}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl flex items-center justify-center text-secondary hover:bg-white/60 hover:scale-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}

            {/* Gradient Mask Overlays - Conditional */}
            {canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-transparent via-transparent to-transparent z-20 pointer-events-none"></div>}
            {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-transparent via-transparent to-transparent z-20 pointer-events-none"></div>}

            <div 
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-3 overflow-x-auto no-scrollbar pt-2 pb-6 px-1"
            >
              {/* Summary Wallet Tab - Restored for Visual Consistency */}
              <button
                onClick={() => onTabChange('summary')}
                className={`relative flex flex-col overflow-hidden rounded-2xl min-w-[76px] h-[92px] transition-all shrink-0 group border-2 backdrop-blur-md ${
                  activeTab === 'summary'
                    ? 'bg-white/80 border-secondary shadow-lg shadow-secondary/20 -translate-y-1 scale-105'
                    : 'bg-white/30 border-white/20 hover:border-white/40 shadow-sm'
                }`}
              >
                <div className={`h-5 w-full flex items-center justify-center ${activeTab === 'summary' ? 'bg-secondary text-white' : 'bg-white/10 text-gray-400'}`}>
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">TOTAL</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <span className={`material-symbols-outlined text-2xl ${activeTab === 'summary' ? 'text-secondary filled' : 'text-gray-400'}`}>
                    account_balance_wallet
                  </span>
                </div>

                <div className={`relative z-10 py-1.5 px-1 w-full text-center transition-colors ${
                  activeTab === 'summary' ? 'bg-secondary text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  <span className="text-[8px] font-black uppercase leading-none block truncate">WALLET</span>
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
                    className={`relative flex flex-col overflow-hidden rounded-2xl min-w-[76px] h-[92px] transition-all shrink-0 group border-2 backdrop-blur-md ${
                      isActive
                        ? 'bg-white/80 border-secondary shadow-lg shadow-secondary/20 -translate-y-1 scale-105'
                        : isToday
                        ? 'bg-japan-red/20 border-japan-red/30'
                        : isPast
                        ? 'bg-primary/10 border-white/20'
                        : 'bg-white/30 border-white/20 hover:border-white/40'
                    }`}
                  >
                    {/* Day Cover Background */}
                    {pm.image && (
                      <div className="absolute inset-0 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                        <img 
                          src={pm.image} 
                          alt="" 
                          className={`w-full h-full object-cover transition-opacity ${isActive ? 'opacity-20' : 'opacity-[0.08]'}`} 
                          onError={e => e.currentTarget.style.display = 'none'} 
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-white/20"></div>
                      </div>
                    )}

                    <div className={`relative z-10 h-5 w-full flex items-center justify-center ${
                      isToday ? 'sakura-gradient text-white'
                      : isPast ? 'bg-primary/20 text-primary'
                      : 'bg-gray-100 text-gray-400'
                    }`}>
                      <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                        {isToday ? '● TODAY' : monthLabel}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                      <span className={`text-2xl font-headline font-black leading-none ${
                        isActive ? 'text-secondary' : isToday ? 'text-japan-red' : 'text-gray-400'
                      }`}>
                        {d || idx + 1}
                      </span>
                    </div>
                    <div className={`relative z-10 py-1.5 px-1 w-full text-center transition-colors ${
                      isActive ? 'bg-secondary text-white' : 'bg-gray-50 text-gray-400'
                    }`}>
                      <span className="text-[8px] font-black uppercase leading-none block truncate">
                        {isPast ? 'DONE' : pm.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
