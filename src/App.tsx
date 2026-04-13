import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import TripCard from './components/TripCard';
import ExtraModal from './components/ExtraModal';
import BottomNav from './components/BottomNav';
import { TRIP_BLUEPRINT } from './constants';
import type { UserState, TabId, DayItem } from './types';
import './index.css';

const STORAGE_KEY = 'japanTrip_v8_react';

function App() {
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { planned: {}, extras: [] };
  });
  const [currentTab, setCurrentTab] = useState<TabId>('summary');
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
  }, [userState]);

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

    // Fixed Expenses
    TRIP_BLUEPRINT.summary.forEach(item => {
      p += item.thb;
      if (userState.planned[item.id]?.paid) {
        a += userState.planned[item.id].actual;
      }
    });

    // Day Items
    TRIP_BLUEPRINT.days.forEach(day => {
      day.items.forEach(item => {
        p += item.thb;
        if (userState.planned[item.id]?.paid) {
          a += userState.planned[item.id].actual;
        }
      });
    });

    // Extras
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
      day: day, // Adding day to item for filtering
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
    const combined = [...dayPlan.map(i => ({...i, isExtra: false})), ...dayExtras].sort((a, b) => a.time.localeCompare(b.time));

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

  return (
    <div className="min-h-screen pb-32">
      <Header onReset={handleReset} currentTime={currentTime} />
      
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
