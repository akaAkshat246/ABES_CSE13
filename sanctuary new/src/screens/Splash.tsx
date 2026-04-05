import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface SplashProps {
  onFinish: () => void;
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #00342b 0%, #07110f 65%, #000000 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute inset-0 blur-3xl rounded-full"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl rotate-12" style={{ background: '#ffffff', color: '#00342b' }}>
            <Heart size={40} fill="currentColor" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="hero-text text-[3rem] tracking-tighter" style={{ color: 'rgba(255,255,255,0.95)' }}>Sanctuary</h1>
            <p className="section-header" style={{ color: 'rgba(255,255,255,0.7)' }}>Your Mindful Space</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#ffffff' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Splash;
