export type Mood = 'peaceful' | 'joyful' | 'reflective' | 'melancholy' | 'energetic';

export type MoodEntryMood = 'radiant' | 'calm' | 'neutral' | 'low' | 'stormy';

export interface MoodEntry {
  date: string; // YYYY-MM-DD (local time)
  mood: MoodEntryMood;
  note?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: Mood;
  tags: string[];
  tagIds: string[];
}

export interface Memory {
  id: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'other';
  url: string;
  title: string;
  caption?: string;
  date: string;
  tags: string[];
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  completed: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  birthday: string;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  avatar: string;
  joinedDate: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: number;
  notifications: boolean;
}

export type Screen = 
  | 'splash' 
  | 'onboarding' 
  | 'profile-creation' 
  | 'home' 
  | 'journal-list' 
  | 'journal-edit' 
  | 'memory-vault' 
  | 'reminders' 
  | 'settings' 
  | 'help' 
  | 'journey' 
  | 'privacy';
