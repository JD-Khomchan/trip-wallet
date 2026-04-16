import React, { useState, useEffect } from 'react';
import type { ExchangeRecord } from '../types';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (record: Omit<ExchangeRecord, 'id' | 'date'>) => void;
  walletThb: number;
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({ isOpen, onClose, onConfirm, walletThb }) => {
  const [thb, setThb] = useState('');
  const [rate, setRate] = useState('');
  const [jpy, setJpy] = useState('');

  useEffect(() => {
    if (!isOpen) { setThb(''); setRate(''); setJpy(''); }
  }, [isOpen]);

  // Auto-calc JPY when THB or rate changes
  useEffect(() => {
    const t = parseFloat(thb);
    const r = parseFloat(rate);
    if (t > 0 && r > 0) {
      setJpy(Math.floor(t * r).toString());
    } else {
      setJpy('');
    }
  }, [thb, rate]);

  if (!isOpen) return null;

  const thbNum = parseFloat(thb) || 0;
  const jpyNum = parseFloat(jpy) || 0;
  const rateNum = parseFloat(rate) || 0;
  const isOverBalance = thbNum > walletThb;

  const handleConfirm = () => {
    if (!thbNum || !jpyNum || !rateNum) { alert('กรุณากรอกข้อมูลให้ครบ'); return; }
    if (isOverBalance) { alert('ยอด THB เกินกว่าที่มีในกระเป๋า'); return; }
    onConfirm({ thb: thbNum, jpy: jpyNum, rate: rateNum });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-200 flex items-end justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-t-4xl overflow-hidden shadow-2xl card-enter pb-safe">
        {/* Header */}
        <div className="p-6 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">currency_exchange</span>
            </div>
            <div>
              <h3 className="text-lg font-headline font-extrabold text-secondary">แลกเงิน</h3>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">THB → JPY</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-bold text-blue-400">
            กระเป๋า THB คงเหลือ: <span className="text-blue-600 font-black">฿{walletThb.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* THB Amount */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">จำนวน THB ที่จะแลก</label>
            <div className="flex items-center gap-2 border-b-2 border-gray-100 focus-within:border-blue-400 pb-1 transition-colors">
              <span className="text-lg font-black text-gray-300">฿</span>
              <input
                type="number"
                placeholder="0"
                value={thb}
                onChange={(e) => setThb(e.target.value)}
                className="flex-1 border-0 focus:ring-0 py-1 font-headline font-extrabold text-2xl outline-none text-secondary"
              />
            </div>
            {isOverBalance && <p className="text-[10px] font-bold text-red-400">เกินยอดในกระเป๋า!</p>}
          </div>

          {/* Rate */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rate (1 THB = ? JPY)</label>
            <div className="flex items-center gap-2 border-b-2 border-gray-100 focus-within:border-blue-400 pb-1 transition-colors">
              <span className="text-sm font-black text-gray-300">¥</span>
              <input
                type="number"
                placeholder="เช่น 4.35"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                step="0.01"
                className="flex-1 border-0 focus:ring-0 py-1 font-headline font-bold text-xl outline-none text-gray-600"
              />
              <span className="text-[10px] font-black text-gray-300">per ฿1</span>
            </div>
          </div>

          {/* JPY Result */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              ได้รับ JPY (แก้ไขได้ถ้าต่างจากจริง)
            </label>
            <div className={`flex items-center gap-2 border-b-2 pb-1 transition-colors ${jpy ? 'border-blue-300 focus-within:border-blue-500' : 'border-gray-100'}`}>
              <span className="text-lg font-black text-blue-400">¥</span>
              <input
                type="number"
                placeholder="คำนวณอัตโนมัติ"
                value={jpy}
                onChange={(e) => setJpy(e.target.value)}
                className="flex-1 border-0 focus:ring-0 py-1 font-headline font-extrabold text-2xl outline-none text-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!thbNum || !jpyNum || isOverBalance}
              className="flex-1 py-3 bg-blue-500 disabled:opacity-30 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 tracking-widest"
            >
              ยืนยันแลกเงิน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeModal;
