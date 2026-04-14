import React from 'react';
import type { TabId } from '../types';

interface TabsProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  planMains: { id: string; title: string; date?: string }[];
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, planMains }) => {
  return (
    <nav className="sticky top-[72px] z-30 bg-surface/90 backdrop-blur-md -mx-4 px-4 py-2 mb-6 overflow-x-auto no-scrollbar flex items-center gap-2">
      <button
        onClick={() => onTabChange('summary')}
        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
          activeTab === 'summary'
            ? 'bg-secondary text-white shadow-md'
            : 'bg-white text-gray-400 border border-gray-100'
        }`}
      >
        Wallet
      </button>
      {planMains.map(pm => (
        <button
          key={pm.id}
          onClick={() => onTabChange(pm.id)}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === pm.id
              ? 'bg-secondary text-white shadow-md'
              : 'bg-white text-gray-400 border border-gray-100'
          }`}
        >
          {pm.title}
          {pm.date && <span className="ml-1 opacity-60 text-[10px]">{pm.date}</span>}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
