import React, { useState } from 'react';
import type { TripBlueprint, SummaryItem, ScheduleItem, PlanMain } from '../types';
import { getIcon, TRIP_BLUEPRINT } from '../constants';

interface ManagePlanProps {
  plan: TripBlueprint;
  onBack: () => void;
  onPlanUpdate: (plan: TripBlueprint) => void;
}

const TYPES = ['transport', 'flight', 'hotel', 'food', 'car', 'activity', 'other'];

const TYPE_COLORS: Record<string, string> = {
  flight:    'border-l-japan-red bg-japan-red/[0.02]',
  transport: 'border-l-blue-500 bg-blue-50/30',
  activity:  'border-l-violet-500 bg-violet-50/30',
  hotel:     'border-l-primary bg-primary/[0.02]',
  food:      'border-l-accent bg-orange-50/30',
  car:       'border-l-gray-500 bg-gray-50/30',
  other:     'border-l-gray-400 bg-gray-50/30',
};
const TYPE_BADGE: Record<string, string> = {
  flight:    'bg-japan-red/10 text-japan-red',
  transport: 'bg-blue-100/80 text-blue-600',
  activity:  'bg-violet-100/80 text-violet-600',
  hotel:     'bg-primary/10 text-primary',
  food:      'bg-orange-100/80 text-accent',
  car:       'bg-gray-100/80 text-gray-600',
  other:     'bg-gray-100 text-gray-500',
};

const emptyItemForm = { title: '', jpy: 0, thb: 0, type: 'transport', desc: '', time: '09:00', image: '', mapUrl: '', guide: '' };
const emptyPlanMainForm = { title: '', date: '', jpy: 0, thb: 0, type: 'activity', desc: '', image: '', mapUrl: '', guide: '' };

const ManagePlan: React.FC<ManagePlanProps> = ({ plan, onBack, onPlanUpdate }) => {
  // Accordion open state
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['summary']));

  // Item form state (for summary items & schedule items)
  const [showForm, setShowForm] = useState(false);
  const [formContext, setFormContext] = useState<'summary' | string>('summary'); // planMain id or 'summary'
  const [editing, setEditing] = useState<(SummaryItem | ScheduleItem) | null>(null);
  const [form, setForm] = useState(emptyItemForm);
  const [isNew, setIsNew] = useState(false);

  // PlanMain form state
  const [showPlanMainForm, setShowPlanMainForm] = useState(false);
  const [planMainForm, setPlanMainForm] = useState(emptyPlanMainForm);
  const [editingPlanMain, setEditingPlanMain] = useState<PlanMain | null>(null);
  const [isNewPlanMain, setIsNewPlanMain] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Item CRUD ---
  const openAddItem = (context: string) => {
    setFormContext(context);
    setForm(emptyItemForm);
    setEditing(null);
    setIsNew(true);
    setShowForm(true);
  };

  const openEditItem = (item: SummaryItem | ScheduleItem, context: string) => {
    setFormContext(context);
    setEditing(item);
    setForm({
      title: item.title, jpy: item.jpy, thb: item.thb, type: item.type,
      desc: item.desc || '', time: (item as ScheduleItem).time || '09:00',
      image: item.image || '', mapUrl: item.mapUrl || '', guide: item.guide || '',
    });
    setIsNew(false);
    setShowForm(true);
  };

  const handleSaveItem = () => {
    if (!form.title.trim()) return;
    if (formContext === 'summary') {
      const updatedSummary = isNew
        ? [...plan.summary, { id: 's_' + Date.now(), title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide } as SummaryItem]
        : plan.summary.map(i => i.id === editing?.id ? { ...i, ...form } : i);
      onPlanUpdate({ ...plan, summary: updatedSummary });
    } else {
      const updatedPlanMains = plan.planMains.map(pm => {
        if (pm.id !== formContext) return pm;
        const updatedSchedules = isNew
          ? [...pm.schedules, { id: 'sc_' + Date.now(), time: form.time, title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide } as ScheduleItem].sort((a, b) => a.time.localeCompare(b.time))
          : pm.schedules.map(i => i.id === editing?.id ? { ...i, ...form } : i);
        return { ...pm, schedules: updatedSchedules };
      });
      onPlanUpdate({ ...plan, planMains: updatedPlanMains });
    }
    setShowForm(false);
  };

  const handleDeleteItem = (id: string, context: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    if (context === 'summary') {
      onPlanUpdate({ ...plan, summary: plan.summary.filter(i => i.id !== id) });
    } else {
      onPlanUpdate({ ...plan, planMains: plan.planMains.map(pm => pm.id === context ? { ...pm, schedules: pm.schedules.filter(i => i.id !== id) } : pm) });
    }
  };

  // --- PlanMain CRUD ---
  const openAddPlanMain = () => {
    setPlanMainForm(emptyPlanMainForm);
    setEditingPlanMain(null);
    setIsNewPlanMain(true);
    setShowPlanMainForm(true);
  };

  const openEditPlanMain = (pm: PlanMain) => {
    setEditingPlanMain(pm);
    setPlanMainForm({ title: pm.title, date: pm.date || '', jpy: pm.jpy, thb: pm.thb, type: pm.type, desc: pm.desc || '', image: pm.image || '', mapUrl: pm.mapUrl || '', guide: pm.guide || '' });
    setIsNewPlanMain(false);
    setShowPlanMainForm(true);
  };

  const handleSavePlanMain = () => {
    if (!planMainForm.title.trim()) return;
    if (isNewPlanMain) {
      const newPm: PlanMain = { id: 'pm_' + Date.now(), title: planMainForm.title, date: planMainForm.date || undefined, jpy: planMainForm.jpy, thb: planMainForm.thb, type: planMainForm.type, desc: planMainForm.desc, image: planMainForm.image, mapUrl: planMainForm.mapUrl, guide: planMainForm.guide, schedules: [] };
      onPlanUpdate({ ...plan, planMains: [...plan.planMains, newPm] });
      setOpenSections(prev => new Set([...prev, newPm.id]));
    } else if (editingPlanMain) {
      onPlanUpdate({ ...plan, planMains: plan.planMains.map(pm => pm.id === editingPlanMain.id ? { ...pm, title: planMainForm.title, date: planMainForm.date || undefined, jpy: planMainForm.jpy, thb: planMainForm.thb, type: planMainForm.type, desc: planMainForm.desc, image: planMainForm.image, mapUrl: planMainForm.mapUrl, guide: planMainForm.guide } : pm) });
    }
    setShowPlanMainForm(false);
  };

  const handleDeletePlanMain = (id: string) => {
    if (!confirm('ลบ Plan Main นี้และ Schedule ทั้งหมดข้างใน?')) return;
    onPlanUpdate({ ...plan, planMains: plan.planMains.filter(pm => pm.id !== id) });
  };

  // --- Render helpers ---
  const renderSummaryRow = (item: SummaryItem) => (
    <div key={item.id} className="flex items-center gap-4 py-3.5 px-4 rounded-3xl hover:bg-white hover:shadow-sm transition-all group border border-transparent hover:border-gray-100">
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${TYPE_BADGE[item.type] || TYPE_BADGE.other}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{getIcon(item.type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-secondary truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 bg-gray-100/50 px-1.5 py-0.5 rounded-md leading-none">{item.type}</span>
          {item.desc && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{item.desc}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-black text-japan-red">฿{item.thb.toLocaleString()}</p>
        {item.jpy > 0 && <p className="text-[9px] font-bold text-gray-400">¥{item.jpy.toLocaleString()}</p>}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shrink-0 ml-1">
        <button onClick={() => openEditItem(item, 'summary')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
        </button>
        <button onClick={() => handleDeleteItem(item.id, 'summary')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
        </button>
      </div>
    </div>
  );

  const renderScheduleRow = (item: ScheduleItem, pmId: string) => (
    <div key={item.id} className="flex items-center gap-4 py-3.5 px-4 rounded-3xl hover:bg-white hover:shadow-sm transition-all group border border-transparent hover:border-gray-100">
      <div className="flex flex-col items-end shrink-0 w-10">
        <span className="text-[11px] font-black text-secondary leading-none">{item.time}</span>
        <span className="text-[8px] font-bold text-gray-300 uppercase mt-0.5">TIME</span>
      </div>
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${TYPE_BADGE[item.type] || TYPE_BADGE.other}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{getIcon(item.type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-secondary truncate">{item.title}</p>
        {item.desc && <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.desc}</p>}
      </div>
      <div className="text-right shrink-0">
        {item.thb > 0 && <p className="text-[13px] font-black text-japan-red">฿{item.thb.toLocaleString()}</p>}
        {item.jpy > 0 && <p className="text-[9px] font-bold text-gray-400">¥{item.jpy.toLocaleString()}</p>}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shrink-0 ml-1">
        <button onClick={() => openEditItem(item, pmId)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
        </button>
        <button onClick={() => handleDeleteItem(item.id, pmId)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-40 glass-header border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-secondary transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h1 className="font-headline font-extrabold text-lg text-secondary leading-none">Manage Plan</h1>
              <span className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                {plan.planMains?.length || 0} Sets · {(plan.summary?.length || 0)} Fixed items
              </span>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('โหลด Template ใหม่? ข้อมูลปัจจุบันจะถูกแทนที่')) onPlanUpdate(TRIP_BLUEPRINT); }}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-gray-100 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">restore</span> Template
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-32 space-y-3"
        style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>

        {/* Summary Accordion */}
        <div className="bg-white rounded-4xl shadow-sm overflow-hidden border border-gray-100 card-enter">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full flex items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-gray-50/50">
            <div className="w-10 h-10 rounded-2xl bg-secondary/5 flex items-center justify-center shrink-0 border border-secondary/10 shadow-sm">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>payments</span>
            </div>
            <div className="flex-1">
              <p className="font-headline font-extrabold text-[15px] text-secondary">Fixed Expenses</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {plan.summary?.length || 0} items · ฿{(plan.summary || []).reduce((s, i) => s + i.thb, 0).toLocaleString()}
              </p>
            </div>
            <div className={`p-1 rounded-full transition-all duration-300 ${openSections.has('summary') ? 'bg-secondary text-white' : 'text-gray-300'}`}>
              <span className="material-symbols-outlined text-sm leading-none"
                style={{ transform: openSections.has('summary') ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </div>
          </button>
          
          {openSections.has('summary') && (
            <div className="border-t border-gray-50 px-3 pb-4 bg-gray-50/20">
              <div className="mt-2 space-y-1">
                {(plan.summary || []).map(renderSummaryRow)}
              </div>
              <button onClick={() => openAddItem('summary')}
                className="w-full mt-3 py-3 text-[11px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/20 hover:bg-primary/5 transition-all active:scale-98">
                <span className="material-symbols-outlined text-sm">add_circle</span> Add Fixed Item
              </button>
            </div>
          )}
        </div>

        {(plan.planMains || []).map((pm, idx) => {
          const isOpen = openSections.has(pm.id);
          const colorClass = TYPE_COLORS[pm.type] || TYPE_COLORS.other;
          const totalThb = (pm.schedules || []).reduce((s, i) => s + i.thb, 0);
          return (
            <div key={pm.id} 
              className={`bg-white rounded-4xl shadow-sm overflow-hidden border-y border-r border-gray-100 border-l-[6px] card-enter ${colorClass}`}
              style={{ animationDelay: `${(idx + 1) * 0.05}s` }}>
              
              {/* Plan Main Header */}
              <div className="flex items-center gap-3 px-5 py-4">
                <button onClick={() => toggleSection(pm.id)} className="flex items-center gap-4 flex-1 text-left min-w-0 group">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 ${TYPE_BADGE[pm.type] || TYPE_BADGE.other}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{getIcon(pm.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-headline font-extrabold text-[15px] text-secondary truncate">{pm.title}</p>
                      {pm.date && (
                        <span className="text-[9px] font-black text-white sakura-gradient px-2 py-0.5 rounded-full shadow-sm shrink-0 uppercase">
                          {pm.date}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                      {(pm.schedules || []).length} schedules
                      {totalThb > 0 && ` · ฿${totalThb.toLocaleString()}`}
                    </p>
                  </div>
                  <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-secondary text-white' : 'text-gray-300 group-hover:text-gray-400'}`}>
                    <span className="material-symbols-outlined text-sm leading-none"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </div>
                </button>
                
                {/* Plan main action buttons */}
                <div className="flex gap-1 shrink-0 ml-1">
                  <button onClick={() => openEditPlanMain(pm)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  </button>
                  <button onClick={() => handleDeletePlanMain(pm.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Schedule Items */}
              {isOpen && (
                <div className="border-t border-gray-50 px-3 pb-4 bg-gray-50/20">
                  <div className="mt-2 space-y-1">
                    {(pm.schedules || []).length === 0 && (
                      <div className="py-8 text-center bg-white/40 rounded-2xl border-2 border-dashed border-gray-100 mx-2 my-2">
                         <span className="material-symbols-outlined text-gray-200 text-3xl mb-1">event_busy</span>
                         <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">No schedules yet</p>
                      </div>
                    )}
                    {(pm.schedules || []).map(item => renderScheduleRow(item, pm.id))}
                  </div>
                  <button onClick={() => openAddItem(pm.id)}
                    className="w-full mt-3 py-3 text-[11px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/20 hover:bg-primary/5 transition-all active:scale-98">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Add Schedule Item
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Plan Main */}
        <button onClick={openAddPlanMain}
          className="w-full py-6 rounded-4xl border-2 border-dashed border-gray-200 bg-white/50 text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-3 hover:border-primary hover:text-primary hover:bg-white transition-all active:scale-98 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <span className="material-symbols-outlined text-lg">add</span>
          </div>
          Add New Set Main
        </button>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-secondary/20 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[92vh] card-enter"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl sakura-gradient flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined">edit_document</span>
                </div>
                <div>
                  <h2 className="font-headline font-extrabold text-xl text-secondary">
                    {isNew ? (formContext === 'summary' ? 'New Fixed Item' : 'New Schedule Item') : 'Edit Details'}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                    {formContext === 'summary' ? 'Fixed Expense' : 'Schedule Plan'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              {formContext !== 'summary' && (
                <div className="group">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Time Selection</label>
                  <div className="relative mt-1.5">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">schedule</span>
                    <input type="time" value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-11 pr-4 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
                  </div>
                </div>
              )}
              
              <div className="group">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Title & Identification</label>
                <input type="text" value={form.title} placeholder="Enter item name..."
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (JPY)</label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-300">¥</span>
                    <input type="number" value={form.jpy || ''}
                      onChange={e => setForm(f => ({ ...f, jpy: Number(e.target.value) }))}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-10 pr-4 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (THB)</label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-sm">฿</span>
                    <input type="number" value={form.thb || ''}
                      onChange={e => setForm(f => ({ ...f, thb: Number(e.target.value) }))}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-10 pr-4 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Type</label>
                <div className="relative mt-1.5">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">category</span>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-11 pr-10 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none appearance-none">
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes & Description</label>
                <textarea value={form.desc} placeholder="Optional notes..." rows={2}
                  onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Guide Steps (คั่นด้วย &gt;)</label>
                <div className="relative mt-1.5">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">route</span>
                  <input type="text" value={form.guide} placeholder="T3 > Monorail > Hamamatsucho > Yamanote > Shinjuku"
                    onChange={e => setForm(f => ({ ...f, guide: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-11 pr-4 py-3.5 text-[13px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps URL</label>
                <div className="relative mt-1.5">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">map</span>
                  <input type="url" value={form.mapUrl} placeholder="https://maps.google.com/..."
                    onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-11 pr-4 py-3.5 text-[13px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                <div className="relative mt-1.5">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">image</span>
                  <input type="url" value={form.image} placeholder="https://..."
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-11 pr-4 py-3.5 text-[13px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setShowForm(false)}
                  className="py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-sm font-black uppercase tracking-widest text-gray-500 transition-all active:scale-95">
                  Discard
                </button>
                <button onClick={handleSaveItem}
                  className="py-4 rounded-2xl sakura-gradient text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-japan-red/20 transition-all active:scale-95">
                  Commit Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Plan Main Form Modal --- */}
      {showPlanMainForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-secondary/20 backdrop-blur-sm" onClick={() => setShowPlanMainForm(false)}>
          <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] card-enter"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary shadow-sm border border-secondary/10">
                  <span className="material-symbols-outlined">folder_managed</span>
                </div>
                <div>
                  <h2 className="font-headline font-extrabold text-xl text-secondary">
                    {isNewPlanMain ? 'New Main Set' : 'Edit Main Set'}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                    Trip Grouping Item
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPlanMainForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 group">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Title</label>
                  <input type="text" value={planMainForm.title} placeholder="e.g. Day 1, Activities"
                    onChange={e => setPlanMainForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="text" value={planMainForm.date} placeholder="18/05"
                    onChange={e => setPlanMainForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] px-4 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none text-center" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Group Icon Category</label>
                <div className="relative mt-1.5">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">category</span>
                  <select value={planMainForm.type} onChange={e => setPlanMainForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] pl-11 pr-10 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none appearance-none">
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                <input type="text" value={planMainForm.desc} placeholder="What is this group for?"
                  onChange={e => setPlanMainForm(f => ({ ...f, desc: e.target.value }))}
                  className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:border-primary/30 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setShowPlanMainForm(false)}
                  className="py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-sm font-black uppercase tracking-widest text-gray-500 transition-all active:scale-95">
                  Discard
                </button>
                <button onClick={handleSavePlanMain}
                  className="py-4 rounded-2xl bg-secondary text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-secondary/20 transition-all active:scale-95">
                  Save Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlan;
