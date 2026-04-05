import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Download, Trash2, Shield, Info, ChevronRight, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { storage } from '../lib/storage';
import { Settings as SettingsType } from '../types';
import { cn } from '../lib/utils';

type LegalSheet = 'privacy' | 'terms' | null;

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    body: 'Sanctuary is a completely offline, private application. All your data — journals, memories, reminders, and personal information — is stored exclusively on your device using localStorage. We do not collect, transmit, or share any of your personal data. We have no servers, no accounts, no tracking. Your sanctuary is yours alone. Last updated: April 2026.',
  },
  terms: {
    title: 'Terms of Service',
    body: 'By using Sanctuary, you agree to use this application for personal, lawful purposes only. Sanctuary is provided as-is without warranties. We are not liable for any data loss — please export your data regularly using the Export feature. This app is intended for personal mindfulness and journaling use only. Last updated: April 2026.',
  },
} as const;

const SHEET_SPRING = { type: 'spring', stiffness: 340, damping: 34 } as const;
const ITEM_TAP = { scale: 0.98 };

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>(() => storage.getSettings());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [legalSheet, setLegalSheet] = useState<LegalSheet>(null);

  const updateSettings = useCallback((updates: Partial<SettingsType>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      storage.setSettings(next);
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    storage.exportData();
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  }, []);

  const handleClearAll = useCallback(() => {
    storage.clearAllData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 scroll-container">
      <header className="space-y-2">
        <h1 className="screen-title">Settings</h1>
        <p className="caption-text">Personalize your Sanctuary experience.</p>
      </header>

      <div className="space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Sun size={20} className="text-primary" />
            <h2 className="section-header">Appearance</h2>
          </div>

          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-sans font-bold text-on-surface">Theme</p>
                <p className="caption-text">Choose your preferred visual style.</p>
              </div>
              <div className="flex p-1 glass rounded-full">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={cn(
                    'px-6 py-2 rounded-full font-sans font-semibold text-xs uppercase tracking-widest transition-all',
                    settings.theme === 'light' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-white/10'
                  )}
                >
                  Light
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={cn(
                    'px-6 py-2 rounded-full font-sans font-semibold text-xs uppercase tracking-widest transition-all',
                    settings.theme === 'dark' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-white/10'
                  )}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-sans font-bold text-on-surface">Font Size</p>
                <p className="caption-text">Adjust text scaling for better readability.</p>
              </div>
              <div className="flex p-1 glass rounded-full">
                {[0.9, 1.0, 1.1].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => updateSettings({ fontSize: scale })}
                    className={cn(
                      'px-6 py-2 rounded-full font-sans font-semibold text-xs transition-all',
                      settings.fontSize === scale ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-white/10'
                    )}
                  >
                    {scale === 0.9 ? 'Small' : scale === 1.0 ? 'Default' : 'Large'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Shield size={20} className="text-primary" />
            <h2 className="section-header">Privacy & Data</h2>
          </div>

          <div className="card space-y-4 p-0 overflow-hidden">
            <motion.button whileTap={ITEM_TAP} onClick={handleExport} className="w-full flex items-center justify-between p-5 text-left list-item">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Download size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-sans font-bold text-on-surface">Export All Data</p>
                  <p className="caption-text">Download a backup of your sanctuary.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant/40" />
            </motion.button>

            <div className="h-px bg-white/10 mx-5" />

            <motion.button
              whileTap={ITEM_TAP}
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-between p-5 text-left list-item group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <Trash2 size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-sans font-bold text-on-surface group-hover:text-red-500 transition-colors">Clear All Data</p>
                  <p className="caption-text">Permanently delete everything.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant/40" />
            </motion.button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Info size={20} className="text-primary" />
            <h2 className="section-header">About</h2>
          </div>

          <div className="card space-y-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <p className="font-sans font-bold text-on-surface">Version</p>
              <p className="caption-text font-bold">1.2.0</p>
            </div>
            <div className="h-px bg-white/10 mx-5" />
            <motion.button whileTap={ITEM_TAP} onClick={() => setLegalSheet('privacy')} className="w-full flex items-center justify-between p-5 text-left list-item">
              <p className="font-sans font-bold text-on-surface">Privacy Policy</p>
              <ChevronRight size={18} className="text-on-surface-variant/40" />
            </motion.button>
            <div className="h-px bg-white/10 mx-5" />
            <motion.button whileTap={ITEM_TAP} onClick={() => setLegalSheet('terms')} className="w-full flex items-center justify-between p-5 text-left list-item">
              <p className="font-sans font-bold text-on-surface">Terms of Service</p>
              <ChevronRight size={18} className="text-on-surface-variant/40" />
            </motion.button>
          </div>

          <div className="text-center py-6">
            <p className="caption-text italic">Made with peace in mind.</p>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <div className="card max-w-sm w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="screen-title">Clear Everything?</h3>
                <p className="body-text">This will permanently delete all your journal entries, memories, and settings. This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleClearAll} className="btn-primary bg-red-500 text-white flex-1">
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-3 rounded-full flex items-center gap-3 border-primary/30"
          >
            <CheckCircle2 size={20} className="text-primary" />
            <span className="font-sans font-bold text-sm">Backup downloaded successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {legalSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalSheet(null)}
              className="fixed inset-0 z-[130] bg-black/25 backdrop-blur-[4px]"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={SHEET_SPRING}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setLegalSheet(null);
              }}
              className="fixed bottom-0 left-0 right-0 z-[140] px-4 pb-4"
            >
              <div className="card max-w-3xl mx-auto rounded-t-[24px] rounded-b-[18px] max-h-[72vh] p-0 overflow-hidden">
                <div className="flex justify-center pt-3">
                  <div className="w-9 h-1 rounded-full bg-outline-variant" />
                </div>
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="screen-title text-[1.2rem]">{LEGAL_CONTENT[legalSheet].title}</h3>
                  <button title="Close" onClick={() => setLegalSheet(null)} className="w-9 h-9 rounded-full glass flex items-center justify-center">
                    <X size={18} />
                  </button>
                </div>
                <div className="px-5 py-4 overflow-y-auto max-h-[55vh] scroll-container">
                  <p className="body-text leading-relaxed selectable">{LEGAL_CONTENT[legalSheet].body}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
