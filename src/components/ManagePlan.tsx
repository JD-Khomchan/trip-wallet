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

const emptyItemForm = { title: '', amount: 0, currency: 'thb' as 'thb' | 'jpy', type: 'transport', desc: '', time: '09:00', image: '', mapUrl: '', guide: '' };
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
    const currency: 'thb' | 'jpy' = item.jpy > 0 && item.thb === 0 ? 'jpy' : 'thb';
    setForm({
      title: item.title, amount: currency === 'jpy' ? item.jpy : item.thb, currency,
      type: item.type,
      desc: item.desc || '', time: (item as ScheduleItem).time || '09:00',
      image: item.image || '', mapUrl: item.mapUrl || '', guide: item.guide || '',
    });
    setIsNew(false);
    setShowForm(true);
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
      const updatedPlanMains = plan.planMains.map(pm => {
        if (pm.id !== formContext) return pm;
        const updatedSchedules = isNew
          ? [...pm.schedules, { id: 'sc_' + Date.now(), time: form.time, title: form.title, jpy, thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide } as ScheduleItem].sort((a, b) => a.time.localeCompare(b.time))
          : pm.schedules.map(i => i.id === editing?.id ? { ...i, ...form, jpy, thb } : i);
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

  const sortByDate = (mains: PlanMain[]) =>
    [...mains].sort((a, b) => {
      const toNum = (d?: string) => {
        if (!d) return 9999;
        const [dd, mm] = d.split('/').map(Number);
        return (mm || 0) * 100 + (dd || 0);
      };
      return toNum(a.date) - toNum(b.date);
    });

  const handleSavePlanMain = () => {
    if (!planMainForm.title.trim()) return;
    if (isNewPlanMain) {
      const newPm: PlanMain = { id: 'pm_' + Date.now(), title: planMainForm.title, date: planMainForm.date || undefined, jpy: planMainForm.jpy, thb: planMainForm.thb, type: planMainForm.type, desc: planMainForm.desc, image: planMainForm.image, mapUrl: planMainForm.mapUrl, guide: planMainForm.guide, schedules: [] };
      onPlanUpdate({ ...plan, planMains: sortByDate([...plan.planMains, newPm]) });
      setOpenSections(prev => new Set([...prev, newPm.id]));
    } else if (editingPlanMain) {
      const updated = plan.planMains.map(pm => pm.id === editingPlanMain.id ? { ...pm, title: planMainForm.title, date: planMainForm.date || undefined, jpy: planMainForm.jpy, thb: planMainForm.thb, type: planMainForm.type, desc: planMainForm.desc, image: planMainForm.image, mapUrl: planMainForm.mapUrl, guide: planMainForm.guide } : pm);
      onPlanUpdate({ ...plan, planMains: sortByDate(updated) });
    }
    setShowPlanMainForm(false);
  };

  const handleDeletePlanMain = (id: string) => {
    if (!confirm('ลบ Plan Main นี้และ Schedule ทั้งหมดข้างใน?')) return;
    onPlanUpdate({ ...plan, planMains: plan.planMains.filter(pm => pm.id !== id) });
  };

  // --- Render helpers ---
  const renderSummaryRow = (item: SummaryItem) => (
    <div key={item.id} 
      onClick={() => openEditItem(item, 'summary')}
      className="flex items-center gap-4 py-4 px-5 rounded-4xl hover:bg-white hover:shadow-xl hover:shadow-secondary/5 hover:scale-[1.01] transition-all group border border-transparent hover:border-gray-50 cursor-pointer active:scale-98">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 transition-transform group-hover:rotate-3 ${TYPE_BADGE[item.type] || TYPE_BADGE.other}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{getIcon(item.type)}</span>
      </div>
      <div className="flex-1 min-w-0 py-1">
        <p className="text-[14px] font-black text-secondary leading-tight wrap-break-word line-clamp-2 mb-1">{item.title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-secondary/40 bg-secondary/5 px-2 py-0.5 rounded-md leading-none border border-secondary/5">{item.type}</span>
          {item.desc && <span className="text-[10px] font-bold text-gray-400/70 truncate max-w-[180px] italic">{item.desc}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        {item.jpy > 0 && item.thb === 0
          ? <p className="text-[14px] font-black text-blue-500 font-headline">¥{item.jpy.toLocaleString()}</p>
          : <p className="text-[14px] font-black text-japan-red font-headline">฿{item.thb.toLocaleString()}</p>}
      </div>
      <div className="flex gap-1 shrink-0 ml-1">
        <button 
          onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, 'summary'); }} 
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-red-50/80 text-red-500/60 hover:text-red-500 hover:bg-red-100 transition-all active:scale-90 shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
        </button>
      </div>
    </div>
  );

  const renderScheduleRow = (item: ScheduleItem, pmId: string) => (
    <div key={item.id} 
      onClick={() => openEditItem(item, pmId)}
      className="flex items-center gap-4 py-4 px-5 rounded-4xl hover:bg-white hover:shadow-xl hover:shadow-secondary/5 hover:scale-[1.01] transition-all group border border-transparent hover:border-gray-50 cursor-pointer active:scale-98">
      <div className="flex flex-col items-end shrink-0 w-12 border-r border-gray-100 pr-3 mr-1">
        <span className="text-[12px] font-black text-secondary font-headline leading-none">{item.time}</span>
        <span className="text-[7px] font-black text-gray-300 uppercase tracking-tighter mt-1">ARRIVAL</span>
      </div>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 transition-transform group-hover:rotate-3 ${TYPE_BADGE[item.type] || TYPE_BADGE.other}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{getIcon(item.type)}</span>
      </div>
      <div className="flex-1 min-w-0 py-1">
        <p className="text-[14px] font-black text-secondary leading-tight wrap-break-word line-clamp-2 mb-1">{item.title}</p>
        {item.desc && <p className="text-[10px] font-bold text-gray-400/70 line-clamp-1 italic">{item.desc}</p>}
      </div>
      <div className="text-right shrink-0">
        {item.jpy > 0 && item.thb === 0
          ? <p className="text-[14px] font-black text-blue-500 font-headline">¥{item.jpy.toLocaleString()}</p>
          : <p className="text-[14px] font-black text-japan-red font-headline">฿{item.thb.toLocaleString()}</p>}
      </div>
      <div className="flex gap-1 shrink-0 ml-1">
        <button 
          onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, pmId); }} 
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-red-50/80 text-red-500/60 hover:text-red-500 hover:bg-red-100 transition-all active:scale-90 shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-100 glass-header border-b border-gray-100 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-secondary hover:bg-gray-50 hover:-translate-x-1 active:scale-90 transition-all">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h1 className="font-headline font-black text-xl text-secondary leading-none tracking-tight">Manage Plan</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                  {plan.planMains?.length || 0} Sets · {(plan.summary?.length || 0)} Fixed
                </span>
                <div className="h-0.5 w-3 bg-gray-200"></div>
              </div>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('โหลด Template ใหม่? ข้อมูลปัจจุบันจะถูกแทนที่')) onPlanUpdate(TRIP_BLUEPRINT); }}
            className="flex items-center gap-2 bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all text-center">
            <span className="material-symbols-outlined text-sm">restore</span> Restore
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-32 space-y-4"
        style={{ paddingTop: 'calc(6.5rem + env(safe-area-inset-top))' }}>

        {/* Summary Accordion */}
        <div className="bg-white rounded-4xl shadow-xl shadow-secondary/5 overflow-hidden border border-gray-100 card-enter hover:shadow-2xl hover:shadow-secondary/10 hover:scale-[1.01] transition-all duration-500 relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
          
          <button
            onClick={() => toggleSection('summary')}
            className="w-full relative z-10 flex items-center gap-4 px-6 py-6 text-left transition-colors hover:bg-gray-50/5">
            <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center shrink-0 border border-secondary/10 shadow-sm transition-transform group-hover:rotate-6">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>payments</span>
            </div>
            <div className="flex-1">
              <p className="font-headline font-black text-lg text-secondary tracking-tight">Fixed Expenses Control</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {plan.summary?.length || 0} items
                </p>
                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                <p className="text-[10px] font-black text-japan-red uppercase tracking-widest">
                  ฿{(plan.summary || []).reduce((s, i) => s + i.thb, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 ${openSections.has('summary') ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-gray-50 text-gray-300'}`}>
              <span className="material-symbols-outlined text-sm leading-none font-black"
                style={{ transform: openSections.has('summary') ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </div>
          </button>
          
          {openSections.has('summary') && (
            <div className="relative z-10 border-t border-gray-50 px-4 pb-6 bg-gray-50/10">
              <div className="mt-4 space-y-1">
                {(plan.summary || []).length === 0 ? (
                    <div className="py-10 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-100 mx-2">
                        <span className="material-symbols-outlined text-gray-200 text-3xl mb-1">payments</span>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No entries found</p>
                    </div>
                ) : (plan.summary || []).map(renderSummaryRow)}
              </div>
              <button onClick={() => openAddItem('summary')}
                className="w-full mt-4 py-4 text-[11px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95 group/add">
                <span className="material-symbols-outlined text-lg transition-transform group-hover/add:rotate-90">add_circle</span> 
                <span>Add Record Entry</span>
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
              className={`bg-white rounded-4xl shadow-xl shadow-secondary/5 overflow-hidden border-y border-r border-gray-100 border-l-[6px] card-enter hover:shadow-2xl hover:shadow-secondary/10 hover:scale-[1.01] transition-all duration-500 relative group ${colorClass}`}
              style={{ animationDelay: `${(idx + 1) * 0.05}s` }}>
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125 duration-700"></div>

              {/* Plan Main Header */}
              <div className="flex items-center gap-3 px-6 py-6 relative z-10">
                <button onClick={() => toggleSection(pm.id)} className="flex items-center gap-3 flex-1 text-left min-w-0 group/header">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 transition-transform group-hover/header:rotate-3 ${TYPE_BADGE[pm.type] || TYPE_BADGE.other}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{getIcon(pm.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); openEditPlanMain(pm); }}>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-headline font-black text-lg text-secondary group-hover:text-primary transition-colors tracking-tight leading-tight shrink-0">{pm.title}</p>
                        {pm.date && (
                          <span className="text-[10px] font-black text-white sakura-gradient px-3 py-1 rounded-xl shadow-md shadow-japan-red/20 shrink-0 uppercase tracking-widest">
                            {pm.date}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {pm.schedules?.length || 0} events
                        </p>
                        {totalThb > 0 && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                            <p className="text-[10px] font-black text-japan-red uppercase tracking-widest">฿{totalThb.toLocaleString()}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 ${isOpen ? 'bg-secondary text-white shadow-lg shadow-secondary/20 scale-110' : 'bg-gray-50 text-gray-300'}`}>
                    <span className="material-symbols-outlined text-sm leading-none font-black"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </div>
                </button>
                
                {/* Plan main action buttons */}
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => handleDeletePlanMain(pm.id)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-50 hover:bg-red-500 hover:text-white text-red-400 transition-all hover:scale-105 active:scale-95 shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Schedule Items */}
              {isOpen && (
                <div className="relative z-10 border-t border-gray-50 px-4 pb-6 bg-gray-50/10">
                  <div className="mt-4 space-y-1">
                    {(pm.schedules || []).length === 0 ? (
                      <div className="py-12 text-center bg-white/40 rounded-4xl border-2 border-dashed border-gray-100 mx-2 my-2">
                         <span className="material-symbols-outlined text-gray-200 text-4xl mb-2">event_busy</span>
                         <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No detailed schedules</p>
                      </div>
                    ) : (pm.schedules || []).map(item => renderScheduleRow(item, pm.id))}
                  </div>
                  <button onClick={() => openAddItem(pm.id)}
                    className="w-full mt-4 py-4 text-[11px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95 group/add">
                    <span className="material-symbols-outlined text-lg transition-transform group-hover/add:rotate-90">add_circle</span> 
                    <span>Add Day Schedule</span>
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
        <div className="fixed inset-0 z-1000 flex items-end sm:items-center justify-center bg-secondary/80 backdrop-blur-md transition-all duration-300" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-[3rem] rounded-t-[3rem] shadow-2xl overflow-y-auto max-h-[92vh] animate-slide-up"
            onClick={e => e.stopPropagation()}>
            
            {/* Header Section */}
            <div className="pt-10 px-8 pb-6 bg-gray-50/50 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl sakura-gradient flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined">edit_square</span>
                  </div>
                  <div>
                    <h2 className="font-headline font-black text-2xl text-secondary">
                      {isNew ? (formContext === 'summary' ? 'Add Fixed Item' : 'New Schedule') : 'Edit Details'}
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                      {formContext === 'summary' ? 'Fixed Expense Configuration' : 'Itinerary Item Planning'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:bg-black/5 rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="px-8 pt-6 pb-12 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {formContext !== 'summary' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Arrival Time</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">schedule</span>
                      <input type="time" value={form.time}
                        onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                        className="w-full bg-gray-50 border border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Type</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">category</span>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl pl-11 pr-10 py-3.5 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none appearance-none">
                      {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Title</label>
                <input type="text" value={form.title} placeholder="Enter item name..."
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency & Price</label>
                <div className="flex gap-2">
                  <div className="flex rounded-2xl bg-gray-50 border border-gray-100 p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, currency: 'thb' }))}
                      className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${form.currency === 'thb' ? 'bg-japan-red text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                      ฿ THB
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, currency: 'jpy' }))}
                      className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${form.currency === 'jpy' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                      ¥ JPY
                    </button>
                  </div>
                  <div className={`flex-1 flex items-center bg-gray-50 rounded-3xl px-4 py-3.5 border-2 border-transparent transition-all focus-within:bg-white ${form.currency === 'thb' ? 'focus-within:border-japan-red' : 'focus-within:border-blue-500'}`}>
                    <span className={`font-black mr-2 text-sm ${form.currency === 'thb' ? 'text-japan-red' : 'text-blue-400'}`}>
                      {form.currency === 'thb' ? '฿' : '¥'}
                    </span>
                    <input type="number" value={form.amount || ''}
                      onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                      className="w-full bg-transparent border-none focus:outline-none text-xl font-headline font-black text-secondary text-right" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes & Details</label>
                <textarea value={form.desc} placeholder="Optional notes..." rows={2}
                  onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none resize-none" />
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">route</span>
                  <input type="text" value={form.guide} placeholder="Guide Steps (e.g. Train > Walk)"
                    onChange={e => setForm(f => ({ ...f, guide: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold focus:bg-white focus:border-secondary transition-all outline-none" />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">map</span>
                  <input type="url" value={form.mapUrl} placeholder="Google Maps Link"
                    onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium focus:bg-white focus:border-secondary transition-all outline-none" />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">image</span>
                  <input type="url" value={form.image} placeholder="Image URL (Thumbnail)"
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium focus:bg-white focus:border-secondary transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <button onClick={() => setShowForm(false)}
                  className="py-4 rounded-3xl bg-gray-50 hover:bg-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-400 transition-all">
                  Discard
                </button>
                <button onClick={handleSaveItem}
                  className="py-4 rounded-3xl sakura-gradient text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-japan-red/20 transition-all active:scale-95">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Plan Main Form Modal --- */}
      {showPlanMainForm && (
        <div className="fixed inset-0 z-1000 flex items-end sm:items-center justify-center bg-secondary/80 backdrop-blur-md transition-all duration-300" onClick={() => setShowPlanMainForm(false)}>
          <div className="bg-white w-full sm:max-w-xl sm:rounded-[3rem] rounded-t-[3rem] shadow-2xl overflow-y-auto max-h-[90vh] animate-slide-up"
            onClick={e => e.stopPropagation()}>
            
            <div className="pt-10 px-8 pb-6 bg-gray-50/50 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <h2 className="font-headline font-black text-2xl text-secondary">
                      {isNewPlanMain ? 'New Main Set' : 'Edit Main Set'}
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                      Group / Day Configuration
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPlanMainForm(false)} className="p-2 text-gray-400 hover:bg-black/5 rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="px-8 pt-6 pb-12 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Title</label>
                  <input type="text" value={planMainForm.title} placeholder="e.g. Day 1, Arrival"
                    onChange={e => setPlanMainForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="text" value={planMainForm.date} placeholder="18/05"
                    onChange={e => setPlanMainForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-4 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none text-center" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Representative Category</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">category</span>
                  <select value={planMainForm.type} onChange={e => setPlanMainForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl pl-11 pr-10 py-3.5 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none appearance-none">
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                <input type="text" value={planMainForm.desc} placeholder="Quick summary..."
                  onChange={e => setPlanMainForm(f => ({ ...f, desc: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-secondary transition-all outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image URL</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">image</span>
                  <input type="url" value={planMainForm.image} placeholder="https://..."
                    onChange={e => setPlanMainForm(f => ({ ...f, image: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium focus:bg-white focus:border-secondary transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <button onClick={() => setShowPlanMainForm(false)}
                  className="py-4 rounded-3xl bg-gray-50 hover:bg-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-400 transition-all">
                  Discard
                </button>
                <button onClick={handleSavePlanMain}
                  className="py-4 rounded-3xl bg-secondary text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-all active:scale-95">
                  Confirm Group
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
