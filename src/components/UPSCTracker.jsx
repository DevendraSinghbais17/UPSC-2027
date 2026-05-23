import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// DATA-DRIVEN WEIGHTS (Ranked Highest to Lowest, Multiplied by 10)
const TARGET_SUBJECTS = [
  { id: 1, name: 'PSIR Paper 1', weight: 167, status: 'untouched' },
  { id: 2, name: 'PSIR Paper 2', weight: 167, status: 'untouched' },
  { id: 3, name: 'Ethics & Integrity', weight: 96, status: 'untouched' },
  { id: 4, name: 'Polity & Constitution', weight: 84, status: 'untouched' },
  { id: 5, name: 'Geography', weight: 73, status: 'untouched' },
  { id: 6, name: 'Economy', weight: 69, status: 'untouched' },
  { id: 7, name: 'Indian Society', weight: 56, status: 'untouched' },
  { id: 8, name: 'Governance', weight: 52, status: 'untouched' },
  { id: 9, name: 'Environment', weight: 52, status: 'untouched' },
  { id: 10, name: 'Science & Tech', weight: 29, status: 'untouched' },
  { id: 11, name: 'Internal Security', weight: 28, status: 'untouched' },
  { id: 12, name: 'Art & Culture', weight: 26, status: 'untouched' },
  { id: 13, name: 'Modern History', weight: 21, status: 'untouched' },
  { id: 14, name: 'World History', weight: 8, status: 'untouched' },
  { id: 15, name: 'Post-Independence', weight: 4, status: 'untouched' },
  { id: 16, name: 'Ancient History', weight: 1, status: 'untouched' },
  { id: 17, name: 'Medieval History', weight: 1, status: 'untouched' },
];

const UPSCTrackerEnhanced = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('reality');
  
  // STATE
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [journal, setJournal] = useState([]);

  // TIMER & UI STATE
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0, running: false });
  const [studyMode, setStudyMode] = useState('deep');
  const [prodSlider, setProdSlider] = useState(75);
  const [journalInput, setJournalInput] = useState('');
  const timerIntervalRef = useRef(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // CHART CONTROLS STATE
  const [sessionChartPeriod, setSessionChartPeriod] = useState('weekly');
  const [sessionChartOffset, setSessionChartOffset] = useState(0);
  const [prodChartPeriod, setProdChartPeriod] = useState('weekly'); 
  const [prodChartOffset, setProdChartOffset] = useState(0);

  // 1. CAPACITOR FILE SYSTEM: READ & AUTO-MIGRATE ON LOAD
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await Filesystem.readFile({
          path: 'upsc_2027_tracker_data.json',
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        
        const data = JSON.parse(result.data);
        
        let loadedSubjects = data.subjects || [];
        if (loadedSubjects.length > 0) {
          const migratedSubjects = TARGET_SUBJECTS.map(target => {
            const oldMatch = loadedSubjects.find(s => 
              s.name.includes(target.name.split(' ')[0]) || s.id === target.id
            );
            return { ...target, status: oldMatch ? oldMatch.status : 'untouched' };
          });
          setSubjects(migratedSubjects);
        } else {
          setSubjects(TARGET_SUBJECTS);
        }

        setSessions(data.sessions || []);
        setProductivity(data.productivity || []);
        setJournal(data.journal || []);
      } catch (e) {
        setSubjects(TARGET_SUBJECTS);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // 2. CAPACITOR FILE SYSTEM: SAVE ON CHANGE
  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        await Filesystem.writeFile({
          path: 'upsc_2027_tracker_data.json',
          data: JSON.stringify({ subjects, sessions, productivity, journal }),
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
      } catch (e) {
        console.error("Error saving data to device:", e);
      }
    };
    saveData();
  }, [subjects, sessions, productivity, journal, isLoaded]);

  // DATE & DYNAMIC PACE ENGINE (222-DAY PROTOCOL)
  const targetStrategyDays = 222;
  const strategyStartDate = new Date('2026-05-23'); 
  const prelimsDate = new Date('2027-05-25');
  const mainsDate = new Date('2027-08-20');
  const today = new Date();
  
  const daysRemainingPrelims = Math.max(0, Math.ceil((prelimsDate - today) / (1000 * 60 * 60 * 24)));
  const daysRemainingMains = Math.max(0, Math.ceil((mainsDate - today) / (1000 * 60 * 60 * 24)));
  const elapsedStrategyDays = Math.max(1, Math.floor((today - strategyStartDate) / (1000 * 60 * 60 * 24)));
  const remainingStrategyDays = Math.max(1, targetStrategyDays - elapsedStrategyDays);

  const calculateProgress = () => {
    if (!subjects.length) return { progress: 0, totalWeight: 934, completedWeight: 0, workingWeight: 0 };
    const totalWeight = subjects.reduce((sum, s) => sum + s.weight, 0);
    const completedWeight = subjects.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.weight, 0);
    const workingWeight = subjects.filter(s => s.status === 'working').reduce((sum, s) => sum + s.weight * 0.5, 0);
    const progress = Math.round(((completedWeight + workingWeight) / totalWeight) * 100);
    return { progress, totalWeight, completedWeight, workingWeight };
  };

  const { progress, totalWeight, completedWeight, workingWeight } = calculateProgress();

  const pace = {
    currentMonthlyPace: elapsedStrategyDays > 0 ? ((progress / elapsedStrategyDays) * 30).toFixed(1) : 0,
    requiredMonthlyPace: remainingStrategyDays > 0 ? (((100 - progress) / remainingStrategyDays) * 30).toFixed(1) : 0,
    requiredDailyPace: remainingStrategyDays > 0 ? ((100 - progress) / remainingStrategyDays).toFixed(2) : 0,
    onTrack: parseFloat(elapsedStrategyDays > 0 ? ((progress / elapsedStrategyDays) * 30).toFixed(1) : 0) >= parseFloat(remainingStrategyDays > 0 ? (((100 - progress) / remainingStrategyDays) * 30).toFixed(1) : 0),
    remainingStrategyDays
  };

  // FULL SOURCES LIST
  const sourcesData = {
    'Internal Security': ['Kumar Aniket — Challenges to Internal Security', 'Study IQ — 8 hr marathon', 'Sarrthi IAS — GS3 Module'],
    'Ancient History': ['RS Sharma', 'NCERT 9th-12th', 'Kautilya Academy Notes', 'Samiksha Institute Notes', 'Sainil Nagare Notes'],
    'Medieval History': ['Satish Chandra', 'NCERT 9th-12th', 'Kautilya Academy Notes', 'Samiksha Institute Notes', 'Sainil Nagare Notes'],
    'Modern History': ['Spectrum (Rajiv Ahir)', 'Bipan Chandra', 'NCERTs', 'Sainil Nagare Notes'],
    'World History': ['Himanshu Khatri Notes', 'Vijay Ram Notes', 'Ravi Notes', 'Study IQ 10 hr marathon'],
    'Post-Independence': ['Spectrum', 'Bipan Chandra'],
    'Geography': ['Kautilya Academy Notes', 'NCERT 11th-12th', 'Majid Husain (Selected chapters)', 'G.C. Leong', 'Vision IAS Notes'],
    'Art & Culture': ['Nitin Singhania'],
    'Environment': ['Shankar IAS Environment Book'],
    'Polity & Constitution': ['M. Laxmikant — Indian Polity', 'Sarrthi IAS Notes', 'DD Basu — Intro to Constitution'],
    'Governance': ['M. Laxmikant — Governance in India', 'Sarrthi IAS Notes'],
    'Science & Tech': ['Ravi P Agrahari — Science & Tech', 'Kautilya Academy Notes', 'Vision IAS Notes'],
    'Economy': ['NCERTs', 'Sarrthi IAS Notes', 'Ramesh Singh', 'Vivek Singh Economy'],
    // Added recommended sources for missing subjects below
    'Indian Society': ['NCERT Sociology 11th & 12th', 'Vision IAS GS1 Value Addition Material'],
    'Disaster Mgmt': ['NDMA Guidelines (Summary)', 'CBSE/NCERT Class 11 Disaster Module', 'Vision IAS Disaster Notes'],
    'Ethics & Integrity': ['Lexicon for Ethics — Chronicle', '2nd ARC Report (Ethics in Governance summary)', 'Subhra Ranjan / Vision IAS Notes'],
    'PSIR Paper 1': ['Subhra Ranjan Classes + Notes', 'IGNOU Notes', 'Andrew Heywood — Political Theory & Ideologies', 'O.P. Gauba', 'Western Political Thought', 'Indian Political Thought'],
    'PSIR Paper 2': ['Subhra Ranjan Classes', 'Pavneet Singh — IR', 'Andrew Heywood — Global Politics', 'Does the Elephant Dance', 'Pax Indica', 'Rajiv Sikri'],
  };

  const dailyTimetable = [
    { time: '7:00–9:30 AM', block: 'Block 1 — Primary Topic', focus: 'Main subject of the month', hours: 2.5 },
    { time: '9:30–10:00 AM', block: 'Break', focus: 'Rest & hydrate', hours: 0.5 },
    { time: '10:00 AM–1:00 PM', block: 'Block 2 — Primary Topic', focus: '3 hours of deep reading', hours: 3 },
    { time: '1:00–2:00 PM', block: 'Lunch', focus: 'Meal break', hours: 1 },
    { time: '2:00–4:00 PM', block: 'Block 3 — Secondary Topic', focus: 'Supporting subject', hours: 2 },
    { time: '4:00–4:30 PM', block: 'Break', focus: 'Rest', hours: 0.5 },
    { time: '4:30–6:00 PM', block: 'Current Affairs', focus: 'Newspaper + notes', hours: 1.5 },
    { time: '6:00–7:00 PM', block: 'Language Paper', focus: 'Grammar or Essay', hours: 1 },
    { time: '7:00–8:00 PM', block: 'Dinner', focus: 'Meal break', hours: 1 },
    { time: '8:00–9:30 PM', block: 'Answer Writing', focus: '1 GS answer daily', hours: 1.5 },
    { time: '9:30–11:00 PM', block: 'Revision', focus: 'Consolidate today', hours: 1.5 },
  ];

  // TIMER LOGIC
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
        return { ...prev, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [timer.running]);

  const startTimer = () => setTimer(prev => ({ ...prev, running: true }));
  const pauseTimer = () => setTimer(prev => ({ ...prev, running: false }));
  const resetTimer = () => setTimer({ hours: 0, minutes: 0, seconds: 0, running: false });
  
  const logSession = () => {
    if (timer.hours === 0 && timer.minutes < 1) {
      alert('Session must be at least 1 minute.');
      return;
    }
    const session = {
      id: Date.now(),
      duration: `${timer.hours}h ${timer.minutes}m`,
      durationSeconds: timer.hours * 3600 + timer.minutes * 60 + timer.seconds,
      mode: studyMode,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toISOString(),
    };
    setSessions([session, ...sessions]);
    resetTimer();
  };

  const logProductivity = () => {
    setProductivity([{ id: Date.now(), score: prodSlider, date: new Date().toISOString() }, ...productivity]);
    alert('Productivity logged! Chart updated.');
  };

  const saveJournal = () => {
    if (!journalInput.trim()) return;
    setJournal([{ id: Date.now(), text: journalInput, timestamp: new Date().toLocaleString(), date: new Date().toISOString() }, ...journal]);
    setJournalInput('');
  };

  const updateSubjectStatus = (id, newStatus) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setSelectedSubjectId(null);
  };

  // --- CHARTING LOGIC ---
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay() || 7; 
    if (day !== 1) d.setHours(-24 * (day - 1)); 
    d.setHours(0,0,0,0);
    return d;
  }
  const getStartOfMonth = (date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  }

  const getChartData = (dataset, period, offset, type) => {
    const now = new Date();
    let startDate, endDate, data = [];

    if (period === 'weekly') {
      const startOfThisWeek = getStartOfWeek(now);
      startOfThisWeek.setDate(startOfThisWeek.getDate() - (offset * 7));
      startDate = new Date(startOfThisWeek);
      endDate = new Date(startOfThisWeek);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23,59,59,999);

      for(let i=0; i<7; i++) {
         const d = new Date(startDate);
         d.setDate(d.getDate() + i);
         data.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), fullDate: d.toDateString(), value: 0, count: 0 });
      }
    } else {
      const startOfThisMonth = getStartOfMonth(now);
      startOfThisMonth.setMonth(startOfThisMonth.getMonth() - offset);
      startDate = new Date(startOfThisMonth);
      endDate = new Date(startOfThisMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); 
      endDate.setHours(23,59,59,999);

      const daysInMonth = endDate.getDate();
      for(let i=1; i<=daysInMonth; i++) {
         data.push({ label: `${i}`, fullDate: new Date(startDate.getFullYear(), startDate.getMonth(), i).toDateString(), value: 0, count: 0 });
      }
    }

    dataset.forEach(item => {
      const d = new Date(item.date);
      if(d >= startDate && d <= endDate) {
        const match = data.find(day => day.fullDate === d.toDateString());
        if (match) {
           if (type === 'sessions') match.value += item.durationSeconds / 3600;
           else if (type === 'productivity') { match.value += item.score; match.count += 1; }
        }
      }
    });

    if (type === 'sessions') data.forEach(item => item.value = Math.round(item.value * 10) / 10);
    else if (type === 'productivity') data.forEach(item => item.value = item.count > 0 ? Math.round(item.value / item.count) : 0);

    const titleStr = period === 'weekly' 
      ? `${startDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${endDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`
      : startDate.toLocaleDateString('en-US', {month:'long', year:'numeric'});

    return { data, titleStr };
  };

  const sessionChart = getChartData(sessions, sessionChartPeriod, sessionChartOffset, 'sessions');
  const prodChart = getChartData(productivity, prodChartPeriod, prodChartOffset, 'productivity');

  if (!isLoaded) return <div className="h-screen bg-gray-950 flex items-center justify-center text-amber-400 font-mono">Calibrating 222-Day Protocol...</div>;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className="hidden md:flex flex-col w-72 bg-[#0d1117] border-r border-gray-800 shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">⚡ UPSC HQ</h1>
          <p className="text-[10px] text-gray-400 mt-2 font-mono tracking-widest uppercase">222-Day Mains Protocol</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3 custom-scrollbar">
          {[
            { id: 'reality', label: 'Reality & Pace', icon: '📊' },
            { id: 'sources', label: 'Sources', icon: '📚' },
            { id: 'daily', label: 'Daily Timetable', icon: '⏰' },
            { id: 'focus', label: 'Focus Engine', icon: '⏱️' },
            { id: 'analytics', label: 'Burnout Radar', icon: '📈' },
            { id: 'journal', label: 'Journal', icon: '📝' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === tab.id ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gradient-to-b from-gray-900 to-gray-950">
        
        {/* TOP BAR */}
        <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 px-4 md:px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg md:text-xl font-bold capitalize text-gray-100">{activeTab.replace('-', ' ')}</h2>
            <div className="flex gap-4 mt-1">
              <p className="text-xs text-amber-500 font-mono">Prelims: {daysRemainingPrelims}d</p>
              <p className="text-xs text-purple-400 font-mono">Mains: {daysRemainingMains}d</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">{progress}%</div>
            <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500 mt-1">Mains Readiness</div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* TAB: REALITY CHECK & PACE */}
            {activeTab === 'reality' && (
              <div className="space-y-6 animate-fade-in">
                {/* DASHBOARD */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Pace</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-blue-400">{pace.currentMonthlyPace}%</p>
                      <p className="text-xs text-gray-500 mb-1">/ mo</p>
                    </div>
                  </div>
                  <div className={`bg-[#161b22] rounded-xl p-5 border shadow-sm ${pace.onTrack ? 'border-green-900/50' : 'border-red-900/50'}`}>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Required Pace</p>
                    <div className="flex items-end gap-2">
                      <p className={`text-3xl font-bold ${pace.onTrack ? 'text-green-400' : 'text-red-400'}`}>
                        {pace.requiredMonthlyPace}%
                      </p>
                      <p className="text-xs text-gray-500 mb-1">/ mo</p>
                    </div>
                  </div>
                  <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Target Plan</p>
                    <p className="text-3xl font-bold text-amber-400">{pace.remainingStrategyDays}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase">Days left in 222-Day Plan</p>
                  </div>
                  <div className={`bg-[#161b22] rounded-xl p-5 border shadow-sm flex flex-col justify-center items-center ${pace.onTrack ? 'border-green-900/50' : 'border-orange-900/50'}`}>
                    <p className={`text-lg font-bold ${pace.onTrack ? 'text-green-400' : 'text-orange-400'}`}>
                      {pace.onTrack ? '✓ ON TRACK' : '⚠ BEHIND'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 text-center">{pace.requiredDailyPace}% needed daily</p>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="bg-[#161b22] rounded-xl p-6 border border-gray-800 shadow-sm">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Weighted Syllabus Progress</h3>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-800">
                    <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* SUBJECT GRID (RANKED) */}
                <div>
                  <div className="flex justify-between items-end mb-4 px-1">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Subject Matrix (Ranked by weight)</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subjects.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubjectId(selectedSubjectId === subject.id ? null : subject.id)}
                        className={`rounded-xl p-4 text-left transition-all duration-200 shadow-sm ${
                          subject.status === 'completed' ? 'bg-green-950/20 border border-green-900/50 hover:border-green-700' :
                          subject.status === 'working' ? 'bg-amber-950/20 border border-amber-900/50 hover:border-amber-700' :
                          'bg-[#161b22] border border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-semibold text-sm text-gray-200 mb-3 leading-tight">{subject.name}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-500 font-mono">Score: {subject.weight}</span>
                          <span className={`text-[9px] px-2 py-1 rounded uppercase font-bold tracking-wider ${
                             subject.status === 'completed' ? 'text-green-400 bg-green-900/30' :
                             subject.status === 'working' ? 'text-amber-400 bg-amber-900/30' : 'text-gray-500 bg-gray-800'
                          }`}>
                            {subject.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* MODAL */}
                  {selectedSubjectId && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                      <div className="w-full max-w-sm bg-[#161b22] border border-gray-700 rounded-2xl p-6 shadow-2xl animate-slide-up">
                        <h4 className="font-bold text-lg text-center mb-6 text-gray-100">
                          {subjects.find(s => s.id === selectedSubjectId)?.name}
                        </h4>
                        <div className="flex flex-col gap-3">
                          {['untouched', 'working', 'completed'].map(status => (
                            <button
                              key={status}
                              onClick={() => updateSubjectStatus(selectedSubjectId, status)}
                              className={`py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                                subjects.find(s => s.id === selectedSubjectId)?.status === status
                                  ? 'bg-amber-500 text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                          <button onClick={() => setSelectedSubjectId(null)} className="mt-4 py-3 bg-transparent text-gray-500 hover:text-white rounded-xl text-sm transition font-semibold">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SOURCES */}
            {activeTab === 'sources' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Foundational Commitments Card */}
                <div className="bg-[#161b22] rounded-xl p-6 md:p-8 border border-amber-900/50 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
                   <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                     <span>🏛️</span> Foundational Commitments
                   </h3>
                   <div className="grid md:grid-cols-2 gap-6 relative z-10">
                      <div>
                        <h4 className="font-bold text-sm text-gray-200 mb-2 border-b border-gray-800 pb-2">Core Classes</h4>
                        <ul className="text-xs text-gray-300 space-y-2">
                          <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">▹</span> <span>Vision IAS Full Program (~484 Videos @ 3.5 hrs each)</span></li>
                          <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">▹</span> <span>NCERTs Class 6th to 12th (All core subjects)</span></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-200 mb-2 border-b border-gray-800 pb-2">Daily Current Affairs</h4>
                        <ul className="text-xs text-gray-300 space-y-2">
                          <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">▹</span> <span>Daily Newspaper reading</span></li>
                          <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">▹</span> <span>Drishti IAS Articles + Custom daily topic list</span></li>
                          <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">▹</span> <span>Vision IAS Monthly Magazine</span></li>
                        </ul>
                      </div>
                   </div>
                   <div className="mt-6 p-4 bg-teal-950/20 border border-teal-900/30 rounded-lg">
                      <p className="text-xs text-teal-200/80 leading-relaxed">
                        💡 <strong>Deep Integration Strategy:</strong> With an extensive multi-source approach, rely heavily on active recall and interconnected, consolidated note-making to synthesize information efficiently.
                      </p>
                   </div>
                </div>

                <div className="bg-[#161b22] rounded-xl p-6 md:p-8 border border-gray-800 shadow-sm">
                  <h3 className="text-xl font-bold text-white mb-6">Subject Masterlist</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map(subject => (
                      <div key={subject.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition">
                        <h4 className="font-bold text-sm mb-3 text-amber-400 border-b border-gray-800 pb-2">{subject.name}</h4>
                        <ul className="text-xs text-gray-300 space-y-2">
                          {(sourcesData[subject.name] || ['Refer to Foundational NCERTs']).map((source, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-teal-400 mt-0.5 opacity-70">▹</span>
                              <span>{source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FOCUS ENGINE */}
            {activeTab === 'focus' && (
               <div className="space-y-6 animate-fade-in">
                 <div className="grid md:grid-cols-5 gap-6">
                   <div className="md:col-span-3 bg-[#161b22] rounded-xl p-8 border border-gray-800 shadow-sm text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Deep Work Timer</p>
                      <div className="text-7xl md:text-8xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-600 mb-8 tracking-tight drop-shadow-sm">
                        {String(timer.hours).padStart(2, '0')}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                      </div>
                      <select value={studyMode} onChange={(e) => setStudyMode(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-sm text-white mb-8 w-full max-w-sm mx-auto focus:ring-2 focus:ring-amber-500 outline-none appearance-none font-semibold">
                        <option value="deep">🧠 Deep Work (Theory)</option>
                        <option value="revision">🔄 Active Recall / Revision</option>
                        <option value="mock">✍️ Mock Test / Answer Writing</option>
                      </select>
                      <div className="flex gap-4 justify-center mb-8 max-w-sm mx-auto w-full">
                        <button onClick={startTimer} disabled={timer.running} className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-gray-900 py-3 rounded-xl font-bold transition disabled:opacity-50 uppercase tracking-wider text-xs">Start</button>
                        <button onClick={pauseTimer} className="flex-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-gray-900 py-3 rounded-xl font-bold transition uppercase tracking-wider text-xs">Pause</button>
                        <button onClick={resetTimer} className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-gray-900 py-3 rounded-xl font-bold transition uppercase tracking-wider text-xs">Reset</button>
                      </div>
                      <button onClick={logSession} className="bg-blue-600 hover:bg-blue-500 text-white w-full max-w-sm mx-auto py-4 rounded-xl font-bold shadow-lg transition uppercase tracking-wider text-sm">Stop & Log Session</button>
                   </div>
                   
                   <div className="md:col-span-2 bg-[#161b22] rounded-xl p-6 border border-gray-800 shadow-sm flex flex-col max-h-[500px]">
                      <h3 className="font-bold text-gray-300 mb-6 uppercase tracking-wider text-sm px-1">Session History</h3>
                      <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                        {sessions.slice(0, 15).map(session => (
                          <div key={session.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex justify-between items-center hover:border-gray-700 transition-colors">
                            <div>
                              <div className="text-gray-100 font-bold font-mono text-lg">{session.duration}</div>
                              <div className="text-xs text-gray-500 mt-1">{new Date(session.date).toLocaleDateString()} • {session.timestamp}</div>
                            </div>
                            <span className="text-[10px] px-2 py-1 bg-gray-800 text-amber-400 rounded uppercase font-bold tracking-wider">{session.mode}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                 </div>

                 <div className="bg-[#161b22] rounded-xl p-6 border border-gray-800 shadow-sm">
                   <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                     <h3 className="font-bold text-gray-300 uppercase tracking-wider text-sm">Study Hours Graph</h3>
                     <div className="flex items-center gap-4 bg-gray-900 p-1.5 rounded-lg border border-gray-800">
                        <div className="flex gap-1">
                          <button onClick={() => {setSessionChartPeriod('weekly'); setSessionChartOffset(0);}} className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition ${sessionChartPeriod === 'weekly' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}>Weekly</button>
                          <button onClick={() => {setSessionChartPeriod('monthly'); setSessionChartOffset(0);}} className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition ${sessionChartPeriod === 'monthly' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}>Monthly</button>
                        </div>
                        <div className="w-px h-6 bg-gray-700"></div>
                        <div className="flex items-center gap-3 px-2">
                           <button onClick={() => setSessionChartOffset(prev => prev + 1)} className="text-gray-400 hover:text-amber-400 text-lg transition px-1">◀</button>
                           <span className="text-xs font-mono text-amber-100 min-w-[120px] text-center">{sessionChart.titleStr}</span>
                           <button onClick={() => setSessionChartOffset(prev => Math.max(0, prev - 1))} disabled={sessionChartOffset === 0} className={`text-lg transition px-1 ${sessionChartOffset === 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-amber-400'}`}>▶</button>
                        </div>
                     </div>
                   </div>
                   
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={sessionChart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                         <XAxis dataKey="label" stroke="#718096" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                         <YAxis stroke="#718096" fontSize={10} axisLine={false} tickLine={false} />
                         <Tooltip 
                            cursor={{fill: '#2d3748', opacity: 0.4}}
                            contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '8px' }}
                            itemStyle={{ color: '#FBBF24', fontWeight: 'bold' }}
                            formatter={(value) => [`${value} Hours`, 'Studied']}
                            labelStyle={{ color: '#A0AEC0', marginBottom: '4px' }}
                         />
                         <Bar dataKey="value" fill="#FBBF24" radius={[4, 4, 0, 0]} maxBarSize={40} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </div>
            )}

            {/* TAB: BURNOUT RADAR */}
            {activeTab === 'analytics' && (
               <div className="space-y-6 animate-fade-in">
                 <div className="bg-[#161b22] rounded-xl p-8 border border-gray-800 shadow-sm text-center max-w-2xl mx-auto">
                   <h2 className="text-gray-300 font-bold text-xl mb-2">Daily Execution Quality</h2>
                   <p className="text-gray-500 text-sm mb-10">Rate your focus and energy today to track potential burnout patterns.</p>
                   
                   <input type="range" min="0" max="100" value={prodSlider} onChange={(e) => setProdSlider(Number(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                   <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 my-10 drop-shadow-sm">{prodSlider}%</div>
                   
                   <button onClick={logProductivity} className="bg-amber-600 hover:bg-amber-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 uppercase tracking-wider text-sm w-full">Log Today's Execution</button>
                 </div>

                 <div className="bg-[#161b22] rounded-xl p-6 border border-gray-800 shadow-sm">
                   <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                     <h3 className="font-bold text-gray-300 uppercase tracking-wider text-sm">Execution Trends</h3>
                     <div className="flex items-center gap-4 bg-gray-900 p-1.5 rounded-lg border border-gray-800">
                        <div className="flex gap-1">
                          <button onClick={() => {setProdChartPeriod('weekly'); setProdChartOffset(0);}} className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition ${prodChartPeriod === 'weekly' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}>Weekly</button>
                          <button onClick={() => {setProdChartPeriod('monthly'); setProdChartOffset(0);}} className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition ${prodChartPeriod === 'monthly' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}>Monthly</button>
                        </div>
                        <div className="w-px h-6 bg-gray-700"></div>
                        <div className="flex items-center gap-3 px-2">
                           <button onClick={() => setProdChartOffset(prev => prev + 1)} className="text-gray-400 hover:text-amber-400 text-lg transition px-1">◀</button>
                           <span className="text-xs font-mono text-amber-100 min-w-[120px] text-center">{prodChart.titleStr}</span>
                           <button onClick={() => setProdChartOffset(prev => Math.max(0, prev - 1))} disabled={prodChartOffset === 0} className={`text-lg transition px-1 ${prodChartOffset === 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-amber-400'}`}>▶</button>
                        </div>
                     </div>
                   </div>
                   
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={prodChart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                         <XAxis dataKey="label" stroke="#718096" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                         <YAxis stroke="#718096" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '8px' }}
                            itemStyle={{ color: '#4ADE80', fontWeight: 'bold' }}
                            formatter={(value) => [`${value}%`, 'Score']}
                            labelStyle={{ color: '#A0AEC0', marginBottom: '4px' }}
                         />
                         <ReferenceLine y={60} stroke="#4ADE80" strokeDasharray="3 3" opacity={0.5} />
                         <ReferenceLine y={40} stroke="#F87171" strokeDasharray="3 3" opacity={0.5} />
                         <Line type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={3} dot={{ fill: '#38BDF8', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#BAE6FD' }} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </div>
            )}
            
            {/* TAB: DAILY */}
            {activeTab === 'daily' && (
              <div className="bg-[#161b22] rounded-xl p-6 border border-gray-800 shadow-sm animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6">Daily Architecture</h3>
                <div className="space-y-3">
                  {dailyTimetable.map((slot, idx) => (
                    <div key={idx} className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-4 rounded-xl border transition-colors ${
                      slot.block.includes('Break') || slot.block.includes('Lunch') || slot.block.includes('Dinner')
                        ? 'bg-gray-900/30 border-gray-800/50 opacity-70'
                        : 'bg-gray-900/80 border-gray-700'
                    }`}>
                      <div className="min-w-[140px] font-mono text-xs font-semibold text-teal-400">{slot.time}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-200">{slot.block}</h4>
                        <p className="text-xs text-gray-400 mt-1">{slot.focus}</p>
                      </div>
                      <div className="hidden md:block text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg font-mono">{slot.hours}h</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: JOURNAL */}
            {activeTab === 'journal' && (
               <div className="bg-[#161b22] rounded-xl p-6 md:p-8 border border-gray-800 shadow-sm animate-fade-in">
                 <h3 className="font-bold text-gray-300 mb-6 uppercase tracking-wider text-sm">Insights & Reflections</h3>
                 <textarea value={journalInput} onChange={(e) => setJournalInput(e.target.value)} placeholder="Note down mistakes, concepts to revisit, or daily reflections..." className="w-full bg-gray-900 border border-gray-800 rounded-xl p-5 text-gray-100 focus:outline-none focus:border-amber-500/50 min-h-[150px] mb-6"></textarea>
                 <button onClick={saveJournal} className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3.5 rounded-xl font-bold w-full md:w-auto uppercase tracking-wider text-sm">Save Insight</button>

                 <div className="mt-10 space-y-4">
                   {journal.map(entry => (
                     <div key={entry.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                       <div className="flex justify-between items-start">
                         <div className="text-xs text-teal-500/80 font-mono mb-3">{entry.timestamp}</div>
                         <button onClick={() => setJournal(journal.filter(j => j.id !== entry.id))} className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wider">Delete</button>
                       </div>
                       <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                     </div>
                   ))}
                 </div>
               </div>
            )}
            
          </div>
        </div>
      </div>
      
      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-gray-800 z-50 pb-safe">
        <div className="flex overflow-x-auto no-scrollbar px-1 py-2">
          {[
            { id: 'reality', label: 'Reality', icon: '📊' },
            { id: 'daily', label: 'Daily', icon: '⏰' },
            { id: 'focus', label: 'Focus', icon: '⏱️' },
            { id: 'sources', label: 'Sources', icon: '📚' },
            { id: 'analytics', label: 'Burnout', icon: '📈' },
            { id: 'journal', label: 'Journal', icon: '📝' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 w-[65px] flex flex-col items-center justify-center rounded-xl transition-colors py-2 ${activeTab === tab.id ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-gray-300'}`}>
               <span className="text-xl mb-1 drop-shadow-sm">{tab.icon}</span>
               <span className="text-[9px] uppercase tracking-wider truncate w-full text-center font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UPSCTrackerEnhanced;