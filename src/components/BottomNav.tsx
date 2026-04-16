import React from 'react';

interface BottomNavProps {
  onOpenExtra: () => void;
  onOpenOverview: () => void;
  onOpenManage: () => void;
  isManageActive?: boolean;
  activeCurrency: 'thb' | 'jpy';
  onSwitchCurrency: (currency: 'thb' | 'jpy') => void;
  walletStats: {
    thbRemaining: number;
    jpyRemaining: number;
  };
  planStats: {
    thbPlan: number;
    jpyPlan: number;
  };
  onOpenTopup: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
  onOpenExtra,
  onOpenOverview,
  onOpenManage,
  isManageActive,
  activeCurrency,
  onSwitchCurrency,
  walletStats,
  planStats,
  onOpenTopup,
}) => {
  const isThb = activeCurrency === 'thb';
  const balance = isThb ? walletStats.thbRemaining : walletStats.jpyRemaining;
  const planAmount = isThb ? planStats.thbPlan : planStats.jpyPlan;
  const currentSymbol = isThb ? '฿' : '¥';
  const nextCurrency = isThb ? 'JPY' : 'THB';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        
        {/* The Zen Dock - Symbol Toggle Edition */}
        <div className="flex items-center h-16 rounded-full bg-white/90 backdrop-blur-3xl border border-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden">
          
          {/* Wallet Hub - No Redundant Symbols */}
          <div className="flex items-center h-full pl-2 pr-4 border-r border-gray-100 flex-1 min-w-0">
            {/* Currency Switcher & Indicator */}
            <button 
              onClick={() => onSwitchCurrency(isThb ? 'jpy' : 'thb')}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 hover:bg-japan-red/5 text-japan-red transition-all active:scale-90 shrink-0 group"
              title={`Switch to ${nextCurrency}`}
            >
              <span className="text-2xl font-black leading-none">{currentSymbol}</span>
              <span className="text-[7px] font-black uppercase mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                 {isThb ? 'THB' : 'JPY'}
              </span>
            </button>
            
            {/* Pure Number Content */}
            <div className="flex flex-col ml-3 min-w-0 flex-1 cursor-pointer justify-center" onClick={onOpenTopup}>
              <span className="text-xl font-headline font-black text-secondary leading-none truncate tracking-tight">
                {balance.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-1 opacity-50">
                 <span className="text-[7px] font-black text-secondary uppercase tracking-widest">Plan:</span>
                 <span className="text-[8px] font-black text-secondary">{planAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Deposit Icon */}
            <button 
              onClick={onOpenTopup}
              className="ml-2 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-japan-red transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </button>
          </div>

          {/* Navigation Hub */}
          <div className="flex items-center px-4 gap-1 shrink-0">
            <button 
              onClick={onOpenOverview}
              className="w-12 h-12 flex flex-col items-center justify-center rounded-2xl text-gray-400 hover:text-secondary hover:bg-gray-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">map</span>
              <span className="text-[7px] font-black uppercase mt-0.5 tracking-widest">Plan</span>
            </button>

            <button 
              onClick={onOpenExtra}
              className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-japan-red text-white shadow-lg shadow-japan-red/30 active:scale-90 transition-all ml-1"
            >
              <span className="material-symbols-outlined text-[28px] filled">add</span>
            </button>

            <button 
              onClick={onOpenManage}
              className={`w-12 h-12 flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 ${
                isManageActive 
                  ? 'bg-secondary text-white shadow-md' 
                  : 'text-gray-400 hover:text-secondary hover:bg-gray-50 ml-1'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isManageActive ? 'close' : 'settings_suggest'}
              </span>
              <span className="text-[7px] font-black uppercase mt-0.5 tracking-widest">{isManageActive ? 'Close' : 'Setup'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BottomNav;
