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
  flight:    'border-l-japan-red bg-japan-red/5',
  transport: 'border-l-blue-400 bg-blue-50',
  activity:  'border-l-violet-400 bg-violet-50',
  hotel:     'border-l-primary bg-primary/5',
  food:      'border-l-accent bg-orange-50',
  car:       'border-l-gray-400 bg-gray-50',
  other:     'border-l-gray-300 bg-gray-50',
};
const TYPE_BADGE: Record<string, string> = {
  flight:    'bg-japan-red/10 text-japan-red',
  transport: 'bg-blue-100 text-blue-600',
  activity:  'bg-violet-100 text-violet-600',
  hotel:     'bg-primary/10 text-primary',
  food:      'bg-orange-100 text-accent',
  car:       'bg-gray-100 text-gray-600',
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
    <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 group">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_BADGE[item.type] || TYPE_BADGE.other}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{getIcon(item.type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-secondary truncate">{item.title}</p>
        {item.desc && <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-japan-red">฿{item.thb.toLocaleString()}</p>
        {item.jpy > 0 && <p className="text-[10px] text-gray-400">¥{item.jpy.toLocaleString()}</p>}
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => openEditItem(item, 'summary')} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
        </button>
        <button onClick={() => handleDeleteItem(item.id, 'summary')} className="p-1.5 rounded-lg hover:bg-red-100 text-red-400">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
        </button>
      </div>
    </div>
  );

  const renderScheduleRow = (item: ScheduleItem, pmId: string) => (
    <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 group">
      <span className="text-[10px] font-black text-gray-400 w-10 text-right shrink-0">{item.time}</span>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_BADGE[item.type] || TYPE_BADGE.other}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{getIcon(item.type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-secondary truncate">{item.title}</p>
        {item.desc && <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>}
      </div>
      <div className="text-right shrink-0">
        {item.thb > 0 && <p className="text-xs font-bold text-japan-red">฿{item.thb.toLocaleString()}</p>}
        {item.jpy > 0 && <p className="text-[10px] text-gray-400">¥{item.jpy.toLocaleString()}</p>}
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => openEditItem(item, pmId)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
        </button>
        <button onClick={() => handleDeleteItem(item.id, pmId)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-400">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 glass-header border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline font-extrabold text-base text-secondary leading-tight">Manage Plan</h1>
              <p className="text-[10px] text-gray-400">{plan.planMains?.length || 0} plans · {(plan.summary?.length || 0)} fixed items</p>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('โหลด Template ใหม่? ข้อมูลปัจจุบันจะถูกแทนที่')) onPlanUpdate(TRIP_BLUEPRINT); }}
            className="flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-sm">restore</span> Template
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-32 space-y-3"
        style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>

        {/* Summary Accordion */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>account_balance_wallet</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-secondary">Fixed Expenses</p>
              <p className="text-[10px] text-gray-400">{plan.summary?.length || 0} items · ฿{(plan.summary || []).reduce((s, i) => s + i.thb, 0).toLocaleString()}</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 transition-transform duration-200"
              style={{ transform: openSections.has('summary') ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_more
            </span>
          </button>
          {openSections.has('summary') && (
            <div className="border-t border-gray-50 px-2 pb-2">
              {(plan.summary || []).map(renderSummaryRow)}
              <button onClick={() => openAddItem('summary')}
                className="w-full mt-1 py-2 text-xs font-bold text-primary flex items-center justify-center gap-1 rounded-xl hover:bg-primary/5">
                <span className="material-symbols-outlined text-sm">add</span> Add Item
              </button>
            </div>
          )}
        </div>

        {/* Plan Main Accordions */}
        {(plan.planMains || []).map((pm) => {
          const isOpen = openSections.has(pm.id);
          const colorClass = TYPE_COLORS[pm.type] || TYPE_COLORS.other;
          const totalThb = (pm.schedules || []).reduce((s, i) => s + i.thb, 0);
          return (
            <div key={pm.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-y border-r border-y-gray-50 border-r-gray-50 ${colorClass}`}>
              {/* Plan Main Header */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button onClick={() => toggleSection(pm.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${TYPE_BADGE[pm.type] || TYPE_BADGE.other}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{getIcon(pm.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-secondary truncate">{pm.title}</p>
                      {pm.date && (
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
                          {pm.date}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {(pm.schedules || []).length} schedules
                      {totalThb > 0 && ` · ฿${totalThb.toLocaleString()}`}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 transition-transform duration-200 shrink-0"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>
                {/* Plan main action buttons */}
                <div className="flex gap-0.5 shrink-0 ml-1">
                  <button onClick={() => openEditPlanMain(pm)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                  </button>
                  <button onClick={() => handleDeletePlanMain(pm.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Schedule Items */}
              {isOpen && (
                <div className="border-t border-gray-50 px-2 pb-2">
                  {(pm.schedules || []).length === 0 && (
                    <p className="text-center text-gray-400 text-xs py-3">ยังไม่มี schedule</p>
                  )}
                  {(pm.schedules || []).map(item => renderScheduleRow(item, pm.id))}
                  <button onClick={() => openAddItem(pm.id)}
                    className="w-full mt-1 py-2 text-xs font-bold text-primary flex items-center justify-center gap-1 rounded-xl hover:bg-primary/5">
                    <span className="material-symbols-outlined text-sm">add</span> Add Schedule
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Plan Main */}
        <button onClick={openAddPlanMain}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-400 flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors">
          <span className="material-symbols-outlined">add_circle</span> Add Plan Main
        </button>
      </main>

      {/* --- Schedule Item Form Modal --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-xl rounded-t-3xl p-6 space-y-4 overflow-y-auto max-h-[90vh]"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-extrabold text-lg text-secondary">
                {isNew ? (formContext === 'summary' ? 'Add Fixed Expense' : 'Add Schedule') : 'Edit Item'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formContext !== 'summary' && (
              <div>
                <label className="text-xs font-bold text-gray-500">Time</label>
                <input type="time" value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-500">Title *</label>
              <input type="text" value={form.title} placeholder="ชื่อรายการ"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500">JPY</label>
                <input type="number" value={form.jpy || ''}
                  onChange={e => setForm(f => ({ ...f, jpy: Number(e.target.value) }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">THB</label>
                <input type="number" value={form.thb || ''}
                  onChange={e => setForm(f => ({ ...f, thb: Number(e.target.value) }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Description</label>
              <input type="text" value={form.desc} placeholder="รายละเอียด"
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Image URL</label>
              <input type="url" value={form.image} placeholder="https://..."
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Google Maps URL</label>
              <input type="url" value={form.mapUrl} placeholder="https://maps.google.com/..."
                onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Guide (คั่นด้วย &gt;)</label>
              <input type="text" value={form.guide} placeholder="T3 > Monorail > Shinjuku"
                onChange={e => setForm(f => ({ ...f, guide: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border text-sm font-bold text-gray-500">Cancel</button>
              <button onClick={handleSaveItem}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Plan Main Form Modal --- */}
      {showPlanMainForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowPlanMainForm(false)}>
          <div className="bg-white w-full max-w-xl rounded-t-3xl p-6 space-y-4 overflow-y-auto max-h-[80vh]"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-extrabold text-lg text-secondary">
                {isNewPlanMain ? 'Add Plan Main' : 'Edit Plan Main'}
              </h2>
              <button onClick={() => setShowPlanMainForm(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Title *</label>
                <input type="text" value={planMainForm.title} placeholder="ชื่อสถานที่ / กิจกรรม"
                  onChange={e => setPlanMainForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Date (DD/MM)</label>
                <input type="text" value={planMainForm.date} placeholder="18/05"
                  onChange={e => setPlanMainForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Type</label>
              <select value={planMainForm.type} onChange={e => setPlanMainForm(f => ({ ...f, type: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Description</label>
              <input type="text" value={planMainForm.desc} placeholder="คำอธิบาย"
                onChange={e => setPlanMainForm(f => ({ ...f, desc: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowPlanMainForm(false)}
                className="flex-1 py-3 rounded-xl border text-sm font-bold text-gray-500">Cancel</button>
              <button onClick={handleSavePlanMain}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlan;
