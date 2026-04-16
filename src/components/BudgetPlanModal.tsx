import React, { useState, useEffect } from 'react';

interface BudgetPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  thbPlan: number;
  jpyPlan: number;
}

const BudgetPlanModal: React.FC<BudgetPlanModalProps> = ({ isOpen, onClose, thbPlan, jpyPlan }) => {
  const [rate, setRate] = useState<number | null>(null); // 1 JPY = ? THB
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(false);
    setRate(null);
    fetch('https://api.frankfurter.dev/v1/latest?from=JPY&to=THB')
      .then(r => r.json())
      .then(data => {
        setRate(data.rates.THB);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const jpyInThb = rate !== null ? Math.round(jpyPlan * rate) : null;
  const totalThb = jpyInThb !== null ? thbPlan + jpyInThb : null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-t-4xl overflow-hidden shadow-2xl card-enter flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="shrink-0 p-6 bg-japan-red/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-japan-red flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-xl">calculate</span>
              </div>
              <div>
                <h3 className="text-lg font-headline font-extrabold text-secondary">ประมาณการรวม</h3>
                <p className="text-[10px] font-black text-japan-red uppercase tracking-widest">Budget Plan Summary</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-black/5 rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
          {/* ส่วนประกอบ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-japan-red/5 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-japan-red">฿</span>
                <span className="text-[12px] font-bold text-gray-500">THB Items</span>
              </div>
              <span className="text-[16px] font-headline font-black text-japan-red">
                ฿{thbPlan.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-japan-red/10 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-japan-red">¥</span>
                <span className="text-[12px] font-bold text-gray-500">JPY Items</span>
              </div>
              <span className="text-[16px] font-headline font-black text-japan-red">
                ¥{jpyPlan.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Rate & Result */}
          {loading && (
            <div className="py-6 flex flex-col items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-3xl animate-spin">refresh</span>
              <p className="text-[11px] font-bold uppercase tracking-widest">กำลังดึงอัตราแลกเปลี่ยน...</p>
            </div>
          )}

          {error && (
            <div className="py-4 text-center text-red-400 text-[12px] font-bold">
              ดึง rate ไม่ได้ กรุณาลองใหม่
            </div>
          )}

          {!loading && !error && rate !== null && (
            <>
              <div className="flex items-center gap-2 px-1">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">
                  ¥1 = ฿{rate.toFixed(4)} (rate วันนี้)
                </span>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>

              <div className="bg-secondary rounded-3xl p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                  ต้องเตรียมเงินบาทประมาณ
                </p>
                <p className="text-4xl font-headline font-black">
                  ฿{totalThb!.toLocaleString()}
                </p>
                <p className="text-[10px] opacity-50 mt-2">
                  ฿{thbPlan.toLocaleString()} + ¥{jpyPlan.toLocaleString()} × {rate.toFixed(4)}
                </p>
              </div>
            </>
          )}

        </div>
        {/* Footer */}
        <div className="shrink-0 px-6 py-4 pb-safe border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanModal;
