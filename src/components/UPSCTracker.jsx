import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// ===================== MONTHLY ROADMAP =====================
const MONTHLY_ROADMAP = [
  { month: 'May 22-31', phase: '1A', focus: 'Internal Security + Ancient/Medieval History', days: 9, topics: ['Internal Security', 'Ancient/Medieval History'], essays: 1 },
  { month: 'June', phase: '1B', focus: 'History (All) + World History', days: 30, topics: ['Ancient/Medieval History', 'Modern History', 'Post-Independence', 'World History'], essays: 4 },
  { month: 'July', phase: '1C', focus: 'Geography + Culture + Society + Environment', days: 31, topics: ['Geography (World & Indian)', 'Art & Culture', 'Indian Society', 'Env. & Disaster Mgmt'], essays: 6 },
  { month: 'August', phase: '2A', focus: 'Polity (Laxmikant) + Science & Tech', days: 31, topics: ['Polity & Constitution', 'Science & Tech'], essays: 30 },
  { month: 'September', phase: '2B', focus: 'Governance + Economy + Ethics', days: 30, topics: ['Governance & Social Justice', 'Economy & Agriculture', 'Ethics & Integrity'], essays: 45 },
  { month: 'October', phase: '3A', focus: 'PSIR Paper 1 (Political Theory)', days: 31, topics: ['PSIR Paper 1'], essays: 4 },
  { month: 'November', phase: '3B', focus: 'PSIR Paper 2 (IR) + Full Revision', days: 30, topics: ['PSIR Paper 2', 'International Relations'], essays: 4 },
  { month: 'December', phase: '4', focus: 'Full Revision + Mains Mock Tests', days: 31, topics: ['CSAT & Aptitude', 'Essay Writing'], essays: 8 },
];

const DAILY_TIMETABLE = [
  { time: '7:00-9:30 AM', activity: 'Primary Core', hours: 2.5, type: 'study' },
  { time: '10:00-1:00 PM', activity: 'Extended Study', hours: 3, type: 'study' },
  { time: '2:00-4:00 PM', activity: 'Secondary Topic', hours: 2, type: 'study' },
  { time: '4:30-6:00 PM', activity: 'Current Affairs', hours: 1.5, type: 'ca' },
  { time: '6:00-7:00 PM', activity: 'Language/Essay', hours: 1, type: 'essay' },
  { time: '8:00-9:30 PM', activity: 'Answer Writing', hours: 1.5, type: 'answers' },
  { time: '9:30-11:00 PM', activity: 'Revision', hours: 1.5, type: 'revision' },
];

// ===================== TARGET SUBJECTS (Algorithmic 1990 Weight Matrix) =====================
const TARGET_SUBJECTS = [
  { id: 1, name: 'PSIR Paper 1', weight: 250, status: 'untouched', roadmapPhase: '3A', confidence: 0 },
  { id: 2, name: 'PSIR Paper 2', weight: 250, status: 'untouched', roadmapPhase: '3B', confidence: 0 },
  { id: 3, name: 'Ethics & Integrity', weight: 200, status: 'untouched', roadmapPhase: '2B', confidence: 0 },
  { id: 4, name: 'Essay Writing', weight: 150, status: 'untouched', roadmapPhase: '4', confidence: 0 },
  { id: 5, name: 'Polity & Constitution', weight: 130, status: 'untouched', roadmapPhase: '2A', confidence: 0 },
  { id: 6, name: 'Economy & Agriculture', weight: 130, status: 'untouched', roadmapPhase: '2B', confidence: 0 },
  { id: 7, name: 'Geography (World & Indian)', weight: 100, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 8, name: 'CSAT & Aptitude', weight: 100, status: 'untouched', roadmapPhase: '4', confidence: 0 },
  { id: 9, name: 'Indian Society', weight: 90, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 10, name: 'Env. & Disaster Mgmt', weight: 80, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 11, name: 'Governance & Social Justice', weight: 75, status: 'untouched', roadmapPhase: '2B', confidence: 0 },
  { id: 12, name: 'International Relations', weight: 50, status: 'untouched', roadmapPhase: '3B', confidence: 0 },
  { id: 13, name: 'Science & Tech', weight: 50, status: 'untouched', roadmapPhase: '2A', confidence: 0 },
  { id: 14, name: 'Internal Security', weight: 50, status: 'untouched', roadmapPhase: '1A', confidence: 0 },
  { id: 15, name: 'Modern History', weight: 45, status: 'untouched', roadmapPhase: '1B', confidence: 0 },
  { id: 16, name: 'Art & Culture', weight: 40, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 17, name: 'Ancient/Medieval History', weight: 30, status: 'untouched', roadmapPhase: '1A', confidence: 0 },
  { id: 18, name: 'World History', weight: 15, status: 'untouched', roadmapPhase: '1B', confidence: 0 },
  { id: 19, name: 'Post-Independence', weight: 5, status: 'untouched', roadmapPhase: '1B', confidence: 0 },
];

const UPSCTrackerUltraPro = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // CORE STATE
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [journal, setJournal] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // TIMER & UI STATE
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0, running: false });
  const [studyMode, setStudyMode] = useState('deep');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studyNotes, setStudyNotes] = useState('');
  const [prodSlider, setProdSlider] = useState(75);
  const [journalInput, setJournalInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  
  const timerIntervalRef = useRef(null);

  // LIVE PRELIMS COUNTDOWN STATE (Target: May 24, 2027)
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // ===================== FILE SYSTEM =====================
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await Filesystem.readFile({
          path: 'upsc_tracker_data_v3.json', // Bumped version for new schema
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        const data = JSON.parse(result.data);
        
        // Smart merge for updated 1990-weight schema
        if (data.subjects) {
           const mergedSubjects = TARGET_SUBJECTS.map(ts => {
             const existing = data.subjects.find(s => s.name === ts.name || s.id === ts.id);
             return existing ? { ...ts, status: existing.status, confidence: existing.confidence || 0 } : ts;
           });
           setSubjects(mergedSubjects);
        } else {
           setSubjects(TARGET_SUBJECTS);
        }

        setSessions(data.sessions || []);
        setProductivity(data.productivity || []);
        setJournal(data.journal || []);
        setGoals(data.goals || []);
      } catch (e) {
        setSubjects(TARGET_SUBJECTS);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        await Filesystem.writeFile({
          path: 'upsc_tracker_data_v3.json',
          data: JSON.stringify({ subjects, sessions, productivity, journal, goals }),
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
      } catch (e) {
        console.error('Save error:', e);
      }
    };
    const timeout = setTimeout(saveData, 1000);
    return () => clearTimeout(timeout);
  }, [subjects, sessions, productivity, journal, goals, isLoaded]);

  // ===================== LIVE COUNTDOWN TIMER =====================
  useEffect(() => {
    const targetDate = new Date('2027-05-24T00:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff > 0) {
        setCountdown({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===================== ALGORITHMIC CALCULATIONS =====================
  const today = new Date();
  
  // Progress Calculation based on exactly 1990 weights
  const calculateProgress = () => {
    if (!subjects.length) return { progress: 0, totalWeight: 1990, completedWeight: 0, workingWeight: 0 };
    const totalWeight = subjects.reduce((sum, s) => sum + s.weight, 0); // Should equal 1990
    const completedWeight = subjects.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.weight, 0);
    const workingWeight = subjects.filter(s => s.status === 'working').reduce((sum, s) => sum + s.weight * 0.5, 0); // 50% math validation
    const progress = (totalWeight > 0) ? Math.round(((completedWeight + workingWeight) / totalWeight) * 100) : 0;
    return { progress, totalWeight, completedWeight, MathRoundWorkingWeight: Math.round(workingWeight) };
  };

  const { progress, totalWeight, completedWeight, MathRoundWorkingWeight } = calculateProgress();

  // Dynamic Pace Matrix Calculation
  const STRATEGY_DAYS = 365;
  const START_DATE = new Date('2026-05-24T00:00:00');
  const daysElapsed = Math.max(1, Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24)));
  
  const expectedProgress = Math.min(100, (daysElapsed / STRATEGY_DAYS) * 100);
  const paceStatus = progress >= expectedProgress ? 'NOMINAL' : 'DEFICIT DETECTED';
  const paceColor = progress >= expectedProgress ? 'text-green-400' : 'text-red-500';
  const paceBg = progress >= expectedProgress ? 'bg-green-900/20 border-green-700/50' : 'bg-red-900/20 border-red-700/50';

  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(checkDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (sessions.some(s => new Date(s.date).toISOString().split('T')[0] === dateStr)) {
        streak++;
      } else if (i > 0) break;
    }
    return streak;
  };

  const calculateTodayStats = () => {
    const todayStr = today.toISOString().split('T')[0];
    const todaySessionsList = sessions.filter(s => new Date(s.date).toISOString().split('T')[0] === todayStr);
    const todayHours = todaySessionsList.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
    const todayProd = productivity.find(p => new Date(p.date).toISOString().split('T')[0] === todayStr);
    return {
      sessions: todaySessionsList.length,
      hours: Math.round(todayHours * 10) / 10,
      productivity: todayProd?.score || 0,
      goals: goals.filter(g => !g.completed).length,
    };
  };

  const calculateWeakAreas = () => {
    return subjects
      .filter(s => s.status === 'untouched' || s.status === 'working')
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  };

  const calculateMonthlyProgress = () => {
    return MONTHLY_ROADMAP.map(month => {
      const completed = subjects
        .filter(s => month.topics.includes(s.name) && s.status === 'completed')
        .reduce((sum, s) => sum + s.weight, 0);
      const totalMonthWeight = subjects
        .filter(s => month.topics.includes(s.name))
        .reduce((sum, s) => sum + s.weight, 0);
      const pct = totalMonthWeight > 0 ? Math.round((completed / totalMonthWeight) * 100) : 0;
      return { ...month, progress: pct };
    });
  };

  const streak = calculateStreak();
  const todayStats = calculateTodayStats();
  const weakAreas = calculateWeakAreas();
  const monthlyProgress = calculateMonthlyProgress();

  // ===================== TIMER LOGIC =====================
  useEffect(() => {
    if (!timer.running) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        let { hours, minutes, seconds } = prev;
        seconds++;
        if (seconds === 60) { seconds = 0; minutes++; }
        if (minutes === 60) { minutes = 0; hours++; }
        
        if (seconds === 0 && minutes === 0 && hours > 0) {
          setShowBreakReminder(true);
        }
        
        return { ...prev, hours, minutes, seconds };
      });
    }, 1000);

    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timer.running]);

  const startTimer = () => setTimer(prev => ({ ...prev, running: true }));
  const pauseTimer = () => setTimer(prev => ({ ...prev, running: false }));
  const resetTimer = () => setTimer({ hours: 0, minutes: 0, seconds: 0, running: false });

  const logSession = () => {
    if (timer.hours === 0 && timer.minutes < 1) {
      alert('Session must be at least 1 minute');
      return;
    }
    const session = {
      id: Date.now(),
      subject: selectedSubject || 'General',
      duration: `${timer.hours}h ${timer.minutes}m`,
      durationSeconds: timer.hours * 3600 + timer.minutes * 60 + timer.seconds,
      mode: studyMode,
      notes: studyNotes,
      date: new Date().toISOString(),
    };
    setSessions([session, ...sessions]);
    
    if (selectedSubject) {
      setSubjects(subjects.map(s => 
        s.name === selectedSubject 
          ? { ...s, confidence: Math.min(100, s.confidence + 5) }
          : s
      ));
    }
    
    resetTimer();
    setStudyNotes('');
  };

  const logProductivity = () => {
    const filtered = productivity.filter(p => new Date(p.date).toISOString().split('T')[0] !== today.toISOString().split('T')[0]);
    const entry = { id: Date.now(), score: prodSlider, date: new Date().toISOString() };
    setProductivity([entry, ...filtered]);
    alert('Productivity logged! Chart updated.');
  };

  const updateSubjectStatus = (id, newStatus) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setSelectedSubjectId(null);
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setGoals([{ id: Date.now(), text: goalInput, completed: false, date: new Date().toISOString() }, ...goals]);
    setGoalInput('');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const saveJournal = () => {
    if (!journalInput.trim()) return;
    setJournal([{ id: Date.now(), text: journalInput, date: new Date().toISOString() }, ...journal]);
    setJournalInput('');
  };

  // ===================== CHART DATA =====================
  const getWeeklyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr);
      const dayHours = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      data.push({ day: dayName, hours: Math.round(dayHours * 10) / 10, sessions: daySessions.length });
    }
    return data;
  };

  const getProdData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayProd = productivity.find(p => new Date(p.date).toISOString().split('T')[0] === dateStr);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      data.push({ day: dayName, score: dayProd ? dayProd.score : 0 });
    }
    return data;
  };

  const getSubjectTimeData = () => {
    const data = {};
    sessions.forEach(s => {
      if (!data[s.subject]) data[s.subject] = 0;
      data[s.subject] += s.durationSeconds / 3600;
    });
    return Object.entries(data)
      .map(([name, hours]) => ({ name: name.length > 12 ? name.substring(0, 12) + '...' : name, hours: Math.round(hours) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  };

  // SOURCES MAP
  const sourcesData = {
    'Internal Security': ['Kumar Aniket — Challenges to Internal Security', 'Study IQ — 8 hr marathon', 'Sarrthi IAS — GS3 Module'],
    'Ancient/Medieval History': ['RS Sharma', 'Satish Chandra', 'NCERT 9th-12th', 'Kautilya Academy Notes', 'Samiksha Institute', 'Sainil Nagare Notes'],
    'Modern History': ['Spectrum (Rajiv Ahir)', 'Bipan Chandra', 'NCERTs', 'Sainil Nagare Notes'],
    'World History': ['Himanshu Khatri Notes', 'Vijay Ram Notes', 'Ravi Notes', 'Study IQ 10 hr marathon'],
    'Post-Independence': ['Spectrum', 'Bipan Chandra'],
    'Geography (World & Indian)': ['Kautilya Academy Notes', 'NCERT 11th-12th', 'Majid Husain (Selected)', 'G.C. Leong', 'Vision IAS Notes'],
    'Art & Culture': ['Nitin Singhania'],
    'Env. & Disaster Mgmt': ['Shankar IAS Environment', 'NDMA Guidelines (Summary)', 'NCERT Class 11 Disaster', 'Vision IAS Notes'],
    'Polity & Constitution': ['M. Laxmikant — Indian Polity', 'Sarrthi IAS Notes', 'DD Basu — Intro to Constitution'],
    'Governance & Social Justice': ['M. Laxmikant — Governance in India', 'Sarrthi IAS Notes'],
    'Science & Tech': ['Ravi P Agrahari', 'Kautilya Academy Notes', 'Vision IAS Notes'],
    'Economy & Agriculture': ['NCERTs', 'Sarrthi IAS Notes', 'Ramesh Singh', 'Vivek Singh Economy'],
    'Indian Society': ['NCERT Sociology 11th & 12th', 'Vision IAS GS1 Value Addition Material'],
    'Ethics & Integrity': ['Lexicon for Ethics', '2nd ARC Report', 'Subhra Ranjan / Vision IAS Notes'],
    'PSIR Paper 1': ['Subhra Ranjan Classes', 'IGNOU Notes', 'Andrew Heywood', 'O.P. Gauba', 'Western & Indian Political Thought'],
    'PSIR Paper 2': ['Subhra Ranjan Classes', 'Pavneet Singh — IR', 'Andrew Heywood', 'Does the Elephant Dance', 'Pax Indica', 'Rajiv Sikri'],
    'International Relations': ['(Subsumed largely by PSIR Paper 2)'],
    'Essay Writing': ['Weekly Practice', 'Anecdote Compilation', 'Philosophical Quotes DB'],
    'CSAT & Aptitude': ['Previous Year Questions', 'Basic Numeracy Daily Practice']
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <p className="text-white font-semibold">Initializing Algorithmic Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white min-h-screen pb-48 font-sans">
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-gray-950 via-gray-900 to-transparent border-b border-gray-800 px-4 py-3 shadow-xl backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          
          {/* LIVE PRELIMS COUNTDOWN */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-2 flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-300">PRELIMS '27 (MAY 24)</span>
            <div className="flex gap-2 font-mono text-xs text-amber-400 font-bold">
              <span>{countdown.d}d</span>
              <span>{String(countdown.h).padStart(2, '0')}h</span>
              <span>{String(countdown.m).padStart(2, '0')}m</span>
              <span className="text-red-400">{String(countdown.s).padStart(2, '0')}s</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-black font-mono tracking-wider">⚡ UPSC HQ</h1>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">{progress}%</div>
            </div>
          </div>

          {/* QUICK STATS BAR */}
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            <div className="bg-gradient-to-br from-red-900/40 to-red-900/20 border border-red-800/50 rounded-lg p-2 text-center">
              <div className="text-lg md:text-xl font-black text-amber-400">🔥{streak}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">streak</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-800/50 rounded-lg p-2 text-center">
              <div className="text-lg md:text-xl font-black text-blue-400">{todayStats.hours}h</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">today</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-green-900/20 border border-green-800/50 rounded-lg p-2 text-center">
              <div className="text-lg md:text-xl font-black text-green-400">{sessions.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">total</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-800/50 rounded-lg p-2 text-center">
              <div className="text-lg md:text-xl font-black text-purple-400">{todayStats.productivity}%</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">today</div>
            </div>
            <div className="bg-gradient-to-br from-teal-900/40 to-teal-900/20 border border-teal-800/50 rounded-lg p-2 text-center">
              <div className="text-lg md:text-xl font-black text-teal-400">{todayStats.goals}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">goals</div>
            </div>
          </div>

          {/* DYNAMIC WEIGHTED PROGRESS BAR (1990 Units) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
               <span>Algorithm Progress</span>
               <span>{completedWeight + MathRoundWorkingWeight}/{totalWeight} Wt</span>
            </div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
              <div className="bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${(completedWeight / totalWeight) * 100}%` }} />
              <div className="bg-gradient-to-r from-amber-500 to-orange-400" style={{ width: `${(MathRoundWorkingWeight / totalWeight) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* BREAK REMINDER */}
      {showBreakReminder && (
        <div className="fixed top-36 left-0 right-0 z-40 mx-4 bg-gradient-to-r from-orange-900 to-red-900 border-2 border-orange-600 rounded-lg p-3 animate-pulse shadow-2xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">⏰ Take a 5-min break! You've been studying for 1 hour</span>
            <button onClick={() => setShowBreakReminder(false)} className="text-sm bg-red-700 text-white px-3 py-1 rounded hover:bg-red-600">✕</button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* DYNAMIC PACE ALERT (Algorithmic Comparison) */}
            <div className={`rounded-xl p-4 border shadow-sm backdrop-blur-sm transition-all ${paceBg}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">📊 Algorithmic Pace Matrix</span>
                <span className={`font-mono text-sm font-black ${paceColor}`}>
                  {paceStatus}
                </span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-700/50">
                 <p className="text-xs text-gray-400">Expected: <span className="text-white font-bold">{expectedProgress.toFixed(1)}%</span></p>
                 <p className="text-xs text-gray-400">Actual: <span className="text-white font-bold">{progress}%</span></p>
                 <p className="text-xs text-gray-400">Day: <span className="text-white font-bold">{daysElapsed}/{STRATEGY_DAYS}</span></p>
              </div>
            </div>

            {/* WEAK AREAS */}
            {weakAreas.length > 0 && (
              <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 border border-red-700/50 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="text-xs font-bold text-red-300 mb-3 uppercase tracking-wider">⚠️ Critical Focus Vectors (By Weight)</h4>
                <div className="space-y-2">
                  {weakAreas.map((s, index) => (
                    <div key={s.id} className="flex justify-between items-center text-xs bg-gray-800/50 p-2.5 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-mono">#{index+1}</span>
                        <span className="text-gray-200 font-semibold">{s.name}</span>
                      </div>
                      <span className="text-red-300 font-mono font-bold bg-red-900/30 px-2 py-1 rounded">{s.weight} Wt</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MONTHLY PROGRESS CARDS */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">📅 Next Phases</h4>
              <div className="grid grid-cols-2 gap-3">
                {monthlyProgress.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 backdrop-blur-sm hover:border-gray-600 transition">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-amber-400">{m.phase}</span>
                      <span className="text-xs font-bold text-gray-400">{m.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRODUCTIVITY GRAPH (COMPOSED CHART: Bar + Line) */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">📈 Cognitive Efficiency Trend</h4>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={getProdData()} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#374151" vertical={false} />
                  <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '10px' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="score" fill="#F59E0B" fillOpacity={0.3} radius={[4, 4, 0, 0]} barSize={20} />
                  <Line type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* WEEKLY CHART (HOURS) */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <h4 className="text-xs font-bold text-gray-300 mb-4 uppercase tracking-wider">📊 Weekly Study Hours</h4>
              {getWeeklyData().length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={getWeeklyData()} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#374151" vertical={false} />
                    <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#2d3748', opacity: 0.4}} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">Log sessions to see chart</p>
              )}
            </div>

            {/* SUBJECT TIME PIE */}
            {getSubjectTimeData().length > 0 && (
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">⏱️ Time Allocation</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={getSubjectTimeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, hours }) => `${name}: ${hours}h`}
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="hours"
                    >
                      {getSubjectTimeData().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4', '#FBBF24'][index % 8]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none' }} formatter={(value) => `${value}h`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ACTIVE GOALS */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <h4 className="text-xs font-bold text-teal-300 mb-3 uppercase tracking-wider">🎯 Micro-Goals ({goals.filter(g => !g.completed).length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {goals.filter(g => !g.completed).map(goal => (
                  <div key={goal.id} className="flex items-center gap-3 text-sm bg-gray-700/50 p-2.5 rounded-lg hover:bg-gray-700 transition">
                    <input type="checkbox" checked={false} onChange={() => toggleGoal(goal.id)} className="w-4 h-4 cursor-pointer accent-teal-500 rounded" />
                    <span className="text-gray-200 flex-1">{goal.text}</span>
                    <button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="text-gray-500 hover:text-red-400 font-bold px-2">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Add a daily micro-goal..."
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition"
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <button onClick={addGoal} className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg text-sm font-bold transition">Add</button>
              </div>
            </div>
          </div>
        )}

        {/* TIMER TAB */}
        {activeTab === 'timer' && (
          <div className="space-y-4">
            <div className={`rounded-xl p-6 md:p-8 text-center border-2 backdrop-blur-sm transition-all duration-300 ${focusMode ? 'bg-gradient-to-br from-red-950 to-orange-950 border-orange-600 shadow-[0_0_30px_rgba(234,88,12,0.2)]' : 'bg-gray-800/40 border-gray-700/50 shadow-sm'}`}>
              <div className={`text-7xl md:text-9xl font-black font-mono mb-6 tracking-tight ${focusMode ? 'text-orange-400 animate-pulse' : 'text-amber-400 drop-shadow-sm'}`}>
                {String(timer.hours).padStart(2, '0')}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>

              <div className="space-y-3 mb-6 max-w-sm mx-auto">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold appearance-none"
                >
                  <option value="">Tag a Subject...</option>
                  {subjects.map(s => (<option key={s.id} value={s.name}>{s.name}</option>))}
                </select>

                <select
                  value={studyMode}
                  onChange={(e) => setStudyMode(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold appearance-none"
                >
                  <option value="deep">🧠 Deep Work (Theory)</option>
                  <option value="revision">🔄 Revision Sprint</option>
                  <option value="mock">📝 Mock Test</option>
                  <option value="ca">📰 Current Affairs</option>
                  <option value="essay">✍️ Essay Writing</option>
                </select>

                <textarea
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  placeholder="Session focus/notes (optional)..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 min-h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
                <button onClick={startTimer} disabled={timer.running} className="bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-gray-900 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition disabled:opacity-50">▶ Start</button>
                <button onClick={pauseTimer} className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-gray-900 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition">⏸ Pause</button>
                <button onClick={resetTimer} className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-gray-900 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition">⟲ Reset</button>
              </div>

              <button onClick={logSession} className="w-full max-w-sm mx-auto block bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition mb-3">
                📥 Stop & Log Session
              </button>

              <button 
                onClick={() => setFocusMode(!focusMode)}
                className={`w-full max-w-sm mx-auto block py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition border ${focusMode ? 'bg-orange-900/40 text-orange-400 border-orange-500/50 hover:bg-orange-800/60' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'}`}
              >
                {focusMode ? '✕ Exit Focus Mode' : '🎯 Enter Focus Mode'}
              </button>
            </div>

            {/* RECENT SESSIONS */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <h4 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider">Recent Sessions History</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {sessions.slice(0, 20).map(s => (
                  <div key={s.id} className="flex justify-between items-center text-sm bg-gray-900/50 border border-gray-700/50 p-3 rounded-lg hover:border-gray-600 transition">
                    <div>
                      <span className="text-gray-200 font-bold">{s.subject}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-500 ml-2 bg-gray-800 px-2 py-0.5 rounded">{s.mode}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">{s.duration}</span>
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No sessions recorded yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* MONTHLY ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/30 to-teal-900/30 border border-teal-700/50 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-base font-bold text-teal-300">📋 8-Month Roadmap to Success</h3>
              <p className="text-xs text-gray-400 mt-1">Track your macro progress through the required phases</p>
            </div>

            {monthlyProgress.map((month, idx) => (
              <div key={idx} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm hover:border-gray-600 transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-2">
                    <h4 className="font-black text-sm text-amber-400">{month.phase} - {month.month}</h4>
                    <p className="text-xs text-gray-300 mt-1 leading-snug">{month.focus}</p>
                  </div>
                  <span className={`text-3xl font-black font-mono ${month.progress === 100 ? 'text-green-400' : month.progress > 50 ? 'text-amber-400' : 'text-gray-500'}`}>
                    {month.progress}%
                  </span>
                </div>

                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-900 mb-3 border border-gray-700">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full transition-all duration-500" style={{ width: `${month.progress}%` }} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="bg-gray-900/80 rounded-lg px-2 py-1.5 text-center border border-gray-700/50">
                    <span className="text-gray-400 block text-[10px] uppercase">Days</span>
                    <span className="text-white font-bold">{month.days}</span>
                  </div>
                  <div className="bg-gray-900/80 rounded-lg px-2 py-1.5 text-center border border-gray-700/50">
                    <span className="text-gray-400 block text-[10px] uppercase">Topics</span>
                    <span className="text-white font-bold">{month.topics.length}</span>
                  </div>
                  <div className="bg-gray-900/80 rounded-lg px-2 py-1.5 text-center border border-gray-700/50">
                    <span className="text-gray-400 block text-[10px] uppercase">Essays</span>
                    <span className="text-amber-400 font-bold">{month.essays}</span>
                  </div>
                </div>

                <div className="border-t border-gray-700/50 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-teal-400 font-bold mb-2">Subject Coverage:</p>
                  <div className="space-y-1.5">
                    {month.topics.map((topic, i) => (
                      <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                        <span className="text-teal-500 opacity-70">▹</span>
                        <span className="font-medium">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DAILY SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-xl p-4 backdrop-blur-sm mb-4">
              <h3 className="text-base font-bold text-amber-300">📅 Optimal Daily Architecture</h3>
              <p className="text-xs text-gray-400 mt-1">Stick to this 11-hour deep work routine.</p>
            </div>

            {DAILY_TIMETABLE.map((slot, idx) => (
              <div key={idx} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm flex items-center gap-4 hover:border-gray-600 transition shadow-sm">
                <div className="font-mono font-bold text-teal-400 text-sm w-28 shrink-0">{slot.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-200">{slot.activity}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">{slot.hours}h Block</div>
                </div>
                <div className={`text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider ${
                  slot.type === 'study' ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50' :
                  slot.type === 'essay' ? 'bg-purple-900/50 text-purple-300 border border-purple-800/50' :
                  slot.type === 'ca' ? 'bg-green-900/50 text-green-300 border border-green-800/50' :
                  'bg-amber-900/50 text-amber-300 border border-amber-800/50'
                }`}>{slot.type}</div>
              </div>
            ))}
          </div>
        )}

        {/* SUBJECTS MATRIX */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="sticky top-[140px] md:top-32 z-30 bg-gray-950 py-3 border-b border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Weighted Subject Matrix</h3>
                <div className="flex gap-2">
                  <button onClick={() => setSubjects(subjects.map(s => ({ ...s, status: 'untouched' })))} className="text-[10px] uppercase font-bold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700">Reset</button>
                  <button onClick={() => setSubjects(subjects.map(s => ({ ...s, status: 'completed' })))} className="text-[10px] uppercase font-bold bg-green-900/50 text-green-400 hover:bg-green-800/60 px-3 py-1.5 rounded-lg border border-green-800">Complete All</button>
                </div>
              </div>
              <p className="text-[10px] text-gray-500">Ranked accurately by historical UPSC Mains weightage. Tap to edit status.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(selectedSubjectId === s.id ? null : s.id)}
                  className={`rounded-xl p-3 text-left transition transform hover:scale-[1.02] border-2 shadow-sm ${
                    s.status === 'completed' ? 'bg-green-950/30 border-green-600/50 text-green-200' :
                    s.status === 'working' ? 'bg-amber-950/30 border-amber-600/50 text-amber-200' :
                    'bg-[#161b22] border-gray-700 text-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm leading-tight mb-3">{s.name}</div>
                  <div className="flex justify-between items-end">
                     <div className="text-[10px] font-mono text-gray-500">
                        <span className="block mb-0.5">Wt: {s.weight}</span>
                        <span>{s.roadmapPhase}</span>
                     </div>
                     <div className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${s.status === 'completed' ? 'bg-green-900/50 text-green-400' : s.status === 'working' ? 'bg-amber-900/50 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                        {s.status}
                     </div>
                  </div>
                </button>
              ))}
            </div>

            {/* SUBJECT MODAL */}
            {selectedSubjectId && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm bg-gray-900 rounded-3xl p-6 border border-gray-700 shadow-2xl animate-slide-up">
                  <h4 className="font-black text-center text-xl text-amber-400 mb-2">
                    {subjects.find(s => s.id === selectedSubjectId)?.name}
                  </h4>
                  <p className="text-[10px] uppercase font-bold text-gray-500 text-center mb-6">Update Status</p>
                  
                  <div className="flex flex-col gap-3 mb-4">
                    {['untouched', 'working', 'completed'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateSubjectStatus(selectedSubjectId, status)}
                        className={`py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border ${
                          subjects.find(s => s.id === selectedSubjectId)?.status === status
                            ? 'bg-amber-500 text-gray-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02]'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {status === 'untouched' ? '⚪ Untouched' : status === 'working' ? '🟡 In Progress' : '🟢 Completed'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Sources:</p>
                    <ul className="text-xs text-gray-300 space-y-1 mb-4">
                       {(sourcesData[subjects.find(s => s.id === selectedSubjectId)?.name] || ['Refer to Core NCERTs']).map((source, idx) => (
                         <li key={idx} className="flex gap-2"><span className="text-teal-500">▹</span><span>{source}</span></li>
                       ))}
                    </ul>
                  </div>

                  <button onClick={() => setSelectedSubjectId(null)} className="w-full py-3 bg-transparent text-gray-500 hover:text-white rounded-xl text-sm font-bold transition border border-gray-700">Close</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* JOURNAL */}
        {activeTab === 'journal' && (
          <div className="space-y-4">
            
            {/* PRODUCTIVITY GRAPH & LOGGER */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">⚡ Cognitive Efficiency</h4>
                 <div className="text-sm font-black text-amber-400">{prodSlider}%</div>
              </div>
              
              <input
                type="range" min="0" max="100" value={prodSlider}
                onChange={(e) => setProdSlider(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-4"
              />
              <button onClick={logProductivity} className="w-full bg-amber-600 hover:bg-amber-500 text-gray-900 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition mb-6 shadow-md">Log Today's Score</button>
            </div>

            {/* JOURNAL LOGGER */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-3">📝 Daily Insights & Reflection</label>
              <textarea
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                placeholder="Log mistakes, epiphanies, links, or quick notes..."
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 min-h-24 resize-none mb-3"
              />
              <button onClick={saveJournal} className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition shadow-md">💾 Save Entry</button>
            </div>

            {/* RECENT ENTRIES */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Journal History ({journal.length})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {journal.map(entry => (
                  <div key={entry.id} className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono font-bold text-teal-500">{new Date(entry.date).toLocaleString()}</span>
                      <button onClick={() => setJournal(journal.filter(e => e.id !== entry.id))} className="text-[10px] font-bold uppercase text-red-500 hover:text-red-400 px-2 py-0.5 bg-red-900/20 rounded">Delete</button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                  </div>
                ))}
                {journal.length === 0 && <p className="text-xs text-center text-gray-500 py-6">No journal entries yet. Start writing!</p>}
              </div>
            </div>

            {/* EXPORT */}
            <button
              onClick={() => {
                const data = { subjects, sessions, productivity, journal, goals, timestamp: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `upsc_2027_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition shadow-lg mt-4"
            >
              📥 Export JSON Backup
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION (Mobile Optimized) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 pb-safe">
        <div className="max-w-3xl mx-auto px-1 py-2 grid grid-cols-6 gap-1 text-[10px]">
          {[
            { id: 'dashboard', icon: '📊', label: 'Stats' },
            { id: 'timer', icon: '⏱️', label: 'Timer' },
            { id: 'roadmap', icon: '🗺️', label: 'Roadmap' },
            { id: 'schedule', icon: '📅', label: 'Daily' },
            { id: 'subjects', icon: '📚', label: 'Subjects' },
            { id: 'journal', icon: '📝', label: 'Journal' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className={`text-xl mb-1 ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}`}>{tab.icon}</span>
              <span className="font-bold uppercase tracking-tighter truncate w-full text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UPSCTrackerUltraPro;