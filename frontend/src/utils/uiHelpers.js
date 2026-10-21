export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const ui = {
  layout: {
    page: 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8',
    section: 'py-7 sm:py-9 lg:py-10',
    stack: 'space-y-4',
    navbarHeight: 'h-[72px]',
  },
  typography: {
    h1: 'text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]',
    h2: 'text-xl font-semibold leading-tight tracking-tight text-slate-900',
    h3: 'text-base font-semibold leading-6 tracking-tight text-slate-800',
    body: 'text-sm leading-6 text-slate-600',
    caption: 'text-xs font-medium leading-5 text-slate-500',
    overline: 'text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600',
  },
  card: 'rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]',
  cardHover: 'transition duration-200 hover:border-blue-200 hover:bg-blue-50/50',
  input:
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
  select:
    'h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
  button: {
    primary:
      'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.22)] transition hover:-translate-y-0.5 hover:from-blue-400 hover:to-indigo-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-60 disabled:hover:translate-y-0',
    secondary:
      'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-300/40 disabled:pointer-events-none disabled:opacity-60',
    ghost:
      'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-300/40 disabled:pointer-events-none disabled:opacity-60',
    icon:
      'inline-grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-300/40',
  },
  skeleton: 'skeleton-shimmer rounded-md bg-slate-800/80',
  row:
    'rounded-xl border border-slate-200 bg-white transition duration-200 hover:border-blue-200 hover:bg-blue-50/60',
};

export const difficultyStyles = {
  easy: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  medium: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  hard: 'border-red-400/20 bg-red-400/10 text-red-300',
};

export const difficultyDotStyles = {
  easy: 'bg-emerald-400',
  medium: 'bg-amber-400',
  hard: 'bg-red-400',
};

export const statusStyles = {
  accepted: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  solved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  wrong: 'border-red-400/20 bg-red-400/10 text-red-300',
  error: 'border-red-400/20 bg-red-400/10 text-red-300',
  pending: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  unsolved: 'border-slate-700 bg-slate-800/70 text-slate-400',
};

export const difficultyOrder = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const getDifficultyStyle = (difficulty = '') =>
  difficultyStyles[String(difficulty).toLowerCase()] || 'border-slate-700 bg-slate-800/70 text-slate-300';

export const getDifficultyDotStyle = (difficulty = '') =>
  difficultyDotStyles[String(difficulty).toLowerCase()] || 'bg-slate-500';

export const getStatusStyle = (status = '') =>
  statusStyles[String(status).toLowerCase()] || 'border-slate-700 bg-slate-800/70 text-slate-300';

export const formatDifficulty = (difficulty = '') => {
  const value = String(difficulty || '').trim();
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown';
};

export const formatTag = (tag = '') =>
  String(tag || 'general')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getProblemTags = (problem) => {
  if (Array.isArray(problem?.tags)) return problem.tags.filter(Boolean);
  return problem?.tags ? [problem.tags] : ['general'];
};

export const getProblemTag = (problem) => getProblemTags(problem)[0] || 'general';

export const getAcceptanceRate = (problem, index = 0) => {
  if (typeof problem?.acceptance === 'number') return Math.round(problem.acceptance);
  const seed = `${problem?.title || ''}${problem?._id || ''}`.length + index * 9;
  return Math.min(96, Math.max(38, 54 + (seed % 39)));
};

export const getPopularityScore = (problem, index = 0) => {
  if (typeof problem?.frequency === 'number') return Math.round(problem.frequency);
  const seed = `${problem?.title || ''}${problem?.difficulty || ''}`.length * 11 + index * 13;
  return Math.min(99, Math.max(35, 48 + (seed % 51)));
};

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

export function calculateStreaks(activityData) {
  if (!activityData) return { currentStreak: 0, maxStreak: 0 };
  
  const today = new Date();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Max streak
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;

    if (activityData[dateStr] > 0) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak (go backwards from today)
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;

    if (activityData[dateStr] > 0) {
      currentStreak++;
    } else if (i === 0) {
      // It's today, it's ok if they haven't solved yet
      continue;
    } else {
      break;
    }
  }

  return { currentStreak, maxStreak };
}
