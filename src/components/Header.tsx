import React from 'react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  onReset: () => void;
  currentTime: string;
  user: User;
  onLogout: () => void;
  isAdmin: boolean;
  onManage: () => void;
}

const Header: React.FC<Omit<HeaderProps, 'isAdmin' | 'onManage'>> = ({ onReset, currentTime, user, onLogout }) => {
  return (
    <header className="fixed top-0 w-full z-[100] glass-header border-b border-gray-100"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-2xl mx-auto px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sakura-gradient rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
            <span className="material-symbols-outlined text-sm">wallet</span>
          </div>
          <h1 className="font-headline font-extrabold text-lg tracking-tight text-secondary">Trip Wallet</h1>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded text-gray-500">{currentTime}</span>
          <img src={user.photoURL || ''} className="w-7 h-7 rounded-full mx-1" title={user.displayName || ''} />
          <button onClick={onReset} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <span className="material-symbols-outlined text-xl">restart_alt</span>
          </button>
          <button onClick={onLogout} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
