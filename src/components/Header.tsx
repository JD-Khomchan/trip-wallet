import React from 'react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  onReset: () => void;
  currentTime: string;
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, currentTime, user, onLogout }) => {
  return (
    <header className="fixed top-0 w-full z-40 glass-header border-b border-gray-100">
      <div className="max-w-xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sakura-gradient rounded-lg flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-sm">wallet</span>
          </div>
          <h1 className="font-headline font-extrabold text-xl tracking-tight text-secondary">Trip Wallet</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded text-gray-500">{currentTime}</span>
          <img src={user.photoURL || ''} className="w-7 h-7 rounded-full" title={user.displayName || ''} />
          <button onClick={onReset} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
