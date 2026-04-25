export const difficultyStyles = {
  easy: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  medium: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  hard: 'border-red-400/25 bg-red-400/10 text-red-300',
};

export const difficultyDotStyles = {
  easy: 'bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.7)]',
  medium: 'bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.7)]',
  hard: 'bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.7)]',
};

export const getDifficultyStyle = (difficulty = '') =>
  difficultyStyles[difficulty.toLowerCase()] || 'border-slate-400/25 bg-slate-400/10 text-slate-300';

export const getDifficultyDotStyle = (difficulty = '') =>
  difficultyDotStyles[difficulty.toLowerCase()] || 'bg-slate-400';

export const formatDifficulty = (difficulty = '') =>
  difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Unknown';

export const getProblemTag = (problem) =>
  Array.isArray(problem?.tags) ? problem.tags[0] : problem?.tags || 'general';
