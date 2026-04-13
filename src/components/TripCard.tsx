import React from 'react';
import { getIcon } from '../constants';

interface TripCardProps {
  id: string;
  time?: string;
  title: string;
  jpy: number;
  thb: number;
  type: string;
  desc?: string;
  isTimeline: boolean;
  status?: 'past' | 'current' | 'future';
  paid: boolean;
  actual: number;
  onTogglePaid: (id: string, initialPrice: number) => void;
  onPriceChange: (id: string, price: number) => void;
  onDelete?: (id: string) => void;
  isExtra?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ 
  id, time, title, jpy, thb, type, desc, isTimeline, status = 'future', 
  paid, actual, onTogglePaid, onPriceChange, onDelete, isExtra 
}) => {
  let dotClass = "bg-gray-200";
  if (status === 'past') dotClass = "bg-primary ring-4 ring-primary/10";
  if (status === 'current') dotClass = "bg-accent ring-4 ring-accent/10 dot-pulse";

  const renderTimelineHeader = () => {
    if (!isTimeline) return null;
    return (
      <>
        <div className={`absolute left-0 top-1 text-[11px] font-black ${
          status === 'past' ? 'text-primary' : status === 'current' ? 'text-accent' : 'text-gray-300'
        } w-12 text-right`}>{time}</div>
        <div className={`absolute left-[48px] top-2 w-3 h-3 rounded-full ${dotClass} z-10 transition-all`}></div>
      </>
    );
  };

  if (isExtra) {
    return (
      <div className="relative pl-20 mb-8 card-enter">
        {renderTimelineHeader()}
        <div className={`bg-white p-4 rounded-card border ${
          status === 'current' ? 'border-accent/40' : 'border-accent/10'
        } shadow-lg shadow-accent/5 flex items-center justify-between relative overflow-hidden transition-all`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex-none flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black bg-accent text-white px-1 rounded-sm uppercase tracking-tighter">Extra</span>
                <p className="font-headline font-bold text-secondary text-sm">{title}</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {jpy > 0 && <span className="text-[10px] font-black text-gray-400 leading-none">¥{jpy.toLocaleString()}</span>}
                <span className="text-[10px] font-black text-accent leading-none">฿{thb.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button onClick={() => onDelete?.(id)} className="text-gray-200 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative card-enter ${isTimeline ? 'pl-20 mb-8' : 'mb-3'}`}>
      {renderTimelineHeader()}
      <div className={`bg-white p-4 rounded-card border ${
        status === 'current' ? 'border-accent/30 shadow-orange-50' : status === 'past' ? 'border-primary/10' : 'border-gray-50'
      } shadow-sm flex items-center justify-between group transition-all`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-10 h-10 rounded-xl ${
            status === 'past' ? 'bg-primary text-white' : status === 'current' ? 'bg-accent text-white' : 'bg-gray-50 text-gray-400'
          } flex-none flex items-center justify-center transition-colors`}>
            <span className="material-symbols-outlined text-lg">{getIcon(type)}</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-headline font-bold text-secondary text-sm truncate">{title}</p>
            <div className="flex items-center gap-2">
              {jpy > 0 && <span className="text-[9px] font-black text-gray-400">¥{jpy.toLocaleString()}</span>}
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter truncate">{desc || ''}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-2 flex-none">
          <div className="text-right">
            <div className="flex items-center text-[8px] font-bold text-gray-300 uppercase justify-end">฿ THB</div>
            <input 
              type="number" 
              value={actual}
              onChange={(e) => onPriceChange(id, parseFloat(e.target.value) || 0)}
              className="w-16 bg-transparent border-0 border-b border-gray-100 focus:border-japan-red focus:ring-0 p-0 text-right font-headline font-extrabold text-sm text-japan-red"
            />
          </div>
          <button 
            onClick={() => onTogglePaid(id, thb)}
            className={`w-8 h-8 rounded-full ${paid ? 'bg-primary text-white shadow-lg' : 'border border-gray-100 text-gray-200'} flex items-center justify-center transition-all`}
          >
            <span className={`material-symbols-outlined text-sm ${paid ? 'filled' : ''}`}>check</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
