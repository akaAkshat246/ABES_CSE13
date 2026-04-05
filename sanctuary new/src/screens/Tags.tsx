import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Tag as TagIcon, Trash2, X, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { JournalEntry, Tag } from '../types';

const TAG_COLORS = ['#00342b', '#775a19', '#4a90d9', '#9b59b6', '#e74c3c', '#27ae60', '#f39c12', '#1abc9c'];
const SHEET_SPRING = { type: 'spring', stiffness: 340, damping: 34 } as const;

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>(() => storage.getTags());
  const [entries] = useState<JournalEntry[]>(() => storage.getEntries());
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const countsByTag = useMemo(() => {
    const counts = new Map<string, number>();
    tags.forEach((tag) => {
      counts.set(tag.id, storage.getEntriesByTag(tag.id).length);
    });
    return counts;
  }, [tags]);

  const activeTag = useMemo(() => {
    return activeTagId ? tags.find((tag) => tag.id === activeTagId) ?? null : null;
  }, [activeTagId, tags]);

  const activeEntries = useMemo(() => {
    if (!activeTagId) return [];
    return storage
      .getEntriesByTag(activeTagId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTagId, tags, entries]);

  const createTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    const created = storage.createTag(name, newTagColor);
    setTags(storage.getTags());
    setShowCreateSheet(false);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[(tags.length + 1) % TAG_COLORS.length]);
    setActiveTagId(created.id);
  };

  const removeTag = (id: string) => {
    storage.deleteTag(id);
    setTags(storage.getTags());
    if (activeTagId === id) setActiveTagId(null);
    setDeleteId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-[calc(96px+env(safe-area-inset-bottom))] scroll-container">
      <header className="flex items-center justify-between gap-4">
        <h1 className="screen-title">Tags</h1>
        <motion.button
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 420, damping: 25 }}
          onClick={() => setShowCreateSheet(true)}
          className="w-11 h-11 rounded-full btn-primary !px-0"
          aria-label="New Tag"
          title="New Tag"
        >
          <Plus size={20} />
        </motion.button>
      </header>

      {tags.length === 0 ? (
        <div className="card py-14 text-center px-6">
          <p className="body-text">No tags yet. Create your first tag to organize your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((tag) => (
            <motion.div
              whileTap={{ scale: 0.995 }}
              key={tag.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTagId((prev) => (prev === tag.id ? null : tag.id))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTagId((prev) => (prev === tag.id ? null : tag.id));
                }
              }}
              aria-label={`Open tag ${tag.name}`}
              className="w-full card p-4 sm:p-5 flex items-center justify-between text-left list-item"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                <p className="font-sans font-semibold text-on-surface truncate">{tag.name}</p>
                <p className="caption-text">({countsByTag.get(tag.id) ?? 0})</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(tag.id);
                }}
                className="w-9 h-9 rounded-xl glass text-red-500 flex items-center justify-center"
                aria-label={`Delete ${tag.name}`}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {activeTag && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="section-header">Entries tagged "{activeTag.name}"</h2>
          {activeEntries.length === 0 ? (
            <div className="card p-6">
              <p className="caption-text">No entries found for this tag.</p>
            </div>
          ) : (
            activeEntries.map((entry) => (
              <div key={entry.id} className="card p-4 sm:p-5 list-item">
                <p className="caption-text">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <h3 className="font-sans font-bold text-on-surface mt-1">{entry.title}</h3>
                <p className="body-text mt-1 line-clamp-2">{entry.content}</p>
              </div>
            ))
          )}
        </motion.section>
      )}

      <AnimatePresence>
        {showCreateSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateSheet(false)}
              className="fixed inset-0 z-[120] bg-black/25 backdrop-blur-[4px]"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={SHEET_SPRING}
              className="fixed bottom-0 left-0 right-0 z-[130] px-4 pb-4"
            >
              <div className="card max-w-3xl mx-auto rounded-t-[24px] rounded-b-[18px] p-0 overflow-hidden">
                <div className="flex justify-center pt-3">
                  <div className="w-9 h-1 rounded-full bg-outline-variant" />
                </div>
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="screen-title text-[1.2rem]">Create tag</h3>
                  <button title="Close" onClick={() => setShowCreateSheet(false)} className="w-9 h-9 rounded-full glass flex items-center justify-center">
                    <X size={18} />
                  </button>
                </div>
                <div className="px-5 py-5 space-y-5">
                  <input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    className="w-full input-field"
                    maxLength={24}
                  />
                  <div className="flex flex-wrap gap-3">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className="w-9 h-9 rounded-full border-2"
                        style={{ backgroundColor: color, borderColor: newTagColor === color ? 'white' : 'transparent' }}
                        aria-label={`Pick color ${color}`}
                      />
                    ))}
                  </div>
                  <button onClick={createTag} className="btn-primary w-full">
                    Create Tag
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <div className="card max-w-sm w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="screen-title">Delete Tag?</h3>
                <p className="body-text">This will remove the tag from related entries.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={() => removeTag(deleteId)} className="btn-primary bg-red-500 text-white flex-1">
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

export default Tags;
