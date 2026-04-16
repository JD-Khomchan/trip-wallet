import React, { useState } from 'react';
import { getIcon } from '../constants';

interface TripCardProps {
  id: string;
  time?: string;
  title: string;
  jpy: number;
  thb: number;
  type: string;
  desc?: string;
  image?: string;
  mapUrl?: string;
  guide?: string;
  isTimeline: boolean;
  status?: 'past' | 'current' | 'future';
  paid: boolean;
  actual: number;
  currency: 'thb' | 'jpy';
  onTogglePaid: (id: string, initialPrice: number, currency: 'thb' | 'jpy') => void;
  onPriceChange: (id: string, price: number) => void;
  onDelete?: (id: string) => void;
  isExtra?: boolean;
  isMini?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({
  id, time, title, jpy, thb, type, desc, image, mapUrl, guide,
  isTimeline, status = 'future', paid, actual, currency,
  onTogglePaid, onPriceChange, onDelete, isExtra, isMini
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = image || mapUrl || guide;

  let dotClass = "bg-gray-200 border-2 border-gray-100";
  let textColor = "text-gray-300";

  if (status === 'past') {
    dotClass = "bg-primary ring-4 ring-primary/10";
    textColor = "text-primary";
  }
  if (status === 'current') {
    dotClass = "bg-japan-red ring-4 ring-japan-red/10 dot-pulse";
    textColor = "text-japan-red";
  }
  if (status === 'future') {
    dotClass = "bg-gray-200 border-2 border-white";
    textColor = "text-gray-300";
  }

  const isJpy = currency === 'jpy';
  const defaultPrice = isJpy ? jpy : thb;

  const renderTimelineHeader = () => {
    if (!isTimeline) return null;
    return (
      <>
        <div className="absolute left-0 top-[38px] -translate-y-1/2 w-11 flex items-center justify-end pr-3 transition-colors duration-300">
          <span className={`text-[11px] font-black ${textColor} leading-none`}>{time}</span>
        </div>
        <div className="absolute left-[45px] top-[38px] -translate-y-1/2 w-4 h-4 flex items-center justify-center z-10 bg-surface rounded-full">
          {status === 'past' ? (
            <span className="material-symbols-outlined text-primary filled" style={{ fontSize: '18px' }}>check_circle</span>
          ) : (
            <div className={`w-3 h-3 rounded-full ${dotClass} transition-all duration-500`}></div>
          )}
        </div>
      </>
    );
  };

  const renderGuideSteps = (guideText: string) => {
    const steps = guideText.split('>').map(s => s.trim()).filter(Boolean);
    return (
      <div className="mt-3 bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">directions</span> Navigation Guide
        </p>
        <div className="flex flex-wrap items-center gap-y-2">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="bg-white border border-gray-100 px-3 py-1 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] font-bold text-gray-600">{step}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="px-1.5 flex items-center text-gray-300">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderExpandedContent = () => {
    if (!expanded || !hasExtra) return null;
    return (
      <div className="mt-4 space-y-3 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
        {image && (
          <div className="relative group overflow-hidden rounded-2xl">
            <img src={image} alt={title} className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-110"
              onError={e => (e.currentTarget.style.display = 'none')} />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {guide && renderGuideSteps(guide)}

        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-japan-red/5 hover:bg-japan-red/10 text-japan-red rounded-2xl transition-all active:scale-98 border border-japan-red/10 font-headline font-extrabold text-[11px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-lg">location_on</span>
            Explore in Google Maps
          </a>
        )}
      </div>
    );
  };

  const borderColor = status === 'current' ? 'border-japan-red/30' : status === 'past' ? 'border-primary/20' : 'border-gray-100';
  const shadowColor = status === 'current' ? 'shadow-japan-red/5' : status === 'past' ? 'shadow-primary/5' : 'shadow-sm';

  return (
    <div className={`relative ${isTimeline ? 'pl-20 mb-8 card-with-time' : isMini ? 'mb-2' : 'mb-3'}`}
      data-time={isTimeline ? time : undefined}>
      {renderTimelineHeader()}

      {/* Hero Currency Badge - Unified across Dashboard & Wallet */}
      <div className={`absolute -top-2 -right-1 flex items-center justify-center rounded-full bg-japan-red text-white font-black shadow-md z-20 border-[3px] border-white animate-in zoom-in duration-500 hover:scale-110 transition-transform ${
        isMini ? 'w-6 h-6 text-[11px]' : 'w-7 h-7 text-[13px]'
      }`}>
        {isJpy ? '¥' : '฿'}
      </div>

      <div className={`bg-white shadow-sm border ${borderColor} ${shadowColor} transition-all duration-300 ${isMini ? 'p-4 rounded-3xl' : 'p-4 rounded-3xl hover:scale-[1.01] hover:shadow-lg hover:shadow-secondary/5'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon Box / Paid Toggle */}
            <button
              onClick={() => onTogglePaid(id, defaultPrice, currency)}
              className={`w-10 h-10 rounded-2xl flex-none flex items-center justify-center transition-all duration-300 shrink-0 relative ${
                paid ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 group-hover:text-secondary'
              }`}>
              <span className={`material-symbols-outlined text-xl ${paid ? 'opacity-40' : ''}`}>{getIcon(isExtra ? 'other' : type)}</span>
              {paid && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px] rounded-2xl">
                  <span className="material-symbols-outlined text-white filled text-xl">check</span>
                </div>
              )}
            </button>

            {/* Info Block */}
            <div className="min-w-0 flex-1 flex flex-col justify-center cursor-pointer" onClick={() => hasExtra && !isMini && setExpanded(!expanded)}>
              <p className={`font-black text-secondary ${isMini ? 'text-xs uppercase tracking-tight' : 'font-headline text-[16px]'} truncate leading-tight`}>{title}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 leading-none">
                {isMini ? 'Fixed Expense' : (desc || type)}
              </p>
            </div>
          </div>

          {/* Action Area - Pure Numbers with enhanced size */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center font-headline font-black text-japan-red">
              <input
                type="number"
                value={actual !== undefined ? actual : defaultPrice}
                onChange={(e) => onPriceChange(id, parseFloat(e.target.value) || 0)}
                className={`bg-transparent border-0 p-0 text-right focus:ring-0 font-black ${
                  isMini ? 'w-18 text-[18px]' : 'w-24 text-[22px]'
                }`}
              />
            </div>
            {isExtra && (
              <button onClick={() => onDelete?.(id)} className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 hover:text-japan-red hover:bg-japan-red/5 transition-all flex items-center justify-center">
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            )}
          </div>
        </div>

        {!isMini && renderExpandedContent()}
      </div>
    </div>
  );
};

export default TripCard;
