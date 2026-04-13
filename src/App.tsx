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
import { TRIP_BLUEPRINT } from './constants';
import type { UserState, TabId, DayItem } from './types';
import './index.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userState, setUserState] = useState<UserState>({ planned: {}, extras: [] });
  const [currentTab, setCurrentTab] = useState<TabId>('summary');
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auth listener + load data from Firestore
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snapshot.exists()) {
          setUserState(snapshot.data() as UserState);
        }
        setDataLoaded(true);
      } else {
        setDataLoaded(false);
        setUserState({ planned: {}, extras: [] });
      }
      setAuthLoading(false);
    });
  }, []);

  // Save to Firestore on state change (debounced)
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
    let p = 0;
    let a = 0;

    TRIP_BLUEPRINT.summary.forEach(item => {
      p += item.thb;
      if (userState.planned[item.id]?.paid) {
        a += userState.planned[item.id].actual;
      }
    });

    TRIP_BLUEPRINT.days.forEach(day => {
      day.items.forEach(item => {
        p += item.thb;
        if (userState.planned[item.id]?.paid) {
          a += userState.planned[item.id].actual;
        }
      });
    });

    userState.extras.forEach(ex => {
      a += ex.thb;
    });

    return { planTotal: p, actualTotal: a };
  }, [userState]);

  // Handlers
  const handleReset = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูลทั้งหมด?')) {
      setUserState({ planned: {}, extras: [] });
    }
  };

  const handleLogout = () => signOut(auth);

  const togglePaid = (id: string, initialPrice: number) => {
    setUserState(prev => {
      const current = prev.planned[id] || { paid: false, actual: initialPrice };
      return {
        ...prev,
        planned: {
          ...prev.planned,
          [id]: { ...current, paid: !current.paid }
        }
      };
    });
  };

  const handlePriceChange = (id: string, price: number) => {
    setUserState(prev => ({
      ...prev,
      planned: {
        ...prev.planned,
        [id]: { ...(prev.planned[id] || { paid: true }), actual: price }
      }
    }));
  };

  const handleAddExtra = (item: Omit<DayItem, 'id' | 'isExtra'>) => {
    const day = currentTab === 'summary' ? TRIP_BLUEPRINT.days[0].date : currentTab;
    const newExtra: DayItem = {
      ...item,
      id: 'ex_' + Date.now(),
      isExtra: true,
      day: day,
    } as any;

    setUserState(prev => ({
      ...prev,
      extras: [...prev.extras, newExtra]
    }));
  };

  const handleDeleteExtra = (id: string) => {
    if (confirm('Delete?')) {
      setUserState(prev => ({
        ...prev,
        extras: prev.extras.filter(e => e.id !== id)
      }));
    }
  };

  const getTimeStatus = (itemTime: string) => {
    const now = new Date();
    const [hNow, mNow] = [now.getHours(), now.getMinutes()];
    const [hItem, mItem] = itemTime.split(':').map(Number);
    const timeNow = hNow * 60 + mNow;
    const timeItem = hItem * 60 + mItem;
    if (timeNow > timeItem + 30) return 'past';
    if (timeNow >= timeItem - 15 && timeNow <= timeItem + 30) return 'current';
    return 'future';
  };

  const dayDates = TRIP_BLUEPRINT.days.map(d => d.date);

  const renderContent = () => {
    if (currentTab === 'summary') {
      return (
        <div className="card-enter">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Fixed Expenses</h3>
          {TRIP_BLUEPRINT.summary.map(item => (
            <TripCard
              key={item.id}
              {...item}
              isTimeline={false}
              paid={userState.planned[item.id]?.paid || false}
              actual={userState.planned[item.id]?.actual !== undefined ? userState.planned[item.id].actual : item.thb}
              onTogglePaid={togglePaid}
              onPriceChange={handlePriceChange}
            />
          ))}
        </div>
      );
    }

    const dayPlan = TRIP_BLUEPRINT.days.find(d => d.date === currentTab)?.items || [];
    const dayExtras = userState.extras.filter((e: any) => e.day === currentTab);
    const combined = [...dayPlan.map(i => ({ ...i, isExtra: false })), ...dayExtras].sort((a, b) => a.time.localeCompare(b.time));
    const hasPast = combined.some(i => getTimeStatus(i.time) === 'past');

    return (
      <div className="relative">
        <div className={`timeline-line ${hasPast ? 'line-past' : ''}`}></div>
        {combined.map(item => (
          <TripCard
            key={item.id}
            {...item}
            isTimeline={true}
            status={getTimeStatus(item.time)}
            paid={userState.planned[item.id]?.paid || false}
            actual={userState.planned[item.id]?.actual !== undefined ? userState.planned[item.id].actual : item.thb}
            onTogglePaid={togglePaid}
            onPriceChange={handlePriceChange}
            onDelete={handleDeleteExtra}
            isExtra={item.isExtra}
          />
        ))}
      </div>
    );
  };

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 sakura-gradient rounded-2xl flex items-center justify-center text-white shadow-xl">
          <span className="material-symbols-outlined text-3xl">wallet</span>
        </div>
        <div className="text-center">
          <h1 className="font-headline font-extrabold text-2xl text-secondary">Trip Wallet</h1>
          <p className="text-gray-400 text-sm mt-1">Japan May 2026</p>
        </div>
        <button
          onClick={() => signInWithPopup(auth, googleProvider)}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-shadow font-semibold text-gray-700"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <Header onReset={handleReset} currentTime={currentTime} user={user} onLogout={handleLogout} />

      <main className="pt-20 max-w-xl mx-auto px-4">
        <Dashboard planTotal={planTotal} actualTotal={actualTotal} />

        <Tabs
          activeTab={currentTab}
          onTabChange={setCurrentTab}
          dayDates={dayDates}
        />

        <div id="content" className="min-h-[400px]">
          {renderContent()}
        </div>
      </main>

      <BottomNav
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenExtra={() => setIsExtraModalOpen(true)}
      />

      <ExtraModal
        isOpen={isExtraModalOpen}
        onClose={() => setIsExtraModalOpen(false)}
        onSubmit={handleAddExtra}
      />
    </div>
  );
}

export default App;
