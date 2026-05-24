# UPSC 2027 Tracker - React + Tailwind CSS Mobile App

## Features

✅ **Reality Check (HQ)** - Dashboard with progress bar (weighted by subject importance)
✅ **Focus Engine** - Session timer with study modes, saves all sessions
✅ **Burnout Radar** - Daily productivity logging with weekly trend visualization
✅ **Session Analytics** - Week-wise and month-wise session & hours charts
✅ **UPSC Journal** - Quick insights logging with timestamps and export
✅ **Mobile-Optimized** - Responsive design for phones, tablets, and desktop
✅ **Persistent Storage** - All data auto-saves to browser local storage
✅ **3-Status Subjects** - Untouched, Working, Completed (affects progress calculation)

---

## Installation & Setup

### Option 1: Create React App

```bash
npx create-react-app upsc-tracker
cd upsc-tracker

# Install dependencies
npm install recharts

# Replace src/App.js with UPSCTracker.jsx content
# Or import it as a component
```

### Option 2: Vite (Faster)

```bash
npm create vite@latest upsc-tracker -- --template react
cd upsc-tracker

npm install recharts
npm run dev
```

### Option 3: Next.js

```bash
npx create-next-app@latest upsc-tracker
cd upsc-tracker

npm install recharts
```

In `pages/index.js` or `app/page.js`:
```jsx
import UPSCTracker from '@/components/UPSCTracker';

export default function Home() {
  return <UPSCTracker />;
}
```

---

## Usage

### As a React Component

```jsx
import UPSCTracker from './UPSCTracker';

function App() {
  return <UPSCTracker />;
}

export default App;
```

### Tailwind CSS Setup (if not already configured)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Features Explained

### 1. Progress Bar (Reality Check)
- **Weighted Calculation**: Each subject has a weight (e.g., Economics = 35, History = 20)
- **3 Statuses**:
  - **Untouched**: 0% contribution
  - **Working**: 50% contribution (partially studied)
  - **Completed**: 100% contribution
- **Dynamic Bar**: Moves automatically as you update subject statuses
- Shows:
  - Overall percentage
  - Completed weight vs total weight
  - Days remaining to prelims
  - Required pace per month

### 2. Session Timer
- **Start/Pause/Reset** controls
- **Study Modes**: Deep Work, Revision Sprint, Mock Test
- **Auto-logging**: Sessions saved with timestamp and duration
- **Session History**: View last 10 sessions with mode and time

### 3. Burnout Radar
- **Productivity Slider**: Rate your daily execution (0-100)
- **Weekly Trend Graph**: Line chart showing 7-day average
- **Status Indicators**:
  - 🟢 Green (60+%): On track
  - 🟡 Yellow (40-59%): Caution
  - 🔴 Red (<40%): Critical

### 4. Session Analytics
- **Weekly Chart**: Bar chart of sessions + line chart of hours studied
- **Monthly Chart**: Same metrics aggregated by month
- **Statistics**: Total sessions count and total hours calculated

### 5. UPSC Journal
- **Quick Entry**: Text area for instant note-taking
- **Auto-timestamp**: Each entry logged with date/time
- **Delete Function**: Remove entries you no longer need
- **Export**: Download all data as JSON backup
- **Clear All**: Nuclear option to reset everything

---

## Data Structure

### Subjects
```js
{
  id: number,
  name: string,
  weight: number (25-38),
  status: 'untouched' | 'working' | 'completed'
}
```

### Sessions
```js
{
  id: timestamp,
  duration: string ('2h 30m'),
  durationSeconds: number,
  mode: 'deep' | 'revision' | 'mock',
  timestamp: Date object,
  date: ISO string
}
```

### Productivity
```js
{
  id: timestamp,
  score: number (0-100),
  date: ISO string
}
```

### Journal Entries
```js
{
  id: timestamp,
  text: string,
  timestamp: string (formatted),
  date: ISO string
}
```

---

## Local Storage Keys

- `upscSubjects` - All 18 subjects with status
- `upscSessions` - All logged sessions
- `upscProductivity` - Daily productivity scores
- `upscJournal` - All journal entries

---

## Customization

### Change Prelims Date
In `calculateDaysRemaining()`:
```jsx
const prelims = new Date('2027-05-23'); // Change this
```

### Add More Subjects
In `useState()` for subjects:
```jsx
{ id: 19, name: 'New Subject', weight: 25, status: 'untouched' }
```

### Change Colors
Modify Tailwind classes:
- `bg-amber-400` → `bg-blue-400`
- `text-teal-400` → `text-green-400`
- etc.

---

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag & drop build folder to netlify.com
```

### GitHub Pages
```bash
npm install gh-pages
# Add to package.json: "homepage": "https://yourusername.github.io/upsc-tracker"
npm run build
npm run deploy
```

---

## Mobile App Conversion

### React Native (Expo)
```bash
npx create-expo-app upsc-tracker-native
npm install recharts react-native-svg
# Adapt with React Native specific components
```

### Progressive Web App (PWA)
Already works as PWA! Users can:
1. Open in browser
2. Add to home screen
3. Works offline (localStorage persists)

Add `public/manifest.json`:
```json
{
  "name": "UPSC 2027 Tracker",
  "short_name": "UPSC",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "theme_color": "#111827",
  "background_color": "#111827",
  "display": "standalone"
}
```

---

## Troubleshooting

### LocalStorage not working?
- Check browser privacy settings
- Use incognito/private mode
- Clear browser cache and try again

### Charts not showing?
- Ensure `recharts` is installed: `npm install recharts`
- Check console for errors
- Sessions/productivity data must exist

### Progress bar stuck at 0%?
- Update at least one subject status to 'working' or 'completed'
- Check subject weights sum to ~383 total

---

## Tips for Maximum Effectiveness

1. **Log sessions consistently** - Even 30-min sessions matter
2. **Rate productivity daily** - Burnout radar only works with data
3. **Use UPSC Journal** - Quick notes prevent forgotten insights
4. **Update subject status weekly** - Progress bar is your visual motivator
5. **Export backup weekly** - Never lose your data
6. **Check analytics monthly** - Identify trends and adjust pace

---

## Support

This app is optimized for:
- ✅ Chrome/Edge (latest)
- ✅ Safari (iOS 13+)
- ✅ Firefox (latest)
- ✅ Samsung Internet

Data persists locally. No internet required after first load.

---

**Good luck with UPSC 2027! You've got this. ⚡**
