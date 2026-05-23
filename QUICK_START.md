# UPSC 2027 Tracker - Quick Start Guide

## 📱 What You Have

A complete **React + Tailwind CSS** mobile app for UPSC preparation tracking with:
- Progress bar (weighted by subject importance)
- Session timer with weekly/monthly analytics
- Burnout radar with productivity tracking
- UPSC Journal for quick notes
- Full local storage persistence

---

## ⚡ 5-Minute Setup

### Step 1: Create React Project
```bash
# Using Vite (fastest)
npm create vite@latest upsc-tracker -- --template react
cd upsc-tracker
npm install

# OR using Create React App
npx create-react-app upsc-tracker
cd upsc-tracker
```

### Step 2: Install Tailwind
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Copy Files
Copy these files to your project:
- `UPSCTracker.jsx` → `src/components/UPSCTracker.jsx` (create components folder)
- `tailwind.config.js` → `tailwind.config.js` (replace)
- `postcss.config.js` → `postcss.config.js` (replace)
- `index.css` → `src/index.css` (replace)

### Step 4: Update App.jsx
```jsx
import React from 'react';
import UPSCTracker from './components/UPSCTracker';
import './index.css';

function App() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <UPSCTracker />
    </div>
  );
}

export default App;
```

### Step 5: Run It
```bash
npm run dev
```

Visit `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)

---

## 🎯 Features at a Glance

### 1️⃣ **Reality Check (HQ)**
- Progress bar updates automatically
- 18 pre-loaded subjects with weights
- Update status: Untouched → Working → Completed
- See days remaining, pace needed, and danger alerts

**How it works:**
- Each subject has a weight (e.g., Economics = 35, History = 20)
- Completed = full weight, Working = 50% weight, Untouched = 0%
- Bar moves as you update statuses

### 2️⃣ **Focus Engine**
- Timer with start/pause/reset
- 3 study modes: Deep Work, Revision, Mock Test
- Click "Stop & Log" to save session
- View last 10 sessions with timestamps

### 3️⃣ **Burnout Radar**
- Daily productivity slider (0-100)
- Automatic weekly trend line chart
- Status: Green (60+%), Yellow (40-59%), Red (<40%)
- Identifies burnout patterns

### 4️⃣ **Session Analytics**
- **Weekly Chart**: Sessions count + hours studied
- **Monthly Chart**: Same metrics per month
- Real-time statistics: Total sessions, Total hours

### 5️⃣ **UPSC Journal**
- Quick notes with auto-timestamp
- Delete entries you don't need
- Export everything as JSON backup
- Clear all data if needed

---

## 📊 How Progress Bar Works

```
Total Weight of All Subjects = 383
Completed Weight = (Completed Subjects × Their Weights)
Working Weight = (Working Subjects × Their Weights × 0.5)

Progress % = ((Completed + Working×0.5) / 383) × 100
```

**Example:**
- Completed: Internal Security (25) + Ancient History (20) = 45
- Working: Modern History (22) + Geography (20) = 22 × 0.5 = 11
- Total = 45 + 11 = 56 out of 383 = **14.6%**

---

## ⏱️ Session Timer

1. Click **Start** → timer begins
2. Select study mode (Deep Work/Revision/Mock Test)
3. Study and pause when needed
4. Click **Stop & Log** to save
5. Sessions appear in history with mode + duration

**Charts auto-generate:**
- Weekly: Last 4 weeks
- Monthly: Last 6 months

---

## 💾 Data Storage

Everything saves automatically to browser's **localStorage**:
- `upscSubjects` - Your subjects + statuses
- `upscSessions` - All logged sessions
- `upscProductivity` - Daily scores
- `upscJournal` - All notes

**Export Backup:** Click "📥 Export as JSON" → Download instantly

---

## 🔧 Customization

### Change Prelims Date
In `UPSCTracker.jsx`, find:
```jsx
const prelims = new Date('2027-05-23');
```
Change to your target date.

### Add More Subjects
In the initial `useState`:
```jsx
{ id: 19, name: 'Your Subject', weight: 25, status: 'untouched' }
```

### Change Colors
Replace Tailwind colors:
- `bg-amber-400` → `bg-blue-400`
- `text-teal-400` → `text-green-400`

---

## 📱 Mobile & Deployment

### Works on:
- ✅ iPhone/iPad (Safari)
- ✅ Android (Chrome)
- ✅ Desktop browsers
- ✅ Tablets

### Deploy (Free)

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Drag `dist` folder to netlify.com
```

---

## 🚨 Troubleshooting

**Progress bar not moving?**
→ Click on a subject → Select "Working" or "Completed"

**Charts not showing?**
→ Make sure `npm install recharts` is done
→ Log some sessions/productivity first

**Data disappeared?**
→ Check if browser localStorage is enabled
→ Use "📥 Export" periodically for backup

**Styling looks off?**
→ Clear browser cache (Ctrl+Shift+Delete)
→ Rebuild: `npm run build`

---

## 📚 What Each Tab Does

| Tab | Purpose |
|-----|---------|
| 📊 Reality | Progress bar, subject status, alerts |
| ⏱️ Focus | Session timer, history, logging |
| 📈 Burnout | Daily productivity, weekly trend |
| 📉 Sessions | Weekly & monthly session charts |
| 📝 Journal | Notes, timestamps, export |

---

## 💡 Tips for Success

1. **Update subjects weekly** - Progress bar is your visual motivation
2. **Log EVERY session** - Even 30-min counts
3. **Rate productivity daily** - Burnout radar needs data
4. **Review journal weekly** - Spot recurring mistakes
5. **Export monthly** - Backup your hard work
6. **Check analytics** - Identify patterns and adjust

---

## 📞 Need Help?

- Check if all files are in the right location
- Verify `npm install recharts` was run
- Clear browser cache and reload
- Check browser console for errors (F12)

---

## 🎯 Your Dates

- **Today:** 22 May 2026
- **Prelims:** 23 May 2027 (365 days)
- **Mains:** 20 Aug 2027 (90 days after Prelims)
- **Mains-Ready:** 31 Dec 2026 (224 days)

---

**You've got this! Let the tracker keep you focused and motivated.** ⚡

Good luck with UPSC 2027! 🎯
