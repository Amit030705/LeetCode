import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowDownUp,
  BookOpen,
  CheckCircle2,
  Circle,
  Filter,
  Flame,
  Loader2,
  Search,
  SlidersHorizontal,
  Target,
  Trophy,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import {
  Button,
  DifficultyBadge,
  EmptyState,
  GlassCard,
  PageHeader,
  ProductShell,
  SkeletonBlock,
  StatPill,
} from '../components/ProductShell';
import {
  cx,
  difficultyOrder,
  formatNumber,
  formatTag,
  getAcceptanceRate,
  getPopularityScore,
  getProblemTag,
  getProblemTags,
  ui,
  calculateStreaks,
} from '../utils/uiHelpers';

const defaultFilters = {
  query: '',
  difficulty: 'all',
  topic: 'all',
  status: 'all',
  sort: 'popular',
};

const sortOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'acceptance', label: 'Acceptance' },
  { value: 'newest', label: 'Newest' },
];

const pageSize = 10;

function SelectField({ icon: Icon, label, value, onChange, options }) {
  return (
    <label className="min-w-0">
      <span className="sr-only">{label}</span>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />}
        <select value={value} onChange={onChange} className={cx(ui.select, Icon && 'pl-9', 'w-full min-w-[148px]')}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => (
        <tr key={index}>
          <td colSpan="6" className="py-2">
            <SkeletonBlock className="h-14 w-full" />
          </td>
        </tr>
      ))}
    </>
  );
}

function StatusIcon({ solved }) {
  return solved ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-label="Solved" />
  ) : (
    <Circle className="h-5 w-5 text-slate-600" aria-label="Unsolved" />
  );
}

function Homepage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [activityData, setActivityData] = useState({});
  const [rankData, setRankData] = useState({ rank: 0, totalUsers: 0 });

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const [problemResponse, solvedResponse, activityResponse, rankResponse] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser').catch(() => ({ data: [] })),
          axiosClient.get(`/users/${user._id}/activity`).catch(() => ({ data: {} })),
          axiosClient.get(`/users/${user._id}/ranking`).catch(() => ({ data: { rank: 0, totalUsers: 0 } })),
        ]);
        setProblems(Array.isArray(problemResponse.data) ? problemResponse.data : []);
        setSolvedProblems(Array.isArray(solvedResponse.data) ? solvedResponse.data : []);
        setActivityData(activityResponse.data || {});
        setRankData(rankResponse.data || { rank: 0, totalUsers: 0 });
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Could not load problems');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProblems();
  }, [user]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const solvedIds = useMemo(() => new Set(solvedProblems.map((problem) => problem._id)), [solvedProblems]);

  const topics = useMemo(() => {
    const values = problems.flatMap((problem) => getProblemTags(problem));
    return [...new Set(values)].filter(Boolean).sort((a, b) => formatTag(a).localeCompare(formatTag(b)));
  }, [problems]);

  const enrichedProblems = useMemo(
    () =>
      problems.map((problem, index) => ({
        ...problem,
        acceptance: getAcceptanceRate(problem, index),
        popularity: getPopularityScore(problem, index),
        primaryTag: getProblemTag(problem),
        tagList: getProblemTags(problem),
        originalIndex: index,
      })),
    [problems],
  );

  const filteredProblems = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const rows = enrichedProblems.filter((problem) => {
      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const topicMatch = filters.topic === 'all' || problem.tagList.includes(filters.topic);
      const solved = solvedIds.has(problem._id);
      const statusMatch = filters.status === 'all' || (filters.status === 'solved' ? solved : !solved);
      const searchMatch =
        !query ||
        problem.title?.toLowerCase().includes(query) ||
        problem.tagList.some((tag) => formatTag(tag).toLowerCase().includes(query));

      return difficultyMatch && topicMatch && statusMatch && searchMatch;
    });

    return [...rows].sort((a, b) => {
      if (filters.sort === 'acceptance') return b.acceptance - a.acceptance;
      if (filters.sort === 'newest') return b.originalIndex - a.originalIndex;
      if (filters.sort === 'popular') return b.popularity - a.popularity;
      return (difficultyOrder[a.difficulty] || 9) - (difficultyOrder[b.difficulty] || 9);
    });
  }, [enrichedProblems, filters, solvedIds]);

  const visibleProblems = filteredProblems.slice(0, page * pageSize);
  const hasMore = visibleProblems.length < filteredProblems.length;
  const solvedCount = solvedProblems.length;
  const totalCount = problems.length;
  const easySolved = solvedProblems.filter((problem) => problem.difficulty === 'easy').length;
  const mediumSolved = solvedProblems.filter((problem) => problem.difficulty === 'medium').length;
  const hardSolved = solvedProblems.filter((problem) => problem.difficulty === 'hard').length;
  const acceptanceRate = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <ProductShell>
      <main className={cx(ui.layout.page, ui.layout.section)}>
        <PageHeader
          eyebrow="Questions"
          title="Problem Set"
          description="A focused LeetCode-style workspace for searching, filtering, sorting, and opening coding questions fast."
          action={
            <Button variant="secondary" onClick={() => setFilters(defaultFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
              Reset
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatPill icon={Target} value={`${formatNumber(solvedCount)}/${formatNumber(totalCount)}`} label="Problems solved" detail={`${acceptanceRate}% completion`} />
          <StatPill icon={CheckCircle2} value={`${easySolved}/${mediumSolved}/${hardSolved}`} label="Easy / Medium / Hard" />
          <StatPill icon={Flame} value={`${calculateStreaks(activityData).currentStreak} days`} label="Current streak" />
          <StatPill icon={Trophy} value={`#${formatNumber(rankData.rank)}`} label={`Global ranking (of ${formatNumber(rankData.totalUsers)})`} />
        </div>

        <GlassCard animate={false} className="sticky top-[4.5rem] z-30 mt-5 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search questions</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={filters.query}
                onChange={(event) => updateFilter('query', event.target.value)}
                placeholder="Search by title or topic"
                className={cx(ui.input, 'pl-9')}
              />
            </label>

            <SelectField
              icon={Filter}
              label="Difficulty"
              value={filters.difficulty}
              onChange={(event) => updateFilter('difficulty', event.target.value)}
              options={[
                { value: 'all', label: 'All Difficulty' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />

            <SelectField
              icon={BookOpen}
              label="Topic"
              value={filters.topic}
              onChange={(event) => updateFilter('topic', event.target.value)}
              options={[{ value: 'all', label: 'All Topics' }, ...topics.map((topic) => ({ value: topic, label: formatTag(topic) }))]}
            />

            <SelectField
              icon={CheckCircle2}
              label="Status"
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'solved', label: 'Solved' },
                { value: 'unsolved', label: 'Unsolved' },
              ]}
            />

            <SelectField
              icon={ArrowDownUp}
              label="Sort"
              value={filters.sort}
              onChange={(event) => updateFilter('sort', event.target.value)}
              options={sortOptions}
            />
          </div>
        </GlassCard>

        <GlassCard animate={false} className="mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">Questions</p>
              <p className={ui.typography.caption}>
                Showing {formatNumber(visibleProblems.length)} of {formatNumber(filteredProblems.length)}
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead className="bg-slate-950/60">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="w-16 px-4 py-3">Status</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Acceptance</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <TableSkeleton />
                ) : visibleProblems.length ? (
                  visibleProblems.map((problem, index) => {
                    const solved = solvedIds.has(problem._id);
                    return (
                      <motion.tr
                        key={problem._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: Math.min(index * 0.015, 0.12) }}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/problem/${problem._id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') navigate(`/problem/${problem._id}`);
                        }}
                        className="group cursor-pointer bg-slate-900/28 outline-none transition hover:bg-blue-500/[0.06] focus:bg-blue-500/[0.08]"
                      >
                        <td className="px-4 py-4">
                          <StatusIcon solved={solved} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className={cx('h-2 w-2 rounded-full', solved ? 'bg-emerald-400' : 'bg-slate-600')} />
                            <div>
                              <p className="font-semibold text-slate-100 transition group-hover:text-blue-200">{problem.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">#{String(problem.originalIndex + 1).padStart(3, '0')} - {formatTag(problem.primaryTag)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-10 text-sm font-semibold text-slate-200">{problem.acceptance}%</span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                              <div className="h-full rounded-full bg-blue-400" style={{ width: `${problem.acceptance}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {problem.tagList.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs font-medium text-slate-400">
                                {formatTag(tag)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                              <div className="h-full rounded-full bg-slate-400" style={{ width: `${problem.popularity}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-slate-300">{problem.popularity}</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6">
                      <EmptyState
                        icon={Search}
                        title="No questions match these filters"
                        description="Adjust difficulty, topic, status, or search text to find more problems."
                        action={
                          <Button variant="secondary" onClick={() => setFilters(defaultFilters)}>
                            Clear filters
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredProblems.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {hasMore ? 'Load the next page of questions without leaving the table.' : 'You are viewing every matching question.'}
              </p>
              <Button variant={hasMore ? 'secondary' : 'ghost'} disabled={!hasMore} onClick={() => setPage((current) => current + 1)}>
                Load more
              </Button>
            </div>
          )}
        </GlassCard>
      </main>
    </ProductShell>
  );
}

export default Homepage;
