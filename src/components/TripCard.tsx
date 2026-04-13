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
  onTogglePaid: (id: string, initialPrice: number) => void;
  onPriceChange: (id: string, price: number) => void;
  onDelete?: (id: string) => void;
  isExtra?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({
  id, time, title, jpy, thb, type, desc, image, mapUrl, guide,
  isTimeline, status = 'future', paid, actual,
  onTogglePaid, onPriceChange, onDelete, isExtra
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = image || mapUrl || guide;

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

  const renderGuideSteps = (guideText: string) => {
    const steps = guideText.split('>').map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap items-center gap-1 mt-2">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{step}</span>
            {i < steps.length - 1 && (
              <span className="material-symbols-outlined text-gray-300" style={{ fontSize: '12px' }}>chevron_right</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderExpandedContent = () => {
    if (!expanded || !hasExtra) return null;
    return (
      <div className="mt-3 space-y-2 border-t border-gray-50 pt-3">
        {image && (
          <img src={image} alt={title} className="w-full h-36 object-cover rounded-xl" onError={e => (e.currentTarget.style.display = 'none')} />
        )}
        {guide && renderGuideSteps(guide)}
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] font-bold text-blue-500 hover:text-blue-600 mt-1">
            <span className="material-symbols-outlined text-sm">map</span>
            Open in Google Maps
          </a>
        )}
      </div>
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
      } shadow-sm transition-all`}>
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${
              status === 'past' ? 'bg-primary text-white' : status === 'current' ? 'bg-accent text-white' : 'bg-gray-50 text-gray-400'
            } flex-none flex items-center justify-center transition-colors`}>
              <span className="material-symbols-outlined text-lg">{getIcon(type)}</span>
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-headline font-bold text-secondary text-sm truncate">{title}</p>
                {hasExtra && (
                  <button onClick={() => setExpanded(v => !v)}
                    className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {expanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                )}
              </div>
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
        {renderExpandedContent()}
      </div>
    </div>
  );
};

export default TripCard;
