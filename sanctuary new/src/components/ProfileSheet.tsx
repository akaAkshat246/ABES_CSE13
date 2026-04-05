import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Save, Download, Trash2, Calendar, User, ChevronRight } from 'lucide-react';
import { UserProfile, JournalEntry, Memory, Reminder } from '../types';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const ProfileSheet: React.FC<ProfileSheetProps> = ({ isOpen, onClose, profile, onUpdate }) => {
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState(profile.gender || 'Prefer not to say');
  const [birthday, setBirthday] = useState(profile.birthday);
  const [avatar, setAvatar] = useState(profile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entries = storage.getEntries();
  const memories = storage.getMemories();
  const reminders = storage.getReminders();

  // Calculate streak
  const calculateStreak = (entries: JournalEntry[]) => {
    if (entries.length === 0) return 0;
    const dates = entries
      .map(e => new Date(e.date).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const uniqueDates = Array.from(new Set(dates));
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      const current = new Date(uniqueDates[i]);
      const next = i + 1 < uniqueDates.length ? new Date(uniqueDates[i + 1]) : null;
      
      streak++;
      
      if (next) {
        const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 1) break;
      }
    }
    return streak;
  };

  const streak = calculateStreak(entries);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      name,
      gender: gender as any,
      birthday,
      avatar,
    };
    onUpdate(updatedProfile);
    onClose();
  };

  const handleExport = () => {
    storage.exportData();
  };

  const handleClear = () => {
    if (window.confirm('Are you absolutely sure? This will delete ALL your data permanently.')) {
      storage.clearAllData();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 z-[210] bg-background rounded-t-[32px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="relative pt-2 pb-6 px-6 flex flex-col items-center">
              <div className="w-12 h-1.5 bg-outline-variant rounded-full mb-6 opacity-40" />
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-variant transition-colors"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>

              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary text-2xl font-bold">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <h2 className="mt-4 text-2xl font-serif text-on-surface">{name}</h2>
              <p className="text-sm text-on-surface-variant opacity-70">
                {gender} • {formatDate(birthday)}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-8">
              {/* Stats Row */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[
                  { label: 'Entries', value: entries.length },
                  { label: 'Memories', value: memories.length },
                  { label: 'Reminders', value: reminders.length },
                  { label: 'Streak', value: `${streak}d` },
                ].map((stat, i) => (
                  <div key={i} className="flex-shrink-0 px-4 py-2 glass rounded-full border border-white/10 flex items-center gap-2">
                    <span className="text-xs font-medium text-on-surface-variant">{stat.label}</span>
                    <span className="text-sm font-bold text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Edit Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant opacity-60 ml-1">
                    Display Name
                  </label>
                  <div className="glass rounded-2xl p-1 border border-white/10">
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent px-4 py-3 outline-none text-on-surface"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant opacity-60 ml-1">
                    Gender
                  </label>
                  <div className="glass rounded-2xl p-1 border border-white/10 flex flex-wrap gap-1">
                    {(['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setGender(opt)}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                          gender === opt 
                            ? "bg-primary text-on-primary shadow-sm" 
                            : "text-on-surface-variant hover:bg-white/5"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant opacity-60 ml-1">
                    Birthday
                  </label>
                  <div className="glass rounded-2xl p-1 border border-white/10">
                    <input 
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full bg-transparent px-4 py-3 outline-none text-on-surface [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Save size={20} />
                  Save Changes
                </motion.button>

                <button
                  onClick={handleExport}
                  className="w-full py-4 text-on-surface-variant font-medium flex items-center justify-center gap-2 hover:bg-surface-variant rounded-2xl transition-colors"
                >
                  <Download size={18} />
                  Export My Data
                </button>

                <button
                  onClick={handleClear}
                  className="w-full py-4 font-medium flex items-center justify-center gap-2 hover:bg-red-500/5 rounded-2xl transition-colors"
                  style={{ color: 'var(--color-error)' }}
                >
                  <Trash2 size={18} />
                  Clear All Data
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileSheet;
