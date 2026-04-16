import React from 'react';

interface BottomNavProps {
  onOpenExtra: () => void;
  onOpenOverview: () => void;
  onOpenManage?: () => void;
  isManageActive?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ onOpenExtra, onOpenOverview, onOpenManage, isManageActive }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 px-6 pt-4 bg-gradient-to-t from-surface via-surface to-transparent pointer-events-none"
      style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
      <div className="max-w-sm mx-auto bg-white/80 backdrop-blur-2xl rounded-pill shadow-2xl border border-white/50 p-2 flex justify-between items-center pointer-events-auto">
        <button
          onClick={() => onOpenManage?.()}
          className={`flex-1 flex flex-col items-center py-2 ${isManageActive ? 'text-japan-red' : 'text-gray-400'}`}
        >
          <span className={`material-symbols-outlined ${isManageActive ? 'filled' : ''}`}>edit_calendar</span>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-widest">Plan</span>
        </button>
        <button
          onClick={onOpenExtra}
          className="w-12 h-12 sakura-gradient text-white rounded-full shadow-lg flex items-center justify-center -translate-y-1 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        <button
          onClick={onOpenOverview}
          className="flex-1 flex flex-col items-center py-2 text-gray-400 hover:text-secondary transition-colors"
        >
          <span className="material-symbols-outlined">map</span>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-widest">Overview</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
