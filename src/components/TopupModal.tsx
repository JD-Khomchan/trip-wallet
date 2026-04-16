import React, { useState, useEffect, useRef } from 'react';
import ModalSheet from './ModalSheet';

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

  const isJpy = currency === 'jpy';

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (!val || isNaN(val) || val <= 0) return;
    onConfirm(currency, val);
    onClose();
  };

  const handleQuickAdd = (val: number) => {
    setAmount(((parseFloat(amount) || 0) + val).toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose();
  };

  const presets = isJpy ? [500, 1000, 5000, 10000] : [100, 500, 1000, 5000];

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="shrink-0 relative pt-10 pb-8 px-8 overflow-hidden bg-japan-red/5 border-b border-japan-red/10">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <h3 className="text-2xl font-headline font-black tracking-tight leading-tight text-secondary">เติมเงินเข้าวอลเล็ต</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 text-japan-red">
              Add Funds to {isJpy ? '¥ JPY' : '฿ THB'} Wallet
            </p>
            <div className="mt-6 inline-flex flex-col bg-white/60 px-4 py-2 rounded-2xl border border-white/50 shadow-sm">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Current Balance</span>
              <span className="text-lg font-headline font-black text-secondary">
                {isJpy ? '¥' : '฿'}{currentBalance.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl bg-japan-red shadow-japan-red/30">
            <span className="material-symbols-outlined text-3xl">add_card</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-8 pb-4 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount to Deposit</label>
            <button onClick={() => setAmount('')} className="text-[10px] font-black text-gray-300 hover:text-japan-red transition-colors uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">backspace</span>Clear
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-3xl px-6 py-6 border-2 focus-within:border-japan-red focus-within:bg-white border-transparent shadow-inner transition-all">
            <span className="text-3xl font-headline font-black text-japan-red">{isJpy ? '¥' : '฿'}</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-0 focus:ring-0 font-headline font-black outline-none text-secondary placeholder:text-gray-200 text-center w-full"
              style={{ fontSize: '3rem' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gray-100" />
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Quick Increments</p>
            <div className="h-px flex-1 bg-gray-100" />
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
      <div className="shrink-0 flex gap-3 px-6 py-5 border-t border-gray-100" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0}
          className="flex-1 py-4 rounded-2xl sakura-gradient text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-japan-red/20 active:scale-95 transition-all disabled:opacity-30 disabled:shadow-none"
        >
          Confirm
        </button>
      </div>
    </ModalSheet>
  );
};

export default TopupModal;
