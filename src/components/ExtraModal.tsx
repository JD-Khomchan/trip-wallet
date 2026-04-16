import React, { useState, useEffect } from 'react';
import type { ExtraItem } from '../types';
import ModalSheet from './ModalSheet';

interface ExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ExtraItem, 'id' | 'planMainId'>) => void;
  activeWallet: 'thb' | 'jpy';
}

const ExtraModal: React.FC<ExtraModalProps> = ({ isOpen, onClose, onSubmit, activeWallet }) => {
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setTime(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
      setAmount('');
    }
  }, [isOpen]);

  const isJpy = activeWallet === 'jpy';

  const handleSubmit = () => {
    if (!time) { alert('กรุณากรอกเวลา'); return; }
    onSubmit({ time, title: 'Extra', amount: parseFloat(amount) || 0, currency: activeWallet, type: 'other' });
    onClose();
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="shrink-0 pt-10 px-8 pb-6 relative overflow-hidden bg-japan-red/5">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-headline font-black text-secondary">Add Trip Extra</h3>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-japan-red">
              Spending from {isJpy ? '¥ JPY' : '฿ THB'} Wallet
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-japan-red shadow-japan-red/20">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-black/5 rounded-full transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-8 pb-4 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Spending Amount</label>
          <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-4xl px-6 py-6 border-2 transition-all shadow-inner focus-within:bg-white border-japan-red/5 focus-within:border-japan-red">
            <span className="text-3xl font-black text-japan-red">{isJpy ? '¥' : '฿'}</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent border-0 focus:ring-0 font-headline font-black outline-none text-secondary text-center w-full"
              style={{ fontSize: '2.25rem' }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">schedule</span>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full min-w-0 bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 font-bold focus:bg-white focus:border-secondary transition-all outline-none appearance-none"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-8 py-5 pb-safe space-y-3 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-3xl text-sm font-black uppercase tracking-widest text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 sakura-gradient shadow-japan-red/30"
        >
          <span className="material-symbols-outlined">save</span> Confirm Expense
        </button>
        <button onClick={onClose} className="w-full py-2 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center hover:text-secondary transition-colors">
          Cancel & Return
        </button>
      </div>
    </ModalSheet>
  );
};

export default ExtraModal;
