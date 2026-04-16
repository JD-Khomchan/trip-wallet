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
}

const TripCard: React.FC<TripCardProps> = ({
  id, time, title, jpy, thb, type, desc, image, mapUrl, guide,
  isTimeline, status = 'future', paid, actual, currency,
  onTogglePaid, onPriceChange, onDelete, isExtra
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
    dotClass = "bg-accent ring-4 ring-accent/10 dot-pulse";
    textColor = "text-accent";
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
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl transition-all active:scale-98 border border-blue-100 font-headline font-extrabold text-[11px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-lg">location_on</span>
            Explore in Google Maps
          </a>
        )}
      </div>
    );
  };

  const borderColor = status === 'current' ? 'border-accent/30' : status === 'past' ? 'border-primary/20' : 'border-gray-100';
  const shadowColor = status === 'current' ? 'shadow-accent/5' : status === 'past' ? 'shadow-primary/5' : 'shadow-sm';

  return (
    <div className={`relative card-enter ${isTimeline ? 'pl-20 mb-8 card-with-time' : 'mb-3'}`}
      data-time={isTimeline ? time : undefined}>
      {renderTimelineHeader()}

      <div className={`bg-white p-4 rounded-3xl border ${borderColor} ${shadowColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/5 hover:border-primary/20`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon Box */}
            <div className={`w-11 h-11 rounded-2xl flex-none flex items-center justify-center transition-all duration-500 shadow-sm ${
              status === 'past' ? 'bg-primary text-white scale-95 opacity-80' :
              status === 'current' ? 'bg-accent text-white shadow-lg shadow-accent/20' :
              'bg-gray-50 text-gray-400'
            }`}>
              <span className="material-symbols-outlined text-xl">{getIcon(isExtra ? 'other' : type)}</span>
            </div>

            {/* Info Block */}
            <div className="flex-1 min-w-0 group cursor-pointer" onClick={() => hasExtra && setExpanded(!expanded)}>
              <div className="flex items-center gap-2">
                <p className="font-headline font-extrabold text-secondary text-[15px] truncate leading-tight">{title}</p>
                {hasExtra && (
                  <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${expanded ? 'rotate-180 text-secondary' : 'text-gray-200'}`}>
                    expand_more
                  </span>
                )}
                {isExtra && (
                  <span className="text-[7px] font-black bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase tracking-widest border border-accent/20">Extra</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {jpy > 0 && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] font-black text-gray-400">¥</span>
                    <span className="text-[10px] font-bold text-gray-400 leading-none">{jpy.toLocaleString()}</span>
                  </div>
                )}
                <p className="text-[10px] font-bold text-gray-300 truncate tracking-tight">{desc || 'No description'}</p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3 shrink-0 pl-2 border-l border-gray-50">
            <div className="text-right">
              <p className={`text-[9px] font-black uppercase tracking-wider mb-1 ${isJpy ? 'text-blue-400' : 'text-japan-red'}`}>
                {isJpy ? 'JPY' : 'THB'}
              </p>
              <div className="flex items-center justify-end">
                <span className={`text-[11px] font-black mr-0.5 ${isJpy ? 'text-blue-400' : 'text-japan-red'}`}>
                  {isJpy ? '¥' : '฿'}
                </span>
                <input
                  type="number"
                  value={actual !== undefined ? actual : defaultPrice}
                  onChange={(e) => onPriceChange(id, parseFloat(e.target.value) || 0)}
                  className={`w-14 bg-transparent border-0 p-0 text-right font-headline font-black text-[15px] focus:ring-0 ${isJpy ? 'text-blue-500' : 'text-japan-red'}`}
                />
              </div>
            </div>

            <button
              onClick={() => onTogglePaid(id, defaultPrice, currency)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                paid ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-200 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${paid ? 'filled' : ''}`}>
                {paid ? 'check_circle' : 'circle'}
              </span>
            </button>

            {isExtra && (
              <button onClick={() => onDelete?.(id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-300 hover:bg-red-100 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            )}
          </div>
        </div>

        {renderExpandedContent()}
      </div>
    </div>
  );
};

export default TripCard;
