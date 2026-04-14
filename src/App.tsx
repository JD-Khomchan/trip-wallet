import { useState, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import TripCard from './components/TripCard';
import ExtraModal from './components/ExtraModal';
import BottomNav from './components/BottomNav';
import ManagePlan from './components/ManagePlan';
import { TRIP_BLUEPRINT } from './constants';
import type { UserState, TabId, ExtraItem, TripBlueprint } from './types';
import './index.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userState, setUserState] = useState<UserState>({ planned: {}, extras: [] });
  const [tripPlan, setTripPlan] = useState<TripBlueprint | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [showManage, setShowManage] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabId>('summary');
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isAdmin = adminEmails.includes(user?.email || '');

  // Auth listener + load data
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userSnap.exists()) setUserState(userSnap.data() as UserState);

        const adminSnap = await getDoc(doc(db, 'config', 'admins'));
        if (adminSnap.exists()) setAdminEmails(adminSnap.data().emails || []);

        const planSnap = await getDoc(doc(db, 'trips', 'main'));
        if (planSnap.exists()) {
          const raw = planSnap.data() as any;
          // Migrate old structure (days[]) → new structure (planMains[])
          if (!raw.planMains && raw.days) {
            const migrated: TripBlueprint = {
              trip: raw.trip || TRIP_BLUEPRINT.trip,
              summary: raw.summary || [],
              planMains: (raw.days as any[]).map((d: any, i: number) => ({
                id: 'pm_' + (i + 1),
                title: d.date,
                date: d.date,
                jpy: 0,
                thb: 0,
                type: 'activity',
                schedules: d.items || [],
              })),
            };
            await setDoc(doc(db, 'trips', 'main'), JSON.parse(JSON.stringify(migrated)));
            setTripPlan(migrated);
          } else {
            setTripPlan(raw as TripBlueprint);
          }
        } else {
          await setDoc(doc(db, 'trips', 'main'), TRIP_BLUEPRINT);
          setTripPlan(TRIP_BLUEPRINT);
        }

        setDataLoaded(true);
      } else {
        setDataLoaded(false);
        setTripPlan(null);
        setUserState({ planned: {}, extras: [] });
      }
      setAuthLoading(false);
    });
  }, []);

  // Save user state to Firestore (debounced)
  useEffect(() => {
    if (!user || !dataLoaded) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setDoc(doc(db, 'users', user.uid), userState);
    }, 800);
    return () => clearTimeout(saveTimeout.current);
  }, [userState, user, dataLoaded]);

  // Update Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0'));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // Dashboard Calculations
  const { planTotal, actualTotal } = useMemo(() => {
    if (!tripPlan) return { planTotal: 0, actualTotal: 0 };
    let p = 0, a = 0;

    (tripPlan.summary || []).forEach(item => {
      p += item.thb;
      if (userState.planned[item.id]?.paid) a += userState.planned[item.id].actual;
    });

    (tripPlan.planMains || []).forEach(pm => {
      (pm.schedules || []).forEach(item => {
        p += item.thb;
        if (userState.planned[item.id]?.paid) a += userState.planned[item.id].actual;
      });
    });

    userState.extras.forEach(ex => { a += ex.thb; });

    return { planTotal: p, actualTotal: a };
  }, [userState, tripPlan]);

  // Handlers
  const handleReset = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูลทั้งหมด?')) {
      setUserState({ planned: {}, extras: [] });
    }
  };

  const handlePlanUpdate = async (updated: TripBlueprint) => {
    setTripPlan(updated);
    try {
      await setDoc(doc(db, 'trips', 'main'), JSON.parse(JSON.stringify(updated)));
    } catch (err) {
      console.error('Save plan failed:', err);
      alert('บันทึกไม่สำเร็จ: ' + (err as Error).message);
    }
  };

  const togglePaid = (id: string, initialPrice: number) => {
    setUserState(prev => {
      const current = prev.planned[id] || { paid: false, actual: initialPrice };
      return { ...prev, planned: { ...prev.planned, [id]: { ...current, paid: !current.paid } } };
    });
  };

  const handlePriceChange = (id: string, price: number) => {
    setUserState(prev => ({
      ...prev,
      planned: { ...prev.planned, [id]: { ...(prev.planned[id] || { paid: true }), actual: price } }
    }));
  };

  const handleAddExtra = (item: Omit<ExtraItem, 'id' | 'planMainId'>) => {
    const planMainId = currentTab === 'summary' ? tripPlan?.planMains[0]?.id : currentTab;
    const newExtra: ExtraItem = { ...item, id: 'ex_' + Date.now(), planMainId };
    setUserState(prev => ({ ...prev, extras: [...prev.extras, newExtra] }));
  };

  const handleDeleteExtra = (id: string) => {
    if (confirm('Delete?')) {
      setUserState(prev => ({ ...prev, extras: prev.extras.filter(e => e.id !== id) }));
    }
  };

  const getTimeStatus = (itemTime: string) => {
    const now = new Date();
    const timeNow = now.getHours() * 60 + now.getMinutes();
    const [h, m] = itemTime.split(':').map(Number);
    const timeItem = h * 60 + m;
    if (timeNow > timeItem + 30) return 'past';
    if (timeNow >= timeItem - 15 && timeNow <= timeItem + 30) return 'current';
    return 'future';
  };

  const renderContent = () => {
    if (!tripPlan) return null;

    if (currentTab === 'summary') {
      return (
        <div className="card-enter">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Fixed Expenses</h3>
          {tripPlan.summary.map(item => (
            <TripCard key={item.id} {...item} isTimeline={false}
              paid={userState.planned[item.id]?.paid || false}
              actual={userState.planned[item.id]?.actual !== undefined ? userState.planned[item.id].actual : item.thb}
              onTogglePaid={togglePaid} onPriceChange={handlePriceChange} />
          ))}
        </div>
      );
    }

    const planMain = tripPlan.planMains.find(pm => pm.id === currentTab);
    if (!planMain) return null;

    const scheduleItems = planMain.schedules.map(i => ({ ...i, isExtra: false as const }));
    const extraItems = userState.extras
      .filter(e => e.planMainId === currentTab)
      .map(e => ({ ...e, isExtra: true as const }));
    const combined = [...scheduleItems, ...extraItems].sort((a, b) => a.time.localeCompare(b.time));
    const hasPast = combined.some(i => getTimeStatus(i.time) === 'past');

    return (
      <div className="relative">
        <div className={`timeline-line ${hasPast ? 'line-past' : ''}`}></div>
        {combined.map(item => (
          <TripCard key={item.id} {...item} isTimeline={true}
            status={getTimeStatus(item.time)}
            paid={userState.planned[item.id]?.paid || false}
            actual={userState.planned[item.id]?.actual !== undefined ? userState.planned[item.id].actual : item.thb}
            onTogglePaid={togglePaid} onPriceChange={handlePriceChange}
            onDelete={handleDeleteExtra} isExtra={item.isExtra} />
        ))}
      </div>
    );
  };

  if (authLoading || (user && !tripPlan)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
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

  if (showManage && isAdmin && tripPlan) {
    return <ManagePlan plan={tripPlan} onBack={() => setShowManage(false)} onPlanUpdate={handlePlanUpdate} />;
  }

  return (
    <div className="min-h-screen" style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}>
      <Header onReset={handleReset} currentTime={currentTime} user={user}
        onLogout={() => signOut(auth)}
        isAdmin={isAdmin} onManage={() => setShowManage(true)} />

      <main className="pt-16 max-w-xl mx-auto px-4" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>
        <Dashboard planTotal={planTotal} actualTotal={actualTotal} tripName={tripPlan!.trip.name} />
        <Tabs activeTab={currentTab} onTabChange={setCurrentTab}
          planMains={tripPlan!.planMains.map(pm => ({ id: pm.id, title: pm.title, date: pm.date }))} />
        <div id="content" className="min-h-[400px]">{renderContent()}</div>
      </main>

      <BottomNav activeTab={currentTab} onTabChange={setCurrentTab} onOpenExtra={() => setIsExtraModalOpen(true)} />
      <ExtraModal isOpen={isExtraModalOpen} onClose={() => setIsExtraModalOpen(false)} onSubmit={handleAddExtra} />
    </div>
  );
}

export default App;
