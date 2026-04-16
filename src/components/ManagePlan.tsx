import React, { useState } from 'react';
import type { TripBlueprint, SummaryItem, ScheduleItem, PlanMain } from '../types';
import { getIcon, TRIP_BLUEPRINT } from '../constants';

interface ManagePlanProps {
  plan: TripBlueprint;
  onBack: () => void;
  onPlanUpdate: (plan: TripBlueprint) => void;
}

const TYPES = ['transport', 'flight', 'hotel', 'food', 'car', 'activity', 'other'];

const TYPE_COLOR: Record<string, string> = {
  flight: 'text-japan-red', transport: 'text-blue-500', activity: 'text-violet-500',
  hotel: 'text-primary', food: 'text-accent', car: 'text-gray-500', other: 'text-gray-400',
};

const emptyItemForm = { title: '', amount: 0, currency: 'thb' as 'thb' | 'jpy', type: 'transport', desc: '', time: '09:00', image: '', mapUrl: '', guide: '' };
const emptyPlanMainForm = { title: '', date: '', type: 'activity', desc: '', image: '' };

const ManagePlan: React.FC<ManagePlanProps> = ({ plan, onBack, onPlanUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [formContext, setFormContext] = useState<'summary' | string>('summary');
  const [editing, setEditing] = useState<(SummaryItem | ScheduleItem) | null>(null);
  const [form, setForm] = useState(emptyItemForm);
  const [isNew, setIsNew] = useState(false);

  const [showPlanMainForm, setShowPlanMainForm] = useState(false);
  const [planMainForm, setPlanMainForm] = useState(emptyPlanMainForm);
  const [editingPlanMain, setEditingPlanMain] = useState<PlanMain | null>(null);
  const [isNewPlanMain, setIsNewPlanMain] = useState(false);

  const openAddItem = (context: string) => {
    setFormContext(context); setForm(emptyItemForm); setEditing(null); setIsNew(true); setShowForm(true);
  };
  const openEditItem = (item: SummaryItem | ScheduleItem, context: string) => {
    setFormContext(context); setEditing(item);
    const currency: 'thb' | 'jpy' = item.jpy > 0 && item.thb === 0 ? 'jpy' : 'thb';
    setForm({ title: item.title, amount: currency === 'jpy' ? item.jpy : item.thb, currency, type: item.type, desc: item.desc || '', time: (item as ScheduleItem).time || '09:00', image: item.image || '', mapUrl: item.mapUrl || '', guide: item.guide || '' });
    setIsNew(false); setShowForm(true);
  };
  const handleSaveItem = () => {
    if (!form.title.trim()) return;
    const jpy = form.currency === 'jpy' ? form.amount : 0;
    const thb = form.currency === 'thb' ? form.amount : 0;
    if (formContext === 'summary') {
      const updatedSummary = isNew
        ? [...plan.summary, { id: 's_' + Date.now(), title: form.title, jpy, thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide } as SummaryItem]
        : plan.summary.map(i => i.id === editing?.id ? { ...i, ...form, jpy, thb } : i);
      onPlanUpdate({ ...plan, summary: updatedSummary });
    } else {
      onPlanUpdate({ ...plan, planMains: plan.planMains.map(pm => {
        if (pm.id !== formContext) return pm;
        const updatedSchedules = isNew
          ? [...pm.schedules, { id: 'sc_' + Date.now(), time: form.time, title: form.title, jpy, thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide } as ScheduleItem].sort((a, b) => a.time.localeCompare(b.time))
          : pm.schedules.map(i => i.id === editing?.id ? { ...i, ...form, jpy, thb } : i);
        return { ...pm, schedules: updatedSchedules };
      })});
    }
    setShowForm(false);
  };
  const handleDeleteItem = (id: string, context: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    if (context === 'summary') onPlanUpdate({ ...plan, summary: plan.summary.filter(i => i.id !== id) });
    else onPlanUpdate({ ...plan, planMains: plan.planMains.map(pm => pm.id === context ? { ...pm, schedules: pm.schedules.filter(i => i.id !== id) } : pm) });
  };

  const openAddPlanMain = () => { setPlanMainForm(emptyPlanMainForm); setEditingPlanMain(null); setIsNewPlanMain(true); setShowPlanMainForm(true); };
  const openEditPlanMain = (pm: PlanMain) => { setEditingPlanMain(pm); setPlanMainForm({ title: pm.title, date: pm.date || '', type: pm.type, desc: pm.desc || '', image: pm.image || '' }); setIsNewPlanMain(false); setShowPlanMainForm(true); };
  const sortByDate = (mains: PlanMain[]) => [...mains].sort((a, b) => {
    const toNum = (d?: string) => { if (!d) return 9999; const [dd, mm] = d.split('/').map(Number); return mm * 100 + dd; };
    return toNum(a.date) - toNum(b.date);
  });
  const handleSavePlanMain = () => {
    if (!planMainForm.title.trim()) return;
    if (isNewPlanMain) {
      const newPm: PlanMain = { id: 'pm_' + Date.now(), title: planMainForm.title, date: planMainForm.date || undefined, jpy: 0, thb: 0, type: planMainForm.type, desc: planMainForm.desc, image: planMainForm.image, mapUrl: '', guide: '', schedules: [] };
      onPlanUpdate({ ...plan, planMains: sortByDate([...plan.planMains, newPm]) });
    } else if (editingPlanMain) {
      onPlanUpdate({ ...plan, planMains: sortByDate(plan.planMains.map(pm => pm.id === editingPlanMain.id ? { ...pm, ...planMainForm, date: planMainForm.date || undefined } : pm)) });
    }
    setShowPlanMainForm(false);
  };
  const handleDeletePlanMain = (id: string) => {
    if (!confirm('ลบวันนี้และ schedule ทั้งหมด?')) return;
    onPlanUpdate({ ...plan, planMains: plan.planMains.filter(pm => pm.id !== id) });
  };

  const sortedMains = sortByDate(plan.planMains || []);

  const inputCls = "w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium focus:bg-white focus:border-gray-200 transition-all outline-none";
  const labelCls = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-secondary transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline font-black text-[15px] text-secondary tracking-tight leading-none">Manage Plan</h1>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{plan.planMains?.length || 0} days · {plan.summary?.length || 0} fixed</p>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('Reset ข้อมูลทั้งหมด?')) onPlanUpdate(TRIP_BLUEPRINT); }}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
            Reset
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 pb-32"
        style={{ paddingTop: 'calc(5rem + env(safe-area-inset-top))' }}>

        {/* Fixed Expenses */}
        <div className="mb-8 pt-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Fixed Expenses</p>
            <button onClick={() => openAddItem('summary')}
              className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
              <span className="material-symbols-outlined text-sm">add</span> Add
            </button>
          </div>

          {(plan.summary || []).length === 0 ? (
            <p className="text-[11px] text-gray-300 italic py-3">ยังไม่มีรายการ</p>
          ) : (plan.summary || []).map(item => (
            <div key={item.id} className="flex items-baseline gap-3 py-2.5 border-b border-gray-50 group">
              <span className={`material-symbols-outlined shrink-0 text-sm ${TYPE_COLOR[item.type] || 'text-gray-300'}`} style={{ fontSize: '14px' }}>{getIcon(item.type)}</span>
              <button onClick={() => openEditItem(item, 'summary')} className="flex-1 text-left min-w-0">
                <span className="text-[13px] text-secondary font-medium">{item.title}</span>
                {item.desc && <span className="text-[11px] text-gray-400 italic ml-2">{item.desc}</span>}
              </button>
              <span className={`text-[13px] font-black shrink-0 ${item.jpy > 0 && item.thb === 0 ? 'text-blue-500' : 'text-japan-red'}`}>
                {item.jpy > 0 && item.thb === 0 ? `¥${item.jpy.toLocaleString()}` : `฿${item.thb.toLocaleString()}`}
              </span>
              <button onClick={() => handleDeleteItem(item.id, 'summary')} className="text-red-300 active:text-red-500 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
              </button>
            </div>
          ))}
          <div className="mt-4 h-px bg-gray-100" />
        </div>

        {/* Days */}
        {sortedMains.map((pm, idx) => (
          <div key={pm.id} className="mb-2">
            <div className="flex gap-5 py-4">
              {/* Left col */}
              <div className="shrink-0 w-16 pt-1">
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase">DAY</span>
                  <span className="text-[10px] font-black tracking-[0.15em] text-gray-400">{String(idx + 1).padStart(2, '0')}</span>
                </div>
                {pm.date && <p className="text-[11px] font-black text-gray-400 tracking-wide">{pm.date}</p>}
                <div className="flex gap-1 mt-3">
                  <button onClick={() => openEditPlanMain(pm)} className="text-gray-300 hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                  </button>
                  <button onClick={() => handleDeletePlanMain(pm.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Right col */}
              <div className="flex-1 min-w-0">
                <h2 className="font-headline font-black text-secondary uppercase tracking-wide leading-tight mb-1"
                  style={{ fontSize: 'clamp(1rem, 4vw, 1.3rem)', letterSpacing: '0.04em' }}>
                  {pm.title}
                </h2>
                {pm.desc && <p className="text-[11px] text-japan-red font-bold mb-3">{pm.desc}</p>}

                {/* Schedules */}
                <div className="space-y-2 mt-2">
                  {(pm.schedules || []).map(item => (
                    <div key={item.id} className="flex items-baseline gap-3 group">
                      <span className="font-headline font-black text-[12px] text-secondary shrink-0 w-10 text-right">{item.time}</span>
                      <button onClick={() => openEditItem(item, pm.id)} className="flex-1 text-left min-w-0">
                        <span className="text-[13px] text-secondary">{item.title}</span>
                        {item.desc && <span className="text-[11px] text-gray-400 italic ml-2">{item.desc}</span>}
                      </button>
                      {(item.thb > 0 || item.jpy > 0) && (
                        <span className={`text-[12px] font-black shrink-0 ${item.jpy > 0 && item.thb === 0 ? 'text-blue-400' : 'text-japan-red'}`}>
                          {item.jpy > 0 && item.thb === 0 ? `¥${item.jpy.toLocaleString()}` : `฿${item.thb.toLocaleString()}`}
                        </span>
                      )}
                      <button onClick={() => handleDeleteItem(item.id, pm.id)} className="text-red-300 active:text-red-500 shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => openAddItem(pm.id)}
                  className="mt-3 text-[10px] font-black text-gray-300 hover:text-secondary uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span> Add schedule
                </button>
              </div>
            </div>
            <div className="h-px bg-gray-100 ml-20" />
          </div>
        ))}

        {/* Add Day */}
        <button onClick={openAddPlanMain}
          className="w-full mt-6 py-5 border border-dashed border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-secondary hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> Add New Day
        </button>
      </main>

      {/* Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-3 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-headline font-black text-xl text-secondary">
                  {isNew ? (formContext === 'summary' ? 'Add Fixed Item' : 'New Schedule') : 'Edit Item'}
                </h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  {formContext === 'summary' ? 'Fixed Expense' : 'Schedule Item'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-secondary transition-colors p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div className={`grid gap-4 ${formContext !== 'summary' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {formContext !== 'summary' && (
                  <div>
                    <label className={labelCls}>Time</label>
                    <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className={inputCls} />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls + ' appearance-none'}>
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Title</label>
                <input type="text" value={form.title} placeholder="ชื่อรายการ..." onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Currency & Amount</label>
                <div className="flex gap-2">
                  <div className="flex bg-gray-50 rounded-2xl p-1 shrink-0 border border-gray-100">
                    <button type="button" onClick={() => setForm(f => ({ ...f, currency: 'thb' }))}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${form.currency === 'thb' ? 'bg-japan-red text-white' : 'text-gray-400'}`}>฿ THB</button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, currency: 'jpy' }))}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${form.currency === 'jpy' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>¥ JPY</button>
                  </div>
                  <div className={`flex-1 flex items-center bg-gray-50 rounded-2xl px-4 border-2 border-transparent focus-within:bg-white transition-all ${form.currency === 'thb' ? 'focus-within:border-japan-red' : 'focus-within:border-blue-500'}`}>
                    <span className={`font-black mr-2 ${form.currency === 'thb' ? 'text-japan-red' : 'text-blue-400'}`}>{form.currency === 'thb' ? '฿' : '¥'}</span>
                    <input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                      className="w-full bg-transparent border-none focus:outline-none text-xl font-headline font-black text-secondary text-right py-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={form.desc} placeholder="Optional..." rows={2} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} className={inputCls + ' resize-none'} />
              </div>

              <div className="space-y-3">
                <input type="text" value={form.guide} placeholder="Guide (e.g. Train > Walk)" onChange={e => setForm(f => ({ ...f, guide: e.target.value }))} className={inputCls} />
                <input type="url" value={form.mapUrl} placeholder="Google Maps URL" onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))} className={inputCls} />
                <input type="url" value={form.image} placeholder="Image URL" onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 pb-6">
                <button onClick={() => setShowForm(false)} className="py-3.5 rounded-2xl bg-gray-50 text-[11px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                <button onClick={handleSaveItem} className="py-3.5 rounded-2xl bg-secondary text-white text-[11px] font-black uppercase tracking-widest">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PlanMain Form Modal */}
      {showPlanMainForm && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowPlanMainForm(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-3 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-headline font-black text-xl text-secondary">{isNewPlanMain ? 'New Day' : 'Edit Day'}</h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Day / Group Configuration</p>
              </div>
              <button onClick={() => setShowPlanMainForm(false)} className="text-gray-300 hover:text-secondary p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Title</label>
                  <input type="text" value={planMainForm.title} placeholder="e.g. Arrival Day" onChange={e => setPlanMainForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="text" value={planMainForm.date} placeholder="18/05" onChange={e => setPlanMainForm(f => ({ ...f, date: e.target.value }))} className={inputCls + ' text-center'} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Type</label>
                <select value={planMainForm.type} onChange={e => setPlanMainForm(f => ({ ...f, type: e.target.value }))} className={inputCls + ' appearance-none'}>
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={planMainForm.desc} placeholder="Quick summary..." onChange={e => setPlanMainForm(f => ({ ...f, desc: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Cover Image URL</label>
                <input type="url" value={planMainForm.image} placeholder="https://..." onChange={e => setPlanMainForm(f => ({ ...f, image: e.target.value }))} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 pb-6">
                <button onClick={() => setShowPlanMainForm(false)} className="py-3.5 rounded-2xl bg-gray-50 text-[11px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                <button onClick={handleSavePlanMain} className="py-3.5 rounded-2xl bg-secondary text-white text-[11px] font-black uppercase tracking-widest">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlan;
