import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Calendar, Trash2, Edit3, Filter, ChevronRight, Book, Wind, Sun, CloudRain, Zap, MessageSquare, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { JournalEntry, Mood } from '../types';
import { cn } from '../lib/utils';

const moodIcons: Record<string, React.ElementType> = {
  peaceful: Wind,
  joyful: Sun,
  reflective: MessageSquare,
  melancholy: CloudRain,
  energetic: Zap,
};

const JournalList: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>(() => storage.getEntries());
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<Mood | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) || 
                           entry.content.toLowerCase().includes(search.toLowerCase());
      const matchesMood = filterMood === 'all' || entry.mood === filterMood;
      return matchesSearch && matchesMood;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, search, filterMood]);

  const handleDelete = useCallback((id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    storage.setEntries(updated);
    setDeleteId(null);
  }, [entries]);

  return (
    <div className="space-y-10 pb-32 scroll-container h-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="section-header">Your Reflections</p>
          <h2 className="screen-title">Journal Archive</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reflections..." 
              className="w-full input-field pl-12 pr-6"
            />
          </div>
          <button 
            onClick={() => navigate('/journal/new')}
            className="btn-primary"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Entry</span>
          </button>
        </div>
      </header>

      {/* Mood Quick Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scroll-container">
        <button 
          onClick={() => setFilterMood('all')}
          className={cn(
            "px-6 py-2.5 rounded-full font-sans font-bold uppercase tracking-widest text-[10px] transition-all whitespace-nowrap",
            filterMood === 'all' ? 'bg-primary text-on-primary shadow-lg' : 'glass text-on-surface-variant hover:bg-white/10'
          )}
        >
          All
        </button>
        {(['peaceful', 'joyful', 'reflective', 'melancholy', 'energetic'] as Mood[]).map((mood) => {
          const Icon = moodIcons[mood] || MessageSquare;
          return (
            <button 
              key={mood}
              onClick={() => setFilterMood(mood)}
              className={cn(
                "px-6 py-2.5 rounded-full font-sans font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 whitespace-nowrap",
                filterMood === mood ? 'bg-primary text-on-primary shadow-lg' : 'glass text-on-surface-variant hover:bg-white/10'
              )}
            >
              <Icon size={14} />
              {mood}
            </button>
          );
        })}
      </div>

      {/* Entries List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05, duration: 0.35, ease: "easeOut" }}
                className="card group relative overflow-hidden p-6"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary bg-primary/5">
                        {React.createElement(moodIcons[entry.mood] || MessageSquare, { size: 24 })}
                      </div>
                      <div className="min-w-0">
                        <p className="caption-text">
                          {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <h3 className="text-xl font-serif font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                          {entry.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="body-text line-clamp-2 opacity-70">
                      {entry.content}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 glass rounded-full text-[10px] font-bold uppercase tracking-widest text-primary/60">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => navigate(`/journal/edit/${entry.id}`)}
                      className="w-10 h-10 glass rounded-xl flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(entry.id)}
                      className="w-10 h-10 glass rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-6"
            >
              <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
                <Book size={32} className="opacity-20 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="screen-title opacity-60">No reflections found</h3>
                <p className="body-text opacity-40 max-w-xs mx-auto">Start capturing your thoughts and memories to see them here.</p>
              </div>
              <button 
                onClick={() => navigate('/journal/new')}
                className="btn-secondary"
              >
                Write First Entry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
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
                <h3 className="screen-title">Delete Entry?</h3>
                <p className="body-text">This action cannot be undone. Your reflection will be lost.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteId)}
                  className="btn-primary bg-red-500 text-white flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalList;
