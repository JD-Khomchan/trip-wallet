import React, { useState } from 'react';
import type { TripBlueprint, SummaryItem, ScheduleItem, PlanMain } from '../types';
import { getIcon, TRIP_BLUEPRINT } from '../constants';
import { formatAmount } from '../utils';

interface ManagePlanProps {
  plan: TripBlueprint;
  onPlanUpdate: (plan: TripBlueprint) => void;
}

const TYPES = ['transport', 'flight', 'hotel', 'food', 'car', 'activity', 'other'];

const TYPE_COLOR: Record<string, string> = {
  flight: 'text-japan-red', transport: 'text-primary', activity: 'text-accent',
  hotel: 'text-secondary', food: 'text-japan-red', car: 'text-gray-500', other: 'text-gray-400',
};

const emptyItemForm = {
  title: '', amount: 0, currency: 'thb' as 'thb' | 'jpy',
  type: 'transport', desc: '', time: '09:00', image: '', mapUrl: '', guide: '',
};
const emptyPlanMainForm = { title: '', date: '', type: 'activity', desc: '', image: '' };

const ManagePlan: React.FC<ManagePlanProps> = ({ plan, onPlanUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [formContext, setFormContext] = useState<'summary' | string>('summary');
  const [editing, setEditing] = useState<(SummaryItem | ScheduleItem) | null>(null);
  const [form, setForm] = useState(emptyItemForm);
  const [isNew, setIsNew] = useState(false);
  const [subTab, setSubTab] = useState<'fixed' | 'itinerary'>('itinerary');

  const [guidePopup, setGuidePopup] = useState<string | null>(null);

  const [showPlanMainForm, setShowPlanMainForm] = useState(false);
  const [planMainForm, setPlanMainForm] = useState(emptyPlanMainForm);
  const [editingPlanMain, setEditingPlanMain] = useState<PlanMain | null>(null);
  const [isNewPlanMain, setIsNewPlanMain] = useState(false);

  // ── Item CRUD ──────────────────────────────────────────────────────────────

  const openAddItem = (context: string) => {
    setFormContext(context); setForm(emptyItemForm); setEditing(null); setIsNew(true); setShowForm(true);
  };

  const openEditItem = (item: SummaryItem | ScheduleItem, context: string) => {
    setFormContext(context);
    setEditing(item);
    setForm({
      title: item.title,
      amount: item.amount,
      currency: item.currency,
      type: item.type,
      desc: item.desc ?? '',
      time: (item as ScheduleItem).time ?? '09:00',
      image: item.image ?? '',
      mapUrl: item.mapUrl ?? '',
      guide: item.guide ?? '',
    });
    setIsNew(false);
    setShowForm(true);
  };

  const handleSaveItem = () => {
    if (!form.title.trim()) return;

    const itemBase = {
      title: form.title,
      amount: form.amount,
      currency: form.currency,
      type: form.type,
      desc: form.desc,
      image: form.image,
      mapUrl: form.mapUrl,
      guide: form.guide,
    };

    if (formContext === 'summary') {
      const updated: SummaryItem[] = isNew
        ? [...plan.summary, { id: 's_' + Date.now(), ...itemBase }]
        : plan.summary.map(i => i.id === editing?.id ? { ...i, ...itemBase } : i);
      onPlanUpdate({ ...plan, summary: updated });
    } else {
      onPlanUpdate({
        ...plan,
        planMains: plan.planMains.map(pm => {
          if (pm.id !== formContext) return pm;
          const updated: ScheduleItem[] = isNew
            ? [...pm.schedules, { id: 'sc_' + Date.now(), time: form.time, ...itemBase }]
                .sort((a, b) => a.time.localeCompare(b.time))
            : pm.schedules.map(i => i.id === editing?.id ? { ...i, time: form.time, ...itemBase } : i);
          return { ...pm, schedules: updated };
        }),
      });
    }
    setShowForm(false);
  };

  const handleDeleteItem = (id: string, context: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    if (context === 'summary') {
      onPlanUpdate({ ...plan, summary: plan.summary.filter(i => i.id !== id) });
    } else {
      onPlanUpdate({
        ...plan,
        planMains: plan.planMains.map(pm =>
          pm.id === context ? { ...pm, schedules: pm.schedules.filter(i => i.id !== id) } : pm
        ),
      });
    }
  };

  // ── PlanMain CRUD ──────────────────────────────────────────────────────────

  const sortByDate = (mains: PlanMain[]) =>
    [...mains].sort((a, b) => {
      const toNum = (d?: string) => { if (!d) return 9999; const [dd, mm] = d.split('/').map(Number); return mm * 100 + dd; };
      return toNum(a.date) - toNum(b.date);
    });

  const openAddPlanMain = () => {
    setPlanMainForm(emptyPlanMainForm); setEditingPlanMain(null); setIsNewPlanMain(true); setShowPlanMainForm(true);
  };
  const openEditPlanMain = (pm: PlanMain) => {
    setEditingPlanMain(pm);
    setPlanMainForm({ title: pm.title, date: pm.date ?? '', type: pm.type, desc: pm.desc ?? '', image: pm.image ?? '' });
    setIsNewPlanMain(false);
    setShowPlanMainForm(true);
  };
  const handleSavePlanMain = () => {
    if (!planMainForm.title.trim()) return;
    if (isNewPlanMain) {
      const newPm: PlanMain = {
        id: 'pm_' + Date.now(), title: planMainForm.title, date: planMainForm.date || undefined,
        type: planMainForm.type, desc: planMainForm.desc, image: planMainForm.image, mapUrl: '', guide: '', schedules: [],
      };
      onPlanUpdate({ ...plan, planMains: sortByDate([...plan.planMains, newPm]) });
    } else if (editingPlanMain) {
      onPlanUpdate({
        ...plan,
        planMains: sortByDate(plan.planMains.map(pm =>
          pm.id === editingPlanMain.id ? { ...pm, ...planMainForm, date: planMainForm.date || undefined } : pm
        )),
      });
    }
    setShowPlanMainForm(false);
  };
  const handleDeletePlanMain = (id: string) => {
    if (!confirm('ลบวันนี้และ schedule ทั้งหมด?')) return;
    onPlanUpdate({ ...plan, planMains: plan.planMains.filter(pm => pm.id !== id) });
  };

  const sortedMains = sortByDate(plan.planMains ?? []);

  const inputCls = 'w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 font-medium focus:bg-white focus:border-gray-200 transition-all outline-none min-h-[52px]';
  const labelCls = 'block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5';

  return (
    <>
      <div className="card-enter bg-gray-50/50 px-0 py-6 rounded-[2.5rem] mb-12">

        {/* Header */}
        <header className="w-full bg-white/50 backdrop-blur-sm border-b border-gray-100 rounded-3xl mb-6">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-headline font-black text-[15px] text-secondary tracking-tight leading-none">Manage Plan</h1>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                {plan.planMains?.length ?? 0} days · {plan.summary?.length ?? 0} fixed
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => subTab === 'itinerary' ? openAddPlanMain() : openAddItem('summary')}
                className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shadow-secondary/20">
                <span className="material-symbols-outlined text-sm">add</span>
                {subTab === 'itinerary' ? 'Add Day' : 'Add Fixed'}
              </button>
              <button
                onClick={() => { if (confirm('Reset ข้อมูลทั้งหมด?')) onPlanUpdate(TRIP_BLUEPRINT); }}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors px-2 py-2 rounded-xl">
                Reset
              </button>
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="flex bg-gray-100/50 p-1.5 rounded-2xl gap-1">
              {(['itinerary', 'fixed'] as const).map(tab => (
                <button key={tab} onClick={() => setSubTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    subTab === tab ? 'bg-white shadow-sm text-secondary' : 'text-gray-400'
                  }`}>
                  {tab === 'itinerary' ? 'Itinerary Plan' : 'Fixed Expenses'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="pb-32 px-1">
          {subTab === 'fixed' ? (
            /* ── Fixed Expenses ── */
            <div className="bg-white rounded-[2rem] px-4 py-6 shadow-sm border border-gray-100 mb-8 mx-1">
              <div className="flex items-center justify-between mb-6 px-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Fixed Expenses</p>
                  <p className="text-[9px] text-gray-300 mt-0.5 font-medium">แชร์ค่าใช้จ่ายก้อนใหญ่</p>
                </div>
              </div>
              <div className="space-y-1">
                {(plan.summary ?? []).length === 0 ? (
                  <p className="text-[11px] text-gray-300 italic py-3 px-1">ยังไม่มีรายการ</p>
                ) : (plan.summary ?? []).map(item => (
                  <div key={item.id} className="flex items-baseline gap-3 py-3 px-3 rounded-2xl hover:bg-gray-50 transition-colors group">
                    <span className={`material-symbols-outlined shrink-0 text-sm ${TYPE_COLOR[item.type] ?? 'text-gray-300'}`} style={{ fontSize: '14px' }}>
                      {getIcon(item.type)}
                    </span>
                    <button onClick={() => openEditItem(item, 'summary')} className="flex-1 text-left min-w-0">
                      <span className="text-[13px] text-secondary font-bold">{item.title}</span>
                      {item.desc && <span className="text-[11px] text-gray-400 italic ml-2">{item.desc}</span>}
                    </button>
                    <span className="text-[13px] font-black shrink-0 text-japan-red font-mono">
                      {formatAmount(item.amount, item.currency)}
                    </span>
                    <button onClick={() => handleDeleteItem(item.id, 'summary')} className="text-gray-200 hover:text-red-400 shrink-0 transition-colors ml-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Itinerary ── */
            <div className="space-y-4 mx-1">
              {sortedMains.map((pm, idx) => (
                <div key={pm.id} className="relative bg-white rounded-[2rem] px-3.5 py-6 shadow-sm border border-gray-100 group transition-all hover:shadow-md overflow-hidden">
                  {pm.image && (
                    <div className="absolute top-0 right-0 bottom-0 w-1/2 z-0 pointer-events-none">
                      <img src={pm.image} alt="" className="w-full h-full object-cover opacity-30" onError={e => e.currentTarget.style.display = 'none'} />
                      <div className="absolute inset-0 bg-linear-to-r from-white via-white/40 to-transparent"></div>
                    </div>
                  )}

                  <div className="relative z-10 flex gap-4">
                    <div className="shrink-0 w-11 text-center pt-1 border-r border-gray-50 pr-3">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black tracking-widest text-gray-300 uppercase">DAY</span>
                        <span className="text-lg font-headline font-black text-secondary leading-tight">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      {pm.date && (
                        <p className="text-[9px] font-black text-japan-red/50 mt-1 whitespace-nowrap">
                          {pm.date.split('/')[0]} {['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][parseInt(pm.date.split('/')[1]) - 1]}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                          <h2 className="font-headline font-black text-secondary uppercase tracking-wide truncate pr-2" style={{ fontSize: '15px', letterSpacing: '0.04em' }}>
                            {pm.title}
                          </h2>
                          {pm.desc && <p className="text-[10px] text-japan-red/70 font-bold">{pm.desc}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditPlanMain(pm)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50/80 backdrop-blur-sm text-gray-400 hover:text-secondary hover:bg-white transition-all shadow-sm">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                          </button>
                          <button onClick={() => handleDeletePlanMain(pm.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50/80 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-white transition-all shadow-sm">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 border-l-2 border-dashed border-gray-50 ml-0.5 pl-3">
                        {(pm.schedules ?? []).map(item => (
                          <div key={item.id} className="flex items-center gap-3 group/item">
                            <span className="font-headline font-black text-[11px] text-gray-400 shrink-0 w-8">{item.time}</span>
                            <button onClick={() => openEditItem(item, pm.id)} className="flex-1 text-left min-w-0">
                              <span className="text-[12px] text-secondary font-medium group-hover/item:text-japan-red transition-colors">{item.title}</span>
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              {item.guide && (
                                <button onClick={() => setGuidePopup(item.guide!)} className="text-primary hover:opacity-70 transition-opacity">
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>directions</span>
                                </button>
                              )}
                              {item.mapUrl && (
                                <a href={item.mapUrl} target="_blank" rel="noopener noreferrer" className="text-japan-red hover:opacity-70 transition-opacity">
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
                                </a>
                              )}
                            </div>
                            <span className="text-[11px] font-black shrink-0 text-japan-red font-mono">
                              {formatAmount(item.amount, item.currency)}
                            </span>
                            <button onClick={() => handleDeleteItem(item.id, pm.id)} className="text-gray-300 hover:text-red-300 transition-colors ml-1">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => openAddItem(pm.id)}
                        className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-gray-100 text-[9px] font-black text-gray-300 hover:text-secondary hover:border-gray-200 uppercase tracking-widest flex items-center justify-center gap-1 transition-all">
                        <span className="material-symbols-outlined text-sm">add_circle</span> Add Schedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Item Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-secondary/80 backdrop-blur-md px-4"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] animate-slide-up"
            onClick={e => e.stopPropagation()}>

            <div className="px-8 pt-8 pb-5 border-b border-gray-100 flex justify-between items-center shrink-0">
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

            <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1 overscroll-contain custom-scrollbar">
              <div className={`grid gap-3 ${formContext !== 'summary' ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
                      className={`px-5 py-2 rounded-xl text-[13px] font-black transition-all ${form.currency === 'thb' ? 'bg-japan-red text-white' : 'text-gray-400'}`}>฿</button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, currency: 'jpy' }))}
                      className={`px-5 py-2 rounded-xl text-[13px] font-black transition-all ${form.currency === 'jpy' ? 'bg-japan-red text-white' : 'text-gray-400'}`}>¥</button>
                  </div>
                  <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-4 border-2 border-transparent focus-within:bg-white transition-all focus-within:border-japan-red">
                    <span className="font-black mr-2 text-japan-red">{form.currency === 'thb' ? '฿' : '¥'}</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                      className="w-full bg-transparent border-none focus:outline-none text-xl font-headline font-black text-secondary text-right py-3"
                    />
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
            </div>

            <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100 rounded-b-[2.5rem] shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowForm(false)} className="py-4 rounded-2xl bg-white border border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                <button onClick={handleSaveItem} className="py-4 rounded-2xl sakura-gradient text-white text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-japan-red/20">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Guide Popup ── */}
      {guidePopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-secondary/60 backdrop-blur-md px-6"
          onClick={() => setGuidePopup(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>directions</span>
                Navigation Guide
              </p>
              <button onClick={() => setGuidePopup(null)} className="text-gray-300 hover:text-secondary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-y-2">
              {guidePopup.split('>').map(s => s.trim()).filter(Boolean).map((step, i, arr) => (
                <React.Fragment key={i}>
                  <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                    <span className="text-[12px] font-bold text-secondary">{step}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="material-symbols-outlined text-gray-300 text-sm px-0.5">chevron_right</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PlanMain Form Modal ── */}
      {showPlanMainForm && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-secondary/80 backdrop-blur-md px-4"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          onClick={() => setShowPlanMainForm(false)}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] animate-slide-up"
            onClick={e => e.stopPropagation()}>

            <div className="px-8 pt-8 pb-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-headline font-black text-xl text-secondary">{isNewPlanMain ? 'New Day' : 'Edit Day'}</h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Day / Group Configuration</p>
              </div>
              <button onClick={() => setShowPlanMainForm(false)} className="text-gray-300 hover:text-secondary p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1 overscroll-contain custom-scrollbar">
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
            </div>

            <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100 rounded-b-[2.5rem] shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowPlanMainForm(false)} className="py-4 rounded-2xl bg-white border border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                <button onClick={handleSavePlanMain} className="py-4 rounded-2xl sakura-gradient text-white text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-japan-red/20">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagePlan;
