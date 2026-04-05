import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Camera, Calendar, ArrowRight, AlertCircle, Heart } from 'lucide-react';
import { storage } from '../lib/storage';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ProfileCreationProps {
  onComplete: () => void;
}

const ProfileCreation: React.FC<ProfileCreationProps> = ({ onComplete }) => {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    birthday: '',
    avatar: '',
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile(prev => ({ ...prev, avatar: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!profile.name || profile.name.trim().length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }
    if (!profile.birthday) {
      setError("Please select your birthday.");
      return;
    }

    const finalProfile: UserProfile = {
      id: Date.now().toString(),
      name: profile.name.trim(),
      birthday: profile.birthday,
      avatar: profile.avatar || '',
      joinedDate: new Date().toISOString(),
    };

    storage.setProfile(finalProfile);
    onComplete();
  }, [profile, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md w-full space-y-10 p-10"
      >
        <header className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={32} />
          </div>
          <h1 className="hero-text">Create Your Profile</h1>
          <p className="body-text">Let's make Sanctuary feel like home.</p>
        </header>

        <div className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full glass border-2 border-primary/20 flex items-center justify-center cursor-pointer group overflow-hidden"
            >
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={40} className="text-primary/30" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <p className="section-header">Upload Photo</p>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="section-header">Your Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                <input 
                  type="text"
                  placeholder="How should we call you?"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value });
                    setError(null);
                  }}
                  className="input-field w-full pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="section-header">Your Birthday</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                <input 
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => {
                    setProfile({ ...profile, birthday: e.target.value });
                    setError(null);
                  }}
                  className="input-field w-full pl-12"
                />
              </div>
              <p className="caption-text">We'll celebrate with you when the day comes.</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-sans font-semibold"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleSubmit}
            className="btn-primary w-full h-14 text-lg"
          >
            <span>Begin Your Journey</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCreation;
