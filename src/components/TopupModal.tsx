import React, { useState, useEffect, useRef } from 'react';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (currency: 'thb' | 'jpy', amount: number) => void;
  currency: 'thb' | 'jpy';
  currentBalance: number;
}

const TopupModal: React.FC<TopupModalProps> = ({ isOpen, onClose, onConfirm, currency, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isJpy = currency === 'jpy';
  const themeHex = '#e57399'; // Vibrant Sakura Pink

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (!val || isNaN(val) || val <= 0) return;
    onConfirm(currency, val);
    onClose();
  };

  const handleQuickAdd = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose();
  };

  const presets = isJpy 
    ? [500, 1000, 5000, 10000] 
    : [100, 500, 1000, 5000];

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-1000 flex items-end sm:items-center justify-center bg-secondary/80 backdrop-blur-md transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="relative w-full sm:max-w-md bg-white sm:rounded-[3rem] rounded-t-[3rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section - Improved Padding/Layout */}
        <div className="shrink-0 relative pt-10 pb-8 px-8 overflow-hidden bg-japan-red/5 text-secondary border-b border-japan-red/10">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-current opacity-[0.03] blur-3xl" style={{ color: themeHex }}></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <h3 className="text-2xl font-headline font-black tracking-tight leading-tight">เติมเงินเข้าวอลเล็ต</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 opacity-80 text-japan-red">
                Add Funds to {isJpy ? '¥ JPY' : '฿ THB'} Wallet
              </p>
              
              <div className="mt-6 inline-flex flex-col bg-white/40 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/50 shadow-sm">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Current Balance</span>
                <span className="text-lg font-headline font-black text-secondary">
                  {isJpy ? '¥' : '฿'}{currentBalance.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="shrink-0 w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all hover:rotate-6 hover:scale-105 bg-japan-red shadow-japan-red/40">
              <span className="material-symbols-outlined text-4xl">add_card</span>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount to Deposit</label>
              <button 
                onClick={() => setAmount('')}
                className="text-[10px] font-black text-gray-300 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">backspace</span>
                Clear
              </button>
            </div>
            
            <div className="group flex items-center justify-center gap-4 bg-gray-50 rounded-3xl px-6 py-6 transition-all duration-300 border-2 focus-within:border-japan-red focus-within:bg-white border-transparent shadow-inner">
              <div className="flex items-center w-full max-w-[280px]">
                <span className="text-3xl font-headline font-black text-japan-red mr-3">
                  {isJpy ? '¥' : '฿'}
                </span>
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-0 focus:ring-0 font-headline font-black text-5xl outline-none text-secondary placeholder:text-gray-200 text-center w-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gray-100"></div>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Quick Increments</p>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {presets.map(val => (
                <button
                  key={val}
                  onClick={() => handleQuickAdd(val)}
                  className="py-4 rounded-2xl border-2 text-[11px] font-black transition-all active:scale-95 border-japan-red/10 text-japan-red bg-japan-red/5 hover:bg-japan-red hover:text-white hover:border-japan-red"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

        </div>
        {/* Footer */}
        <div className="shrink-0 flex flex-col gap-3 px-8 py-5 pb-safe border-t border-gray-100">
          <button
            onClick={handleConfirm}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-5 rounded-3xl text-[13px] font-black uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed bg-japan-red shadow-japan-red/30 hover:bg-red-700"
          >
            Confirm Deposit
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest hover:text-secondary transition-colors text-center"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopupModal;

