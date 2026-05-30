const VARIANTS = [
  'I am dealing with',
  'I just went through',
  'Today includes',
  'My mind keeps returning to',
  'I feel affected by',
  'I need support with',
  'I am noticing',
  'The main situation is',
  'Right now there is'
];

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'about',
  'being',
  'from',
  'that',
  'this',
  'there',
  'into',
  'after',
  'what',
  'when',
  'through',
  'today',
  'right',
  'main'
]);

const GROUPS = [
  {
    mood: 'happy',
    label: 'wins and celebration',
    colorName: 'solar coral',
    keywords: ['win', 'won', 'celebrate', 'celebration', 'success', 'achievement', 'proud', 'reward'],
    situations: ['a personal win', 'good news arriving', 'finishing a hard task', 'being appreciated', 'a milestone', 'a surprise reward', 'a joyful plan', 'a creative breakthrough']
  },
  {
    mood: 'happy',
    label: 'connection and warmth',
    colorName: 'rose amber',
    keywords: ['friend', 'family', 'love', 'date', 'together', 'belong', 'laugh', 'warm'],
    situations: ['laughing with friends', 'a warm family moment', 'feeling loved', 'a thoughtful message', 'making new friends', 'a good conversation', 'feeling included', 'sharing a memory']
  },
  {
    mood: 'happy',
    label: 'play and fun',
    colorName: 'festival peach',
    keywords: ['fun', 'play', 'party', 'dance', 'music', 'trip', 'game', 'weekend'],
    situations: ['a fun hangout', 'music lifting my mood', 'dancing or movement', 'a party mood', 'a playful challenge', 'a weekend plan', 'a trip idea', 'a favorite hobby']
  },
  {
    mood: 'happy',
    label: 'hope and progress',
    colorName: 'golden sunrise',
    keywords: ['hope', 'progress', 'improve', 'better', 'start', 'new', 'opportunity', 'excited'],
    situations: ['a fresh opportunity', 'starting something new', 'seeing progress', 'feeling hopeful', 'a better routine', 'a promising idea', 'a clean restart', 'future excitement']
  },
  {
    mood: 'happy',
    label: 'confidence boost',
    colorName: 'bright tangerine',
    keywords: ['confident', 'capable', 'brave', 'ready', 'strong', 'glow', 'bold', 'energy'],
    situations: ['feeling confident', 'speaking up well', 'trying something brave', 'having high energy', 'feeling capable', 'a strong presentation', 'a bold decision', 'trusting myself']
  },
  {
    mood: 'happy',
    label: 'gratitude',
    colorName: 'marigold',
    keywords: ['grateful', 'thankful', 'blessed', 'lucky', 'kind', 'gift', 'helped', 'support'],
    situations: ['feeling grateful', 'someone helping me', 'receiving kindness', 'a meaningful gift', 'noticing small joys', 'feeling lucky', 'being supported', 'appreciating today']
  },
  {
    mood: 'happy',
    label: 'relief after pressure',
    colorName: 'warm apricot',
    keywords: ['relieved', 'done', 'over', 'passed', 'solved', 'cleared', 'released', 'finished'],
    situations: ['pressure finally easing', 'an exam being over', 'a problem getting solved', 'finishing errands', 'submitting work', 'getting clarity', 'a clean result', 'things working out']
  },
  {
    mood: 'happy',
    label: 'creative spark',
    colorName: 'pink gold',
    keywords: ['creative', 'idea', 'art', 'write', 'design', 'imagine', 'inspired', 'spark'],
    situations: ['a new creative idea', 'wanting to make art', 'writing with energy', 'design inspiration', 'an imaginative mood', 'a project spark', 'fresh ideas', 'flowing expression']
  },
  {
    mood: 'calm',
    label: 'rest and softness',
    colorName: 'aqua mist',
    keywords: ['rest', 'soft', 'sleep', 'slow', 'gentle', 'ease', 'quiet', 'peace'],
    situations: ['needing a slow day', 'a quiet evening', 'resting after effort', 'gentle breathing', 'soft music', 'sleepy calm', 'peaceful space', 'a slower pace']
  },
  {
    mood: 'calm',
    label: 'mindful reset',
    colorName: 'clear teal',
    keywords: ['mindful', 'meditate', 'breath', 'breathing', 'grounded', 'present', 'still', 'centered'],
    situations: ['mindful breathing', 'feeling present', 'a meditation break', 'grounding myself', 'sitting in stillness', 'a centered moment', 'resetting gently', 'noticing my body']
  },
  {
    mood: 'calm',
    label: 'safe and steady',
    colorName: 'soft cyan',
    keywords: ['safe', 'stable', 'steady', 'secure', 'settled', 'balanced', 'protected', 'routine'],
    situations: ['feeling safe', 'a stable routine', 'things being predictable', 'a balanced day', 'secure plans', 'feeling settled', 'a protected space', 'steady progress']
  },
  {
    mood: 'calm',
    label: 'nature and quiet',
    colorName: 'sea glass',
    keywords: ['nature', 'rain', 'ocean', 'garden', 'trees', 'walk', 'sky', 'fresh'],
    situations: ['a peaceful walk', 'rain sounds', 'looking at the sky', 'being near trees', 'fresh air', 'a calm garden', 'ocean thoughts', 'quiet nature']
  },
  {
    mood: 'calm',
    label: 'acceptance',
    colorName: 'blue lagoon',
    keywords: ['accept', 'acceptance', 'okay', 'fine', 'let go', 'forgive', 'patience', 'allow'],
    situations: ['accepting what happened', 'letting go', 'being patient', 'forgiving myself', 'things being okay', 'allowing emotions', 'not forcing answers', 'soft acceptance']
  },
  {
    mood: 'calm',
    label: 'low demand',
    colorName: 'mint blue',
    keywords: ['simple', 'light', 'easy', 'unbusy', 'free', 'space', 'minimal', 'low'],
    situations: ['a simple task list', 'having free time', 'low expectations', 'an easy schedule', 'less noise', 'personal space', 'a light workload', 'minimal demands']
  },
  {
    mood: 'calm',
    label: 'home comfort',
    colorName: 'cool jade',
    keywords: ['home', 'comfort', 'cozy', 'tea', 'blanket', 'clean', 'room', 'safe'],
    situations: ['a cozy room', 'cleaning my space', 'tea and quiet', 'home comfort', 'a blanket mood', 'organizing gently', 'a calm corner', 'resting at home']
  },
  {
    mood: 'calm',
    label: 'repair and recovery',
    colorName: 'healing turquoise',
    keywords: ['recover', 'healing', 'repair', 'aftercare', 'hydrate', 'pause', 'recovering', 'restoring'],
    situations: ['recovering from stress', 'needing aftercare', 'hydrating and pausing', 'repairing energy', 'emotional healing', 'restoring balance', 'a recovery day', 'taking a pause']
  },
  {
    mood: 'focused',
    label: 'deep work',
    colorName: 'deep teal',
    keywords: ['focus', 'focused', 'deep work', 'concentrate', 'concentration', 'flow', 'productive', 'build'],
    situations: ['a deep work block', 'building a project', 'entering flow', 'staying productive', 'solving a problem', 'concentrating hard', 'coding or designing', 'a serious work session']
  },
  {
    mood: 'focused',
    label: 'study mode',
    colorName: 'ink cyan',
    keywords: ['study', 'exam', 'revision', 'learn', 'class', 'notes', 'assignment', 'practice'],
    situations: ['studying for exams', 'reviewing notes', 'learning a chapter', 'doing assignments', 'practice questions', 'class preparation', 'revision time', 'memorizing material']
  },
  {
    mood: 'focused',
    label: 'planning',
    colorName: 'slate mint',
    keywords: ['plan', 'planning', 'schedule', 'organize', 'priority', 'strategy', 'roadmap', 'prepare'],
    situations: ['planning my day', 'organizing priorities', 'building a schedule', 'making a strategy', 'preparing steps', 'mapping a roadmap', 'sorting tasks', 'choosing priorities']
  },
  {
    mood: 'focused',
    label: 'deadline drive',
    colorName: 'electric teal',
    keywords: ['deadline', 'submit', 'deliver', 'finish', 'urgent work', 'due', 'complete', 'target'],
    situations: ['a deadline approaching', 'submitting work', 'finishing a target', 'delivering a project', 'completing a task', 'urgent work focus', 'closing open loops', 'a due date']
  },
  {
    mood: 'focused',
    label: 'decision clarity',
    colorName: 'glass green',
    keywords: ['decide', 'decision', 'clarity', 'choose', 'analyze', 'compare', 'logic', 'evaluate'],
    situations: ['making a decision', 'needing clarity', 'comparing options', 'analyzing choices', 'thinking logically', 'evaluating a plan', 'choosing a path', 'clearing confusion']
  },
  {
    mood: 'focused',
    label: 'learning skill',
    colorName: 'forest cyan',
    keywords: ['skill', 'practice', 'training', 'improve', 'learn', 'discipline', 'habit', 'repeat'],
    situations: ['practicing a skill', 'training consistently', 'building discipline', 'learning through repetition', 'improving technique', 'forming a habit', 'daily practice', 'skill growth']
  },
  {
    mood: 'focused',
    label: 'admin mode',
    colorName: 'steel teal',
    keywords: ['email', 'errand', 'admin', 'budget', 'forms', 'calls', 'cleanup', 'manage'],
    situations: ['clearing emails', 'handling forms', 'making calls', 'budgeting tasks', 'small errands', 'admin cleanup', 'managing details', 'finishing chores']
  },
  {
    mood: 'focused',
    label: 'athletic intensity',
    colorName: 'neon mint',
    keywords: ['workout', 'gym', 'run', 'training', 'sport', 'fitness', 'match', 'active'],
    situations: ['a workout session', 'going to the gym', 'running practice', 'sports training', 'a fitness goal', 'match preparation', 'active energy', 'physical discipline']
  },
  {
    mood: 'stressed',
    label: 'overload',
    colorName: 'violet storm',
    keywords: ['overwhelmed', 'too much', 'overload', 'crowded', 'busy', 'chaos', 'burden', 'swamped'],
    situations: ['too many tasks', 'feeling overwhelmed', 'a crowded schedule', 'mental overload', 'too much noise', 'being swamped', 'chaotic responsibilities', 'carrying a burden']
  },
  {
    mood: 'stressed',
    label: 'anxiety',
    colorName: 'blue violet',
    keywords: ['anxious', 'anxiety', 'worry', 'worried', 'panic', 'nervous', 'fear', 'uneasy'],
    situations: ['anxious thoughts', 'worrying about outcomes', 'feeling nervous', 'panic rising', 'uncertain fear', 'an uneasy body', 'future worry', 'racing thoughts']
  },
  {
    mood: 'stressed',
    label: 'pressure',
    colorName: 'indigo pressure',
    keywords: ['pressure', 'expectation', 'responsibility', 'perform', 'prove', 'judged', 'result', 'score'],
    situations: ['performance pressure', 'high expectations', 'needing to prove myself', 'waiting for results', 'being judged', 'heavy responsibility', 'score pressure', 'public performance']
  },
  {
    mood: 'stressed',
    label: 'time crunch',
    colorName: 'urgent violet',
    keywords: ['late', 'rush', 'rushing', 'hurry', 'time', 'delay', 'deadline', 'last minute'],
    situations: ['running late', 'last minute work', 'a time crunch', 'rushing between tasks', 'delayed plans', 'not enough time', 'urgent deadlines', 'a packed timeline']
  },
  {
    mood: 'stressed',
    label: 'uncertainty',
    colorName: 'fog purple',
    keywords: ['uncertain', 'confused', 'unknown', 'doubt', 'unclear', 'lost', 'unsure', 'question'],
    situations: ['not knowing what next', 'unclear answers', 'feeling lost', 'doubting myself', 'unknown outcomes', 'confusing signals', 'too many questions', 'uncertain plans']
  },
  {
    mood: 'stressed',
    label: 'social strain',
    colorName: 'storm lilac',
    keywords: ['awkward', 'social', 'message', 'reply', 'conflict', 'misunderstood', 'group', 'conversation'],
    situations: ['awkward conversation', 'waiting for a reply', 'group tension', 'being misunderstood', 'social pressure', 'message stress', 'a difficult conversation', 'feeling exposed']
  },
  {
    mood: 'stressed',
    label: 'money worry',
    colorName: 'muted plum',
    keywords: ['money', 'bills', 'budget', 'cost', 'rent', 'fees', 'payment', 'finance'],
    situations: ['money worries', 'paying bills', 'budget pressure', 'unexpected costs', 'rent stress', 'fees piling up', 'payment deadlines', 'financial planning stress']
  },
  {
    mood: 'stressed',
    label: 'health concern',
    colorName: 'cool mauve',
    keywords: ['health', 'sick', 'doctor', 'pain', 'symptom', 'medicine', 'tired', 'body'],
    situations: ['health worries', 'feeling sick', 'doctor anxiety', 'body pain', 'new symptoms', 'medicine routines', 'being exhausted', 'waiting on health news']
  },
  {
    mood: 'angry',
    label: 'frustration',
    colorName: 'hot rose',
    keywords: ['frustrated', 'frustration', 'annoyed', 'irritated', 'blocked', 'stuck', 'fed up', 'ugh'],
    situations: ['feeling frustrated', 'being stuck', 'plans getting blocked', 'repeating the same issue', 'being fed up', 'small things irritating me', 'a blocked task', 'technical problems']
  },
  {
    mood: 'angry',
    label: 'unfairness',
    colorName: 'red ember',
    keywords: ['unfair', 'wrong', 'blame', 'ignored', 'disrespect', 'treated badly', 'injustice', 'rude'],
    situations: ['something feeling unfair', 'being blamed wrongly', 'feeling ignored', 'being disrespected', 'a rude comment', 'injustice at work', 'being treated badly', 'rules not being fair']
  },
  {
    mood: 'angry',
    label: 'boundary breach',
    colorName: 'crimson pulse',
    keywords: ['boundary', 'privacy', 'pushed', 'forced', 'intruded', 'controlled', 'no space', 'pressured'],
    situations: ['boundaries being crossed', 'privacy being ignored', 'feeling pushed', 'being forced', 'someone intruding', 'feeling controlled', 'not getting space', 'pressure from others']
  },
  {
    mood: 'angry',
    label: 'argument',
    colorName: 'neon red',
    keywords: ['argument', 'fight', 'shout', 'yell', 'heated', 'debate', 'clash', 'temper'],
    situations: ['an argument', 'a heated debate', 'someone shouting', 'a family fight', 'a clash at work', 'losing my temper', 'a tense disagreement', 'raised voices']
  },
  {
    mood: 'angry',
    label: 'betrayal',
    colorName: 'black cherry',
    keywords: ['betrayed', 'betrayal', 'lied', 'lie', 'cheated', 'trust', 'backstab', 'secret'],
    situations: ['feeling betrayed', 'someone lying', 'trust being broken', 'a secret being kept', 'being cheated', 'a backstab feeling', 'dishonesty', 'broken promises']
  },
  {
    mood: 'angry',
    label: 'impatience',
    colorName: 'spark red',
    keywords: ['impatient', 'waiting', 'slow', 'delay', 'queue', 'traffic', 'stalled', 'hold'],
    situations: ['waiting too long', 'traffic delays', 'a slow process', 'being put on hold', 'a stalled plan', 'queue frustration', 'impatient energy', 'delayed responses']
  },
  {
    mood: 'angry',
    label: 'criticism sting',
    colorName: 'rose flame',
    keywords: ['criticized', 'criticism', 'insult', 'mocked', 'judged', 'comment', 'teased', 'rejected'],
    situations: ['harsh criticism', 'being mocked', 'an insulting comment', 'feeling judged', 'being teased', 'rejection sting', 'a sharp remark', 'public criticism']
  },
  {
    mood: 'angry',
    label: 'control conflict',
    colorName: 'fire red',
    keywords: ['control', 'bossy', 'rules', 'restricted', 'permission', 'limit', 'command', 'orders'],
    situations: ['someone being bossy', 'too many rules', 'feeling restricted', 'needing permission', 'strict limits', 'taking orders', 'control conflict', 'not being trusted']
  }
];

const toWords = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

const hueRanges = {
  happy: [20, 45],        // Mapped to Sunset Gold and Solar Apricot (dopamine stimulation)
  calm: [135, 175],       // Mapped to Tranquil Eucalyptus and Sea Glass Jade (cortisol reduction)
  focused: [205, 235],    // Mapped to Midnight Sapphire and Cyber Cobalt Blue (cognitive stamina)
  stressed: [250, 285],   // Mapped to Cosmic Purple and Dusty Lavender (soothing decompression)
  angry: [345, 15]        // Mapped to Magma Crimson and Molten Amber Gold (cathartic grounding)
};

const hashText = (text) => {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const colorFromHash = (mood, text) => {
  const hash = hashText(`${mood}-${text}`);
  const [start, end] = hueRanges[mood] || hueRanges.calm;
  const range = start > end ? 360 - start + end : end - start;
  const hue = (start + (hash % Math.max(1, range))) % 360;
  const hueB = (hue + 20 + ((hash >> 8) % 25)) % 360;
  const hueC = (hue + 340 - ((hash >> 16) % 20)) % 360;
  const saturation = 70 + (hash % 15);
  const accentLightness = 52 + ((hash >> 4) % 10);
  const skyLightness = mood === 'focused' || mood === 'angry' ? 14 + ((hash >> 12) % 6) : 93 + ((hash >> 12) % 5);
  const skySaturation = 25 + (hash % 15);

  return {
    accent: `hsl(${hue} ${saturation}% ${accentLightness}%)`,
    accentSoft: `hsl(${hueB} ${Math.max(50, saturation - 10)}% ${Math.min(78, accentLightness + 8)}%)`,
    accentDeep: `hsl(${hueC} ${Math.min(90, saturation + 6)}% ${Math.max(16, accentLightness - 22)}%)`,
    gradient: `linear-gradient(135deg, hsl(${hueC} ${saturation}% 10%) 0%, hsl(${hue} ${saturation}% ${accentLightness}%) 50%, hsl(${hueB} ${saturation}% 60%) 100%)`,
    ink: skyLightness > 50 ? `hsl(${hue} 70% 8%)` : `hsl(${hue} 40% 95%)`,
    sky: `hsl(${hueB} ${skySaturation}% ${skyLightness}%)`,
    colorName: `aesthetic ${hue}-${saturation}-${accentLightness}`
  };
};

export const SITUATION_LIBRARY = GROUPS.flatMap((group, groupIndex) =>
  group.situations.flatMap((situation, situationIndex) =>
    VARIANTS.map((variant, variantIndex) => {
      const phrase = `${variant} ${situation}`;
      return {
        id: `${group.mood}-${groupIndex}-${situationIndex}-${variantIndex}`,
        mood: group.mood,
        label: group.label,
        colorName: group.colorName,
        situation,
        phrase,
        keywords: [...new Set([...group.keywords, ...toWords(situation), ...toWords(group.label)])]
      };
    })
  )
);

export function scanMoodSituation(text) {
  const value = text.toLowerCase();
  const words = new Set(toWords(value));
  const moodScores = {};
  const scoredMatches = SITUATION_LIBRARY.map((situation) => {
    const score = situation.keywords.reduce((total, keyword) => {
      const normalized = keyword.toLowerCase();
      if (normalized.includes(' ')) return total + (value.includes(normalized) ? 3 : 0);
      return total + (words.has(normalized) ? 2 : value.includes(normalized) ? 1 : 0);
    }, 0);
    return { ...situation, score };
  })
    .filter((situation) => situation.score > 0)
    .sort((a, b) => b.score - a.score);

  const matches = [];
  const seen = new Set();
  for (const match of scoredMatches) {
    const key = `${match.mood}-${match.label}-${match.situation}`;
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push(match);
    if (matches.length === 5) break;
  }

  matches.forEach((match) => {
    moodScores[match.mood] = (moodScores[match.mood] || 0) + match.score;
  });

  const mood = Object.entries(moodScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'calm';
  const enrichedMatches = matches.map((match) => ({
    ...match,
    palette: colorFromHash(match.mood, `${text}-${match.id}-${match.phrase}`)
  }));
  const paletteSeed = enrichedMatches[0] ? `${text}-${enrichedMatches[0].id}-${enrichedMatches[0].phrase}` : text || 'low demand calm mint blue';
  const palette = colorFromHash(mood, paletteSeed);
  return { mood, matches: enrichedMatches, palette };
}
