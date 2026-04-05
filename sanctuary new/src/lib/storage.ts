import { MoodEntry, Tag, UserProfile, JournalEntry, Memory, Reminder, Settings } from '../types';

const PREFIX = 'sanctuary_';

const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const safeSet = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const formatISODateLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysLocal = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const storage = {
  // Profile
  getProfile: (): UserProfile | null => safeGet('profile', null),
  setProfile: (profile: UserProfile): void => safeSet('profile', profile),

  // Journal
  getEntries: (): JournalEntry[] => {
    const entries = safeGet<JournalEntry[]>('entries', []);
    return entries.map((entry) => ({
      ...entry,
      tags: entry.tags ?? [],
      tagIds: entry.tagIds ?? [],
    }));
  },
  setEntries: (entries: JournalEntry[]): void => safeSet('entries', entries),
  getDraft: (): Partial<JournalEntry> | null => safeGet('draft', null),
  setDraft: (draft: Partial<JournalEntry> | null): void => safeSet('draft', draft),

  // Tags
  getTags: (): Tag[] => safeGet<Tag[]>('tags', []),
  setTags: (tags: Tag[]): void => safeSet('tags', tags),
  getTagById: (id: string): Tag | null => {
    const tags = safeGet<Tag[]>('tags', []);
    return tags.find((tag) => tag.id === id) ?? null;
  },
  createTag: (name: string, color: string): Tag => {
    const tags = safeGet<Tag[]>('tags', []);
    const existing = tags.find((tag) => tag.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing;

    const newTag: Tag = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      name: name.trim(),
      color,
    };
    tags.unshift(newTag);
    safeSet('tags', tags);
    return newTag;
  },
  deleteTag: (id: string): void => {
    const tags = safeGet<Tag[]>('tags', []);
    const updatedTags = tags.filter((tag) => tag.id !== id);
    safeSet('tags', updatedTags);

    const deletedTag = tags.find((tag) => tag.id === id);
    const deletedName = deletedTag?.name.toLowerCase();
    const entries = safeGet<JournalEntry[]>('entries', []).map((entry) => ({
      ...entry,
      tags: (entry.tags ?? []).filter((name) => name.toLowerCase() !== deletedName),
      tagIds: (entry.tagIds ?? []).filter((tagId) => tagId !== id),
    }));
    safeSet('entries', entries);
  },
  getEntriesByTag: (tagId: string): JournalEntry[] => {
    const tags = safeGet<Tag[]>('tags', []);
    const tag = tags.find((t) => t.id === tagId);
    const tagName = tag?.name.toLowerCase();

    const entries = safeGet<JournalEntry[]>('entries', []);
    return entries
      .map((entry) => ({
        ...entry,
        tags: entry.tags ?? [],
        tagIds: entry.tagIds ?? [],
      }))
      .filter((entry) => {
        if (entry.tagIds.includes(tagId)) return true;
        if (!tagName) return false;
        return entry.tags.some((name) => name.toLowerCase() === tagName);
      });
  },

  // Memories
  getMemories: (): Memory[] => safeGet('memories', []),
  setMemories: (memories: Memory[]): void => safeSet('memories', memories),

  // Reminders
  getReminders: (): Reminder[] => safeGet('reminders', []),
  setReminders: (reminders: Reminder[]): void => safeSet('reminders', reminders),

  // Settings
  getSettings: (): Settings => {
    const defaults: Settings = {
      theme: 'light',
      fontSize: 1.0,
      notifications: true,
    };
    const saved = safeGet<Partial<Settings>>('settings', {});
    return { ...defaults, ...saved };
  },
  setSettings: (settings: Settings): void => {
    safeSet('settings', settings);
    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    // Apply font scale
    const fontSize = settings.fontSize ?? 1.0;
    document.documentElement.style.setProperty('--font-scale', fontSize.toString());
  },

  // Daily Quote Cache
  getDailyQuote: (): string | null => {
    const cached = safeGet<{ quote: string; date: string } | null>('daily_quote', null);
    const today = new Date().toDateString();
    if (cached && cached.date === today) return cached.quote;
    return null;
  },
  setDailyQuote: (quote: string): void => {
    safeSet('daily_quote', { quote, date: new Date().toDateString() });
  },

  // Mood Tracking
  getMoods: (): MoodEntry[] => safeGet<MoodEntry[]>('moods', []),

  saveMood: (entry: MoodEntry): void => {
    const existing = safeGet<MoodEntry[]>('moods', []);
    const idx = existing.findIndex((m) => m.date === entry.date);
    const normalized: MoodEntry = {
      ...entry,
      note: entry.note ?? '',
    };

    if (idx >= 0) {
      existing[idx] = normalized;
    } else {
      existing.push(normalized);
    }

    // Keep stable chronological ordering.
    existing.sort((a, b) => a.date.localeCompare(b.date));
    safeSet('moods', existing);
  },

  getMoodByDate: (date: string): MoodEntry | null => {
    const all = safeGet<MoodEntry[]>('moods', []);
    return all.find((m) => m.date === date) ?? null;
  },

  // Returns logged mood entries for the last 7 days (oldest -> newest).
  getLast7DaysMoods: (): MoodEntry[] => {
    const today = new Date();
    const byDate = new Map(safeGet<MoodEntry[]>('moods', []).map((m) => [m.date, m]));

    const last7Dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      last7Dates.push(formatISODateLocal(addDaysLocal(today, -i)));
    }

    return last7Dates.map((d) => byDate.get(d)).filter((x): x is MoodEntry => !!x);
  },

  // Count consecutive days with mood logged, ending today.
  getMoodStreak: (): number => {
    const today = new Date();
    const moodsByDate = new Map(safeGet<MoodEntry[]>('moods', []).map((m) => [m.date, m]));

    let streak = 0;
    for (let i = 0; i < 3650; i++) {
      const dateKey = formatISODateLocal(addDaysLocal(today, -i));
      if (moodsByDate.has(dateKey)) streak++;
      else break;
    }
    return streak;
  },

  // Global Data Operations
  exportData: (): void => {
    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFIX)) {
          data[key] = localStorage.getItem(key);
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      a.href = url;
      a.download = `sanctuary-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Handle silently as instructed
    }
  },

  clearAllData: (): void => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.location.reload();
    } catch {
      // Handle silently
    }
  }
};
