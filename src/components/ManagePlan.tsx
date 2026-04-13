import React, { useState } from 'react';
import type { TripBlueprint, SummaryItem, DayItem, DayPlan } from '../types';
import { getIcon } from '../constants';

interface ManagePlanProps {
  plan: TripBlueprint;
  onBack: () => void;
  onPlanUpdate: (plan: TripBlueprint) => void;
}

type ActiveTab = 'summary' | string;

const TYPES = ['transport', 'flight', 'hotel', 'food', 'car', 'activity', 'other'];

const emptyItem = { title: '', jpy: 0, thb: 0, type: 'transport', desc: '', time: '09:00', image: '', mapUrl: '', guide: '' };

const ManagePlan: React.FC<ManagePlanProps> = ({ plan, onBack, onPlanUpdate }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [editing, setEditing] = useState<(SummaryItem | DayItem) | null>(null);
  const [form, setForm] = useState(emptyItem);
  const [showForm, setShowForm] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const openAdd = () => {
    setForm(emptyItem);
    setEditing(null);
    setIsNew(true);
    setShowForm(true);
  };

  const openEdit = (item: SummaryItem | DayItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      jpy: item.jpy,
      thb: item.thb,
      type: item.type,
      desc: item.desc || '',
      time: (item as DayItem).time || '09:00',
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
        const newItem: SummaryItem = { id: 's_' + Date.now(), title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image || undefined, mapUrl: form.mapUrl || undefined, guide: form.guide || undefined };
        updatedSummary = [...plan.summary, newItem];
      } else {
        updatedSummary = plan.summary.map(i => i.id === editing?.id ? { ...i, ...form } : i);
      }
      onPlanUpdate({ ...plan, summary: updatedSummary });
    } else {
      const updatedDays = plan.days.map(day => {
        if (day.date !== activeTab) return day;
        let updatedItems: DayItem[];
        if (isNew) {
          const newItem: DayItem = { id: 'd_' + Date.now(), time: form.time, title: form.title, jpy: form.jpy, thb: form.thb, type: form.type, desc: form.desc, image: form.image || undefined, mapUrl: form.mapUrl || undefined, guide: form.guide || undefined };
          updatedItems = [...day.items, newItem].sort((a, b) => a.time.localeCompare(b.time));
        } else {
          updatedItems = day.items.map(i => i.id === editing?.id ? { ...i, ...form, time: form.time } : i);
        }
        return { ...day, items: updatedItems };
      });
      onPlanUpdate({ ...plan, days: updatedDays });
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    if (activeTab === 'summary') {
      onPlanUpdate({ ...plan, summary: plan.summary.filter(i => i.id !== id) });
    } else {
      const updatedDays = plan.days.map(day =>
        day.date === activeTab ? { ...day, items: day.items.filter(i => i.id !== id) } : day
      );
      onPlanUpdate({ ...plan, days: updatedDays });
    }
  };

  const handleAddDay = () => {
    const date = prompt('วันที่ใหม่ (DD/MM) เช่น 22/05');
    if (!date) return;
    if (plan.days.find(d => d.date === date)) return alert('มีวันนี้แล้ว');
    const newDay: DayPlan = { date, items: [] };
    onPlanUpdate({ ...plan, days: [...plan.days, newDay] });
    setActiveTab(date);
  };

  const handleDeleteDay = (date: string) => {
    if (!confirm(`ลบวันที่ ${date}?`)) return;
    onPlanUpdate({ ...plan, days: plan.days.filter(d => d.date !== date) });
    setActiveTab('summary');
  };

  const currentItems = activeTab === 'summary'
    ? plan.summary
    : plan.days.find(d => d.date === activeTab)?.items || [];

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
          <button onClick={openAdd}
            className="flex items-center gap-1 bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl shadow">
            <span className="material-symbols-outlined text-sm">add</span> Add
          </button>
        </div>
      </header>

      <main className="pt-20 max-w-xl mx-auto px-4 pb-10">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          <button onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'summary' ? 'bg-secondary text-white' : 'bg-white text-gray-500 border'}`}>
            Summary
          </button>
          {plan.days.map(day => (
            <button key={day.date} onClick={() => setActiveTab(day.date)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === day.date ? 'bg-secondary text-white' : 'bg-white text-gray-500 border'}`}>
              {day.date}
            </button>
          ))}
          <button onClick={handleAddDay}
            className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-white text-gray-400 border border-dashed">
            + Day
          </button>
        </div>

        {/* Delete Day button */}
        {activeTab !== 'summary' && (
          <div className="flex justify-end mb-2">
            <button onClick={() => handleDeleteDay(activeTab)} className="text-xs text-red-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">delete</span> ลบวันนี้
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          {(currentItems as any[]).map((item: SummaryItem | DayItem) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <span className="material-symbols-outlined text-sm">{getIcon(item.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {(item as DayItem).time && (
                    <span className="text-[10px] font-black text-gray-400">{(item as DayItem).time}</span>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={closeForm}>
          <div className="bg-white w-full max-w-xl rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-headline font-extrabold text-lg text-secondary">
              {isNew ? 'Add Item' : 'Edit Item'}
            </h2>

            {activeTab !== 'summary' && (
              <div>
                <label className="text-xs font-bold text-gray-500">Time</label>
                <input type="time" value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500">Title *</label>
              <input type="text" value={form.title} placeholder="ชื่อรายการ"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500">JPY</label>
                <input type="number" value={form.jpy || ''}
                  onChange={e => setForm(f => ({ ...f, jpy: Number(e.target.value) }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">THB *</label>
                <input type="number" value={form.thb || ''}
                  onChange={e => setForm(f => ({ ...f, thb: Number(e.target.value) }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">Description</label>
              <input type="text" value={form.desc} placeholder="รายละเอียด (ไม่บังคับ)"
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
            </div>

                    <div>
              <label className="text-xs font-bold text-gray-500">Image URL</label>
              <input type="url" value={form.image} placeholder="https://..."
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">Google Maps URL</label>
              <input type="url" value={form.mapUrl} placeholder="https://maps.google.com/..."
                onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">Guide (คั่นด้วย &gt;)</label>
              <input type="text" value={form.guide} placeholder="T3 > Monorail > Hamamatsucho > Yamanote > Shinjuku"
                onChange={e => setForm(f => ({ ...f, guide: e.target.value }))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
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
    </div>
  );
};

export default ManagePlan;
