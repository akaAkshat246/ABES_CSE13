import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Save, Trash2, Clock, Hash, AlertCircle, Sparkles, Wand2, Brain, Loader2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { geminiService } from '../services/gemini';
import { JournalEntry, Mood } from '../types';
import { cn } from '../lib/utils';

const MOODS: { type: Mood; label: string; color: string }[] = [
  { type: 'peaceful', label: 'Peaceful', color: '#7ebdac' },
  { type: 'joyful', label: 'Joyful', color: '#fed488' },
  { type: 'reflective', label: 'Reflective', color: '#a8c0b8' },
  { type: 'melancholy', label: 'Melancholy', color: '#4a6560' },
  { type: 'energetic', label: 'Energetic', color: '#00342b' },
];

const JournalEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Partial<JournalEntry>>(() => {
    if (id) {
      const existing = storage.getEntries().find(e => e.id === id);
      if (existing) return { ...existing, tagIds: existing.tagIds || [] };
    }
    return storage.getDraft() || {
      title: '',
      content: '',
      mood: 'peaceful',
      tags: [],
      tagIds: [],
      date: new Date().toISOString(),
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // AI States
  const [isInspiring, setIsInspiring] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<{ emotion: string; encouragement: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const initialEntryRef = useRef(JSON.stringify(entry));

  // Word count
  const wordCount = useMemo(() => {
    return entry.content?.trim() ? entry.content.trim().split(/\s+/).length : 0;
  }, [entry.content]);

  // Auto-save draft
  useEffect(() => {
    const timer = setInterval(() => {
      if (hasUnsavedChanges && !id) {
        storage.setDraft(entry);
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [entry, hasUnsavedChanges, id]);

  const handleChange = useCallback((updates: Partial<JournalEntry>) => {
    setEntry(prev => {
      const next = { ...prev, ...updates };
      setHasUnsavedChanges(JSON.stringify(next) !== initialEntryRef.current);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!entry.title?.trim()) return;

    setIsSaving(true);
    try {
      const entries = storage.getEntries();
      const tagIdsFromNames = (entry.tags || []).map((name) => storage.createTag(name, '#00342b').id);
      const newEntry: JournalEntry = {
        id: id || Date.now().toString(),
        title: entry.title.trim(),
        content: entry.content || '',
        mood: entry.mood || 'peaceful',
        tags: entry.tags || [],
        tagIds: entry.tagIds?.length ? entry.tagIds : tagIdsFromNames,
        date: entry.date || new Date().toISOString(),
      };

      if (id) {
        const index = entries.findIndex(e => e.id === id);
        if (index !== -1) entries[index] = newEntry;
      } else {
        entries.unshift(newEntry);
        storage.setDraft(null); // Clear draft on successful save
      }

      storage.setEntries(entries);
      setHasUnsavedChanges(false);
      initialEntryRef.current = JSON.stringify(newEntry);
      navigate('/journal');
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setIsSaving(false);
    }
  }, [entry, id, navigate]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    const entries = storage.getEntries().filter(e => e.id !== id);
    storage.setEntries(entries);
    navigate('/journal');
  }, [id, navigate]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedConfirm(true);
    } else {
      navigate('/journal');
    }
  }, [hasUnsavedChanges, navigate]);

  const handleInspireMe = async () => {
    setIsInspiring(true);
    setAiError(null);
    try {
      const prompt = await geminiService.getJournalPrompt();
      setAiPrompt(prompt);
    } catch (error) {
      setAiError("Could not connect to AI");
    } finally {
      setIsInspiring(false);
    }
  };

  const handleAnalyzeMood = async () => {
    if (!entry.content || entry.content.length < 10) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const analysis = await geminiService.analyzeMood(entry.content);
      setMoodAnalysis(analysis);
    } catch (error) {
      setAiError("Could not connect to AI");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestTitle = async () => {
    if (!entry.content || entry.content.length < 10) return;
    setIsSuggestingTitle(true);
    setAiError(null);
    try {
      const suggestedTitle = await geminiService.suggestTitle(entry.content);
      handleChange({ title: suggestedTitle });
    } catch (error) {
      setAiError("Could not connect to AI");
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  const getMoodColor = (emotion: string) => {
    const e = emotion.toLowerCase();
    if (e.includes('happy') || e.includes('joy') || e.includes('teal')) return 'bg-teal-500/20 text-teal-600 dark:text-teal-400';
    if (e.includes('sad') || e.includes('blue') || e.includes('melancholy')) return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
    if (e.includes('anxious') || e.includes('amber') || e.includes('worry')) return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
    if (e.includes('angry') || e.includes('red') || e.includes('rage')) return 'bg-red-500/20 text-red-600 dark:text-red-400';
    if (e.includes('grateful') || e.includes('gold') || e.includes('thankful')) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
    return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <button 
          onClick={handleBack}
          aria-label="Go back"
          title="Back"
          className="btn-ghost p-2 rounded-full hover:bg-primary/10"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex items-center gap-3">
          {lastSaved && !id && (
            <span className="caption-text flex items-center gap-1">
              <Clock size={12} />
              Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {id && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete entry"
              title="Delete entry"
              className="btn-ghost text-red-500 hover:bg-red-500/10"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!entry.title?.trim() || isSaving}
            className={cn(
              "btn-primary",
              (!entry.title?.trim() || isSaving) && "opacity-50 cursor-not-allowed"
            )}
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <input 
              type="text"
              placeholder="Title your thoughts..."
              value={entry.title}
              onChange={(e) => handleChange({ title: e.target.value })}
              className="flex-1 bg-transparent hero-text text-[2rem] border-none outline-none placeholder:opacity-30 selectable"
            />
            {!entry.title && wordCount > 30 && (
              <button 
                onClick={handleSuggestTitle}
                disabled={isSuggestingTitle}
                className="btn-ghost text-xs flex items-center gap-2 opacity-60 hover:opacity-100"
              >
                {isSuggestingTitle ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                Suggest title
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 p-1 glass rounded-full">
            {MOODS.map((m) => (
              <button
                key={m.type}
                onClick={() => handleChange({ mood: m.type })}
                className={cn(
                  "px-4 py-1.5 rounded-full font-sans font-medium text-xs transition-all",
                  entry.mood === m.type 
                    ? "bg-primary text-on-primary shadow-md" 
                    : "text-on-surface-variant hover:bg-white/10"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
            <Hash size={14} className="text-primary" />
            <input 
              type="text"
              placeholder="Add tags (comma separated)"
              value={entry.tags?.join(', ')}
              onChange={(e) => handleChange({ tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '') })}
              onBlur={() => handleChange({ tagIds: (entry.tags || []).map((name) => storage.createTag(name, '#00342b').id) })}
              className="bg-transparent outline-none font-sans text-xs min-w-[150px] selectable"
            />
          </div>
        </div>

        <div className="relative group">
          <textarea 
            placeholder={aiPrompt || "What's on your mind today?"}
            value={entry.content}
            onChange={(e) => handleChange({ content: e.target.value })}
            className="w-full min-h-[400px] bg-transparent body-text text-[1.1rem] leading-relaxed border-none outline-none resize-none placeholder:opacity-30 selectable transition-all duration-700"
          />
          
          <div className="absolute top-0 right-0">
            <button 
              onClick={handleInspireMe}
              disabled={isInspiring}
              className={cn(
                "btn-secondary text-xs h-9 px-4 flex items-center gap-2 transition-all",
                isInspiring && "animate-pulse"
              )}
            >
              {isInspiring ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Inspire Me
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 py-2 px-4 glass rounded-full">
                <span className="caption-text flex items-center gap-1">
                  <Hash size={12} />
                  {wordCount} words
                </span>
              </div>

              {wordCount >= 50 && !moodAnalysis && (
                <button 
                  onClick={handleAnalyzeMood}
                  disabled={isAnalyzing}
                  className={cn(
                    "btn-secondary text-xs h-9 px-4 flex items-center gap-2",
                    isAnalyzing && "animate-pulse"
                  )}
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                  Analyse my mood
                </button>
              )}
            </div>

            <AnimatePresence>
              {moodAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6 space-y-3 border-l-4 border-primary"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest", getMoodColor(moodAnalysis.emotion))}>
                      {moodAnalysis.emotion}
                    </span>
                    <button
                      onClick={() => setMoodAnalysis(null)}
                      aria-label="Close mood analysis"
                      title="Close mood analysis"
                      className="text-on-surface-variant opacity-30 hover:opacity-100"
                    >
                      <AlertCircle size={14} />
                    </button>
                  </div>
                  <p className="body-text italic font-serif text-lg leading-relaxed">
                    "{moodAnalysis.encouragement}"
                  </p>
                </motion.div>
              )}
              {aiError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-500 italic text-center"
                >
                  {aiError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
                <p className="body-text">This action cannot be undone. Your memory will be lost.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="btn-primary bg-red-500 text-white flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Confirmation */}
      <AnimatePresence>
        {showUnsavedConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <div className="card max-w-sm w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Save size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="screen-title">Unsaved Changes</h3>
                <p className="body-text">You have unsaved changes. Do you want to save them before leaving?</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSave}
                  className="btn-primary w-full"
                >
                  Save and Leave
                </button>
                <button 
                  onClick={() => navigate('/journal')}
                  className="btn-secondary w-full"
                >
                  Discard and Leave
                </button>
                <button 
                  onClick={() => setShowUnsavedConfirm(false)}
                  className="btn-ghost w-full"
                >
                  Stay Here
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalEdit;
