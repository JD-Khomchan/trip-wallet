import { useState, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TripCard from './components/TripCard';
import ExtraModal from './components/ExtraModal';
import ExchangeModal from './components/ExchangeModal';
import TopupModal from './components/TopupModal';
import BottomNav from './components/BottomNav';
import ManagePlan from './components/ManagePlan';
import TripOverview from './components/TripOverview';
import BudgetPlanModal from './components/BudgetPlanModal';
import { TRIP_BLUEPRINT } from './constants';
import { getDayStatus, getItemStatus, getAutoTab, migrateTripBlueprint } from './utils';
import type { UserState, TabId, ExtraItem, TripBlueprint, ExchangeRecord, TopupRecord } from './types';
import './index.css';

const EMPTY_STATE: UserState = { planned: {}, extras: [], wallet: { thb: 0, jpy: 0 }, exchanges: [], topups: [] };

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userState, setUserState] = useState<UserState>(EMPTY_STATE);
  const [tripPlan, setTripPlan] = useState<TripBlueprint | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [showManage, setShowManage] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabId>('summary');
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [activeWallet, setActiveWallet] = useState<'thb' | 'jpy'>('jpy');
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isBudgetPlanOpen, setIsBudgetPlanOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [nowPosition, setNowPosition] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isAdmin = adminEmails.includes(user?.email ?? '');

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const [userSnap, adminSnap, planSnap] = await Promise.all([
          getDoc(doc(db, 'users', firebaseUser.uid)),
          getDoc(doc(db, 'config', 'admins')),
          getDoc(doc(db, 'trips', 'main')),
        ]);

        if (userSnap.exists()) setUserState({ ...EMPTY_STATE, ...(userSnap.data() as UserState) });
        if (adminSnap.exists()) setAdminEmails(adminSnap.data().emails ?? []);

        if (planSnap.exists()) {
          // migrateTripBlueprint handles both old { days, thb/jpy } and new { planMains, amount/currency } formats
          const migrated = migrateTripBlueprint(planSnap.data());
          setTripPlan(migrated);
          setCurrentTab(getAutoTab(migrated.planMains));
          // Write migrated plan back so future loads are already in new format
          await setDoc(doc(db, 'trips', 'main'), JSON.parse(JSON.stringify(migrated)));
        } else {
          await setDoc(doc(db, 'trips', 'main'), TRIP_BLUEPRINT);
          setTripPlan(TRIP_BLUEPRINT);
          setCurrentTab(getAutoTab(TRIP_BLUEPRINT.planMains));
        }

        setDataLoaded(true);
      } else {
        setDataLoaded(false);
        setTripPlan(null);
        setUserState(EMPTY_STATE);
      }
      setAuthLoading(false);
    });
  }, []);

  // ── Legacy wallet → topup history migration ────────────────────────────────

  useEffect(() => {
    if (!dataLoaded || !userState.wallet) return;
    const { thb, jpy } = userState.wallet;
    if (thb > 0 || jpy > 0) {
      const legacyTopups: TopupRecord[] = [];
      if (thb > 0) legacyTopups.push({ id: 'legacy_thb', currency: 'thb', amount: thb, date: new Date().toISOString() });
      if (jpy > 0) legacyTopups.push({ id: 'legacy_jpy', currency: 'jpy', amount: jpy, date: new Date().toISOString() });
      setUserState(prev => ({ ...prev, wallet: { thb: 0, jpy: 0 }, topups: [...(prev.topups ?? []), ...legacyTopups] }));
    }
  }, [dataLoaded]);

  // ── Auto-save userState to Firestore (debounced) ───────────────────────────

  useEffect(() => {
    if (!user || !dataLoaded) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setDoc(doc(db, 'users', user.uid), userState);
    }, 800);
    return () => clearTimeout(saveTimeout.current);
  }, [userState, user, dataLoaded]);

  // ── Clock ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.getHours().toString().padStart(2, '0') + ':' +
        now.getMinutes().toString().padStart(2, '0') + ':' +
        now.getSeconds().toString().padStart(2, '0')
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Now pointer position (timeline) ───────────────────────────────────────

  useEffect(() => {
    if (!timelineRef.current || currentTab === 'summary') { setNowPosition(null); return; }

    const calc = () => {
      const container = timelineRef.current;
      if (!container || !tripPlan) return;
      const planMain = (tripPlan.planMains ?? []).find(pm => pm.id === currentTab);
      if (!planMain || getDayStatus(planMain.date) !== 'today') { setNowPosition(null); return; }

      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const cards = Array.from(container.querySelectorAll('.card-with-time'));
      const timePoints = [
        { minutes: 0, y: 0 },
        ...cards.map(c => {
          const [h, m] = (c.getAttribute('data-time') ?? '00:00').split(':').map(Number);
          const dot = c.querySelector('.rounded-full, .material-symbols-outlined') as HTMLElement;
          return { minutes: h * 60 + m, y: (c as HTMLElement).offsetTop + (dot ? dot.offsetTop : 38) };
        })
      ].sort((a, b) => a.minutes - b.minutes);

      let pos: number | null = null;
      if (nowMinutes <= timePoints[0].minutes) {
        pos = timePoints[0].y;
      } else if (nowMinutes >= timePoints[timePoints.length - 1].minutes) {
        pos = timePoints[timePoints.length - 1].y;
      } else {
        for (let i = 0; i < timePoints.length - 1; i++) {
          const start = timePoints[i], end = timePoints[i + 1];
          if (nowMinutes >= start.minutes && nowMinutes <= end.minutes) {
            pos = start.y + (end.y - start.y) * ((nowMinutes - start.minutes) / (end.minutes - start.minutes));
            break;
          }
        }
      }
      setNowPosition(pos);
    };

    calc();
    const interval = setInterval(calc, 1000);
    window.addEventListener('resize', calc);
    return () => { clearInterval(interval); window.removeEventListener('resize', calc); };
  }, [currentTime, currentTab, tripPlan]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const sortedPlanMains = useMemo(() => {
    if (!tripPlan) return [];
    return [...tripPlan.planMains].sort((a, b) => {
      const [da, ma] = (a.date ?? '0/0').split('/').map(Number);
      const [db2, mb] = (b.date ?? '0/0').split('/').map(Number);
      return ma !== mb ? ma - mb : da - db2;
    });
  }, [tripPlan]);

  // Budget stats split by currency
  const stats = useMemo(() => {
    if (!tripPlan) return { thb: { plan: 0, actual: 0 }, jpy: { plan: 0, actual: 0 } };

    let thbPlan = 0, thbActual = 0, jpyPlan = 0, jpyActual = 0;

    const calcItem = (item: { id: string; amount: number; currency: 'thb' | 'jpy' }) => {
      if (item.currency === 'thb') thbPlan += item.amount;
      else jpyPlan += item.amount;

      const p = userState.planned[item.id];
      if (p?.paid) {
        // actual: null → use plan amount; actual: n → use user's override
        const paidAmount = p.actual ?? item.amount;
        if (item.currency === 'jpy') jpyActual += paidAmount;
        else thbActual += paidAmount;
      }
    };

    (tripPlan.summary ?? []).forEach(calcItem);
    (tripPlan.planMains ?? []).forEach(pm => (pm.schedules ?? []).forEach(calcItem));

    (userState.extras ?? []).forEach(ex => {
      if (ex.currency === 'jpy') jpyActual += ex.amount;
      else thbActual += ex.amount;
    });

    return { thb: { plan: thbPlan, actual: thbActual }, jpy: { plan: jpyPlan, actual: jpyActual } };
  }, [userState, tripPlan]);

  // Wallet balance (deposited - exchanged - spent)
  // stats.actual already handles null → plan amount correctly, so reuse it here
  const walletStats = useMemo(() => {
    const topups = userState.topups ?? [];
    const exchanges = userState.exchanges ?? [];

    const thbDeposited = topups.filter(t => t.currency === 'thb').reduce((s, t) => s + t.amount, 0) + (userState.wallet?.thb ?? 0);
    const jpyDeposited = topups.filter(t => t.currency === 'jpy').reduce((s, t) => s + t.amount, 0) + (userState.wallet?.jpy ?? 0);
    const totalExchangedThb = exchanges.reduce((s, e) => s + e.thb, 0);
    const totalExchangedJpy = exchanges.reduce((s, e) => s + e.jpy, 0);

    return {
      thbRemaining: thbDeposited - totalExchangedThb - stats.thb.actual,
      jpyRemaining: jpyDeposited + totalExchangedJpy - stats.jpy.actual,
      thbDeposited,
      jpyDeposited,
    };
  }, [userState, stats]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleReset = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูลทั้งหมด?')) setUserState(EMPTY_STATE);
  };

  const handleWalletTopup = (currency: 'thb' | 'jpy', amount: number) => {
    const record: TopupRecord = { id: 'tp_' + Date.now(), date: new Date().toISOString(), amount, currency };
    setUserState(prev => ({ ...prev, topups: [...(prev.topups ?? []), record] }));
  };

  const handleDeleteTopup = (id: string) => {
    if (confirm('ยกเลิกรายการเติมเงินนี้?'))
      setUserState(prev => ({ ...prev, topups: (prev.topups ?? []).filter(t => t.id !== id) }));
  };

  const handleDeleteExchange = (id: string) => {
    if (confirm('ยกเลิกรายการแลกเงินนี้?'))
      setUserState(prev => ({ ...prev, exchanges: (prev.exchanges ?? []).filter(e => e.id !== id) }));
  };

  const handlePlanUpdate = async (updated: TripBlueprint) => {
    // When plan amount changes → reset user's actual to null so it follows new plan amount automatically.
    // This prevents stale "actual" from showing after admin edits the plan price.
    if (tripPlan) {
      const oldAmounts = new Map<string, number>();
      [...(tripPlan.summary ?? []), ...(tripPlan.planMains ?? []).flatMap(pm => pm.schedules ?? [])]
        .forEach(i => oldAmounts.set(i.id, i.amount));

      const updatedPlanned = { ...userState.planned };
      [...(updated.summary ?? []), ...(updated.planMains ?? []).flatMap(pm => pm.schedules ?? [])]
        .forEach(item => {
          if (oldAmounts.has(item.id) && oldAmounts.get(item.id) !== item.amount && updatedPlanned[item.id]) {
            updatedPlanned[item.id] = { ...updatedPlanned[item.id], actual: null };
          }
        });
      setUserState(prev => ({ ...prev, planned: updatedPlanned }));
    }

    setTripPlan(updated);
    try {
      await setDoc(doc(db, 'trips', 'main'), JSON.parse(JSON.stringify(updated)));
    } catch (err) {
      console.error('Save plan failed:', err);
      alert('บันทึกไม่สำเร็จ: ' + (err as Error).message);
    }
  };

  const handleExchange = (record: Omit<ExchangeRecord, 'id' | 'date'>) => {
    const newRecord: ExchangeRecord = { ...record, id: 'ex_' + Date.now(), date: new Date().toISOString() };
    setUserState(prev => ({ ...prev, exchanges: [...(prev.exchanges ?? []), newRecord] }));
  };

  // Toggle paid — first toggle creates PlannedItem with actual: null (follows plan amount)
  const togglePaid = (id: string, currency: 'thb' | 'jpy') => {
    setUserState(prev => {
      const current = prev.planned[id];
      return {
        ...prev,
        planned: {
          ...prev.planned,
          [id]: current
            ? { ...current, paid: !current.paid }
            : { paid: true, actual: null, currency },
        },
      };
    });
  };

  // Price change — null means "clear override, use plan amount"
  const handlePriceChange = (id: string, price: number | null, currency: 'thb' | 'jpy') => {
    setUserState(prev => ({
      ...prev,
      planned: {
        ...prev.planned,
        [id]: { ...(prev.planned[id] ?? { paid: false, currency }), actual: price },
      },
    }));
  };

  const handleAddExtra = (item: Omit<ExtraItem, 'id' | 'planMainId'>) => {
    const planMainId = currentTab === 'summary' ? tripPlan?.planMains[0]?.id : currentTab;
    const newExtra: ExtraItem = { ...item, id: 'ex_' + Date.now(), planMainId };
    setUserState(prev => ({ ...prev, extras: [...(prev.extras ?? []), newExtra] }));
  };

  const handleDeleteExtra = (id: string) => {
    if (confirm('Delete?'))
      setUserState(prev => ({ ...prev, extras: prev.extras.filter(e => e.id !== id) }));
  };

  // ── Render content ─────────────────────────────────────────────────────────

  const renderContent = () => {
    if (!tripPlan) return null;

    const history = [
      ...(userState.topups ?? []).map(t => ({ ...t, kind: 'topup' as const })),
      ...(userState.exchanges ?? []).map(e => ({ ...e, kind: 'exchange' as const })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const tripBg = tripPlan.planMains?.find(pm => pm.image)?.image
      ?? 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop';

    return (
      <>
        {/* ── Summary Tab ── */}
        <div className={currentTab !== 'summary' ? 'hidden' : 'relative'}>
          <div className="absolute -top-24 -left-10 -right-10 h-[500px] z-0 overflow-hidden pointer-events-none">
            <img src={tripBg} alt="" className="w-full h-full object-cover blur-[2px] scale-110 opacity-70 saturate-[1.8] brightness-90" />
            <div className="absolute inset-0 bg-linear-to-b from-surface via-surface/90 to-transparent h-40"></div>
            <div className="absolute inset-0 bg-linear-to-b from-surface via-transparent to-transparent opacity-100"></div>
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-surface/80 to-surface"></div>
            <div className="absolute inset-0 bg-linear-to-t from-surface/20 via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 space-y-8 pb-10">
            <div className="pt-10 pb-6 text-center card-enter">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-xl mb-6">
                <span className="material-symbols-outlined text-secondary text-2xl">account_balance_wallet</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-japan-red uppercase tracking-[0.6em] ml-1">Consolidated</span>
                <h1 className="text-4xl font-headline font-black text-secondary uppercase leading-none tracking-tighter">
                  Trip <span className="opacity-40">Ledger</span>
                </h1>
                <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                  <div className="h-px w-4 bg-secondary"></div>
                  <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">
                    {tripPlan.trip.name} • {tripPlan.trip.destination}
                  </p>
                  <div className="h-px w-4 bg-secondary"></div>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-center gap-3">
                <button onClick={() => setIsTopupModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl text-secondary hover:bg-white/60 active:scale-95 transition-all text-xs font-black uppercase tracking-widest">
                  <span className="material-symbols-outlined text-lg">add_circle</span>Top Up
                </button>
                <button onClick={() => setIsBudgetPlanOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary/90 backdrop-blur-xl border border-secondary shadow-xl shadow-secondary/20 text-white hover:bg-secondary active:scale-95 transition-all text-xs font-black uppercase tracking-widest">
                  <span className="material-symbols-outlined text-lg">currency_exchange</span>Exchange
                </button>
              </div>
            </div>

            <div className="card-enter">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Fixed Expenses</h3>
              {tripPlan.summary.map(item => {
                const cur = item.currency;
                return (
                  <TripCard key={item.id}
                    id={item.id} title={item.title} amount={item.amount} currency={cur}
                    type={item.type} desc={item.desc} image={item.image} mapUrl={item.mapUrl} guide={item.guide}
                    isTimeline={false} isMini={true}
                    paid={userState.planned[item.id]?.paid ?? false}
                    actual={userState.planned[item.id]?.actual ?? null}
                    onTogglePaid={togglePaid}
                    onPriceChange={handlePriceChange}
                  />
                );
              })}
            </div>

            <div className="card-enter">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Transaction History</h3>
              <div className="space-y-2">
                {history.length > 0 ? history.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-3xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.kind === 'topup' ? 'bg-primary/10 text-primary' : 'bg-japan-red/10 text-japan-red'}`}>
                        <span className="material-symbols-outlined text-xl">{item.kind === 'topup' ? 'payments' : 'currency_exchange'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-secondary uppercase tracking-tight truncate">
                          {item.kind === 'topup' ? (item.id.startsWith('legacy') ? 'Initial Balance' : 'Top-up') : 'Currency Exchange'}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {item.kind === 'topup' ? (
                          <p className="text-sm font-black text-secondary">
                            <span className="text-[11px] font-black text-japan-red mr-1">{(item as any).currency === 'jpy' ? '¥' : '฿'}</span>
                            {(item as any).amount.toLocaleString()}
                          </p>
                        ) : (
                          <div className="flex flex-col items-end">
                            <p className="text-xs font-black text-japan-red"><span className="text-[10px] mr-1">฿</span>{(item as any).thb.toLocaleString()}</p>
                            <p className="text-xs font-black text-primary"><span className="text-[10px] mr-1">¥</span>{(item as any).jpy.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <button onClick={() => item.kind === 'topup' ? handleDeleteTopup(item.id) : handleDeleteExchange(item.id)}
                        className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 hover:text-japan-red hover:bg-japan-red/5 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center bg-gray-50/50 rounded-4xl border-2 border-dashed border-gray-100">
                    <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">history</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No history yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Day Tabs ── */}
        {sortedPlanMains.map(pm => {
          const dayStatus = getDayStatus(pm.date);
          const scheduleItems = (pm.schedules ?? []).map(i => ({ ...i, isExtra: false as const }));
          const extraItems = (userState.extras ?? [])
            .filter(e => e.planMainId === pm.id)
            .map(e => ({ ...e, isExtra: true as const }));
          const combined = [...scheduleItems, ...extraItems].sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div key={pm.id} className={currentTab === pm.id ? 'relative' : 'hidden'}>
              <div className="absolute -top-24 -left-10 -right-10 h-[500px] z-0 overflow-hidden pointer-events-none">
                {pm.image ? (
                  <>
                    <img src={pm.image} alt="" className="w-full h-full object-cover blur-[2px] scale-110 opacity-70 saturate-[1.8] brightness-90 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-linear-to-b from-surface via-surface/90 to-transparent h-40"></div>
                    <div className="absolute inset-0 bg-linear-to-b from-surface via-transparent to-transparent opacity-100"></div>
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-surface/80 to-surface"></div>
                    <div className="absolute inset-0 bg-linear-to-t from-surface/20 via-transparent to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-japan-red/10 via-primary/5 to-surface"></div>
                )}
              </div>

              <div className="relative z-10 pt-10 pb-8 card-enter">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-3 bg-japan-red rounded-full"></div>
                      <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em]">
                        Day {String(sortedPlanMains.indexOf(pm) + 1).padStart(2, '0')}
                      </p>
                    </div>
                    <h1 className="text-3xl font-headline font-black text-secondary uppercase leading-none tracking-tighter drop-shadow-sm truncate">
                      {pm.title}
                    </h1>
                    {pm.desc && <p className="text-secondary/60 text-[10px] font-medium mt-2 line-clamp-1 italic">{pm.desc}</p>}
                  </div>
                  <div className="shrink-0">
                    <span className="px-3 py-1.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 text-secondary text-[10px] font-black tracking-widest shadow-xl flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {pm.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative" ref={currentTab === pm.id ? timelineRef : null}>
                <div className="timeline-line !-top-8">
                  {nowPosition !== null && <div className="timeline-progress" style={{ height: nowPosition }}></div>}
                </div>

                {nowPosition !== null && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none transition-all duration-1000 ease-linear -translate-y-1/2" style={{ top: nowPosition }}>
                    <div className="absolute left-0 w-11 flex items-center justify-end pr-3">
                      <span className="text-[11px] font-black text-japan-red">{currentTime.slice(0, 5)}</span>
                    </div>
                    <div className="absolute left-[47px]">
                      <div className="w-3 h-3 rounded-full bg-japan-red ring-4 ring-japan-red/20 dot-pulse"></div>
                    </div>
                    <div className="absolute left-[62px] top-1/2 -translate-y-1/2 whitespace-nowrap bg-japan-red text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg shadow-japan-red/20">
                      NOW
                    </div>
                  </div>
                )}

                {combined.map(item => {
                  const cur = item.currency;
                  return (
                    <TripCard key={item.id}
                      id={item.id} time={item.time} title={item.title}
                      amount={item.amount} currency={cur}
                      type={item.type} desc={item.desc}
                      image={item.isExtra ? undefined : item.image}
                      mapUrl={item.isExtra ? undefined : item.mapUrl}
                      guide={item.isExtra ? undefined : item.guide}
                      isTimeline={true}
                      status={getItemStatus(dayStatus, item.time)}
                      paid={item.isExtra ? true : (userState.planned[item.id]?.paid ?? false)}
                      actual={item.isExtra ? null : (userState.planned[item.id]?.actual ?? null)}
                      onTogglePaid={togglePaid}
                      onPriceChange={handlePriceChange}
                      onDelete={handleDeleteExtra}
                      isExtra={item.isExtra}
                    />
                  );
                })}

                <div className="relative pl-20 h-[38px] card-with-time" data-time="23:59">
                  <div className="absolute left-0 top-full -translate-y-1/2 w-11 flex items-center justify-end pr-3">
                    <span className={`text-[11px] font-black ${dayStatus === 'past' ? 'text-primary' : 'text-gray-300'}`}>00:00</span>
                  </div>
                  <div className="absolute left-[45px] top-full -translate-y-1/2 w-4 h-4 flex items-center justify-center z-10 bg-surface rounded-full">
                    {dayStatus === 'past'
                      ? <span className="material-symbols-outlined text-primary filled" style={{ fontSize: '18px' }}>check_circle</span>
                      : <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-surface"></div>}
                  </div>
                  <div className="absolute left-20 top-full -translate-y-1/2">
                    <div className={`py-2 px-4 rounded-2xl border border-dashed italic text-[10px] font-bold uppercase tracking-widest inline-block shadow-sm transition-all ${
                      dayStatus === 'past' ? 'bg-primary/5 border-primary text-primary' : 'bg-white/50 border-gray-100 text-gray-300'
                    }`}>End of Day</div>
                  </div>
                </div>
              </div>
              <div className="h-20" />
            </div>
          );
        })}
      </>
    );
  };

  // ── UI ──────────────────────────────────────────────────────────────────────

  if (authLoading || (user && !tripPlan)) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400 text-sm">Loading...</div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 sakura-gradient rounded-2xl flex items-center justify-center text-white shadow-xl">
          <span className="material-symbols-outlined text-3xl">wallet</span>
        </div>
        <div className="text-center">
          <h1 className="font-headline font-extrabold text-2xl text-secondary">Trip Wallet</h1>
          <p className="text-gray-400 text-sm mt-1">{TRIP_BLUEPRINT.trip.name}</p>
        </div>
        <button onClick={() => signInWithPopup(auth, googleProvider)}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-shadow font-semibold text-gray-700">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  if (showOverview && tripPlan) {
    return <TripOverview plan={tripPlan} onBack={() => setShowOverview(false)} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface selection:bg-japan-red/10"
      style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}>
      <Header onReset={handleReset} currentTime={currentTime} user={user} onLogout={() => signOut(auth)} />

      <main className="pt-16 max-w-2xl mx-auto px-5" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>
        {showManage && isAdmin && tripPlan ? (
          <div className="-mx-5">
            <ManagePlan plan={tripPlan} onPlanUpdate={handlePlanUpdate} />
          </div>
        ) : (
          <>
            <div className="relative z-20">
              <Dashboard tripName={tripPlan!.trip.name} planMains={sortedPlanMains} activeTab={currentTab} onTabChange={setCurrentTab} />
            </div>
            <div id="content" className="min-h-[400px] relative z-10">{renderContent()}</div>
          </>
        )}
      </main>

      <BottomNav
        onOpenExtra={() => setIsExtraModalOpen(true)}
        onOpenOverview={() => setShowOverview(true)}
        onOpenManage={() => setShowManage(!showManage)}
        isManageActive={showManage}
        activeCurrency={activeWallet}
        onSwitchCurrency={setActiveWallet}
        walletStats={{ thbRemaining: walletStats.thbRemaining, jpyRemaining: walletStats.jpyRemaining }}
        planStats={{ thbPlan: stats.thb.plan, jpyPlan: stats.jpy.plan }}
        onOpenTopup={() => setIsTopupModalOpen(true)}
      />
      <ExtraModal isOpen={isExtraModalOpen} onClose={() => setIsExtraModalOpen(false)} onSubmit={handleAddExtra} activeWallet={activeWallet} />
      <BudgetPlanModal isOpen={isBudgetPlanOpen} onClose={() => setIsBudgetPlanOpen(false)} thbPlan={stats.thb.plan} jpyPlan={stats.jpy.plan} />
      <ExchangeModal isOpen={isExchangeModalOpen} onClose={() => setIsExchangeModalOpen(false)} onConfirm={handleExchange} walletThb={walletStats.thbRemaining} />
      <TopupModal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} onConfirm={handleWalletTopup} currency={activeWallet} currentBalance={activeWallet === 'thb' ? walletStats.thbRemaining : walletStats.jpyRemaining} />
    </div>
  );
}

export default App;
