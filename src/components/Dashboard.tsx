import React from 'react';

interface DashboardProps {
  planTotal: number;
  actualTotal: number;
}

const Dashboard: React.FC<DashboardProps> = ({ planTotal, actualTotal }) => {
  const diff = planTotal - actualTotal;
  const percent = Math.min(100, Math.round((actualTotal / planTotal) * 100)) || 0;
  const isOverBudget = diff < 0;

  return (
    <section className="mt-4 mb-8">
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Journey to</span>
          <h2 className="font-headline font-extrabold text-4xl text-secondary tracking-tight">Japan 2026</h2>
        </div>
        <div className="enso-ring w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-sm">
          <span className="text-xs font-bold text-japan-red italic">{percent}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-5 rounded-card shadow-sm border border-white flex flex-col justify-between h-32">
          <span className="material-symbols-outlined text-gray-300">target</span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Budget (Plan)</p>
            <p className="text-2xl font-headline font-extrabold">฿{planTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="sakura-gradient p-5 rounded-card shadow-xl shadow-japan-red/10 flex flex-col justify-between h-32 text-white">
          <span className="material-symbols-outlined text-white/50">payments</span>
          <div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Actual Spent</p>
            <p className="text-2xl font-headline font-extrabold">฿{actualTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="col-span-2 bg-[#e2e8f0] p-4 rounded-card flex justify-between items-center border border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl text-secondary shadow-sm">
              <span className="material-symbols-outlined text-lg">savings</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Remaining</p>
              <p className="text-xl font-headline font-extrabold">
                {isOverBudget ? '-' : ''}฿{Math.abs(diff).toLocaleString()}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
            isOverBudget 
              ? "bg-japan-red text-white shadow-lg" 
              : "bg-white text-green-600 border border-green-100"
          }`}>
            {isOverBudget ? "Over Budget" : "On Track"}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
