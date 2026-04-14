import React, { useState, useEffect } from 'react';
import type { ExtraItem } from '../types';

interface ExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ExtraItem, 'id' | 'planMainId'>) => void;
}

const ExtraModal: React.FC<ExtraModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [jpy, setJpy] = useState<string>('');
  const [thb, setThb] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setTime(now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!time || !title || isNaN(parseFloat(thb))) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    onSubmit({
      time,
      title,
      jpy: parseFloat(jpy) || 0,
      thb: parseFloat(thb),
      type: 'other',
    });
    setTitle('');
    setJpy('');
    setThb('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-card w-full max-w-xs overflow-hidden shadow-2xl card-enter">
        <div className="p-6 sakura-gradient text-white">
          <h3 className="text-xl font-headline font-extrabold tracking-tight">Add Trip Extra</h3>
          <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">บันทึกรายการจ่ายหน้างาน</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Time (24h)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border-0 border-b-2 border-gray-100 focus:ring-0 focus:border-japan-red py-1 font-headline font-bold text-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">¥ JPY (ถ้ามี)</label>
              <input
                type="number"
                placeholder="0"
                value={jpy}
                onChange={(e) => setJpy(e.target.value)}
                className="w-full border-0 border-b-2 border-gray-100 focus:ring-0 focus:border-japan-red py-1 font-headline font-bold text-lg outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Item Name</label>
            <input
              type="text"
              placeholder="แวะซื้ออะไรดี?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-0 border-b-2 border-gray-100 focus:ring-0 focus:border-japan-red py-1 font-body text-sm outline-none text-gray-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Amount (฿ THB)</label>
            <input
              type="number"
              placeholder="0.00"
              value={thb}
              onChange={(e) => setThb(e.target.value)}
              className="w-full border-0 border-b-2 border-gray-100 focus:ring-0 focus:border-japan-red py-1 font-headline font-extrabold text-xl outline-none text-japan-red"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 py-3 sakura-gradient text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-japan-red/20 tracking-widest">Save Extra</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtraModal;
