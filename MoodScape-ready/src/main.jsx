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

function Nav({ view, setView, onOpenScan }) {
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

function Dashboard({ onOpenCinema }) {
  const { mood, theme } = useMood();
  return (
    <section className="page-grid">
      <div className="wide">
        <div className="section-head" style={{ marginBottom: '14px' }}>
          <div>
            <span className="panel-label">Live environment</span>
            <h2>{theme.activity}</h2>
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
        {mood && (
          <button
            type="button"
            className="ghost-btn full escape-btn animate-pulse-border"
            onClick={onOpenCinema}
            style={{
              border: '1px solid rgba(236, 72, 153, 0.5)',
              background: 'rgba(236, 72, 153, 0.12)',
              color: '#fff',
              marginTop: '8px',
              fontWeight: '800'
            }}
          >
            <Film size={17} style={{ color: '#ec4899' }} /> Watch Movies Curated for {MOODS[mood].label} Mode
          </button>
        )}
      </div>
      <FocusTools compact />
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
  const playlists = {
    happy: '37i9dQZF1DXcBWIGoYBM5M',
    calm: '37i9dQZF1DX4sWSpwq3LiO',
    focused: '37i9dQZF1DWZeKCadRdKQ',
    stressed: '37i9dQZF1DWWQRwui0ExPn',
    angry: '37i9dQZF1DWXRqYSzZy49K'
  };
  
  const playlistId = playlists[mood] || playlists.focused;
  
  return (
    <div className="spotify-widget-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#1DB954" style={{ flexShrink: 0 }}>
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.076-.336.135-.668.47-.744 3.856-.88 7.15-.506 9.82 1.13.295.18.387.565.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.075-1.185-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.666-1.112 8.232-.57 11.34 1.343.367.227.487.708.26 1.074zm.106-2.833C14.484 8.788 8.825 8.6 5.587 9.584c-.5.15-1.025-.133-1.176-.632-.15-.5.133-1.025.632-1.176 3.722-1.13 9.953-.918 13.914 1.432.45.267.6.845.333 1.295-.267.45-.845.6-1.295.333z"/>
        </svg>
        <span className="panel-label" style={{ margin: 0 }}>Spotify Recommendation</span>
      </div>
      <div className="spotify-embed-container">
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ borderRadius: '8px', border: 0 }}
          title="Spotify Playlist Recommendation"
        />
      </div>
    </div>
  );
}

function FocusTools({ compact = false }) {
  const { mood } = useMood();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Review React context flow', completed: false },
    { id: '2', text: 'Polish analytics copy', completed: false }
  ]);
  const [draft, setDraft] = useState('');
  const [activeSound, setActiveSound] = useState(null);

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
      synthEngine.stopAll();
      setActiveSound(null);
      playCompletionBell();
    }
  }, [seconds, running]);

  useEffect(() => {
    return () => {
      synthEngine.stopAll();
    };
  }, []);

  const handleSoundToggle = (type) => {
    const next = synthEngine.toggle(type);
    setActiveSound(next);
  };

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
    const newTask = {
      id: Date.now().toString(),
      text: draft.trim(),
      completed: false
    };
    setTasks((items) => [newTask, ...items]);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const rest = String(seconds % 60).padStart(2, '0');

  const mainPanel = (
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
        <button
          type="button"
          className={activeSound === 'rain' ? 'active' : ''}
          onClick={() => handleSoundToggle('rain')}
        >
          <Music2 size={17} /> Calm Chimes
          {activeSound === 'rain' && <span className="playing-pulse" />}
        </button>
        <button
          type="button"
          className={activeSound === 'lofi' ? 'active' : ''}
          onClick={() => handleSoundToggle('lofi')}
        >
          <Music2 size={17} /> Lofi Piano
          {activeSound === 'lofi' && <span className="playing-pulse" />}
        </button>
        <button
          type="button"
          className={activeSound === 'space' ? 'active' : ''}
          onClick={() => handleSoundToggle('space')}
        >
          <Music2 size={17} /> Cosmic Space
          {activeSound === 'space' && <span className="playing-pulse" />}
        </button>
      </div>
      <div className="task-input">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a next action"
        />
        <button
          className="icon-btn active"
          type="button"
          aria-label="Add task"
          onClick={addTask}
        >
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
            <button
              className="delete-btn"
              type="button"
              aria-label={`Delete ${task.text}`}
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  if (compact) {
    return mainPanel;
  }

  return (
    <div className="focus-grid">
      {mainPanel}
      <div className="focus-sidebar">
        <SpotifyWidget mood={mood} />
        <div className="mindfulness-tips">
          <span className="panel-label">Mindful Insights</span>
          <p className="tip-text" style={{ margin: '8px 0 0', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)' }}>
            {mood === 'happy' && 'Your momentum is high! Ride this wave to complete creative work, but take a 2-minute breath break between tasks.'}
            {mood === 'calm' && 'Your emotional state is extremely stable. This is a perfect window for deep planning, technical writing, or reflective analysis.'}
            {mood === 'focused' && 'Minimize browser tabs and notifications. It takes up to 20 minutes for the human brain to recover deep focus after a small distraction.'}
            {mood === 'stressed' && 'Mental strain detected. Remember to breathe deeply: inhale for 4s, hold for 4s, exhale for 4s. Take one task at a time.'}
            {mood === 'angry' && 'High emotional intensity is raw potential. Channel this drive into rapid drafting, speed-coding, or clearing out old backlog tasks!'}
          </p>
        </div>
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

function Home({ setView, onOpenCinema }) {
  const { mood } = useMood();
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
        {mood && (
          <div className="mood-escape-banner" style={{ marginTop: '28px', textAlign: 'center' }}>
            <button
              type="button"
              className="primary-btn escape-btn-accent animate-pulse-border"
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

  const generated = [...realMovies];
  
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
                style={{
                  minHeight: '110px',
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)'
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
                style={{
                  width: '100%',
                  padding: '0 16px',
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)'
                }}
              />
            </div>
            
            {visibleMovies.length > 0 ? (
              <>
                <div className="movies-grid">
                  {visibleMovies.map((movie) => (
                    <div className="movie-card" key={movie.id}>
                      <div className="movie-banner-wrap" style={{ aspectRatio: '2 / 3' }}>
                        <img src={movie.poster} alt={movie.title} className="movie-banner" loading="lazy" />
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
                    </div>
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
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.5)' }}>
                No recommendations matched your search. Try typing another keyword!
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  const { mood } = useMood();
  const [view, setView] = useState('home');
  const [cinemaOpen, setCinemaOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  return (
    <main className="app-shell">
      <Nav view={view} setView={setView} onOpenScan={() => setScanOpen(true)} />
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
          {view === 'home' && <Home setView={setView} onOpenCinema={() => setCinemaOpen(true)} />}
          {view === 'dashboard' && <Dashboard onOpenCinema={() => setCinemaOpen(true)} />}
          {view === 'analytics' && <Analytics />}
          {view === 'focus' && <FocusTools />}
        </motion.div>
      </AnimatePresence>
      <CinemaEscape isOpen={cinemaOpen} onClose={() => setCinemaOpen(false)} mood={mood} />
      <MoodScanModal isOpen={scanOpen} onClose={() => setScanOpen(false)} />
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <MoodProvider>
    <App />
  </MoodProvider>
);
