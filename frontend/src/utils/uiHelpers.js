export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const ui = {
  layout: {
    page: 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8',
    section: 'py-6 sm:py-8',
    stack: 'space-y-4',
    navbarHeight: 'h-16',
  },
  typography: {
    h1: 'text-2xl font-semibold leading-tight text-slate-50 sm:text-3xl',
    h2: 'text-xl font-semibold leading-tight text-slate-50',
    h3: 'text-base font-semibold leading-6 text-slate-100',
    body: 'text-sm leading-6 text-slate-300',
    caption: 'text-xs font-medium leading-5 text-slate-500',
    overline: 'text-xs font-semibold uppercase tracking-[0.12em] text-slate-500',
  },
  card: 'rounded-lg border border-slate-800 bg-slate-900/72 shadow-[0_18px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl',
  cardHover: 'transition duration-200 hover:border-slate-700 hover:bg-slate-900/90',
  input:
    'h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 text-sm font-medium text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10',
  select:
    'h-10 rounded-lg border border-slate-800 bg-slate-950/80 px-3 text-sm font-medium text-slate-100 outline-none transition focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10',
  button: {
    primary:
      'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.24)] transition hover:bg-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-60',
    secondary:
      'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-700/30 disabled:pointer-events-none disabled:opacity-60',
    ghost:
      'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800/80 hover:text-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-700/30 disabled:pointer-events-none disabled:opacity-60',
    icon:
      'inline-grid h-10 w-10 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-slate-700/30',
  },
  skeleton: 'skeleton-shimmer rounded-md bg-slate-800/80',
  row:
    'rounded-lg border border-slate-800 bg-slate-900/56 transition duration-200 hover:border-blue-500/30 hover:bg-slate-800/72',
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
