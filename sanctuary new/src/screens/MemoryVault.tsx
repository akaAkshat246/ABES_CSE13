import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  Plus, Trash2, Maximize2, X, FileText, Video, Image as ImageIcon, 
  Search, Filter, AlertCircle, Sparkles, Loader2, Wand2, 
  Music, Archive, Download, Play, Pause, ZoomIn
} from 'lucide-react';
import { storage } from '../lib/storage';
import { geminiService } from '../services/gemini';
import { Memory } from '../types';
import { cn } from '../lib/utils';

const MemoryVault: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>(() => storage.getMemories());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Memory['type'] | 'all'>('all');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [pendingMemory, setPendingMemory] = useState<Partial<Memory> | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterType === 'all' || m.type === filterType;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [memories, searchQuery, filterType]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      let type: Memory['type'] = 'other';
      
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type === 'application/pdf') type = 'pdf';
      else if (
        file.type.includes('word') || 
        file.type.includes('document') || 
        file.type.includes('excel') || 
        file.type.includes('sheet') || 
        file.type.includes('powerpoint') || 
        file.type.includes('presentation') || 
        file.type.includes('text/plain')
      ) type = 'doc';

      setPendingMemory({
        id: Date.now().toString(),
        title: file.name,
        url: base64,
        type,
        date: new Date().toISOString(),
        tags: [],
        caption: ''
      });
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleSavePending = () => {
    if (!pendingMemory || !pendingMemory.title) return;
    const newMemory = pendingMemory as Memory;
    const updated = [newMemory, ...memories];
    setMemories(updated);
    storage.setMemories(updated);
    setPendingMemory(null);
  };

  const handleGenerateCaption = async () => {
    if (!pendingMemory?.title) return;
    setIsGeneratingCaption(true);
    setAiError(null);
    try {
      const caption = await geminiService.suggestMemoryCaption(pendingMemory.title);
      setPendingMemory(prev => prev ? { ...prev, caption } : null);
    } catch (error) {
      setAiError("Could not connect to AI");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleDelete = useCallback((id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    storage.setMemories(updated);
    setShowDeleteConfirm(null);
    if (selectedMemory?.id === id) setSelectedMemory(null);
  }, [memories, selectedMemory]);

  const getFileIcon = (type: Memory['type']) => {
    switch (type) {
      case 'video': return <Video size={20} />;
      case 'audio': return <Music size={20} />;
      case 'pdf': return <FileText size={20} />;
      case 'doc': return <FileText size={20} />;
      case 'other': return <Archive size={20} />;
      default: return <ImageIcon size={20} />;
    }
  };

  return (
    <div className="space-y-8 pb-20 overflow-x-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="screen-title">Memory Vault</h1>
          <p className="caption-text">Your safe space for precious moments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
            <input 
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-12"
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Memory</span>
          </button>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
            className="hidden"
          />
        </div>
      </header>

      {/* Filter Tabs - No horizontal scroll, wrapping grid */}
      <div className="flex flex-wrap gap-2">
        {['all', 'image', 'video', 'audio', 'pdf', 'doc', 'other'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={cn(
              "px-4 py-1.5 rounded-full font-sans font-semibold text-[0.65rem] uppercase tracking-widest transition-all",
              filterType === type 
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                : "glass text-on-surface-variant hover:bg-white/10"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredMemories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-32 h-32 text-primary/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="screen-title text-on-surface-variant opacity-50">Your vault is empty</h3>
            <p className="body-text opacity-50">Add your first memory to keep it safe forever.</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            Add Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-hidden">
          {filteredMemories.map((memory) => (
            <motion.div
              layout
              key={memory.id}
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square rounded-[16px] overflow-hidden group cursor-pointer shadow-sm"
              onClick={() => setSelectedMemory(memory)}
            >
              {/* Content */}
              <div className="w-full h-full bg-surface-container-low">
                {memory.type === 'image' ? (
                  <img 
                    src={memory.url} 
                    alt={memory.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center glass p-4 text-center gap-2">
                    {getFileIcon(memory.type)}
                  </div>
                )}
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 glass rounded-full border border-white/20 z-10">
                <span className="text-[0.6rem] font-bold font-sans uppercase tracking-wider text-primary">
                  {memory.type}
                </span>
              </div>

              {/* Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/30 backdrop-blur-md border-t border-white/10">
                <p className="text-[0.7rem] font-medium text-white truncate px-1">
                  {memory.title}
                </p>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(memory.id);
                  }}
                  className="w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Fullscreen Preview */}
      <AnimatePresence>
        {selectedMemory && (
          <PreviewModal 
            memory={selectedMemory} 
            onClose={() => setSelectedMemory(null)} 
          />
        )}
      </AnimatePresence>

      {/* New Memory Modal */}
      <AnimatePresence>
        {pendingMemory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <div className="card max-w-lg w-full space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="screen-title">New Memory</h3>
                <button onClick={() => setPendingMemory(null)} className="btn-ghost p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden bg-surface-container-low">
                {pendingMemory.type === 'image' ? (
                  <img src={pendingMemory.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : pendingMemory.type === 'video' ? (
                  <video src={pendingMemory.url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center glass gap-3">
                    {getFileIcon(pendingMemory.type as any)}
                    <p className="caption-text">{pendingMemory.title}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="section-header">Title</label>
                  <input 
                    type="text"
                    value={pendingMemory.title}
                    onChange={(e) => setPendingMemory({ ...pendingMemory, title: e.target.value })}
                    className="input-field w-full"
                    placeholder="Memory title..."
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="section-header">Caption (Optional)</label>
                    <button 
                      onClick={handleGenerateCaption}
                      disabled={isGeneratingCaption || !pendingMemory.title}
                      className="text-[0.7rem] font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                    >
                      {isGeneratingCaption ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      Generate poetic caption
                    </button>
                  </div>
                  <textarea 
                    value={pendingMemory.caption}
                    onChange={(e) => setPendingMemory({ ...pendingMemory, caption: e.target.value })}
                    className="input-field w-full min-h-[80px] resize-none"
                    placeholder="Add a poetic caption..."
                  />
                  {aiError && <p className="text-[10px] text-red-500 italic">{aiError}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPendingMemory(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSavePending} className="btn-primary flex-1">Save to Vault</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <div className="card max-w-sm w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="screen-title">Delete Memory?</h3>
                <p className="body-text">This action cannot be undone. This moment will be removed from your vault.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
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

const PreviewModal: React.FC<{ memory: Memory; onClose: () => void }> = ({ memory, onClose }) => {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0]);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 z-10">
        <div className="space-y-1">
          <h2 className="screen-title text-white">{memory.title}</h2>
          <p className="caption-text text-white/50">
            {new Date(memory.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {memory.type === 'image' && (
            <button 
              onClick={() => setIsZoomed(!isZoomed)}
              className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ZoomIn size={24} className={cn(isZoomed && "text-primary")} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      
      <motion.div 
        style={{ y, opacity }}
        drag={!isZoomed ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 150) onClose();
        }}
        className="flex-1 flex items-center justify-center p-6 relative cursor-grab active:cursor-grabbing"
      >
        {memory.type === 'image' ? (
          <div className="relative max-w-full max-h-full flex flex-col items-center gap-6">
            <motion.img 
              src={memory.url} 
              alt={memory.title}
              animate={{ scale: isZoomed ? 1.8 : 1 }}
              className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg"
              referrerPolicy="no-referrer"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => setIsZoomed(!isZoomed)}
            />
            {!isZoomed && memory.caption && (
              <p className="max-w-2xl text-center font-serif italic text-xl text-white/90 leading-relaxed">
                "{memory.caption}"
              </p>
            )}
          </div>
        ) : memory.type === 'video' ? (
          <video 
            src={memory.url} 
            controls 
            autoPlay
            className="max-w-full max-h-full shadow-2xl rounded-lg"
          />
        ) : memory.type === 'audio' ? (
          <div className="glass p-12 rounded-3xl flex flex-col items-center gap-8 text-center max-w-md w-full">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Music size={48} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="hero-text text-white">{memory.title}</h3>
              <p className="body-text text-white/60">Audio Memory</p>
            </div>
            <audio controls src={memory.url} className="w-full" />
          </div>
        ) : (
          <div className="glass p-12 rounded-3xl flex flex-col items-center gap-6 text-center max-w-md w-full">
            <FileText size={80} className="text-primary" />
            <div className="space-y-2">
              <h3 className="hero-text text-white">{memory.title}</h3>
              <p className="body-text text-white/60">This {memory.type.toUpperCase()} file is ready for download.</p>
            </div>
            <a 
              href={memory.url} 
              download={memory.title}
              className="btn-primary w-full"
            >
              <Download size={20} />
              Download File
            </a>
          </div>
        )}
      </motion.div>
      
      {/* Swipe hint */}
      <div className="p-6 text-center">
        <p className="text-[0.6rem] text-white/30 uppercase tracking-[0.2em]">Swipe down to close</p>
      </div>
    </motion.div>
  );
};

export default MemoryVault;
