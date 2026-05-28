import React, { Suspense, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  Check,
  CirclePause,
  CirclePlay,
  Flame,
  Focus,
  Home as HomeIcon,
  Moon,
  Music2,
  Plus,
  RefreshCcw,
  Sparkles,
  Sun,
  TimerReset,
  Trash2,
  Zap
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { scanMoodSituation } from './moodSituations';
import './styles.css';

const MOODS = {
  happy: {
    label: 'Happy',
    icon: Sun,
    energy: 88,
    stress: 18,
    gradient: 'linear-gradient(135deg, #f8c94f 0%, #f97316 46%, #ec4899 100%)',
    accent: '#f97316',
    ink: '#241507',
    sky: '#fff1b8',
    assistant: 'Your energy is bright. Try a quick creative sprint while momentum is high.',
    activity: 'Creative sprint',
    environment: 'Sunlit floating islands'
  },
  calm: {
    label: 'Calm',
    icon: Moon,
    energy: 48,
    stress: 12,
    gradient: 'linear-gradient(135deg, #5eead4 0%, #38bdf8 48%, #818cf8 100%)',
    accent: '#22d3ee',
    ink: '#051923',
    sky: '#c8fff4',
    assistant: 'You seem steady. A reflective planning block would fit this rhythm.',
    activity: 'Reflective planning',
    environment: 'Soft ocean atmosphere'
  },
  focused: {
    label: 'Focused',
    icon: Focus,
    energy: 72,
    stress: 26,
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1f2937 48%, #14b8a6 100%)',
    accent: '#2dd4bf',
    ink: '#e6fffb',
    sky: '#132f32',
    assistant: 'Distractions are low. Start a 25 minute deep work session.',
    activity: 'Deep work',
    environment: 'Minimal orbital station'
  },
  stressed: {
    label: 'Stressed',
    icon: Brain,
    energy: 42,
    stress: 78,
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 48%, #ef4444 100%)',
    accent: '#a78bfa',
    ink: '#f7f7ff',
    sky: '#21184b',
    assistant: 'Pressure is showing. Breathe, list one next action, then enter focus mode.',
    activity: 'Reset ritual',
    environment: 'Gentle storm field'
  },
  angry: {
    label: 'Angry',
    icon: Flame,
    energy: 91,
    stress: 68,
    gradient: 'linear-gradient(135deg, #020617 0%, #991b1b 46%, #f43f5e 100%)',
    accent: '#fb7185',
    ink: '#fff1f2',
    sky: '#19050a',
    assistant: 'High intensity detected. Channel it into a timed power task, then cool down.',
    activity: 'Power task',
    environment: 'Neon pulse city'
  }
};

const HISTORY = [
  { day: 'Mon', happy: 68, calm: 44, focus: 52, stress: 30 },
  { day: 'Tue', happy: 50, calm: 58, focus: 76, stress: 24 },
  { day: 'Wed', happy: 38, calm: 42, focus: 48, stress: 70 },
  { day: 'Thu', happy: 74, calm: 55, focus: 81, stress: 18 },
  { day: 'Fri', happy: 62, calm: 63, focus: 66, stress: 34 },
  { day: 'Sat', happy: 85, calm: 72, focus: 45, stress: 16 },
  { day: 'Sun', happy: 70, calm: 68, focus: 58, stress: 22 }
];

const CALM_PLACEHOLDERS = ['low-demand calm', 'mint blue', 'light workload', 'personal space'];

const MoodContext = createContext(null);

function useMood() {
  return useContext(MoodContext);
}

function MoodProvider({ children }) {
  const [mood, setMood] = useState('focused');
  const [journal, setJournal] = useState('I want to focus but I feel pressure from exams.');
  const [scanResult, setScanResult] = useState(() => scanMoodSituation(journal));
  const theme = useMemo(
    () => ({
      ...MOODS[mood],
      ...(scanResult.mood === mood ? scanResult.palette : {}),
      environment: scanResult.matches[0] ? `${scanResult.matches[0].label} atmosphere` : MOODS[mood].environment
    }),
    [mood, scanResult]
  );

  const analyzeJournal = () => {
    const result = scanMoodSituation(journal);
    setScanResult(result);
    setMood(result.mood);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--mood-gradient', theme.gradient);
    document.documentElement.style.setProperty('--mood-accent', theme.accent);
    document.documentElement.style.setProperty('--mood-ink', theme.ink);
    document.documentElement.style.setProperty('--mood-sky', theme.sky);
  }, [theme]);

  const value = useMemo(
    () => ({ mood, setMood, theme, journal, setJournal, scanResult, analyzeJournal }),
    [mood, theme, journal, scanResult]
  );
  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

function SceneObject() {
  const { mood, theme } = useMood();
  const group = useRef();
  useFrame((_, delta) => {
    group.current.rotation.y += delta * (mood === 'angry' ? 0.32 : 0.16);
    group.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.08;
  });

  const count = mood === 'focused' ? 8 : 13;
  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, index) => {
        const angle = (index / count) * Math.PI * 2;
        const radius = mood === 'happy' ? 2.25 : mood === 'angry' ? 1.7 : 2;
        return (
          <Float key={index} speed={1.1 + index * 0.04} rotationIntensity={0.25} floatIntensity={0.8}>
            <mesh position={[Math.cos(angle) * radius, Math.sin(index) * 0.55, Math.sin(angle) * radius]}>
              <icosahedronGeometry args={[0.18 + (index % 3) * 0.04, 1]} />
              <meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={0.35} roughness={0.35} />
            </mesh>
          </Float>
        );
      })}
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[0.95, 64, 64]} />
          <MeshDistortMaterial
            color={theme.accent}
            distort={mood === 'stressed' ? 0.5 : mood === 'angry' ? 0.34 : 0.18}
            speed={mood === 'calm' ? 1.2 : 2.2}
            roughness={0.18}
            metalness={0.2}
          />
        </mesh>
      </Float>
    </group>
  );
}

function MoodScene() {
  const { mood, theme } = useMood();
  return (
    <div className="scene-wrap" aria-label={`${theme.environment} 3D mood scene`}>
      <Canvas camera={{ position: [0, 0.45, 4.1], fov: 58 }} dpr={[1, 1.6]} gl={{ alpha: true }}>
        <ambientLight intensity={0.82} />
        <pointLight position={[3, 4, 3]} intensity={58} color={theme.accent} />
        <pointLight position={[-4, -2, 2]} intensity={22} color={theme.accentSoft || theme.accent} />
        <Suspense fallback={null}>
          <Stars radius={60} depth={36} count={mood === 'focused' ? 900 : 1500} factor={4} fade speed={0.8} />
          <SceneObject />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.7} />
      </Canvas>
    </div>
  );
}

function Nav({ view, setView }) {
  const items = [
    ['home', HomeIcon],
    ['dashboard', Activity],
    ['analytics', BarChart3],
    ['focus', Focus]
  ];
  return (
    <nav className="nav">
      <button className="brand" type="button" onClick={() => setView('home')} aria-label="MoodScape home">
        <Sparkles size={18} />
        <span>MoodScape</span>
      </button>
      <div className="nav-actions">
        {items.map(([id, Icon]) => (
          <button
            key={id}
            className={view === id ? 'icon-btn active' : 'icon-btn'}
            type="button"
            title={id}
            aria-label={id}
            onClick={() => setView(id)}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </nav>
  );
}

function MoodSelector() {
  const { mood, setMood } = useMood();
  return (
    <div className="mood-grid">
      {Object.entries(MOODS).map(([key, item]) => {
        const Icon = item.icon;
        return (
          <button key={key} type="button" className={mood === key ? 'mood-card selected' : 'mood-card'} onClick={() => setMood(key)}>
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Hero({ setView }) {
  const { theme, journal, setJournal, scanResult, analyzeJournal } = useMood();
  const usePlaceholder = (text) => {
    setJournal(`I want a ${text} kind of day with less pressure and more room to breathe.`);
  };

  return (
    <section className="hero">
      <div className="hero-copy">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow">
          AI Powered Mood-Adaptive React Application
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          MoodScape
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="hero-text">
          A responsive emotional workspace that transforms theme, motion, assistant guidance, analytics, and focus tools around the user’s current state.
        </motion.p>
        <div className="hero-actions">
          <button type="button" className="primary-btn" onClick={() => setView('dashboard')}>
            <Zap size={18} />
            Launch dashboard
          </button>
          <button type="button" className="ghost-btn" onClick={() => setView('focus')}>
            <TimerReset size={18} />
            Start focus
          </button>
        </div>
      </div>
      <MoodScene />
      <div className="analysis-panel">
        <div>
          <span className="panel-label">Scan your mood</span>
          <strong>{theme.environment}</strong>
        </div>
        <textarea value={journal} onChange={(event) => setJournal(event.target.value)} aria-label="Mood journal input" />
        <div className="scan-placeholders" aria-label="Calm scan placeholders">
          {CALM_PLACEHOLDERS.map((item) => (
            <button key={item} type="button" onClick={() => usePlaceholder(item)}>
              {item}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn full" onClick={analyzeJournal}>
          <Brain size={18} />
          Analyze mood
        </button>
        <div className="scan-matches" aria-label="Matched mood situations">
          <span className="scan-result-label">Scan result</span>
          {scanResult.matches.length > 0 ? (
            scanResult.matches.map((match, index) => (
              <div
                className="scan-match-row"
                key={match.id}
                style={{
                  '--chip-accent': match.palette.accent,
                  '--chip-soft': match.palette.accentSoft
                }}
              >
                <span className="scan-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="scan-swatch" aria-hidden="true" />
                <span className="scan-copy">
                  <strong>{match.label}</strong>
                  <small>{MOODS[match.mood].label} palette / {match.situation}</small>
                </span>
              </div>
            ))
          ) : (
            <div className="scan-match-row">
              <span className="scan-index">01</span>
              <span className="scan-swatch" aria-hidden="true" />
              <span className="scan-copy">
                <strong>low demand</strong>
                <small>Calm / mint blue</small>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AssistantPanel() {
  const { theme } = useMood();
  return (
    <motion.div layout className="assistant">
      <div className="assistant-orb">
        <Bot size={24} />
      </div>
      <div>
        <span className="panel-label">Assistant</span>
        <p>{theme.assistant}</p>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Dashboard() {
  const { theme } = useMood();
  return (
    <section className="page-grid">
      <div className="wide">
        <div className="section-head">
          <div>
            <span className="panel-label">Live environment</span>
            <h2>{theme.activity}</h2>
          </div>
          <MoodSelector />
        </div>
        <MoodScene />
      </div>
      <div className="stack">
        <AssistantPanel />
        <div className="stats-row">
          <StatCard label="Energy" value={`${theme.energy}%`} icon={Zap} />
          <StatCard label="Stress" value={`${theme.stress}%`} icon={Brain} />
        </div>
      </div>
      <FocusTools compact />
    </section>
  );
}

function FocusTools({ compact = false }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState(['Review React context flow', 'Polish analytics copy']);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const rest = String(seconds % 60).padStart(2, '0');

  return (
    <section className={compact ? 'focus-panel compact' : 'focus-panel'}>
      <div className="section-head">
        <div>
          <span className="panel-label">Focus zone</span>
          <h2>{minutes}:{rest}</h2>
        </div>
        <div className="tool-row">
          <button className="icon-btn" type="button" title={running ? 'Pause' : 'Play'} aria-label={running ? 'Pause' : 'Play'} onClick={() => setRunning((value) => !value)}>
            {running ? <CirclePause size={20} /> : <CirclePlay size={20} />}
          </button>
          <button className="icon-btn" type="button" title="Reset timer" aria-label="Reset timer" onClick={() => { setRunning(false); setSeconds(25 * 60); }}>
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>
      <div className="sound-row">
        <button type="button"><Music2 size={17} /> Rain</button>
        <button type="button"><Music2 size={17} /> Lo-fi</button>
        <button type="button"><Music2 size={17} /> Space</button>
      </div>
      <div className="task-input">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a next action" />
        <button
          className="icon-btn active"
          type="button"
          aria-label="Add task"
          onClick={() => {
            if (!draft.trim()) return;
            setTasks((items) => [draft.trim(), ...items]);
            setDraft('');
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <div className="task" key={task}>
            <Check size={16} />
            <span>{task}</span>
            <button type="button" aria-label={`Delete ${task}`} onClick={() => setTasks((items) => items.filter((item) => item !== task))}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Analytics() {
  const { theme } = useMood();
  const bars = [
    { name: 'Energy', value: theme.energy },
    { name: 'Stress', value: theme.stress },
    { name: 'Focus', value: Math.max(30, theme.energy - theme.stress / 3) },
    { name: 'Calm', value: Math.max(20, 95 - theme.stress) }
  ];

  return (
    <section className="analytics">
      <div className="section-head">
        <div>
          <span className="panel-label">Emotional analytics</span>
          <h2>Weekly mood intelligence</h2>
        </div>
        <MoodSelector />
      </div>
      <div className="chart-grid">
        <div className="chart-panel">
          <h3>Mood history</h3>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.18)" />
              <XAxis dataKey="day" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip contentStyle={{ background: '#111827', border: '0', borderRadius: 8 }} />
              <Area type="monotone" dataKey="focus" stackId="1" stroke={theme.accent} fill={theme.accent} fillOpacity={0.55} />
              <Area type="monotone" dataKey="calm" stackId="1" stroke="#5eead4" fill="#5eead4" fillOpacity={0.35} />
              <Area type="monotone" dataKey="stress" stackId="1" stroke="#fb7185" fill="#fb7185" fillOpacity={0.22} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-panel">
          <h3>Current scan</h3>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={bars}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.18)" />
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip contentStyle={{ background: '#111827', border: '0', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {bars.map((entry, index) => (
                  <Cell key={entry.name} fill={[theme.accent, '#fb7185', '#a7f3d0', '#38bdf8'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Home({ setView }) {
  return (
    <>
      <Hero setView={setView} />
      <section className="below-hero">
        <div className="section-head">
          <div>
            <span className="panel-label">Manual mood control</span>
            <h2>Choose the emotional operating mode</h2>
          </div>
          <MoodSelector />
        </div>
      </section>
    </>
  );
}

function App() {
  const [view, setView] = useState('home');
  return (
    <MoodProvider>
      <main className="app-shell">
        <Nav view={view} setView={setView} />
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
            {view === 'home' && <Home setView={setView} />}
            {view === 'dashboard' && <Dashboard />}
            {view === 'analytics' && <Analytics />}
            {view === 'focus' && <FocusTools />}
          </motion.div>
        </AnimatePresence>
      </main>
    </MoodProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
