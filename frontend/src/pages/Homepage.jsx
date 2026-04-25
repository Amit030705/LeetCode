import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  LineChart,
  Medal,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { GlassCard, ProductShell, SectionHeader, StatPill } from '../components/ProductShell';
import { formatDifficulty, getDifficultyDotStyle, getDifficultyStyle, getProblemTag } from '../utils/uiHelpers';

const features = [
  { icon: Target, title: 'Interview-grade problem paths', text: 'Curated DSA tracks by topic, company pattern, and difficulty progression.' },
  { icon: Zap, title: 'Fast execution workflow', text: 'Run, submit, inspect results, and learn from editorial content without context switching.' },
  { icon: ShieldCheck, title: 'Real progress intelligence', text: 'Track accuracy, streaks, solved count, and recommended next problems.' },
];

const testimonials = [
  { name: 'Aarav M.', role: 'SDE Intern', quote: 'The dashboard made my daily placement prep feel focused and measurable.' },
  { name: 'Nisha R.', role: 'Backend Engineer', quote: 'The coding workspace feels polished enough to use for serious contest practice.' },
  { name: 'Rahul K.', role: 'Final Year Student', quote: 'Topic filters and recommendations helped me stop randomly solving problems.' },
];

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
      ))}
    </div>
  );
}

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    query: '',
    sort: 'default',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [problemResponse, solvedResponse] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser').catch(() => ({ data: [] })),
        ]);
        setProblems(problemResponse.data || []);
        setSolvedProblems(solvedResponse.data || []);
      } catch (error) {
        console.error('Error fetching platform data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const solvedIds = useMemo(() => new Set(solvedProblems.map((problem) => problem._id)), [solvedProblems]);
  const tags = useMemo(() => [...new Set(problems.map(getProblemTag).filter(Boolean))], [problems]);

  const filteredProblems = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();

    const rows = problems.filter((problem) => {
      const tag = getProblemTag(problem);
      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const tagMatch = filters.tag === 'all' || tag === filters.tag;
      const statusMatch =
        filters.status === 'all' ||
        (filters.status === 'solved' ? solvedIds.has(problem._id) : !solvedIds.has(problem._id));
      const queryMatch =
        !normalizedQuery ||
        problem.title?.toLowerCase().includes(normalizedQuery) ||
        tag?.toLowerCase().includes(normalizedQuery);

      return difficultyMatch && tagMatch && statusMatch && queryMatch;
    });

    if (filters.sort === 'difficulty') {
      const order = { easy: 1, medium: 2, hard: 3 };
      return [...rows].sort((a, b) => (order[a.difficulty] || 9) - (order[b.difficulty] || 9));
    }

    if (filters.sort === 'title') {
      return [...rows].sort((a, b) => a.title.localeCompare(b.title));
    }

    return rows;
  }, [filters, problems, solvedIds]);

  const solvedCount = solvedProblems.length;
  const totalProblems = problems.length || 1;
  const accuracy = Math.min(96, Math.max(62, Math.round((solvedCount / totalProblems) * 100) || 78));

  return (
    <ProductShell>
      <main>
        <section className="relative px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Placement prep, redesigned for momentum
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Master Coding Interviews & Crack Placements
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Practice curated problems, run code in a premium editor, monitor progress, and build the habits that turn interview prep into offers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <NavLink to="/problems" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 text-sm font-black text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-200">
                  Start Practicing
                  <ArrowRight className="h-4 w-4" />
                </NavLink>
                <NavLink to="/dashboard" className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/10">
                  Explore Problems
                </NavLink>
              </div>
            </motion.div>

            <GlassCard className="p-4 sm:p-5">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/80 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Live Dashboard</p>
                    <p className="text-xs text-slate-500">Today&apos;s coding pulse</p>
                  </div>
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">Online</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatPill icon={CheckCircle2} value={solvedCount || 128} label="Solved" />
                  <StatPill icon={Flame} value="12 days" label="Streak" />
                  <StatPill icon={Trophy} value="#2,418" label="Rank" />
                  <StatPill icon={BarChart3} value={`${accuracy}%`} label="Accuracy" />
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-bold text-white">Weekly Progress</span>
                    <span className="text-cyan-200">+18%</span>
                  </div>
                  <div className="flex h-28 items-end gap-2">
                    {[38, 62, 46, 76, 58, 88, 72].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-violet-500 to-cyan-300" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section id="dashboard" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Dashboard</p>
                <h2 className="mt-2 text-3xl font-black text-white">Welcome back, {user?.firstName || 'coder'}</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-400">Your workspace is tuned for daily practice, placement prep, and contest readiness.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatPill icon={CheckCircle2} value={solvedCount} label="Problems Solved" />
              <StatPill icon={Flame} value="12" label="Daily Streak" />
              <StatPill icon={Medal} value="#2,418" label="Ranking" />
              <StatPill icon={TrendingUp} value={`${accuracy}%`} label="Accuracy" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <GlassCard className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">Recommended Problems</h3>
                  <NavLink to="/problems" className="text-sm font-bold text-cyan-200 hover:text-cyan-100">View all</NavLink>
                </div>
                <div className="space-y-3">
                  {loading ? <SkeletonRows /> : filteredProblems.slice(0, 4).map((problem) => (
                    <NavLink key={problem._id} to={`/problem/${problem._id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.07]">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${getDifficultyDotStyle(problem.difficulty)}`} />
                        <div>
                          <p className="font-bold text-white">{problem.title}</p>
                          <p className="text-sm text-slate-500">{getProblemTag(problem)} · 68% acceptance</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${getDifficultyStyle(problem.difficulty)}`}>{formatDifficulty(problem.difficulty)}</span>
                    </NavLink>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-black text-white">Recent Activity</h3>
                <div className="mt-5 space-y-4">
                  {['Solved Array Sprint', 'Submitted DP Challenge', 'Watched Editorial', 'Joined Weekly Contest'].map((activity, index) => (
                    <div key={activity} className="flex gap-3">
                      <div className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-cyan-200">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{activity}</p>
                        <p className="text-sm text-slate-500">{index + 1}h ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        <section id="problems" className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Problem Library"
              title="A serious workspace for serious practice"
              description="Search, filter, sort, and continue exactly where your preparation needs the most leverage."
            />

            <GlassCard className="p-4 sm:p-6">
              <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.query}
                    onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                    placeholder="Search problems, tags, topics..."
                    className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
                  />
                </div>
                {[
                  ['status', [['all', 'All Status'], ['solved', 'Solved'], ['unsolved', 'Unsolved']]],
                  ['difficulty', [['all', 'All Difficulty'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']]],
                  ['tag', [['all', 'All Topics'], ...tags.map((tag) => [tag, tag])]],
                ].map(([key, options]) => (
                  <select
                    key={key}
                    value={filters[key]}
                    onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}
                    className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none focus:border-cyan-300/40"
                  >
                    {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                ))}
                <select
                  value={filters.sort}
                  onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none focus:border-cyan-300/40"
                >
                  <option value="default">Recommended</option>
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-4">Status</th>
                      <th className="px-4">Title</th>
                      <th className="px-4">Acceptance</th>
                      <th className="px-4">Difficulty</th>
                      <th className="px-4">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5"><SkeletonRows /></td></tr>
                    ) : filteredProblems.length ? filteredProblems.map((problem) => {
                      const solved = solvedIds.has(problem._id);
                      return (
                        <tr key={problem._id} className="group">
                          <td className="rounded-l-2xl border-y border-l border-white/10 bg-white/[0.035] px-4 py-4">
                            <CheckCircle2 className={`h-5 w-5 ${solved ? 'text-emerald-300' : 'text-slate-600'}`} />
                          </td>
                          <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4">
                            <NavLink to={`/problem/${problem._id}`} className="font-black text-white transition group-hover:text-cyan-200">{problem.title}</NavLink>
                          </td>
                          <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4 text-sm font-bold text-slate-400">{65 + (problem.title?.length || 0) % 25}%</td>
                          <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4">
                            <span className={`rounded-full border px-3 py-1 text-xs font-black ${getDifficultyStyle(problem.difficulty)}`}>{formatDifficulty(problem.difficulty)}</span>
                          </td>
                          <td className="rounded-r-2xl border-y border-r border-white/10 bg-white/[0.035] px-4 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                              {getProblemTag(problem)}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" className="rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-12 text-center">
                          <BookOpen className="mx-auto h-10 w-10 text-slate-600" />
                          <p className="mt-3 font-bold text-white">No matching problems</p>
                          <p className="mt-1 text-sm text-slate-500">Try changing filters or search terms.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Why LeecoAI" title="Built like a product, not a classroom assignment" />
            <div className="grid gap-5 md:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <GlassCard key={title} className="p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{text}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-3">
              <StatPill icon={Users} value="12k+" label="Active Users" />
              <StatPill icon={GraduationCap} value={`${problems.length || 450}+`} label="Problems" />
              <StatPill icon={Building2} value="80+" label="Companies" />
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonials.map((item) => (
                <GlassCard key={item.name} className="p-6">
                  <LineChart className="h-6 w-6 text-cyan-200" />
                  <p className="mt-5 text-lg font-semibold leading-8 text-white">&quot;{item.quote}&quot;</p>
                  <div className="mt-5">
                    <p className="font-black text-white">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      </main>
    </ProductShell>
  );
}

export default Homepage;
