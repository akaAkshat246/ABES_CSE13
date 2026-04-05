import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, EyeOff, Database, Download, Trash2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

const Privacy: React.FC = () => {
  const handleExport = () => {
    storage.exportData();
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      storage.clearAllData();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 scroll-container">
      <header className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield size={32} />
        </div>
        <h1 className="hero-text">Privacy & Security</h1>
        <p className="body-text">Your sanctuary is built on a foundation of absolute privacy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4 p-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Lock size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-on-surface">Local Storage</h3>
            <p className="caption-text leading-relaxed">
              Every journal entry and memory is stored directly on your device. 
              We never upload your data to any server.
            </p>
          </div>
        </div>

        <div className="card space-y-4 p-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <EyeOff size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-on-surface">No Tracking</h3>
            <p className="caption-text leading-relaxed">
              We don't use any analytics or tracking tools. Your activity in 
              Sanctuary is completely private and invisible to us.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="section-header px-2">Data Management</h2>
        <div className="card p-0 overflow-hidden divide-y divide-white/10">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Download size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="font-sans font-bold text-on-surface">Export Your Data</p>
                <p className="caption-text">Download a full backup of your sanctuary in JSON format.</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-on-surface-variant/40" />
          </button>

          <button 
            onClick={handleClearAll}
            className="w-full flex items-center justify-between p-6 hover:bg-red-500/5 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <Trash2 size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="font-sans font-bold text-on-surface group-hover:text-red-500 transition-colors">Clear All Data</p>
                <p className="caption-text">Permanently delete everything from this device.</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-on-surface-variant/40" />
          </button>
        </div>
      </div>

      <div className="card bg-primary/5 border-primary/20 p-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Database size={24} />
          </div>
          <h3 className="screen-title">Technical Details</h3>
        </div>
        <div className="space-y-4">
          <p className="body-text">
            Sanctuary uses the browser's <strong>localStorage</strong> API to persist your data. 
            This data is tied to your browser and device. Clearing your browser's cache or 
            storage may result in data loss if you haven't exported a backup.
          </p>
          <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-xl text-primary text-sm font-sans font-semibold">
            <AlertCircle size={18} />
            <span>Always keep a regular backup of your data.</span>
          </div>
        </div>
      </div>

      <footer className="text-center py-10">
        <p className="caption-text italic">Your privacy is our promise.</p>
      </footer>
    </div>
  );
};

export default Privacy;
