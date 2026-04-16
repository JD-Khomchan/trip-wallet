import React, { useState, useEffect } from 'react';
import type { ExchangeRecord } from '../types';
import ModalSheet from './ModalSheet';

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

  useEffect(() => {
    const t = parseFloat(thb);
    const r = parseFloat(rate);
    if (t > 0 && r > 0) setJpy(Math.floor(t * r).toString());
    else setJpy('');
  }, [thb, rate]);

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
    <ModalSheet isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="shrink-0 p-6 bg-japan-red/5 border-b border-japan-red/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-japan-red flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">currency_exchange</span>
          </div>
          <div>
            <h3 className="text-lg font-headline font-extrabold text-secondary">แลกเงิน</h3>
            <p className="text-[10px] font-black text-japan-red uppercase tracking-widest">THB → JPY</p>
          </div>
        </div>
        <div className="mt-3 text-[11px] font-bold text-gray-500">
          กระเป๋า THB คงเหลือ: <span className="text-japan-red font-black">฿{walletThb.toLocaleString()}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">จำนวน THB ที่จะแลก</label>
          <div className="flex items-center gap-2 border-b-2 border-gray-100 focus-within:border-japan-red pb-1 transition-colors">
            <span className="text-lg font-black text-gray-300">฿</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={thb}
              onChange={e => setThb(e.target.value)}
              className="flex-1 border-0 focus:ring-0 py-1 font-headline font-extrabold outline-none text-secondary"
              style={{ fontSize: '1.5rem' }}
            />
          </div>
          {isOverBalance && <p className="text-[10px] font-bold text-red-400">เกินยอดในกระเป๋า!</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rate (1 THB = ? JPY)</label>
          <div className="flex items-center gap-2 border-b-2 border-gray-100 focus-within:border-japan-red pb-1 transition-colors">
            <span className="text-sm font-black text-gray-300">¥</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="เช่น 4.35"
              value={rate}
              onChange={e => setRate(e.target.value)}
              step="0.01"
              className="flex-1 border-0 focus:ring-0 py-1 font-headline font-bold outline-none text-gray-600"
              style={{ fontSize: '1.25rem' }}
            />
            <span className="text-[10px] font-black text-gray-300">per ฿1</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ได้รับ JPY (แก้ไขได้ถ้าต่างจากจริง)</label>
          <div className={`flex items-center gap-2 border-b-2 pb-1 transition-colors ${jpy ? 'border-japan-red/30 focus-within:border-japan-red' : 'border-gray-100'}`}>
            <span className="text-lg font-black text-japan-red">¥</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="คำนวณอัตโนมัติ"
              value={jpy}
              onChange={e => setJpy(e.target.value)}
              className="flex-1 border-0 focus:ring-0 py-1 font-headline font-extrabold outline-none text-japan-red"
              style={{ fontSize: '1.5rem' }}
            />
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
          disabled={!thbNum || !jpyNum || isOverBalance}
          className="flex-1 py-4 rounded-2xl sakura-gradient text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-japan-red/20 active:scale-95 transition-all disabled:opacity-30 disabled:shadow-none"
        >
          ยืนยัน
        </button>
      </div>
    </ModalSheet>
  );
};

export default ExchangeModal;
