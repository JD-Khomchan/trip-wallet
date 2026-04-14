import React, { useState } from 'react';
import type { TripBlueprint, SummaryItem, ScheduleItem, PlanMain } from '../types';
import { getIcon, TRIP_BLUEPRINT } from '../constants';

interface ManagePlanProps {
  plan: TripBlueprint;
  onBack: () => void;
  onPlanUpdate: (plan: TripBlueprint) => void;
}

type ActiveTab = 'summary' | string; // summary or planMain.id

const TYPES = ['transport', 'flight', 'hotel', 'food', 'car', 'activity', 'other'];

const emptyItemForm = { title: '', jpy: 0, thb: 0, type: 'transport', desc: '', time: '09:00', image: '', mapUrl: '', guide: '' };
const emptyPlanMainForm = { title: '', date: '', jpy: 0, thb: 0, type: 'activity', desc: '', image: '', mapUrl: '', guide: '' };

const ManagePlan: React.FC<ManagePlanProps> = ({ plan, onBack, onPlanUpdate }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [editing, setEditing] = useState<(SummaryItem | ScheduleItem) | null>(null);
  const [form, setForm] = useState(emptyItemForm);
  const [showForm, setShowForm] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Plan Main edit modal
  const [showPlanMainForm, setShowPlanMainForm] = useState(false);
  const [planMainForm, setPlanMainForm] = useState(emptyPlanMainForm);
  const [editingPlanMain, setEditingPlanMain] = useState<PlanMain | null>(null);
  const [isNewPlanMain, setIsNewPlanMain] = useState(false);

  // --- Schedule item CRUD ---
  const openAdd = () => {
    setForm(emptyItemForm);
    setEditing(null);
    setIsNew(true);
    setShowForm(true);
  };

  const openEdit = (item: SummaryItem | ScheduleItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      jpy: item.jpy,
      thb: item.thb,
      type: item.type,
      desc: item.desc || '',
      time: (item as ScheduleItem).time || '09:00',
      image: item.image || '',
      mapUrl: item.mapUrl || '',
      guide: item.guide || '',
    });
    setIsNew(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (activeTab === 'summary') {
      let updatedSummary: SummaryItem[];
      if (isNew) {
        const newItem: SummaryItem = { id: 's_' + Date.now(), title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide };
        updatedSummary = [...plan.summary, newItem];
      } else {
        updatedSummary = plan.summary.map(i => i.id === editing?.id
          ? { ...i, title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide }
          : i);
      }
      onPlanUpdate({ ...plan, summary: updatedSummary });
    } else {
      const updatedPlanMains = plan.planMains.map(pm => {
        if (pm.id !== activeTab) return pm;
        let updatedSchedules: ScheduleItem[];
        if (isNew) {
          const newItem: ScheduleItem = { id: 'sc_' + Date.now(), time: form.time, title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide };
          updatedSchedules = [...pm.schedules, newItem].sort((a, b) => a.time.localeCompare(b.time));
        } else {
          updatedSchedules = pm.schedules.map(i => i.id === editing?.id
            ? { ...i, time: form.time, title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image, mapUrl: form.mapUrl, guide: form.guide }
            : i);
        }
        return { ...pm, schedules: updatedSchedules };
      });
      onPlanUpdate({ ...plan, planMains: updatedPlanMains });
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    if (activeTab === 'summary') {
      onPlanUpdate({ ...plan, summary: plan.summary.filter(i => i.id !== id) });
    } else {
      const updatedPlanMains = plan.planMains.map(pm =>
        pm.id === activeTab ? { ...pm, schedules: pm.schedules.filter(i => i.id !== id) } : pm
      );
      onPlanUpdate({ ...plan, planMains: updatedPlanMains });
    }
  };

  // --- Plan Main CRUD ---
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
      const newPm: PlanMain = {
        id: 'pm_' + Date.now(),
        title: planMainForm.title,
        date: planMainForm.date || undefined,
        jpy: planMainForm.jpy,
        thb: planMainForm.thb,
        type: planMainForm.type,
        desc: planMainForm.desc,
        image: planMainForm.image,
        mapUrl: planMainForm.mapUrl,
        guide: planMainForm.guide,
        schedules: [],
      };
      onPlanUpdate({ ...plan, planMains: [...plan.planMains, newPm] });
      setActiveTab(newPm.id);
    } else if (editingPlanMain) {
      const updatedPlanMains = plan.planMains.map(pm =>
        pm.id === editingPlanMain.id
          ? { ...pm, title: planMainForm.title, date: planMainForm.date || undefined, jpy: planMainForm.jpy, thb: planMainForm.thb, type: planMainForm.type, desc: planMainForm.desc, image: planMainForm.image, mapUrl: planMainForm.mapUrl, guide: planMainForm.guide }
          : pm
      );
      onPlanUpdate({ ...plan, planMains: updatedPlanMains });
    }
    setShowPlanMainForm(false);
  };

  const handleDeletePlanMain = (id: string) => {
    if (!confirm('ลบ Plan Main นี้?')) return;
    onPlanUpdate({ ...plan, planMains: plan.planMains.filter(pm => pm.id !== id) });
    setActiveTab('summary');
  };

  const currentItems = activeTab === 'summary'
    ? plan.summary
    : plan.planMains.find(pm => pm.id === activeTab)?.schedules || [];

  const currentPlanMain = plan.planMains.find(pm => pm.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 glass-header border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-extrabold text-xl tracking-tight text-secondary">Manage Plan</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (confirm('โหลด Template ใหม่? ข้อมูลปัจจุบันจะถูกแทนที่ทั้งหมด')) onPlanUpdate(TRIP_BLUEPRINT); }}
              className="flex items-center gap-1 bg-gray-100 text-gray-500 text-sm font-bold px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-sm">restore</span>
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-1 bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl shadow">
              <span className="material-symbols-outlined text-sm">add</span> Add
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 max-w-xl mx-auto px-4 pb-10">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          <button onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'summary' ? 'bg-secondary text-white' : 'bg-white text-gray-500 border'}`}>
            Summary
          </button>
          {plan.planMains.map(pm => (
            <button key={pm.id} onClick={() => setActiveTab(pm.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === pm.id ? 'bg-secondary text-white' : 'bg-white text-gray-500 border'}`}>
              {pm.title}
              {pm.date && <span className="ml-1 opacity-60 text-[10px]">{pm.date}</span>}
            </button>
          ))}
          <button onClick={openAddPlanMain}
            className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-white text-gray-400 border border-dashed">
            + Plan
          </button>
        </div>

        {/* Plan Main info bar (when viewing a plan main) */}
        {activeTab !== 'summary' && currentPlanMain && (
          <div className="flex justify-between items-center mb-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
            <div>
              <p className="font-bold text-sm text-secondary">{currentPlanMain.title}</p>
              <p className="text-xs text-gray-400">
                {currentPlanMain.date && <span className="mr-2">{currentPlanMain.date}</span>}
                {currentPlanMain.desc}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEditPlanMain(currentPlanMain)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button onClick={() => handleDeletePlanMain(activeTab)} className="p-2 rounded-full hover:bg-red-50 text-red-400">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          {(currentItems as any[]).map((item: SummaryItem | ScheduleItem) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <span className="material-symbols-outlined text-sm">{getIcon(item.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {(item as ScheduleItem).time && (
                    <span className="text-[10px] font-black text-gray-400">{(item as ScheduleItem).time}</span>
                  )}
                  <p className="font-bold text-sm text-secondary truncate">{item.title}</p>
                </div>
                <p className="text-xs text-gray-400">{item.jpy > 0 ? `¥${item.jpy.toLocaleString()} · ` : ''}฿{item.thb.toLocaleString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full hover:bg-red-50 text-red-400">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
          {currentItems.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">ยังไม่มีรายการ กด Add เพื่อเพิ่ม</div>
          )}
        </div>
      </main>

      {/* Schedule Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={closeForm}>
          <div className="bg-white w-full max-w-xl rounded-t-3xl p-6 space-y-4 overflow-y-auto max-h-[90vh]"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="font-headline font-extrabold text-lg text-secondary">
              {isNew ? 'Add Schedule' : 'Edit Schedule'}
            </h2>

            {activeTab !== 'summary' && (
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
                <label className="text-xs font-bold text-gray-500">THB *</label>
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
              <input type="text" value={form.desc} placeholder="รายละเอียด (ไม่บังคับ)"
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
              <input type="text" value={form.guide} placeholder="T3 > Monorail > Hamamatsucho > Yamanote > Shinjuku"
                onChange={e => setForm(f => ({ ...f, guide: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={closeForm}
                className="flex-1 py-3 rounded-xl border text-sm font-bold text-gray-500">Cancel</button>
              <button onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Main Form Modal */}
      {showPlanMainForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowPlanMainForm(false)}>
          <div className="bg-white w-full max-w-xl rounded-t-3xl p-6 space-y-4 overflow-y-auto max-h-[90vh]"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="font-headline font-extrabold text-lg text-secondary">
              {isNewPlanMain ? 'Add Plan Main' : 'Edit Plan Main'}
            </h2>

            <div>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500">JPY</label>
                <input type="number" value={planMainForm.jpy || ''}
                  onChange={e => setPlanMainForm(f => ({ ...f, jpy: Number(e.target.value) }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-base" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">THB</label>
                <input type="number" value={planMainForm.thb || ''}
                  onChange={e => setPlanMainForm(f => ({ ...f, thb: Number(e.target.value) }))}
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
