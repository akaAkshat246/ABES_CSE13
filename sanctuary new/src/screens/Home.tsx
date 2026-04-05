import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../lib/storage';
import Clock from '../components/Clock';
import { geminiService } from '../services/gemini';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { Sparkles, Calendar, Loader2 } from 'lucide-react';
import ProfileSheet from '../components/ProfileSheet';
import { MoodEntryMood, UserProfile } from '../types';

const OCCASIONS: Record<string, { message: string }> = {
  "01/01": { message: "Happy New Year! A fresh page — write it beautifully." },
  "02/01": { message: "World Introvert Day — your quiet is your power." },
  "04/01": { message: "World Braille Day — every touch carries meaning." },
  "10/01": { message: "World Hindi Day — language is the soul of culture." },
  "11/01": { message: "National Human Trafficking Awareness Day — stand for freedom." },
  "12/01": { message: "National Youth Day — your energy can change the world." },
  "14/01": { message: "Makar Sankranti — let your dreams fly high like a kite." },
  "15/01": { message: "Indian Army Day — salute to the brave hearts." },
  "21/01": { message: "National Hugging Day — warmth is the best medicine." },
  "24/01": { message: "National Girl Child Day — empower her, empower the future." },
  "25/01": { message: "National Voters' Day — your voice, your vote, your power." },
  "26/01": { message: "Republic Day — celebrating the spirit of a sovereign nation." },
  "27/01": { message: "International Holocaust Remembrance Day — never forget." },
  "28/01": { message: "Data Privacy Day — protect your digital self." },
  "30/01": { message: "Martyrs' Day — remembering those who gave their all." },

  "01/02": { message: "Indian Coast Guard Day — guardians of the sea." },
  "02/02": { message: "World Wetlands Day — nature's kidneys need our care." },
  "04/02": { message: "World Cancer Day — strength, hope, and awareness." },
  "07/02": { message: "Rose Day — some feelings are best expressed without words. Let a rose speak today." },
  "08/02": { message: "Propose Day — courage is the first step to a lifetime of togetherness." },
  "09/02": { message: "Chocolate Day — life is better with a little sweetness." },
  "10/02": { message: "Teddy Day — a warm hug in the form of a memory." },
  "11/02": { message: "Promise Day — words are bonds. Keep them with heart." },
  "12/02": { message: "Hug Day — the shortest distance between two souls." },
  "13/02": { message: "Kiss Day — a silent language of love and care." },
  "14/02": { message: "Valentine's Day — celebrate love in all its beautiful forms." },
  "20/02": { message: "World Day of Social Justice — equality for every soul." },
  "21/02": { message: "International Mother Language Day — speak your heart's tongue." },
  "24/02": { message: "Central Excise Day — building the nation's economy." },
  "28/02": { message: "National Science Day — curiosity is the engine of discovery." },

  "01/03": { message: "Zero Discrimination Day — celebrate diversity, end exclusion." },
  "03/03": { message: "World Wildlife Day — protect the wild, protect our future." },
  "08/03": { message: "International Women's Day — celebrate her strength and grace." },
  "12/03": { message: "World Kidney Day — health starts from within." },
  "14/03": { message: "Pi Day — infinite possibilities in a simple circle." },
  "15/03": { message: "World Consumer Rights Day — stay informed, stay protected." },
  "18/03": { message: "Global Recycling Day — give resources a second life." },
  "20/03": { message: "International Day of Happiness — find joy in the small things." },
  "21/03": { message: "World Poetry Day — let the rhythm of words move you." },
  "22/03": { message: "World Water Day — every drop is a precious gift." },
  "23/03": { message: "World Meteorological Day — understanding the breath of our planet." },
  "24/03": { message: "World TB Day — awareness leads to a healthier world." },
  "27/03": { message: "World Theatre Day — life is a stage, play your part well." },

  "01/04": { message: "April Fools' Day — a little laughter goes a long way." },
  "02/04": { message: "World Autism Awareness Day — celebrate unique minds." },
  "05/04": { message: "National Maritime Day — sailing towards a brighter horizon." },
  "07/04": { message: "World Health Day — your body is your only true home." },
  "10/04": { message: "World Homeopathy Day — healing through nature's balance." },
  "11/04": { message: "National Safe Motherhood Day — care for those who care for us." },
  "14/04": { message: "Ambedkar Jayanti — equality and justice for all." },
  "17/04": { message: "World Haemophilia Day — awareness and support for every bleed." },
  "18/04": { message: "World Heritage Day — preserving the echoes of our past." },
  "21/04": { message: "National Civil Services Day — serving the nation with integrity." },
  "22/04": { message: "Earth Day — invest in our planet, it's the only one we have." },
  "23/04": { message: "World Book Day — get lost in a story, find yourself in a page." },
  "24/04": { message: "National Panchayati Raj Day — democracy at the grassroots." },
  "25/04": { message: "World Malaria Day — zero malaria starts with us." },
  "26/04": { message: "World Intellectual Property Day — celebrate the spark of innovation." },
  "29/04": { message: "International Dance Day — let your body move to the rhythm of life." },

  "01/05": { message: "International Labour Day — dignity in every hand that works." },
  "03/05": { message: "World Press Freedom Day — truth must always have a voice." },
  "04/05": { message: "International Firefighters' Day — bravery in the face of flames." },
  "07/05": { message: "World Athletics Day — push your limits, find your strength." },
  "08/05": { message: "World Red Cross Day — humanity in the heart of crisis." },
  "11/05": { message: "National Technology Day — innovation for a better tomorrow." },
  "12/05": { message: "International Nurses Day — the healing touch of compassion." },
  "15/05": { message: "International Day of Families — where life begins and love never ends." },
  "17/05": { message: "World Telecommunication Day — connecting the world, one byte at a time." },
  "18/05": { message: "International Museum Day — history is a living conversation." },
  "21/05": { message: "National Anti-Terrorism Day — peace is our greatest strength." },
  "22/05": { message: "International Day for Biological Diversity — life is a web of wonder." },
  "24/05": { message: "Commonwealth Day — unity in diversity across the globe." },
  "31/05": { message: "World No Tobacco Day — choose life, choose health." },

  "01/06": { message: "Global Day of Parents — the first teachers, the lifelong guides." },
  "03/06": { message: "World Bicycle Day — simple, sustainable, and soulful." },
  "05/06": { message: "World Environment Day — only one Earth, protect her." },
  "07/06": { message: "World Food Safety Day — safe food today for a healthy tomorrow." },
  "08/06": { message: "World Oceans Day — the blue heart of our planet needs us." },
  "12/06": { message: "World Day Against Child Labour — every child deserves a childhood." },
  "14/06": { message: "World Blood Donor Day — give blood, give life." },
  "20/06": { message: "World Refugee Day — compassion knows no borders." },
  "21/06": { message: "International Day of Yoga — find balance in body and soul." },
  "23/06": { message: "United Nations Public Service Day — serving for the common good." },
  "26/06": { message: "International Day Against Drug Abuse — choose health, choose hope." },
  "29/06": { message: "National Statistics Day — data tells the story of our progress." },

  "01/07": { message: "National Doctors' Day — gratitude to the healers among us." },
  "04/07": { message: "Independence Day (USA) — celebrating the spirit of liberty." },
  "11/07": { message: "World Population Day — people are the world's greatest resource." },
  "15/07": { message: "World Youth Skills Day — empower the hands that build the future." },
  "17/07": { message: "World Day for International Justice — truth and fairness for all." },
  "18/07": { message: "Nelson Mandela International Day — be the change you wish to see." },
  "26/07": { message: "Kargil Vijay Diwas — remembering the heroes of the heights." },
  "28/07": { message: "World Hepatitis Day — awareness for a healthier liver." },
  "29/07": { message: "International Tiger Day — protect the roar of the wild." },

  "01/08": { message: "World Lung Cancer Day — breathe hope, spread awareness." },
  "06/08": { message: "Hiroshima Day — peace is the only path forward." },
  "07/08": { message: "National Javelin Day — celebrating athletic excellence." },
  "09/08": { message: "Nagasaki Day — a silent prayer for a nuclear-free world." },
  "10/08": { message: "World Lion Day — respect the king of the jungle." },
  "12/08": { message: "International Youth Day — youth lead the way to innovation." },
  "13/08": { message: "World Organ Donation Day — leave a legacy of life." },
  "15/08": { message: "Independence Day (India) — freedom is our greatest heritage." },
  "19/08": { message: "World Photography Day — capture the beauty of a moment." },
  "20/08": { message: "Sadbhavana Diwas — promoting harmony and goodwill." },
  "26/08": { message: "Women's Equality Day — equal rights, equal future." },
  "29/08": { message: "National Sports Day — play for health, play for pride." },

  "05/09": { message: "Teachers' Day — a tribute to those who light the way." },
  "08/09": { message: "International Literacy Day — reading opens worlds." },
  "14/09": { message: "Hindi Diwas — celebrating the beauty of our language." },
  "15/09": { message: "Engineers' Day — building the world with logic and vision." },
  "16/09": { message: "World Ozone Day — protecting the shield of our planet." },
  "21/09": { message: "International Day of Peace — let harmony prevail." },
  "22/09": { message: "World Rose Day (Welfare of Cancer Patients) — spread cheer and hope." },
  "25/09": { message: "World Pharmacists' Day — your health, their expertise." },
  "27/09": { message: "World Tourism Day — explore the world, enrich your soul." },
  "29/09": { message: "World Heart Day — listen to the rhythm of your life." },

  "01/10": { message: "International Day of Older Persons — wisdom is a gift of time." },
  "02/10": { message: "Gandhi Jayanti — non-violence is the greatest force." },
  "04/10": { message: "World Animal Welfare Day — kindness to every living creature." },
  "05/10": { message: "World Teachers' Day — global gratitude for educators." },
  "08/10": { message: "Indian Air Force Day — touch the sky with glory." },
  "09/10": { message: "World Post Day — connecting hearts across distances." },
  "10/10": { message: "World Mental Health Day — your mind matters, talk about it." },
  "11/10": { message: "International Day of the Girl Child — her dreams, her future." },
  "15/10": { message: "World Students' Day — curiosity is the spark of learning." },
  "16/10": { message: "World Food Day — zero hunger is a global mission." },
  "20/10": { message: "World Statistics Day — data for a better world." },
  "24/10": { message: "United Nations Day — unity for global peace and progress." },
  "31/10": { message: "National Unity Day — strength in our togetherness." },

  "01/11": { message: "World Vegan Day — compassion on every plate." },
  "07/11": { message: "National Cancer Awareness Day — early detection saves lives." },
  "09/11": { message: "Legal Services Day — justice for the underprivileged." },
  "11/11": { message: "National Education Day — learning is the key to empowerment." },
  "12/11": { message: "World Pneumonia Day — every breath counts." },
  "14/11": { message: "Children's Day — celebrate the innocence and joy of childhood." },
  "17/11": { message: "National Epilepsy Day — understanding and support for every journey." },
  "19/11": { message: "World Toilet Day — sanitation is a human right." },
  "21/11": { message: "World Television Day — the window to the world's stories." },
  "26/11": { message: "Constitution Day — the foundation of our democracy." },

  "01/12": { message: "World AIDS Day — unity in the fight against HIV." },
  "02/12": { message: "National Pollution Control Day — clean air, clean water, clean life." },
  "03/12": { message: "International Day of Persons with Disabilities — celebrate every ability." },
  "04/12": { message: "Indian Navy Day — guardians of our waters." },
  "05/12": { message: "World Soil Day — the foundation of life needs our care." },
  "07/12": { message: "Armed Forces Flag Day — support the brave defenders." },
  "10/12": { message: "Human Rights Day — dignity and justice for every soul." },
  "11/12": { message: "International Mountain Day — the peaks of our planet need protection." },
  "14/12": { message: "National Energy Conservation Day — save energy for a brighter future." },
  "18/12": { message: "International Migrants Day — dignity for every journey." },
  "22/12": { message: "National Mathematics Day — the language of the universe." },
  "23/12": { message: "Kisan Diwas — salute to the hands that feed the nation." },
  "24/12": { message: "National Consumer Day — stay aware, stay empowered." },
  "25/12": { message: "Christmas — peace, joy, and love to all." },
};

const LITERARY_QUOTES = [
  { text: "You do not need to leave your room. Remain sitting at your table and listen. Do not even listen, simply wait, be quiet, still and solitary.", author: "Franz Kafka" },
  { text: "I am a sick man. I am a wicked man. An unattractive man.", author: "Fyodor Dostoevsky" },
  { text: "Don't bend; don't water it down; don't try to make it logical; don't edit your own soul according to the fashion.", author: "Franz Kafka" },
  { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", author: "Fyodor Dostoevsky" },
  { text: "There is an infinite amount of hope in the universe... but not for us.", author: "Franz Kafka" },
  { text: "To go wrong in one's own way is better than to go right in someone else's.", author: "Fyodor Dostoevsky" },
  { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
  { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", author: "Fyodor Dostoevsky" },
  { text: "In the struggle between yourself and the world, back the world.", author: "Franz Kafka" },
  { text: "Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him.", author: "Fyodor Dostoevsky" },
  { text: "I am free and that is why I am lost.", author: "Franz Kafka" },
  { text: "We sometimes encounter people, even perfect strangers, who begin to interest us at first sight.", author: "Fyodor Dostoevsky" },
  { text: "You are the task. No pupil far and wide.", author: "Franz Kafka" },
  { text: "If you want to be respected by others, the great thing is to respect yourself.", author: "Fyodor Dostoevsky" },
  { text: "My guarding angel is fear.", author: "Franz Kafka" },
  { text: "Talking nonsense is the sole privilege mankind possesses over the other organisms.", author: "Fyodor Dostoevsky" },
  { text: "Logic is doubtless unshakeable, but it cannot withstand a man who wants to go on living.", author: "Franz Kafka" },
  { text: "Nothing in this world is harder than speaking the truth, nothing easier than flattery.", author: "Fyodor Dostoevsky" },
  { text: "There is infinite hope, but not for us.", author: "Franz Kafka" },
  { text: "The soul is healed by being with children.", author: "Fyodor Dostoevsky" },
  { text: "Start with what is necessary, then what is possible, and suddenly you are doing the impossible.", author: "Franz Kafka" },
  { text: "Man is sometimes extraordinarily, passionately, in love with suffering.", author: "Fyodor Dostoevsky" },
  { text: "I have the true feeling of myself only when I am unbearably unhappy.", author: "Franz Kafka" },
  { text: "It takes something more than intelligence to act intelligently.", author: "Fyodor Dostoevsky" },
  { text: "I lack nothing. I am not able to make myself understood.", author: "Franz Kafka" },
  { text: "Realists do not fear the results of their study.", author: "Fyodor Dostoevsky" },
  { text: "There is immeasurable distance between late and too late.", author: "Franz Kafka" },
  { text: "To live without hope is to cease to live.", author: "Fyodor Dostoevsky" },
  { text: "I am a cage in search of a bird.", author: "Franz Kafka" },
  { text: "Beauty will save the world.", author: "Fyodor Dostoevsky" },
];

const RIZZ_LINES = {
  Male: [
    "You've got this, king.",
    "Proud of you, man.",
    "Keep going, you're doing great.",
    "The quietest ones often have the loudest minds.",
    "Depth is rare. You have it.",
    "Some people light up rooms. You light up the ones that matter."
  ],
  Female: [
    "You're doing amazing, queen.",
    "So proud of your progress.",
    "Keep shining, beautiful.",
    "Intelligent, soft, and completely unaware of how rare that is.",
    "There is something about the way you exist that feels like poetry.",
    "You are the kind of person people write about."
  ],
  "Non-binary": [
    "You're doing great.",
    "Proud of you.",
    "Keep going.",
    "You exist in a way the world hasn't caught up to yet.",
    "Complexity is your superpower.",
    "There are people who will never understand you. That's their loss."
  ],
  "Prefer not to say": [
    "You're doing great.",
    "Proud of you.",
    "Keep going.",
    "Complexity is your superpower."
  ]
};

const getDayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const getTimeGreeting = (hours: number) => {
  if (hours >= 0 && hours < 12) return "Good Morning";
  if (hours >= 12 && hours < 17) return "Good Afternoon";
  if (hours >= 17 && hours < 21) return "Good Evening";
  return "Good Night";
};

const formatISODateLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const MOOD_META: Record<MoodEntryMood, { label: string; dotColor: string }> = {
  radiant: { label: 'Radiant', dotColor: 'var(--color-secondary)' },
  calm: { label: 'Calm', dotColor: 'var(--color-primary)' },
  neutral: { label: 'Neutral', dotColor: 'var(--color-on-surface-variant)' },
  low: { label: 'Low', dotColor: 'var(--color-primary-container)' },
  stormy: { label: 'Stormy', dotColor: 'var(--color-error)' },
};

const MOOD_ORDER: MoodEntryMood[] = ['radiant', 'calm', 'neutral', 'low', 'stormy'];

const MoodGlyph: React.FC<{ mood: MoodEntryMood }> = ({ mood }) => {
  const fill = MOOD_META[mood].dotColor;

  if (mood === 'radiant') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.2" fill={fill} />
      </svg>
    );
  }

  if (mood === 'calm') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="4.2" fill={fill} />
      </svg>
    );
  }

  if (mood === 'neutral') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6.2" y="11.4" width="11.6" height="2.2" rx="1.1" fill={fill} />
      </svg>
    );
  }

  if (mood === 'low') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.6c-2.8 2.8-6.2 6.2-6.2 10.1 0 4.3 2.9 7.7 6.2 7.7s6.2-3.4 6.2-7.7c0-3.9-3.4-7.3-6.2-10.1z"
          fill={fill}
        />
      </svg>
    );
  }

  // stormy
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.8l1.7 4.9 5-.6-3.8 3.1 2.1 4.7-5-1.8-5 1.8 2.1-4.7-3.8-3.1 5 .6L12 2.8z"
        fill={fill}
      />
    </svg>
  );
};

interface HomeProps {
  onProfileUpdate: (profile: UserProfile) => void;
}

const Home: React.FC<HomeProps> = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState(() => storage.getProfile());
  const [weeklyPrompt, setWeeklyPrompt] = useState<string>("");
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const isMonday = today.getDay() === 1;

  const todayISO = useMemo(() => formatISODateLocal(today), [today]);
  const todayMoodEntry = storage.getMoodByDate(todayISO);
  const [loggedMoodToday, setLoggedMoodToday] = useState<MoodEntryMood | null>(() => todayMoodEntry?.mood ?? null);
  const [isCheckInVisible, setIsCheckInVisible] = useState<boolean>(() => todayMoodEntry == null);
  const [selectedMood, setSelectedMood] = useState<MoodEntryMood | null>(null);
  const [note, setNote] = useState<string>("");
  const moodStreak = storage.getMoodStreak();

  const confirmMood = () => {
    if (!selectedMood) return;
    storage.saveMood({
      date: todayISO,
      mood: selectedMood,
      note: note.trim() ? note.trim() : "",
    });
    setLoggedMoodToday(selectedMood);
    setIsCheckInVisible(false);
    setSelectedMood(null);
    setNote("");
  };

  const literaryQuote = useMemo(() => {
    const dayOfYear = getDayOfYear(today);
    return LITERARY_QUOTES[dayOfYear % LITERARY_QUOTES.length];
  }, [today]);

  const rizzLine = useMemo(() => {
    const gender = profile?.gender || 'Non-binary';
    const lines = RIZZ_LINES[gender as keyof typeof RIZZ_LINES] || RIZZ_LINES['Non-binary'];
    return lines[Math.floor(Math.random() * lines.length)];
  }, [profile?.gender]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    onProfileUpdate(updatedProfile);
  };

  const dateKey = useMemo(() => {
    const d = today.getDate().toString().padStart(2, '0');
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const y = today.getFullYear();
    return `${d}-${m}-${y}`;
  }, [today]);

  const todayStr = useMemo(() => {
    const d = today.getDate().toString().padStart(2, '0');
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
  }, [today]);

  const occasion = useMemo(() => OCCASIONS[todayStr], [todayStr]);

  const greeting = useMemo(() => {
    const hours = today.getHours();
    return getTimeGreeting(hours);
  }, [today]);

  useEffect(() => {
    const fetchWeeklyPrompt = async () => {
      if (!isMonday) return;
      
      const cacheKey = `sanctuary_weekly_${dateKey}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setWeeklyPrompt(cached);
          return;
        }
      } catch {
        // Ignore
      }

      setIsLoadingWeekly(true);
      try {
        const prompt = await geminiService.getWeeklyReflection();
        setWeeklyPrompt(prompt);
        try {
          localStorage.setItem(cacheKey, prompt);
        } catch { /* ignore */ }
      } catch (error) {
        setWeeklyPrompt("What was the most meaningful lesson you learned this week?");
      } finally {
        setIsLoadingWeekly(false);
      }
    };

    fetchWeeklyPrompt();
  }, [dateKey, isMonday]);

  useEffect(() => {
    const checkBirthday = () => {
      if (!profile?.birthday) return;
      const bday = new Date(profile.birthday);
      if (bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth()) {
        setShowBirthday(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7ebdac', '#fed488', '#00342b']
        });
      }
    };
    checkBirthday();
  }, [profile, today]);

  return (
    <div className="space-y-10 pb-10">
      <header className="relative flex items-start justify-between">
        <div className="space-y-2">
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="section-header"
          >
            {greeting}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-text"
          >
            Welcome back, <span className="text-primary font-medium">{profile?.name || 'Explorer'}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="body-text italic text-primary/70"
          >
            {rizzLine}
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsProfileOpen(true)}
          className="relative w-10 h-10 rounded-full border-2 border-primary/40 shadow-[0_2px_12px_rgba(0,52,43,0.2)] overflow-hidden flex-shrink-0"
        >
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold">
              {profile?.name?.charAt(0) || 'S'}
            </div>
          )}
        </motion.button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <Clock />

          <div className="space-y-3">
            {moodStreak >= 7 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center rounded-full border border-secondary/80 bg-secondary/5 px-3 py-1 caption-text font-bold"
              >
                7 day streak
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isCheckInVisible ? (
                <motion.div
                  key="mood-checkin"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="card border-primary/20 bg-primary/5 p-6 space-y-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="section-header text-primary">Daily Mood</p>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    {MOOD_ORDER.map((mood) => {
                      const selected = selectedMood === mood;
                      return (
                        <div key={mood} className="flex flex-col items-center gap-2 min-w-[64px]">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            animate={{ scale: selected ? 1.15 : 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            onClick={() => setSelectedMood(mood)}
                            className={cn(
                              'w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-200',
                              selected ? 'glass ring-1 ring-[var(--color-primary)] bg-white/10' : 'bg-white/5 border border-white/10'
                            )}
                          >
                            <MoodGlyph mood={mood} />
                          </motion.button>
                          <p className="text-[0.65rem] font-sans capitalize text-on-surface-variant/85 text-center">
                            {MOOD_META[mood].label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedMood ? (
                      <motion.div
                        key="note-confirm"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Add a note..."
                          maxLength={120}
                          className="w-full bg-transparent border border-white/10 rounded-[14px] px-4 py-3 outline-none placeholder:text-on-surface-variant/45 focus:ring-2 focus:ring-[var(--color-primary)]"
                        />

                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={confirmMood}
                          className="btn-primary w-full"
                        >
                          Confirm
                        </motion.button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.p
                  key="mood-caption"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="caption-text text-on-surface-variant/80"
                >
                  You felt {loggedMoodToday ?? 'neutral'} today
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {occasion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card border-primary/20 bg-primary/5"
              >
                <p className="section-header text-primary mb-2">Today's Occasion</p>
                <p className="body-text font-medium text-on-surface">{occasion.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isMonday && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-2 border-secondary/30 bg-secondary/5 p-8 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="section-header text-secondary">Weekly Reflection</p>
                <Calendar size={18} className="text-secondary opacity-50" />
              </div>
              {isLoadingWeekly ? (
                <div className="h-12 w-full bg-secondary/10 animate-pulse rounded-lg" />
              ) : (
                <p className="screen-title text-on-surface leading-relaxed">
                  {weeklyPrompt}
                </p>
              )}
            </motion.div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card min-h-[260px] flex flex-col justify-center relative overflow-hidden p-10 group border-l-[3px] border-secondary/50"
        >
          <span className="absolute top-4 left-4 font-serif text-[4rem] text-primary opacity-20 leading-none">“</span>
          
          <div className="relative z-10 space-y-6">
            <p className="font-serif italic text-[1.1rem] leading-[1.7] text-on-surface">
              {literaryQuote.text}
            </p>
            
            <p className="font-sans text-[0.75rem] uppercase tracking-widest text-on-surface-variant text-right mt-3">
              — {literaryQuote.author}
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showBirthday && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="card max-w-md w-full text-center space-y-6 p-10"
            >
              <h2 className="hero-text text-primary">Happy Birthday!</h2>
              <p className="body-text">
                Today is a celebration of you. May your journey ahead be filled with peace, 
                growth, and beautiful memories.
              </p>
              <button 
                onClick={() => setShowBirthday(false)}
                className="btn-primary w-full"
              >
                Thank You
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {profile && (
        <ProfileSheet
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Home;
