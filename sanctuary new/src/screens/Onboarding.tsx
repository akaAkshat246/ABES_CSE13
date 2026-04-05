import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Heart, Shield, Sparkles, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Sanctuary',
    description: 'A quiet space for your thoughts, memories, and mindful moments.',
    icon: Heart,
    color: '#7ebdac',
  },
  {
    id: 'privacy',
    title: 'Your Data, Your Control',
    description: 'Everything is stored locally on your device. No cloud, no tracking, just peace of mind.',
    icon: Shield,
    color: '#fed488',
  },
  {
    id: 'mindful',
    title: 'Stay Mindful',
    description: 'Set gentle reminders and keep a digital vault of your most precious memories.',
    icon: Sparkles,
    color: '#00342b',
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const step = STEPS[currentStep];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #00342b 0%, #07110f 65%, #000000 100%)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-md w-full space-y-12 text-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 100 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-10"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
            >
              <step.icon size={48} />
            </div>
            
            <div className="space-y-4">
              <h1 className="hero-text text-[2.5rem]" style={{ color: 'rgba(255,255,255,0.95)' }}>{step.title}</h1>
              <p className="body-text text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-center gap-8">
          {/* Progress Dots */}
          <div className="flex gap-3">
            {STEPS.map((_, index) => (
              <button
                key={index}
                title={`Go to step ${index + 1}`}
                onClick={() => {
                  setDirection(index > currentStep ? 1 : -1);
                  setCurrentStep(index);
                }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  currentStep === index ? "w-8" : ""
                )}
                style={{ backgroundColor: currentStep === index ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 w-full">
            {currentStep > 0 && (
              <button 
                onClick={handlePrev}
                className="btn-secondary flex-1"
                style={{ color: 'rgba(255,255,255,0.95)', borderColor: 'rgba(255,255,255,0.4)' }}
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
            )}
            <button 
              onClick={handleNext}
              className="btn-primary flex-[2] h-14 text-lg"
              style={{ backgroundColor: '#ffffff', color: '#00342b' }}
            >
              <span>{currentStep === STEPS.length - 1 ? 'Get Started' : 'Continue'}</span>
              {currentStep === STEPS.length - 1 ? <Check size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
