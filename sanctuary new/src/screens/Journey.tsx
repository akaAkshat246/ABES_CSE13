import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { storage } from '../lib/storage';
import { JournalEntry } from '../types';

const TIMELINE_MOOD_COLORS: Record<string, string> = {
  radiant: '#fed488',
  calm: '#00342b',
  neutral: '#9e9e9e',
  low: '#5c7a9e',
  stormy: '#c0392b',
  peaceful: '#00342b',
  joyful: '#fed488',
  reflective: '#9e9e9e',
  melancholy: '#5c7a9e',
  energetic: '#c0392b',
};
const ITEM_SPRING = { type: 'spring', stiffness: 380, damping: 28 } as const;

const Journey: React.FC = () => {
  const navigate = useNavigate();
  const entries = storage.getEntries().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const tags = storage.getTags();

  const tagById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag]));
  }, [tags]);

  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, JournalEntry[]>();
    entries.forEach((entry) => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    });
    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: new Date(items[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      items,
    }));
  }, [entries]);

  const getEntryDotColor = (entry: JournalEntry) => {
    const moodKey = (entry.mood || '').toLowerCase();
    return TIMELINE_MOOD_COLORS[moodKey] ?? 'var(--color-primary)';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-[calc(112px+env(safe-area-inset-bottom))] scroll-container">
      <header className="space-y-2">
        <h1 className="hero-text">Your Journey</h1>
      </header>

      {entries.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="body-text">Your journey begins with a single word. Start your first journal entry.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByMonth.map((group) => {
            const monthMoodDotsCount = Math.min(group.items.length, 12);

            return (
              <section key={group.key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="section-header">{group.label}</h2>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: monthMoodDotsCount }).map((_, i) => (
                      <span
                        key={`${group.key}_${i}`}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getEntryDotColor(group.items[i % group.items.length]) }}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative pl-7 sm:pl-8 space-y-4">
                  <div className="absolute left-3.5 top-2 bottom-2 w-px bg-primary/20" />
                  {group.items.map((entry, idx) => {
                    const date = new Date(entry.date);
                    const badgeDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                    const moodLabel = entry.mood ? entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1) : null;

                    const tagNames = (entry.tagIds ?? [])
                      .map((id) => tagById.get(id)?.name)
                      .filter((v): v is string => !!v);
                    const fallbackNames = (entry.tags ?? []).filter((name) => !tagNames.includes(name));
                    const finalTagNames = [...tagNames, ...fallbackNames].slice(0, 4);

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="relative"
                      >
                        <span
                          className="absolute -left-[2.35rem] top-3 w-3 h-3 rounded-full ring-4 ring-background"
                          style={{ backgroundColor: getEntryDotColor(entry) }}
                        />

                        <motion.button
                          whileTap={{ scale: 0.99 }}
                          transition={ITEM_SPRING}
                          onClick={() => navigate(`/journal/edit/${entry.id}`)}
                          className="w-full text-left card p-5 list-item"
                        >
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <span className="caption-text glass rounded-full px-3 py-1">{badgeDate}</span>
                            {moodLabel ? (
                              <span className="caption-text glass rounded-full px-3 py-1">{moodLabel}</span>
                            ) : null}
                          </div>
                          <h3 className="font-sans font-bold text-on-surface mt-2">{entry.title}</h3>
                          <p className="body-text mt-1">{entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}</p>
                          {finalTagNames.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {finalTagNames.map((name) => (
                                <span key={`${entry.id}_${name}`} className="caption-text glass rounded-full px-2.5 py-1">
                                  #{name}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        onClick={() => navigate('/journal/new')}
        aria-label="Create new entry"
        title="New Entry"
        className="fab-button fixed right-5 sm:right-8 bottom-[calc(96px+env(safe-area-inset-bottom))] sm:bottom-8 btn-primary shadow-2xl"
      >
        <Plus size={18} />
        New Entry
      </motion.button>
    </div>
  );
};

export default Journey;
