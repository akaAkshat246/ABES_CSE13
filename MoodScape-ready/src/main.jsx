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
  Film,
  Flame,
  Focus,
  Home as HomeIcon,
  Hourglass,
  Instagram,
  Linkedin,
  MessageCircle,
  Moon,
  Plus,
  Minus,
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
    if (group.current) {
      group.current.rotation.y += delta * (mood === 'angry' ? 0.32 : 0.16);
      group.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.08;
    }
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

function Nav({ view, setView, onOpenScan, themeMode, toggleTheme }) {
  const items = [
    ['home', HomeIcon, 'Home'],
    ['planning', Check, 'Reflective Planning'],
    ['analytics', BarChart3, 'Analytics'],
    ['focus', Focus, 'Focus Zone']
  ];
  return (
    <nav className="nav">
      <button className="brand" type="button" onClick={() => setView('home')} aria-label="MoodScape home">
        <Sparkles size={18} />
        <span>MoodScape</span>
      </button>
      <div className="nav-actions">
        <button
          className="ghost-btn scan-nav-btn animate-pulse-border"
          type="button"
          onClick={onOpenScan}
          style={{
            minHeight: '38px',
            padding: '0 12px',
            fontSize: '0.85rem',
            border: '1px solid rgba(45, 212, 191, 0.4)',
            background: 'rgba(45, 212, 191, 0.08)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Brain size={16} style={{ color: 'var(--mood-accent)' }} />
          <span>Scan Mood</span>
        </button>
        {items.map(([id, Icon, label]) => (
          <button
            key={id}
            className={view === id ? 'icon-btn active' : 'icon-btn'}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => setView(id)}
          >
            <Icon size={18} />
          </button>
        ))}
        <button
          className="icon-btn theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme mode"
          style={{
            marginLeft: '4px',
            border: '1px solid var(--panel-border)'
          }}
        >
          {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
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
  return (
    <section className="hero">
      <MoodScene />
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
          <button type="button" className="primary-btn" onClick={() => setView('planning')}>
            <Zap size={18} />
            Reflective planning
          </button>
          <button type="button" className="ghost-btn" onClick={() => setView('focus')}>
            <TimerReset size={18} />
            Start focus
          </button>
        </div>
      </div>
    </section>
  );
}

function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [text]);
  
  return <span>{displayedText}</span>;
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
        <p><TypewriterText text={theme.assistant} /></p>
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

function HappinessSustainer() {
  const [sleep, setSleep] = useState(true);
  const [boundaries, setBoundaries] = useState(true);
  const [breakTaken, setBreakTaken] = useState(true);
  const [gratitude, setGratitude] = useState(false);

  const score = (sleep ? 25 : 0) + (boundaries ? 25 : 0) + (breakTaken ? 25 : 0) + (gratitude ? 25 : 0);
  
  // Calculate active runway: Base 4 hours + sleep (3h) + boundaries (3h) + break (3h) + gratitude (3h) = 16h total protected waking day
  const happyHours = 4 + (sleep ? 3 : 0) + (boundaries ? 3 : 0) + (breakTaken ? 3 : 0) + (gratitude ? 3 : 0);

  return (
    <div className="stat-card happiness-sustainer-panel" style={{ gridColumn: '1 / -1', marginTop: '18px' }}>
      <div className="section-head" style={{ marginBottom: '16px' }}>
        <div>
          <span className="panel-label">Emotional Longevity Framework</span>
          <h3>Happiness Maintenance Criteria</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            A thorough scientific baseline evaluating your baseline habits. Toggle your day's criteria to measure your estimated emotional lifespan runway and discover how long you can sustain peak happy hours.
          </p>
        </div>
      </div>
      
      <div className="sustainer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        <div className="sustainer-toggles" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span className="panel-label" style={{ marginBottom: '4px', display: 'block' }}>Habits Checklist</span>
          
          <button 
            type="button" 
            className={`ghost-btn sustainer-toggle-btn ${sleep ? 'active' : ''}`}
            onClick={() => setSleep(!sleep)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', minHeight: '44px', width: '100%', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>💤</span>
              <strong style={{ fontSize: '0.88rem' }}>7+ Hours Restful Sleep (+3h)</strong>
            </div>
            <span style={{ fontSize: '0.82rem' }}>{sleep ? 'Active ✅' : 'Inactive ❌'}</span>
          </button>
          
          <button 
            type="button" 
            className={`ghost-btn sustainer-toggle-btn ${boundaries ? 'active' : ''}`}
            onClick={() => setBoundaries(!boundaries)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', minHeight: '44px', width: '100%', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🛡️</span>
              <strong style={{ fontSize: '0.88rem' }}>Clear Cognitive Boundaries (+3h)</strong>
            </div>
            <span style={{ fontSize: '0.82rem' }}>{boundaries ? 'Active ✅' : 'Inactive ❌'}</span>
          </button>
          
          <button 
            type="button" 
            className={`ghost-btn sustainer-toggle-btn ${breakTaken ? 'active' : ''}`}
            onClick={() => setBreakTaken(!breakTaken)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', minHeight: '44px', width: '100%', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>☕</span>
              <strong style={{ fontSize: '0.88rem' }}>Hourly Screen Break Taken (+3h)</strong>
            </div>
            <span style={{ fontSize: '0.82rem' }}>{breakTaken ? 'Active ✅' : 'Inactive ❌'}</span>
          </button>
          
          <button 
            type="button" 
            className={`ghost-btn sustainer-toggle-btn ${gratitude ? 'active' : ''}`}
            onClick={() => setGratitude(!gratitude)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', minHeight: '44px', width: '100%', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🎯</span>
              <strong style={{ fontSize: '0.88rem' }}>Daily Gratitude Win Logged (+3h)</strong>
            </div>
            <span style={{ fontSize: '0.82rem' }}>{gratitude ? 'Active ✅' : 'Inactive ❌'}</span>
          </button>
        </div>
        
        <div className="sustainer-gauge-side" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <span className="panel-label">Estimated Lifespan Runway</span>
          
          <div className="gauge-score-circle" style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px dashed var(--mood-accent)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 25px color-mix(in srgb, var(--mood-accent) 18%, transparent)',
            background: 'var(--input-bg)',
            transition: 'all 0.3s ease'
          }}>
            <strong style={{ fontSize: '2.2rem', color: 'var(--mood-accent)', fontWeight: '900', letterSpacing: '-0.5px' }}>{happyHours}h</strong>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.7, fontWeight: '700' }}>Happy Runway</span>
          </div>
          
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sustainability Score</span>
              <strong style={{ color: 'var(--mood-accent)' }}>{score}%</strong>
            </div>
            <div style={{ height: '8px', background: 'var(--input-bg)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
              <div style={{ width: `${score}%`, height: '100%', background: 'var(--mood-accent)', borderRadius: '99px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
            
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'var(--card-hover-bg)', border: '1px solid var(--panel-border)', textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: '1.4', color: 'var(--text-app)' }}>
                {score === 100 && '🥇 Peak Emotional Resilience: You have fortified all four emotional pillars! Your neurochemistry has full reserves to sustain joy, tackle deep focus, and remain unshakeable for the entire 16-hour waking day.'}
                {score === 75 && '🥈 Strong Emotional Buffer: Your baseline is excellent. You can sustain up to 13 hours of stability. Cultivating that last micro-habit will anchor your peace all the way to bedtime.'}
                {score === 50 && '🥉 Moderate Waking Runway: Your emotional energy supports 10 hours of happy focus. Ensure you step away from screens and honor your personal boundaries before mental fatigue sets in.'}
                {score === 25 && '⚠️ Deficit Alert: With only 7 hours of sustained runway, emotional fatigue is close. We highly recommend starting with restorative rest or a screen detox right away.'}
                {score === 0 && '🚨 Depleted Runway: You are running on a 4-hour survival baseline. Rest is now a critical biological requirement. Close some tabs and do a complete reset.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sustainer-guidelines" style={{ borderTop: '1px solid var(--panel-border)', marginTop: '24px', paddingTop: '20px' }}>
        <span className="panel-label" style={{ marginBottom: '12px', display: 'block' }}>Scientific Maintenance Guidelines — Extends Waking Happiness</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span>💤</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-app)' }}>Neurological Baseline</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Sleeping 7-8 hours clears out accumulated neural waste (adenosine), balances cortisol, and resets emotional processing centers to keep you steady.
            </p>
          </div>
          
          <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span>🛡️</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-app)' }}>Cognitive Borders</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Establishing borders blocks digital notification noise, preventing high stress spikes and safeguarding your finite reservoir of willpower and attention.
            </p>
          </div>
          
          <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span>☕</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-app)' }}>Sensory Intermissions</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Stepping away from devices for 5 minutes every hour replenishes dopamine receptor sensitivity and activates parasympathetic nervous recovery.
            </p>
          </div>
          
          <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span>🎯</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-app)' }}>Threat Reset (Gratitude)</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Consciously identifying and writing down three daily successes or wins overrides the brain's evolutionary threat bias, retraining it to register safety and comfort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReflectivePlanning() {
  const { theme } = useMood();
  return (
    <section className="page-grid">
      <div className="wide">
        <div className="section-head" style={{ marginBottom: '14px' }}>
          <div>
            <span className="panel-label">Reflective Planning Hub</span>
            <h2>Tasks & Environments</h2>
          </div>
        </div>
        <div style={{ marginBottom: '18px' }}>
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
      <TaskPlanner />
      <HappinessSustainer />
    </section>
  );
}

class AmbientSynthEngine {
  constructor() {
    this.ctx = null;
    this.rainNode = null;
    this.lofiNode = null;
    this.spaceNode = null;
    this.activeType = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stopAll() {
    if (this.rainNode) {
      try { this.rainNode.stop(); } catch (e) {}
      this.rainNode = null;
    }
    if (this.lofiNode) {
      try { this.lofiNode.stop(); } catch (e) {}
      this.lofiNode = null;
    }
    if (this.spaceNode) {
      try { this.spaceNode.stop(); } catch (e) {}
      this.spaceNode = null;
    }
    this.activeType = null;
  }

  playRain() {
    this.init();
    this.stopAll();
    this.activeType = 'calm';

    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut * 0.96 + white * 0.04);
      lastOut = output[i];
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    const waveLfo = this.ctx.createOscillator();
    waveLfo.frequency.value = 0.06;
    const waveLfoGain = this.ctx.createGain();
    waveLfoGain.gain.value = 180;
    
    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    waveGain.gain.value = 0.22;

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.ctx.destination);

    noiseSource.start();
    waveLfo.start();

    const delay = this.ctx.createDelay(1.0);
    delay.delayTime.value = 0.55;
    const delayGain = this.ctx.createGain();
    delayGain.gain.value = 0.45;

    delay.connect(delayGain);
    delayGain.connect(delay);
    delay.connect(this.ctx.destination);

    const chimes = [];
    const playChime = () => {
      if (this.activeType !== 'calm') return;
      const time = this.ctx.currentTime;
      const chimeFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      oscGain.gain.setValueAtTime(0, time);
      oscGain.gain.linearRampToValueAtTime(0.05, time + 0.01);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      oscGain.connect(delay);
      
      osc.start();
      chimes.push(osc);
      
      setTimeout(playChime, 2500 + Math.random() * 2500);
    };

    setTimeout(playChime, 1500);

    this.rainNode = {
      stop: () => {
        try { noiseSource.stop(); } catch (e) {}
        try { waveLfo.stop(); } catch (e) {}
        noiseSource.disconnect();
        waveLfo.disconnect();
        waveLfoGain.disconnect();
        filter.disconnect();
        waveGain.disconnect();
        
        chimes.forEach(osc => {
          try { osc.stop(); } catch(e) {}
          osc.disconnect();
        });
        delay.disconnect();
        delayGain.disconnect();
      }
    };
  }

  playSpace() {
    this.init();
    this.stopAll();
    this.activeType = 'space';

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.value = 40;
    osc2.type = 'triangle';
    osc2.frequency.value = 80.4;
    osc3.type = 'sine';
    osc3.frequency.value = 120.2;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180;
    filter.Q.value = 1.8;

    const lfo1 = this.ctx.createOscillator();
    lfo1.frequency.value = 0.04;
    const lfoGain1 = this.ctx.createGain();
    lfoGain1.gain.value = 120;

    lfo1.connect(lfoGain1);
    lfoGain1.connect(filter.frequency);

    const spaceGain = this.ctx.createGain();
    spaceGain.gain.value = 0.16;

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    
    filter.connect(spaceGain);
    spaceGain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo1.start();

    const pulsars = [];
    const playPulsar = () => {
      if (this.activeType !== 'space') return;
      const time = this.ctx.currentTime;
      const pOsc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();

      pOsc.type = 'sine';
      pOsc.frequency.setValueAtTime(1800 + Math.random() * 800, time);
      pOsc.frequency.exponentialRampToValueAtTime(100, time + 0.15);

      pGain.gain.setValueAtTime(0, time);
      pGain.gain.linearRampToValueAtTime(0.015, time + 0.005);
      pGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

      pOsc.connect(pGain);
      pGain.connect(this.ctx.destination);
      pOsc.start();
      pulsars.push(pOsc);

      setTimeout(playPulsar, 3000 + Math.random() * 4000);
    };

    setTimeout(playPulsar, 2000);

    this.spaceNode = {
      stop: () => {
        try { osc1.stop(); } catch (e) {}
        try { osc2.stop(); } catch (e) {}
        try { osc3.stop(); } catch (e) {}
        try { lfo1.stop(); } catch (e) {}
        osc1.disconnect();
        osc2.disconnect();
        osc3.disconnect();
        lfo1.disconnect();
        lfoGain1.disconnect();
        filter.disconnect();
        spaceGain.disconnect();

        pulsars.forEach(osc => {
          try { osc.stop(); } catch(e) {}
          osc.disconnect();
        });
      }
    };
  }

  playLofi() {
    this.init();
    this.stopAll();
    this.activeType = 'lofi';

    const notes = [
      [130.81, 164.81, 196.00, 246.94],
      [87.31, 110.00, 130.81, 164.81],
      [110.00, 130.81, 164.81, 196.00, 246.94],
      [82.41, 98.00, 123.47, 146.83]
    ];

    let chordIndex = 0;
    const voices = [];
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 580;

    const swellLfo = this.ctx.createOscillator();
    swellLfo.frequency.value = 0.15;
    const swellLfoGain = this.ctx.createGain();
    swellLfoGain.gain.value = 150;
    
    swellLfo.connect(swellLfoGain);
    swellLfoGain.connect(filter.frequency);
    swellLfo.start();

    const mainGain = this.ctx.createGain();
    mainGain.gain.value = 0.15;

    filter.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    const playChord = () => {
      if (this.activeType !== 'lofi') return;
      const currentNotes = notes[chordIndex];
      const time = this.ctx.currentTime;
      
      voices.forEach(v => {
        try {
          v.gainNode.gain.setValueAtTime(v.gainNode.gain.value, time);
          v.gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);
          setTimeout(() => {
            try { v.osc.stop(); v.osc.disconnect(); if (v.vib) { v.vib.stop(); v.vib.disconnect(); } v.gainNode.disconnect(); } catch(e) {}
          }, 2000);
        } catch(e) {}
      });
      voices.length = 0;

      currentNotes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const vGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const vib = this.ctx.createOscillator();
        const vibGain = this.ctx.createGain();
        vib.frequency.value = 4.2 + Math.random() * 0.8;
        vibGain.gain.value = 1.0;
        vib.connect(vibGain);
        vibGain.connect(osc.frequency);
        vib.start();

        vGain.gain.setValueAtTime(0, time);
        vGain.gain.linearRampToValueAtTime(0.045, time + 0.8 + idx * 0.18);
        vGain.gain.setValueAtTime(0.045, time + 3.8);
        vGain.gain.exponentialRampToValueAtTime(0.0001, time + 5.0);

        osc.connect(vGain);
        vGain.connect(filter);
        osc.start();
        
        voices.push({ osc, gainNode: vGain, vib });
      });

      chordIndex = (chordIndex + 1) % notes.length;
    };

    playChord();
    const intervalId = setInterval(playChord, 5200);

    const tapeCrackleSize = this.ctx.sampleRate * 2.5;
    const crackleBuffer = this.ctx.createBuffer(1, tapeCrackleSize, this.ctx.sampleRate);
    const crackleData = crackleBuffer.getChannelData(0);
    for (let i = 0; i < tapeCrackleSize; i++) {
      const pop = Math.random() < 0.00025 ? (Math.random() * 2 - 1) * 0.07 : 0;
      const hiss = (Math.random() * 2 - 1) * 0.005;
      crackleData[i] = pop + hiss;
    }
    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;
    
    const crackleGain = this.ctx.createGain();
    crackleGain.gain.value = 0.05;
    crackleSource.connect(crackleGain);
    crackleGain.connect(this.ctx.destination);
    crackleSource.start();

    this.lofiNode = {
      stop: () => {
        clearInterval(intervalId);
        voices.forEach(v => {
          try { v.osc.stop(); v.osc.disconnect(); if (v.vib) { v.vib.stop(); v.vib.disconnect(); } v.gainNode.disconnect(); } catch(e) {}
        });
        try { swellLfo.stop(); } catch(e) {}
        try { crackleSource.stop(); } catch(e) {}
        crackleSource.disconnect();
        crackleGain.disconnect();
        swellLfo.disconnect();
        swellLfoGain.disconnect();
        filter.disconnect();
        mainGain.disconnect();
      }
    };
  }

  toggle(type) {
    if (this.activeType === type) {
      this.stopAll();
      return null;
    }
    if (type === 'rain') {
      this.playRain();
    } else if (type === 'space') {
      this.playSpace();
    } else if (type === 'lofi') {
      this.playLofi();
    }
    return type;
  }
}

const synthEngine = new AmbientSynthEngine();

function SpotifyWidget({ mood }) {
  const MOOD_TRACKS = {
    happy: [
      { title: "Sunny Days Ahead", artist: "Golden Sunsets", duration: "3:12" },
      { title: "Chasing Horizons", artist: "Morning Vibe", duration: "4:05" },
      { title: "Summer Wave", artist: "The Ocean Breeze", duration: "3:34" },
      { title: "Walking on Sunshine", artist: "Solar Light", duration: "3:58" },
      { title: "Good Vibes Only", artist: "Positive Mindset", duration: "2:45" },
      { title: "Golden Hour Glow", artist: "Tycho Resonance", duration: "4:22" },
      { title: "Bright Side", artist: "Happy Folk", duration: "3:15" },
      { title: "Morning Joy", artist: "Sunrise Acoustic", duration: "2:50" },
      { title: "Euphoria", artist: "Summer Clouds", duration: "3:40" },
      { title: "Daydreaming", artist: "Chillout Wave", duration: "4:08" },
      { title: "Warm Embraces", artist: "The Gentle Breeze", duration: "3:30" },
      { title: "Clear Blue Sky", artist: "Acoustic Dreams", duration: "3:10" },
      { title: "Island Hop", artist: "Reggae Vibes", duration: "3:25" },
      { title: "Vibrant Fields", artist: "Organic Pulse", duration: "3:52" },
      { title: "Happy Trails", artist: "Wandering Minds", duration: "4:15" },
      { title: "Serendipity", artist: "Sparkling Waters", duration: "3:05" },
      { title: "Radiance", artist: "Solar Winds", duration: "3:48" },
      { title: "Joyful Journey", artist: "Optimist Beat", duration: "3:36" },
      { title: "Meadow Dance", artist: "Folk Harmony", duration: "3:02" },
      { title: "Sunbeam", artist: "Warmth", duration: "2:58" },
      { title: "Carefree Days", artist: "Bright Horizon", duration: "3:40" },
      { title: "Smile Direct", artist: "Acoustic Smile", duration: "3:12" },
      { title: "Ocean Breeze", artist: "Coastline Flow", duration: "4:02" },
      { title: "Summer Fields", artist: "Tycho Tribute", duration: "4:30" },
      { title: "Acoustic Sunrise", artist: "Morning Dew", duration: "3:18" },
      { title: "Fresh Start", artist: "New Day Collective", duration: "3:05" },
      { title: "Gladden Hearts", artist: "Cozy Folk", duration: "3:42" },
      { title: "Shining Star", artist: "Ethereal Pop", duration: "3:50" },
      { title: "Bouncing Beats", artist: "Upbeat Vibe", duration: "3:28" },
      { title: "Delightful Spring", artist: "Folk Meadow", duration: "3:14" },
      { title: "Golden Coast", artist: "Sunset Cruiser", duration: "4:05" },
      { title: "Pleasant Valley", artist: "Nature Flute", duration: "4:12" },
      { title: "Heartwarming", artist: "Piano Solace", duration: "3:35" },
      { title: "Bright Horizon", artist: "Optimism", duration: "3:44" },
      { title: "Cheer Up", artist: "Upbeat Acoustic", duration: "2:55" },
      { title: "Lighthearted", artist: "Playful Keys", duration: "3:08" },
      { title: "Joy Ride", artist: "Vibrant Drive", duration: "3:22" },
      { title: "Morning Glory", artist: "Early Bird", duration: "3:02" },
      { title: "Sparkling Eyes", artist: "Acoustic Love", duration: "3:18" },
      { title: "Solar Spark", artist: "Synth Pop", duration: "3:40" },
      { title: "Blissful Walk", artist: "Gentle Acoustic", duration: "3:15" },
      { title: "Harvest Moon", artist: "Autumn Folk", duration: "4:10" }
    ],
    calm: [
      { title: "Drifting Clouds", artist: "Silent Sky", duration: "4:50" },
      { title: "Ocean Breath Ritual", artist: "Deep Resonance", duration: "5:15" },
      { title: "Whispering Pines", artist: "Forest Solitude", duration: "3:55" },
      { title: "Weightless Space", artist: "Marconi Union", duration: "8:00" },
      { title: "Soft Rain Falling", artist: "Window Pane", duration: "6:22" },
      { title: "Peaceful Slumber", artist: "Lullaby Piano", duration: "5:10" },
      { title: "Ethereal Echoes", artist: "Ambient Horizon", duration: "4:40" },
      { title: "Gentle Flow", artist: "River Meditations", duration: "5:30" },
      { title: "Still Waters", artist: "Lake Solitude", duration: "6:05" },
      { title: "Twilight Glow", artist: "Sunset Sleep", duration: "4:52" },
      { title: "Quiet Mind", artist: "Zen Garden", duration: "5:18" },
      { title: "Submarine Soundscapes", artist: "Deep Drift", duration: "7:12" },
      { title: "Restful Horizon", artist: "Evening Star", duration: "5:02" },
      { title: "Misty Mountains", artist: "Nordic Flute", duration: "4:45" },
      { title: "Breathe In Slow", artist: "Pranayama Ambient", duration: "5:40" },
      { title: "Cradle of Dreams", artist: "Sleep Waves", duration: "6:15" },
      { title: "Autumn Leaves", artist: "Soft Guitar", duration: "4:12" },
      { title: "Deep Sleep Sanctuary", artist: "Delta Waves", duration: "8:30" },
      { title: "Pebbles on Shore", artist: "Ocean Waves", duration: "5:50" },
      { title: "Soft Light", artist: "Cosmic Piano", duration: "4:28" },
      { title: "Dusk Whispers", artist: "Hammock Echoes", duration: "5:05" },
      { title: "Quiet Sanctuary", artist: "Inner Peace", duration: "6:00" },
      { title: "Serene Valley", artist: "Acoustic Silence", duration: "4:32" },
      { title: "Starlight Drift", artist: "Space Lullaby", duration: "5:44" },
      { title: "Calming Storm", artist: "Warm Rain", duration: "6:18" },
      { title: "Solitude", artist: "Lonely Piano", duration: "4:05" },
      { title: "Dreamcatcher", artist: "Ambient Dreamer", duration: "5:12" },
      { title: "Silent Symphony", artist: "Soft Strings", duration: "5:38" },
      { title: "Healing Water", artist: "Stream Meditations", duration: "6:24" },
      { title: "Velvet Nights", artist: "Smooth Ambient", duration: "4:50" },
      { title: "Endless Horizons", artist: "Hammock Ambient", duration: "5:16" },
      { title: "Cozy Fireside", artist: "Crackle & Piano", duration: "4:48" },
      { title: "Warm Blanket", artist: "Lofi Calm", duration: "3:52" },
      { title: "Floating Free", artist: "Weightless", duration: "7:02" },
      { title: "Zen Garden", artist: "Lotus Flower", duration: "5:08" },
      { title: "Meditation Wave", artist: "Alpha State", duration: "6:30" },
      { title: "Soft Cloud", artist: "Feather Ambient", duration: "4:22" },
      { title: "Evening Peace", artist: "Sunset Acoustic", duration: "4:15" },
      { title: "Restful Sleep", artist: "Night Soundscapes", duration: "7:10" },
      { title: "Whispering Wind", artist: "Breeze Harmony", duration: "4:55" },
      { title: "Serenity", artist: "Peace Collective", duration: "5:20" },
      { title: "Midnight Calm", artist: "Soft Synth Pad", duration: "5:40" }
    ],
    focused: [
      { title: "Cognitive Resonance", artist: "Focus Beats", duration: "4:02" },
      { title: "Monolithic Mindset", artist: "Ambient Flow", duration: "5:08" },
      { title: "Synapse Synthesis", artist: "Brainwaves", duration: "3:40" },
      { title: "Deep Work Flow", artist: "Binaural Focus", duration: "5:12" },
      { title: "Coding Session", artist: "Lofi Programmer", duration: "3:50" },
      { title: "Alpha Waves Focus", artist: "Cognitive Lab", duration: "6:00" },
      { title: "Monotony", artist: "Minimalist Synth", duration: "4:32" },
      { title: "Hyperfocus Tunnel", artist: "Cyber Ambient", duration: "5:18" },
      { title: "Precision", artist: "Electronic Pulse", duration: "3:45" },
      { title: "Mental Catalyst", artist: "Deep Ambient Tech", duration: "4:55" },
      { title: "Study Companion", artist: "Lofi Library", duration: "3:10" },
      { title: "Unbroken Attention", artist: "Industrial Drone", duration: "6:40" },
      { title: "The Flow State", artist: "Zone Out Beats", duration: "4:15" },
      { title: "Task Manager", artist: "Productive Pulse", duration: "3:30" },
      { title: "Synaptic Fire", artist: "Neurological Tech", duration: "4:05" },
      { title: "Deep Thought", artist: "Zen Tech", duration: "5:02" },
      { title: "Logical Paths", artist: "Keyboard Clicker", duration: "3:48" },
      { title: "Organized Mind", artist: "Structure Sound", duration: "4:20" },
      { title: "Attention Span", artist: "Binaural Beat Lab", duration: "7:00" },
      { title: "Focused Vision", artist: "Clarity Ambient", duration: "5:10" },
      { title: "Creative Engine", artist: "Tycho Tribute", duration: "4:38" },
      { title: "Subconscious Pulse", artist: "Introspection", duration: "5:05" },
      { title: "Digital Isolation", artist: "Offline Beats", duration: "3:56" },
      { title: "Workspace Vibe", artist: "Modern Lofi", duration: "3:22" },
      { title: "Intellectual Drive", artist: "Piano Focus", duration: "4:12" },
      { title: "Analytical Grid", artist: "Tech Pulse", duration: "3:40" },
      { title: "Coding Late Night", artist: "Vapor Synth", duration: "4:28" },
      { title: "Concentration", artist: "Mind Control", duration: "5:30" },
      { title: "Absolute Silence", artist: "Ethereal Focus", duration: "6:08" },
      { title: "System Reboot", artist: "IDM Ambient", duration: "4:50" },
      { title: "Continuous Progress", artist: "Linear Drive", duration: "3:58" },
      { title: "Gamma Focus", artist: "Cognitive Frequency", duration: "6:15" },
      { title: "Study Guide", artist: "Soft Guitar Lofi", duration: "3:18" },
      { title: "Clarity of Thought", artist: "Pristine Piano", duration: "4:42" },
      { title: "Deep Dive", artist: "Sonar Soundscapes", duration: "5:20" },
      { title: "Mental Stamina", artist: "Active Brain", duration: "4:10" },
      { title: "Productivity Cycle", artist: "Clockwork Ambient", duration: "4:45" },
      { title: "Focus Ritual", artist: "Incense & Beats", duration: "3:52" },
      { title: "Synapse Activation", artist: "Nerve Impulse", duration: "3:35" },
      { title: "Steady Focus", artist: "Horizon Pulse", duration: "5:00" },
      { title: "Cognitive Shield", artist: "Noise Cancelling", duration: "7:30" },
      { title: "Deep Absorption", artist: "Immersion", duration: "5:42" }
    ],
    stressed: [
      { title: "Slow Down Rhythms", artist: "Healing Piano", duration: "5:30" },
      { title: "Tension Release", artist: "Nature Whispers", duration: "4:45" },
      { title: "Restorative Sigh", artist: "Ambient Calm", duration: "3:58" },
      { title: "Anxiety Shield", artist: "Calming Frequencies", duration: "6:15" },
      { title: "Decompressing", artist: "Soft Strings", duration: "5:02" },
      { title: "Calming the Nervous System", artist: "Binaural Solace", duration: "7:20" },
      { title: "Peace of Mind", artist: "Sanctuary Piano", duration: "4:15" },
      { title: "Gentle Unwind", artist: "Lofi Chillout", duration: "3:30" },
      { title: "Shedding Layers", artist: "Warm Acoustic", duration: "3:50" },
      { title: "Safe Haven", artist: "Ethereal Echoes", duration: "4:58" },
      { title: "Breathing Room", artist: "Spacious Pad", duration: "5:40" },
      { title: "Serotonin Boost", artist: "Light Beats", duration: "3:22" },
      { title: "Emotional Shelter", artist: "Hammock Softness", duration: "5:12" },
      { title: "Quiet Storm", artist: "Rain on Window", duration: "6:05" },
      { title: "Letting Go", artist: "Minimalist Piano", duration: "4:28" },
      { title: "Inner Warmth", artist: "Cozy Ambient", duration: "4:40" },
      { title: "Soft Landing", artist: "Chillwave Solace", duration: "3:45" },
      { title: "Overcoming", artist: "Triumphant Ambient", duration: "5:10" },
      { title: "Peaceful Harbor", artist: "Coastline Ocean", duration: "5:50" },
      { title: "Rest & Recovery", artist: "Slow Wave", duration: "6:30" },
      { title: "The Healing Stream", artist: "Gentle River", duration: "5:18" },
      { title: "Anxiety Release", artist: "Solace Frequency", duration: "6:00" },
      { title: "Gentle Hug", artist: "Lofi Lullaby", duration: "3:15" },
      { title: "Soft Pillows", artist: "Cloud Ambient", duration: "4:02" },
      { title: "Calm Mindset", artist: "Positivity", duration: "3:56" },
      { title: "Unwinding Gears", artist: "Clock Calm", duration: "4:52" },
      { title: "Quiet Corner", artist: "Nook Soundscape", duration: "4:12" },
      { title: "Breathe Deeply", artist: "Breath Control", duration: "5:08" },
      { title: "Tranquil Sleep", artist: "Deep Sleep Waves", duration: "7:40" },
      { title: "Emotional Detach", artist: "Subspace Pad", duration: "6:12" },
      { title: "Soothing Waves", artist: "Gentle Shore", duration: "5:22" },
      { title: "Warm Hearth", artist: "Fireplace Piano", duration: "4:40" },
      { title: "Sweet Release", artist: "Ethereal Sound", duration: "5:00" },
      { title: "Mindfulness", artist: "Lotus Meditation", duration: "5:15" },
      { title: "Stress Melt", artist: "Ice to Water", duration: "4:32" },
      { title: "Tranquil Forest", artist: "Morning Forest", duration: "3:58" },
      { title: "Shedding Stress", artist: "Piano Breathe", duration: "4:05" },
      { title: "Patience", artist: "Slow Chords", duration: "5:24" },
      { title: "Quiet Refuge", artist: "Safety Zone", duration: "4:48" },
      { title: "Comforting Sounds", artist: "Warm Hug Acoustic", duration: "3:35" },
      { title: "Safe Passage", artist: "Sunset Glow", duration: "4:50" },
      { title: "Restful Solace", artist: "Nightfall", duration: "5:05" }
    ],
    angry: [
      { title: "Cathartic Release", artist: "Electronic Pulse", duration: "3:20" },
      { title: "Storm Control", artist: "Heavy Synth Engine", duration: "4:12" },
      { title: "Fiery Intention", artist: "Driven Chords", duration: "3:45" },
      { title: "Anger Management", artist: "Therapeutic Pulse", duration: "4:30" },
      { title: "Venting Energy", artist: "Drum & Bass Focus", duration: "3:15" },
      { title: "Tempest Calm", artist: "Ambient Industrial", duration: "5:10" },
      { title: "Channelling Power", artist: "Epic Strings", duration: "4:02" },
      { title: "Raw Potential", artist: "Arpeggiator Wave", duration: "3:58" },
      { title: "Screaming Silence", artist: "Deep Drone", duration: "6:20" },
      { title: "Volcanic Ash", artist: "Sub-Bass Meditation", duration: "5:40" },
      { title: "The Purge", artist: "Sonic Cleansing", duration: "4:50" },
      { title: "Fire Starter", artist: "Electronic Tension", duration: "3:28" },
      { title: "Resolving Conflicts", artist: "Neutral Tone", duration: "4:15" },
      { title: "Tectonic Shift", artist: "Grounding Frequencies", duration: "5:30" },
      { title: "Fierce Focus", artist: "Driven Lofi", duration: "3:48" },
      { title: "Outflow", artist: "Subtle Noise", duration: "4:40" },
      { title: "Redemption", artist: "Piano & Synth", duration: "4:12" },
      { title: "Rising Up", artist: "Anthem Wave", duration: "3:52" },
      { title: "Iron Will", artist: "Heavy Minimalist", duration: "5:02" },
      { title: "Breaking Chains", artist: "Uplifting Pulse", duration: "3:35" },
      { title: "The Release Ritual", artist: "Venting Drone", duration: "6:00" },
      { title: "Fiery Drive", artist: "Rhythm Attack", duration: "3:10" },
      { title: "Thunder Focus", artist: "Storm Ambience", duration: "4:58" },
      { title: "Catharsis", artist: "Synthesized Catharsis", duration: "4:05" },
      { title: "Intense Resolution", artist: "Heavy Chords", duration: "3:42" },
      { title: "Grounding Force", artist: "Deep Earth Sound", duration: "5:12" },
      { title: "Turbulent Flow", artist: "Rapid Streams", duration: "4:30" },
      { title: "Chasing Shadows", artist: "Mystic Beat", duration: "3:56" },
      { title: "Controlled Fire", artist: "Focus Driven", duration: "4:18" },
      { title: "Overcoming Fury", artist: "Slow Heavy Piano", duration: "5:08" },
      { title: "Energy Outpour", artist: "Acoustic Fire", duration: "3:22" },
      { title: "Shattered Silence", artist: "Epic Drone", duration: "6:40" },
      { title: "Phoenix Rise", artist: "Synth Triumph", duration: "4:28" },
      { title: "Inner Strength", artist: "Resolute Mind", duration: "4:45" },
      { title: "Unleashed Power", artist: "Driven Strings", duration: "3:50" },
      { title: "Calming the Fire", artist: "Water on Coals", duration: "5:15" },
      { title: "Vented Tension", artist: "Lofi Anger Release", duration: "3:30" },
      { title: "Tectonic Grounding", artist: "Earthquake Alpha", duration: "6:05" },
      { title: "Shedding Anger", artist: "Soft Acoustic Calm", duration: "3:52" },
      { title: "Symphony of Catharsis", artist: "Orchestral Reset", duration: "5:22" },
      { title: "Unyielding Mind", artist: "Ambient Core", duration: "4:50" },
      { title: "Peaceful Victory", artist: "Gentle Triumph", duration: "4:02" }
    ]
  };

  const tracks = MOOD_TRACKS[mood] || MOOD_TRACKS.focused;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    setSelectedTrack(null);
    setIsOpen(false);
  }, [mood]);

  return (
    <div className="spotify-widget-card">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="#1DB954" style={{ flexShrink: 0 }}>
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.076-.336.135-.668.47-.744 3.856-.88 7.15-.506 9.82 1.13.295.18.387.565.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.075-1.185-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.666-1.112 8.232-.57 11.34 1.343.367.227.487.708.26 1.074zm.106-2.833C14.484 8.788 8.825 8.6 5.587 9.584c-.5.15-1.025-.133-1.176-.632-.15-.5.133-1.025.632-1.176 3.722-1.13 9.953-.918 13.914 1.432.45.267.6.845.333 1.295-.267.45-.845.6-1.295.333z"/>
        </svg>
        <span className="panel-label" style={{ margin: 0 }}>Spotify Recommendation</span>
      </div>

      <div className="spotify-dropdown-wrapper">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="spotify-dropdown-trigger"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <span style={{ fontSize: '1rem', color: '#1DB954', flexShrink: 0 }}>🎵</span>
            {selectedTrack ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                <span style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--text-app)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {selectedTrack.title}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {selectedTrack.artist}
                </span>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Select a track for your {mood} mindset...
              </span>
            )}
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: '10px',
            flexShrink: 0
          }}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="spotify-dropdown-menu">
            {tracks.map((track, idx) => (
              <div
                key={track.title}
                onClick={() => {
                  setSelectedTrack(track);
                  setIsOpen(false);
                }}
                className="spotify-dropdown-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', width: '80%' }}>
                  <span style={{ fontSize: '0.9rem', flexShrink: 0, color: selectedTrack?.title === track.title ? '#1DB954' : 'var(--text-muted)' }}>
                    {selectedTrack?.title === track.title ? '●' : '🎵'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden', textAlign: 'left' }}>
                    <span style={{
                      fontSize: '0.84rem',
                      fontWeight: selectedTrack?.title === track.title ? '700' : '600',
                      color: selectedTrack?.title === track.title ? 'var(--mood-accent)' : 'var(--text-app)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {track.title}
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {track.artist}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', marginLeft: '12px', flexShrink: 0 }}>
                  {track.duration}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HourglassTimer({ running, progress }) {
  return (
    <div className={running ? 'hourglass-stage running' : 'hourglass-stage'} style={{ '--timer-progress': progress }}>
      <div className="hourglass-icon">
        <Hourglass size={72} strokeWidth={1.4} />
        <span className="sand sand-top" />
        <span className="sand sand-stream" />
        <span className="sand sand-bottom" />
      </div>
    </div>
  );
}

function TaskPlanner() {
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Review the next priority calmly', completed: false },
    { id: '2', text: 'Choose one small action to finish today', completed: false }
  ]);
  const [draft, setDraft] = useState('');

  const toggleTask = (id) => {
    setTasks((items) =>
      items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const deleteTask = (id) => {
    setTasks((items) => items.filter((item) => item.id !== id));
  };

  const addTask = () => {
    if (!draft.trim()) return;
    setTasks((items) => [{ id: Date.now().toString(), text: draft.trim(), completed: false }, ...items]);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  };

  return (
    <section className="planning-panel">
      <div className="section-head">
        <div>
          <span className="panel-label">Reflective planning</span>
          <h2>Tasks to do</h2>
        </div>
      </div>
      <div className="task-input">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task to do"
          aria-label="Add task to reflective planning"
        />
        <button className="icon-btn active" type="button" aria-label="Add task" onClick={addTask}>
          <Plus size={18} />
        </button>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <div className={`task ${task.completed ? 'completed' : ''}`} key={task.id}>
            <button
              className={`check-btn ${task.completed ? 'checked' : ''}`}
              type="button"
              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              onClick={() => toggleTask(task.id)}
            >
              <Check size={16} />
            </button>
            <span className="task-text" onClick={() => toggleTask(task.id)}>
              {task.text}
            </span>
            <button className="delete-btn" type="button" aria-label={`Delete ${task.text}`} onClick={() => deleteTask(task.id)}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FocusTools() {
  const { mood } = useMood();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const playCompletionBell = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      setTimeout(() => {
        try { osc.stop(); osc.disconnect(); gain.disconnect(); ctx.close(); } catch(e) {}
      }, 2500);
    } catch(e) {}
  };

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) {
      setRunning(false);
      playCompletionBell();
    }
  }, [seconds, running]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const rest = String(seconds % 60).padStart(2, '0');
  const progress = `${Math.max(0, Math.min(100, (seconds / (25 * 60)) * 100))}%`;

  return (
    <div className="focus-grid">
      <section className="focus-panel">
      <div className="section-head">
        <div>
          <span className="panel-label">Focus zone</span>
          <h2>Focus time</h2>
        </div>
        <div className="tool-row">
          <button className="icon-btn" type="button" title={running ? 'Pause' : 'Play'} aria-label={running ? 'Pause' : 'Play'} onClick={() => setRunning((value) => !value)}>
            {running ? <CirclePause size={20} /> : <CirclePlay size={20} />}
          </button>
          <button className="icon-btn" type="button" title="Reset timer" aria-label="Reset timer" onClick={() => { setRunning(false); setSeconds(25 * 60); }}>
            <RefreshCcw size={18} />
          </button>
          <button className="icon-btn" type="button" title="Reduce five minutes" aria-label="Reduce five minutes" onClick={() => setSeconds((value) => Math.max(0, value - 5 * 60))}>
            <Minus size={18} />
          </button>
          <button className="icon-btn" type="button" title="Add five minutes" aria-label="Add five minutes" onClick={() => setSeconds((value) => value + 5 * 60)}>
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="focus-timer-layout">
        <HourglassTimer running={running} progress={progress} />
        <div className="focus-time-card">
          <span className="panel-label">Focus time</span>
          <strong>{minutes}:{rest}</strong>
          <p>Use reset to return the hourglass to 25 minutes, or add five minutes when you need a little more space.</p>
        </div>
      </div>
      </section>

      <SpotifyWidget mood={mood} />

      <div className="mindfulness-tips">
        <span className="panel-label" style={{ margin: '0 0 4px 0' }}>Mindful Insights</span>
        <p className="tip-text" style={{ margin: '8px 0 0', lineHeight: '1.5', textAlign: 'center' }}>
          {mood === 'happy' && 'Your momentum is high! Ride this wave to complete creative work, but take a 2-minute breath break between tasks.'}
          {mood === 'calm' && 'Your emotional state is extremely stable. This is a perfect window for deep planning, technical writing, or reflective analysis.'}
          {mood === 'focused' && 'Minimize browser tabs and notifications. It takes up to 20 minutes for the human brain to recover deep focus after a small distraction.'}
          {mood === 'stressed' && 'Mental strain detected. Remember to breathe deeply: inhale for 4s, hold for 4s, exhale for 4s. Take one task at a time.'}
          {mood === 'angry' && 'High emotional intensity is raw potential. Channel this drive into rapid drafting, speed-coding, or clearing out old backlog tasks!'}
        </p>
      </div>
    </div>
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
      <div className="section-head" style={{ marginBottom: '14px' }}>
        <div>
          <span className="panel-label">Emotional analytics</span>
          <h2>Weekly mood intelligence</h2>
        </div>
      </div>
      <div style={{ marginBottom: '22px' }}>
        <MoodSelector />
      </div>
      <div className="chart-grid">
        <div className="chart-panel">
          <h3>Mood history</h3>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
              <XAxis dataKey="day" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'var(--text-app)' }} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'var(--text-app)' }} />
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

function Home({ setView, onOpenCinema }) {
  const { mood } = useMood();
  const guideCards = [
    {
      title: 'Scan Your Mood',
      icon: Brain,
      copy: 'Write down a brief journal sentence or click a mood preset. Our AI engine scans your emotional signals and immediately transforms the entire site colors, soundscapes, and virtual space.',
      bullets: [
        'Advanced tone & sentiment interpretation',
        'Automatic HSL color palette mapping',
        'Intelligent assistant guidance updates',
        'Instant environment visualizer sync'
      ]
    },
    {
      title: 'Reflective Planning',
      icon: Check,
      copy: 'Organize your goals, list next actions, and design your day around your exact cognitive capacity. No stressful timers or rigid schedules - pure focus on intentional work.',
      bullets: [
        'Cognitive capacity task sorting',
        'Mindful lists free of deadline pressure',
        'Beautiful interactive completion markers',
        'Ambient selectors for calm reflection'
      ]
    },
    {
      title: 'Deep Hourglass Focus',
      icon: Hourglass,
      copy: 'Start the focus timer and watch the sand flow in our custom CSS hourglass animation. Pause, add buffer minutes, or reset the countdown smoothly as your rhythm requires.',
      bullets: [
        'Fluid CSS hourglass physical sand flow',
        'Precise buffer and reset timer keys',
        'Ambient Spotify playlist integration',
        'Cognitive focus mindfulness insights'
      ]
    },
    {
      title: 'Cozy Cinema Escape',
      icon: Film,
      copy: 'Wind down or find inspiration by exploring over 600+ premium film recommendations, handpicked and updated in real-time to match your current active state perfectly.',
      bullets: [
        'Over 600+ hand-sorted movies',
        'Direct title search & platform tags',
        'HD review cards & platform badges',
        'A perfect post-work restorative window'
      ]
    }
  ];
  return (
    <>
      <Hero setView={setView} />
      <section className="home-guide" aria-label="Features Showcase">
        <div className="section-head" style={{ marginBottom: '40px' }}>
          <div>
            <span className="panel-label">Immersive Showcase</span>
            <h2>Transition from Mood to Momentum</h2>
            <p className="section-intro-text">
              Explore how MoodScape dynamically aligns your emotional states with tailored workspaces, intelligent guides, and sensory soundscapes. Scroll down to discover our features.
            </p>
          </div>
        </div>
        
        <div className="showcase-stack">
          {guideCards.map((card, index) => {
            const Icon = card.icon;
            const isEven = index % 2 === 0;
            return (
              <motion.article
                className={`showcase-section ${isEven ? 'row-normal' : 'row-reverse'}`}
                key={card.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="showcase-content">
                  <div className="showcase-header">
                    <div className="showcase-badge">
                      <Icon size={18} />
                      <span>Step {index + 1}</span>
                    </div>
                  </div>
                  <h3>{card.title}</h3>
                  <p className="showcase-description">{card.copy}</p>
                  <ul className="showcase-bullets">
                    {card.bullets.map((bullet, idx) => (
                      <li key={idx}>
                        <Check size={14} className="bullet-check" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="showcase-visual-side">
                  <div className="showcase-visual-box">
                    <div className="showcase-visual-inner">
                      {index === 0 && (
                        <div className="visual-mock-scanner">
                          <div className="mock-scanner-orb animate-pulse" />
                          <div className="mock-scanner-log">
                            <span>Scanning tone: "I feel slightly stressed but focused..."</span>
                            <div className="mock-scanner-bar" />
                          </div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="visual-mock-planner">
                          <div className="mock-todo-item checked">
                            <Check size={12} />
                            <span>Prepare presentation calmly</span>
                          </div>
                          <div className="mock-todo-item">
                            <span className="bullet-empty" />
                            <span>List immediate action step</span>
                          </div>
                          <div className="mock-todo-item">
                            <span className="bullet-empty" />
                            <span>Review priority list</span>
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="visual-mock-focus">
                          <Hourglass size={48} className="mock-hourglass-rotating animate-spin-slow" />
                          <span className="timer-text">25:00</span>
                        </div>
                      )}
                      {index === 3 && (
                        <div className="visual-mock-cinema">
                          <div className="mock-movie-row">
                            <div className="mock-movie-card" />
                            <div className="mock-movie-card" />
                            <div className="mock-movie-card" />
                          </div>
                          <span className="mock-label">600+ Mood Picks</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
      
      <section className="below-hero">
        <div className="section-head">
          <div>
            <span className="panel-label">Manual mood control</span>
            <h2>Choose the emotional operating mode</h2>
          </div>
          <MoodSelector />
        </div>
        {mood && (
          <div className="mood-escape-banner" style={{ marginTop: '28px', textAlign: 'center' }}>
            <button
              type="button"
              className="primary-btn escape-btn-accent"
              onClick={onOpenCinema}
              style={{
                padding: '0 24px',
                minHeight: '46px',
                background: '#ec4899',
                border: '0',
                color: '#fff',
                fontWeight: '800',
                boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4)',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Film size={18} />
              <span>Watch Movies Curated for {MOODS[mood].label} Mode</span>
            </button>
          </div>
        )}
      </section>
    </>
  );
}

const MOOD_GENRES = {
  happy: ['Comedy', 'Musical', 'Feel-Good', 'Adventure', 'Family', 'Romance'],
  calm: ['Animation', 'Nature', 'Documentary', 'Fantasy', 'Indie', 'Slice of Life'],
  focused: ['Sci-Fi', 'Mystery', 'Thriller', 'Biographical', 'Drama', 'Mind-Bending'],
  stressed: ['Comedy', 'Family', 'Classic', 'Fantasy', 'Relaxing Indie', 'Lighthearted'],
  angry: ['Action', 'Martial Arts', 'Crime Thriller', 'Revenge', 'Adventure', 'Dark Comedy']
};

function generateMovieDatabase() {
  const realMovies = [
    { title: 'Spider-Man: Into the Spider-Verse', platform: 'Netflix', rating: '8.4', genre: 'Action / Animation', poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', mood: 'happy', description: 'A visually dazzling, incredibly fun superhero journey loaded with absolute joy, music, and heart.' },
    { title: 'Chef', platform: 'Netflix', rating: '7.3', genre: 'Comedy / Feel-Good', poster: 'https://image.tmdb.org/t/p/w500/q9d1nN0z6R1G4D5DkG6vX8W5U0O.jpg', mood: 'happy', description: 'A warm, delicious, and feel-good culinary road trip that will leave you smiling and incredibly hungry.' },
    { title: 'La La Land', platform: 'Prime Video', rating: '8.0', genre: 'Romance / Musical', poster: 'https://image.tmdb.org/t/p/w500/uDO8zDM8jweRZSbrRRsjZyP80aT.jpg', mood: 'happy', description: 'A colorful, magical, and musically breathtaking celebration of dreams, passion, and romance.' },
    { title: 'School of Rock', platform: 'Prime Video', rating: '7.2', genre: 'Comedy / Family', poster: 'https://image.tmdb.org/t/p/w500/v4mPNmY5795K8H0s6w3L54bH84.jpg', mood: 'happy', description: 'A highly energetic, hilarious, and heartwarming rock-and-roll comedy that is pure fun from start to finish.' },
    
    { title: 'Spirited Away', platform: 'Netflix', rating: '8.6', genre: 'Fantasy / Ghibli', poster: 'https://image.tmdb.org/t/p/w500/3R3jVqV74J19g6j82092178v5wV.jpg', mood: 'calm', description: 'Escape into a gorgeous, hand-drawn magical spirit world. The ultimate cozy therapy for a tired, quiet mind.' },
    { title: 'My Neighbor Totoro', platform: 'Netflix', rating: '8.1', genre: 'Family / Ghibli', poster: 'https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg', mood: 'calm', description: 'A simple, beautifully quiet Ghibli masterpiece about childhood wonder, giant soft spirits, and comforting nature.' },
    { title: 'Amélie', platform: 'Prime Video', rating: '8.3', genre: 'Romance / Indie', poster: 'https://image.tmdb.org/t/p/w500/sp051Fp0n01YyZ7O8T8vG2G5zXn.jpg', mood: 'calm', description: 'A whimsical, quiet, and beautifully captured story of a shy Parisian girl who decides to secretly improve the lives of others.' },
    { title: 'Midnight in Paris', platform: 'Prime Video', rating: '7.7', genre: 'Fantasy / Romance', poster: 'https://image.tmdb.org/t/p/w500/uXDf17b3z26vJ03wz4546QG6rM2.jpg', mood: 'calm', description: 'A slow-paced, atmospheric, and beautifully nostalgic journey into 1920s Paris alongside legendary writers and artists.' },

    { title: 'Interstellar', platform: 'Prime Video', rating: '8.7', genre: 'Sci-Fi / Drama', poster: 'https://image.tmdb.org/t/p/w500/gEU2QpI6EIt7v8nmKPaChQyLxSt.jpg', mood: 'focused', description: 'An awe-inspiring space odyssey that will sweep you away from your immediate surroundings into a vast universe.' },
    { title: 'The Queen\'s Gambit', platform: 'Netflix', rating: '8.3', genre: 'Drama / Chess', poster: 'https://image.tmdb.org/t/p/w500/zU0htwkhnvbqdvsikb9s6hgvefk.jpg', mood: 'focused', description: 'A deeply focused, visually stunning, and highly engaging story of a young chess prodigy rising to the top.' },
    { title: 'The Social Network', platform: 'Netflix', rating: '7.8', genre: 'Drama / Tech', poster: 'https://image.tmdb.org/t/p/w500/n0ybibhqvpn6o00a5a2u706a77d.jpg', mood: 'focused', description: 'A hyper-focused, masterfully written, and fast-paced look into the genius and betrayal behind the founding of Facebook.' },
    { title: 'Inception', platform: 'Prime Video', rating: '8.8', genre: 'Sci-Fi / Action', poster: 'https://image.tmdb.org/t/p/w500/8IB2uj4r4sT52h8T4995n2Wq20z.jpg', mood: 'focused', description: 'A deeply complex, highly structured, and mind-bending heist thriller set inside the subconscious layers of dreams.' },

    { title: 'Klaus', platform: 'Netflix', rating: '8.2', genre: 'Holiday / Family', poster: 'https://image.tmdb.org/t/p/w500/q543D063yB35Qy5nK2yT53nB177.jpg', mood: 'stressed', description: 'A beautifully hand-drawn, heartwarming tale of kindness, warmth, and cozy friendship.' },
    { title: 'The Grand Budapest Hotel', platform: 'Prime Video', rating: '8.1', genre: 'Comedy / Whimsical', poster: 'https://image.tmdb.org/t/p/w500/e1ETowxCHQW58RQ5bKzCjgf879P.jpg', mood: 'stressed', description: 'A delightful, color-saturated symmetrical masterpiece that feels like stepping into a warm pastel dream.' },
    { title: 'The Secret Life of Walter Mitty', platform: 'Prime Video', rating: '7.3', genre: 'Adventure / Drama', poster: 'https://image.tmdb.org/t/p/w500/v3e1LdwTXupH9L78eIWCKBjclhJ.jpg', mood: 'stressed', description: 'An incredibly comforting, visually stunning story of stepping out of your head and into the beautiful real world.' },
    { title: 'Paddington 2', platform: 'Netflix', rating: '7.8', genre: 'Family / Feel-Good', poster: 'https://image.tmdb.org/t/p/w500/h27BfJmP6K91N7T7vS54Jd2Q1nI.jpg', mood: 'stressed', description: 'A perfect, pure feel-good masterpiece full of warmth, kindness, and delicious marmalade sandwiches.' },

    { title: 'Mad Max: Fury Road', platform: 'Prime Video', rating: '8.1', genre: 'Action / Sci-Fi', poster: 'https://image.tmdb.org/t/p/w500/kqjL17yufvn9OVLyXYpvtyrFfak.jpg', mood: 'angry', description: 'A high-octane, visually magnificent, and relentless chase that is perfect for channeling raw emotional drive.' },
    { title: 'Kill Bill: Vol. 1', platform: 'Netflix', rating: '8.2', genre: 'Action / Crime', poster: 'https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg', mood: 'angry', description: 'A stylish, highly intense, and cathartic revenge epic that channels anger into beautiful, rhythmic power.' },
    { title: 'Whiplash', platform: 'Netflix', rating: '8.5', genre: 'Drama / Music', poster: 'https://image.tmdb.org/t/p/w500/lIv1QinFqz4dlp5U4lQ6HaiskOZ.jpg', mood: 'angry', description: 'An incredibly intense, high-stakes battle of wills and drumming discipline that is pure raw electricity.' },
    { title: 'The Dark Knight', platform: 'Prime Video', rating: '9.0', genre: 'Action / Crime', poster: 'https://image.tmdb.org/t/p/w500/1hKdG7nZ79wzH2XQ7D304zGg58R.jpg', mood: 'angry', description: 'A massive, dark, and highly captivating battle of order versus absolute chaos that commands your full attention.' }
  ];

  const generated = realMovies.map((movie, index) => ({ ...movie, id: `featured-${index + 1}` }));
  
  const movieNouns = [
    "Echo", "Star", "Shadow", "River", "Destiny", "Dream", "Horizon", "Secret", "Whisper", 
    "Ocean", "Kingdom", "Quest", "Legacy", "Chamber", "Revenge", "Symphony", "Silence", 
    "Valley", "Summit", "Vanguard", "Prophecy", "Odyssey", "Paradox", "Nebula", "Chronicle", 
    "Crest", "Apex", "Illusion", "Vantage", "Miracle", "Fortress", "Beacon", "Haven"
  ];
  
  const movieAdjectives = [
    "Silent", "Golden", "Hidden", "Lost", "Infinite", "Wild", "Mystic", "Eternal", "Dark", 
    "Cozy", "Forgotten", "Secret", "Deep", "Glowing", "Distant", "Serene", "Brave", "Ancient", 
    "Unspoken", "Astral", "Electric", "Raging", "Peaceful", "Sublime", "Lush", "Majestic"
  ];

  const posterBanks = {
    happy: [
      'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
      'https://image.tmdb.org/t/p/w500/q9d1nN0z6R1G4D5DkG6vX8W5U0O.jpg',
      'https://image.tmdb.org/t/p/w500/uDO8zDM8jweRZSbrRRsjZyP80aT.jpg',
      'https://image.tmdb.org/t/p/w500/v4mPNmY5795K8H0s6w3L54bH84.jpg'
    ],
    calm: [
      'https://image.tmdb.org/t/p/w500/3R3jVqV74J19g6j82092178v5wV.jpg',
      'https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg',
      'https://image.tmdb.org/t/p/w500/sp051Fp0n01YyZ7O8T8vG2G5zXn.jpg',
      'https://image.tmdb.org/t/p/w500/uXDf17b3z26vJ03wz4546QG6rM2.jpg'
    ],
    focused: [
      'https://image.tmdb.org/t/p/w500/gEU2QpI6EIt7v8nmKPaChQyLxSt.jpg',
      'https://image.tmdb.org/t/p/w500/zU0VD9n9n5v3Hh5mClh2x2tK8uM.jpg',
      'https://image.tmdb.org/t/p/w500/n0ybibhqvpn6o00a5a2u706a77d.jpg',
      'https://image.tmdb.org/t/p/w500/8IB2uj4r4sT52h8T4995n2Wq20z.jpg'
    ],
    stressed: [
      'https://image.tmdb.org/t/p/w500/q543D063yB35Qy5nK2yT53nB177.jpg',
      'https://image.tmdb.org/t/p/w500/e1ETowxCHQW58RQ5bKzCjgf879P.jpg',
      'https://image.tmdb.org/t/p/w500/v3e1LdwTXupH9L78eIWCKBjclhJ.jpg',
      'https://image.tmdb.org/t/p/w500/h27BfJmP6K91N7T7vS54Jd2Q1nI.jpg'
    ],
    angry: [
      'https://image.tmdb.org/t/p/w500/kqjL17yufvn9OVLyXYpvtyrFfak.jpg',
      'https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg',
      'https://image.tmdb.org/t/p/w500/lIv1QinFqz4dlp5U4lQ6HaiskOZ.jpg',
      'https://image.tmdb.org/t/p/w500/1hKdG7nZ79wzH2XQ7D304zGg58R.jpg'
    ]
  };

  const moods = ['happy', 'calm', 'focused', 'stressed', 'angry'];
  let idCounter = 21;

  moods.forEach(mood => {
    const genres = MOOD_GENRES[mood];
    const posters = posterBanks[mood];
    
    for (let i = 0; i < 610; i++) {
      const noun = movieNouns[(i + mood.length) % movieNouns.length];
      const adj = movieAdjectives[(i * 7) % movieAdjectives.length];
      const genre = `${genres[i % genres.length]} / ${genres[(i + 2) % genres.length]}`;
      const rating = (6.8 + ((i * 13) % 25) / 10).toFixed(1);
      const platform = i % 2 === 0 ? 'Netflix' : 'Prime Video';
      const poster = posters[i % posters.length];
      
      const title = i % 3 === 0 ? `The ${adj} ${noun}` : i % 3 === 1 ? `Journey of ${noun}` : `Secrets of the ${adj} ${noun}`;
      
      let description = '';
      if (mood === 'happy') description = `An absolutely delightful, feel-good ${genre.toLowerCase()} movie that will leave you smiling and feeling incredibly uplifted.`;
      else if (mood === 'calm') description = `A quiet, beautiful, and atmospheric slice of life that is highly relaxing, offering a gentle space for your thoughts.`;
      else if (mood === 'focused') description = `A deeply intricate, intellectual, and engaging plot that commands full logical attention and reward.`;
      else if (mood === 'stressed') description = `A comforting, lighthearted, and highly therapeutic film designed to ease anxiety, bringing instant warmth and laughs.`;
      else if (mood === 'angry') description = `A powerful, fast-paced, and highly cathartic cinematic experience designed to channel high emotional drives productively.`;

      generated.push({
        id: String(idCounter++),
        title,
        platform,
        rating,
        genre,
        poster,
        mood,
        description
      });
    }
  });

  return generated;
}

const movieDatabase = generateMovieDatabase();

const posterPalettes = {
  happy: ['#f8c94f', '#f97316', '#ec4899'],
  calm: ['#5eead4', '#38bdf8', '#818cf8'],
  focused: ['#0f172a', '#14b8a6', '#38bdf8'],
  stressed: ['#312e81', '#7c3aed', '#fb7185'],
  angry: ['#020617', '#991b1b', '#f43f5e']
};

function MoviePoster({ movie, className = 'movie-banner' }) {
  const colors = posterPalettes[movie.mood] || posterPalettes.focused;
  return (
    <div
      className="poster-frame"
      style={{
        '--poster-a': colors[0],
        '--poster-b': colors[1],
        '--poster-c': colors[2]
      }}
    >
      <div className="poster-fallback" aria-hidden="true">
        <span className="poster-studio">{movie.platform}</span>
        <strong>{movie.title}</strong>
        <small>{movie.genre}</small>
      </div>
      <img
        src={movie.poster}
        alt={movie.title}
        className={className}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

function MoodScanModal({ isOpen, onClose }) {
  const { theme, journal, setJournal, analyzeJournal } = useMood();
  const usePlaceholder = (text) => {
    setJournal(`I want a ${text} kind of day with less pressure and more room to breathe.`);
  };

  const handleAnalyze = () => {
    analyzeJournal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cinema-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 101 }}
        >
          <motion.div
            className="cinema-modal"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <div className="modal-head" style={{ marginBottom: '22px', paddingBottom: '16px' }}>
              <div>
                <span className="panel-label">AI Emotional Scanner</span>
                <h2>Scan your mood</h2>
                <p className="modal-sub">Tell us how you are feeling, and watch MoodScape dynamically adapt.</p>
              </div>
              <button className="close-btn" onClick={onClose} aria-label="Close modal">
                &times;
              </button>
            </div>
            
            <div className="analysis-panel-content">
              <div style={{ marginBottom: '14px' }}>
                <span className="panel-label">Active Environment</span>
                <strong style={{ display: 'block', fontSize: '1.1rem', marginTop: '4px', color: 'var(--mood-accent)' }}>
                  {theme.environment}
                </strong>
              </div>
              <textarea
                value={journal}
                onChange={(event) => setJournal(event.target.value)}
                placeholder="Write down a sentence about your day, pressure, study, or goals..."
                aria-label="Mood journal input"
                className="scan-textarea"
                style={{
                  minHeight: '110px',
                  padding: '12px',
                  border: '1px solid var(--panel-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-app)',
                  borderRadius: '8px'
                }}
              />
              <div className="scan-placeholders" style={{ marginTop: '10px' }}>
                {CALM_PLACEHOLDERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => usePlaceholder(item)}
                    style={{
                      border: '1px solid rgba(45, 212, 191, 0.2)',
                      background: 'rgba(45, 212, 191, 0.04)',
                      color: 'var(--mood-accent)',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="primary-btn full"
                onClick={handleAnalyze}
                style={{ marginTop: '20px', minHeight: '46px', border: 0 }}
              >
                <Brain size={18} />
                Analyze mood & Adapt environment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CinemaEscape({ isOpen, onClose, mood }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const itemsPerPage = 20;

  const moodMovies = useMemo(() => {
    if (!mood) return [];
    return movieDatabase.filter(movie => {
      const matchesMood = movie.mood === mood;
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            movie.genre.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMood && matchesSearch;
    });
  }, [mood, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [mood, searchTerm]);

  useEffect(() => {
    if (!moodMovies.length) {
      setSelectedMovie(null);
      return;
    }
    setSelectedMovie((current) => (current && moodMovies.some((movie) => movie.id === current.id) ? current : moodMovies[0]));
  }, [moodMovies]);

  const visibleMovies = useMemo(() => {
    return moodMovies.slice(0, page * itemsPerPage);
  }, [moodMovies, page]);

  if (!mood) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cinema-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cinema-modal"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="panel-label">Cozy Escape Widget</span>
                <h2>{MOODS[mood].label} Cinema Escape</h2>
                <p className="modal-sub">
                  Discover over 600+ original-postered movies curated strictly for your active **{MOODS[mood].label}** state.
                </p>
              </div>
              <button className="close-btn" onClick={onClose} aria-label="Close modal">
                &times;
              </button>
            </div>

            <div className="search-filter-row" style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search 600+ ${MOODS[mood].label} movies...`}
                className="search-input"
                style={{
                  width: '100%',
                  padding: '0 16px',
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--panel-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-app)'
                }}
              />
            </div>

            {selectedMovie && (
              <section className="web-player-shell" aria-label={`${selectedMovie.platform} web player preview`}>
                <div className="web-player-screen">
                  <MoviePoster movie={selectedMovie} className="web-player-backdrop" />
                  <div className="web-player-vignette" />
                  <div className="web-player-topbar">
                    <span className={selectedMovie.platform === 'Netflix' ? 'stream-brand netflix' : 'stream-brand prime'}>
                      {selectedMovie.platform}
                    </span>
                    <span className="stream-quality">HD</span>
                  </div>
                  <div className="web-player-copy">
                    <span className="panel-label">Now Previewing</span>
                    <h3>{selectedMovie.title}</h3>
                    <p>{selectedMovie.description}</p>
                  </div>
                  <div className="web-player-controls">
                    <button type="button" className="player-play" aria-label="Play preview">
                      <CirclePlay size={34} />
                    </button>
                    <div className="player-timeline">
                      <span />
                    </div>
                    <span className="player-time">00:00 / 02:14</span>
                  </div>
                </div>
                <aside className="web-player-details">
                  <div className="mini-poster">
                    <MoviePoster movie={selectedMovie} />
                  </div>
                  <div>
                    <span className="movie-genre">{selectedMovie.genre}</span>
                    <h3>{selectedMovie.title}</h3>
                    <p>{selectedMovie.platform} mood pick with a {selectedMovie.rating} audience score.</p>
                  </div>
                </aside>
              </section>
            )}
            
            {visibleMovies.length > 0 ? (
              <>
                <div className="movies-grid">
                  {visibleMovies.map((movie) => (
                    <button className={selectedMovie?.id === movie.id ? 'movie-card selected' : 'movie-card'} key={movie.id} type="button" onClick={() => setSelectedMovie(movie)}>
                      <div className="movie-banner-wrap" style={{ aspectRatio: '2 / 3' }}>
                        <MoviePoster movie={movie} />
                        <div className="movie-platform-badge" style={{ '--badge-color': movie.platform === 'Netflix' ? '#e50914' : '#00a8e1' }}>
                          {movie.platform}
                        </div>
                      </div>
                      <div className="movie-info">
                        <div className="movie-title-row">
                          <h3>{movie.title}</h3>
                          <span className="movie-rating">⭐ {movie.rating}</span>
                        </div>
                        <span className="movie-genre">{movie.genre}</span>
                        <p className="movie-desc">{movie.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {moodMovies.length > page * itemsPerPage && (
                  <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => setPage(p => p + 1)}
                      style={{ padding: '0 32px', minHeight: '46px', fontWeight: 'bold' }}
                    >
                      Load More Recommendations ({moodMovies.length - page * itemsPerPage} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                No recommendations matched your search. Try typing another keyword!
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <Sparkles size={16} style={{ color: 'var(--mood-accent)' }} />
            <span>MoodScape</span>
          </div>
          <p className="footer-tagline">
            A beautiful responsive emotional workspace aligning focus time, reflective planning, and cozy breaks around your tone.
          </p>
        </div>
        
        <div className="footer-divider" />
        
        <div className="footer-author-card">
          <span>Designed & Crafted by</span>
          <strong className="author-name">Akshat Vats</strong>
          <span className="author-affiliation" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '500' }}>
            🎓 ABES Engineering College, Ghaziabad
          </span>
          
          <div className="author-connect-tiles" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <a 
              href="https://github.com/akaAkshat246" 
              target="_blank" 
              rel="noopener noreferrer"
              className="connect-tile tile-github"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                color: '#fff',
                background: '#24292e',
                boxShadow: '0 4px 12px rgba(36, 41, 46, 0.25)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
              aria-label="GitHub Profile"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

            <a 
              href="https://www.linkedin.com/in/akshat-vats-b6b1692b6/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="connect-tile tile-linkedin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                color: '#fff',
                background: '#0077b5',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.25)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
              aria-label="LinkedIn Profile"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.instagram.com/who_akshatvats/#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="connect-tile tile-instagram"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                color: '#fff',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                boxShadow: '0 4px 12px rgba(220, 39, 67, 0.25)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
              aria-label="Instagram Profile"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            
            <a 
              href="https://wa.me/917505475455" 
              target="_blank" 
              rel="noopener noreferrer"
              className="connect-tile tile-whatsapp"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                color: '#fff',
                background: '#25D366',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
              aria-label="WhatsApp Chat"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.666.988 3.31 1.492 5.361 1.493 5.4 0 9.79-4.386 9.794-9.786.002-2.614-1.015-5.074-2.864-6.928C17.086 2.08 14.636 1.062 12.012 1.06 6.615 1.06 2.223 5.447 2.22 10.849c-.001 2.087.549 4.12 1.595 5.922l-.999 3.65 3.831-.967zm12.355-6.756c-.328-.164-1.942-.958-2.242-1.068-.3-.11-.518-.165-.736.164-.219.329-.847 1.068-1.039 1.287-.192.219-.384.246-.712.083-.328-.164-1.386-.511-2.641-1.63-1.011-.902-1.694-2.017-1.892-2.346-.198-.328-.021-.506.143-.67.147-.147.328-.384.492-.575.164-.192.219-.328.328-.548.11-.219.055-.411-.027-.575-.082-.164-.736-1.776-1.009-2.434-.266-.643-.538-.553-.736-.563-.19-.01-.41-.01-.629-.01-.219 0-.575.082-.876.411-.3.328-1.149 1.123-1.149 2.738 0 1.615 1.176 3.176 1.341 3.395.164.219 2.314 3.533 5.605 4.954.783.338 1.395.54 1.872.69.788.25 1.505.215 2.072.13.632-.094 1.942-.794 2.216-1.56.274-.767.274-1.424.192-1.56-.082-.136-.3-.219-.629-.383z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        <span>© {new Date().getFullYear()} MoodScape by Akshat Vats. All rights reserved.</span>
        <span>Made with ❤️ in India</span>
      </div>
    </footer>
  );
}

function App() {
  const { mood } = useMood();
  const [view, setView] = useState('home');
  const [cinemaOpen, setCinemaOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('dark');

  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <main className="app-shell">
      <Nav 
        view={view} 
        setView={setView} 
        onOpenScan={() => setScanOpen(true)} 
        themeMode={themeMode}
        toggleTheme={toggleTheme}
      />
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
          {view === 'home' && <Home setView={setView} onOpenCinema={() => setCinemaOpen(true)} />}
          {view === 'planning' && <ReflectivePlanning />}
          {view === 'analytics' && <Analytics />}
          {view === 'focus' && <FocusTools />}
        </motion.div>
      </AnimatePresence>
      <CinemaEscape isOpen={cinemaOpen} onClose={() => setCinemaOpen(false)} mood={mood} />
      <MoodScanModal isOpen={scanOpen} onClose={() => setScanOpen(false)} />
      {view === 'home' && <SiteFooter />}
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <MoodProvider>
    <App />
  </MoodProvider>
);
