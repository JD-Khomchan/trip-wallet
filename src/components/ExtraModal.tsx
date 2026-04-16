import React, { useState, useEffect } from 'react';
import type { ExtraItem } from '../types';

interface ExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ExtraItem, 'id' | 'planMainId'>) => void;
  activeWallet: 'thb' | 'jpy';
}

const ExtraModal: React.FC<ExtraModalProps> = ({ isOpen, onClose, onSubmit, activeWallet }) => {
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setTime(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
      setTitle('');
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isJpy = activeWallet === 'jpy';

  const handleSubmit = () => {
    if (!time || !title) { alert('กรุณากรอกเวลาและชื่อรายการ'); return; }
    onSubmit({
      time,
      title,
      amount: parseFloat(amount) || 0,
      currency: activeWallet,
      type: 'other',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-end sm:items-center justify-center bg-secondary/80 backdrop-blur-md transition-all duration-300"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-[3rem] rounded-t-[3rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}>
        
        {/* Header Section */}
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

        <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-8 space-y-6">
          {/* Amount Input - Prominent */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Spending Amount</label>
            <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-4xl px-6 py-6 border-2 transition-all shadow-inner focus-within:bg-white border-japan-red/5 focus-within:border-japan-red">
              <span className="text-3xl font-black text-japan-red">{isJpy ? '¥' : '฿'}</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent border-0 focus:ring-0 font-headline font-black text-4xl outline-none text-secondary text-center w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Time */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">schedule</span>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none"
                />
              </div>
            </div>

            {/* Title / Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">local_mall</span>
                <input
                  type="text"
                  placeholder="Items..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none"
                />
              </div>
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
      </div>
    </div>
  );
};

export default ExtraModal;
