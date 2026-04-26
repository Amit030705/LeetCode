import { useEffect, useState, useMemo } from 'react';
import { useParams, NavLink } from 'react-router';
import toast from 'react-hot-toast';
import {
  Award,
  BarChart3,
  CheckCircle2,
  GitBranch,
  Medal,
  Send,
  Target,
  Trophy,
  UserRound,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import {
  DifficultyBadge,
  EmptyState,
  GlassCard,
  ProductShell,
  SkeletonBlock,
  StatPill,
} from '../components/ProductShell';
import { cx, formatNumber, formatTag, getProblemTag, ui } from '../utils/uiHelpers';

// Reusing some of the helper components from Profile.jsx but adapted for public view
function getCountByDifficulty(items, difficulty) {
  return items.filter((item) => item?.difficulty === difficulty).length;
}

function Heatmap({ solvedCount }) {
  const days = Array.from({ length: 98 }, (_, index) => (index * 7 + solvedCount * 3) % 5);
  const colors = ['bg-slate-800', 'bg-emerald-950', 'bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400'];

  return (
    <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5">
      {days.map((level, index) => (
        <div key={index} className={cx('aspect-square rounded-[3px]', colors[level])} />
      ))}
    </div>
  );
}

function DonutChart({ easy, medium, hard }) {
  const total = easy + medium + hard;
  const denominator = Math.max(total, 1);
  const easyEnd = (easy / denominator) * 360;
  const mediumEnd = easyEnd + (medium / denominator) * 360;

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative grid h-36 w-36 place-items-center rounded-full"
        style={{
          background: total
            ? `conic-gradient(#34d399 0deg ${easyEnd}deg, #fbbf24 ${easyEnd}deg ${mediumEnd}deg, #f87171 ${mediumEnd}deg 360deg)`
            : '#1e293b',
        }}
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-950 text-center">
          <div>
            <p className="text-2xl font-semibold text-slate-50">{total}</p>
            <p className="text-xs font-medium text-slate-500">Solved</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {[
          ['Easy', easy, 'bg-emerald-400'],
          ['Medium', medium, 'bg-amber-400'],
          ['Hard', hard, 'bg-red-400'],
        ].map(([label, value, color]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className={cx('h-2.5 w-2.5 rounded-full', color)} />
            <span className="w-16 font-medium text-slate-300">{label}</span>
            <span className="font-semibold text-slate-100">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicProfile() {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/users/${userId}`);
        setProfileData(response.data);
      } catch (error) {
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const stats = useMemo(() => {
    if (!profileData) return { solved: 0, total: 0, easy: 0, medium: 0, hard: 0, submissions: 0, acceptanceRate: 0, rank: 0 };
    
    const { solvedProblems, totalProblems } = profileData;
    const solved = solvedProblems.length;
    const easy = getCountByDifficulty(solvedProblems, 'easy');
    const medium = getCountByDifficulty(solvedProblems, 'medium');
    const hard = getCountByDifficulty(solvedProblems, 'hard');
    
    // Estimates for display
    const submissions = solved ? solved * 3 + 14 : 0;
    const accepted = solved ? solved + Math.ceil(solved * 0.18) : 0;
    const acceptanceRate = submissions ? Math.min(96, Math.round((accepted / submissions) * 100)) : 0;
    const rank = Math.max(1, 5000 - solved * 19);

    return { solved, total: totalProblems, easy, medium, hard, submissions, acceptanceRate, rank };
  }, [profileData]);

  if (loading) {
    return (
      <ProductShell>
        <main className={cx(ui.layout.page, ui.layout.section)}>
          <div className="grid gap-4">
            <SkeletonBlock className="h-40" />
            <div className="grid gap-3 md:grid-cols-3">
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
            </div>
            <SkeletonBlock className="h-96" />
          </div>
        </main>
      </ProductShell>
    );
  }

  if (!profileData) {
    return (
      <ProductShell>
        <main className={cx(ui.layout.page, ui.layout.section)}>
           <EmptyState icon={UserRound} title="Profile not found" description="The user you are looking for does not exist." />
        </main>
      </ProductShell>
    );
  }

  const { user, solvedProblems } = profileData;
  const recentSolved = [...solvedProblems].slice(-5).reverse();
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ProductShell>
      <main className={cx(ui.layout.page, ui.layout.section)}>
        <GlassCard animate={false} className="p-5 mb-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.firstName} className="h-24 w-24 rounded-xl object-cover ring-2 ring-slate-700" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-xl bg-blue-500/15 text-4xl font-semibold text-blue-200 ring-2 ring-blue-400/20">
                  {(user.firstName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="mb-2 inline-flex h-7 items-center gap-2 rounded-md border border-slate-700 bg-slate-800/50 px-2.5 text-xs font-semibold text-slate-300">
                  <UserRound className="h-3.5 w-3.5" />
                  Joined {joinedDate}
                </div>
                <h1 className="truncate text-3xl font-bold text-slate-50">{user.firstName} {user.lastName}</h1>
                <p className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  Rank #{formatNumber(stats.rank)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm lg:w-[320px]">
              <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-3 text-center">
                <p className="text-xs text-slate-500">Problems Solved</p>
                <p className="mt-1 font-bold text-2xl text-slate-50">{formatNumber(stats.solved)}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-3 text-center">
                <p className="text-xs text-slate-500">Acceptance Rate</p>
                <p className="mt-1 font-bold text-2xl text-slate-50">{stats.acceptanceRate}%</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] mb-4">
          <GlassCard animate={false} className="p-5">
            <div className="mb-5">
              <h2 className={ui.typography.h2}>Activity Heatmap</h2>
            </div>
            <Heatmap solvedCount={stats.solved} />
          </GlassCard>

          <GlassCard animate={false} className="p-5">
            <div className="mb-5">
              <h2 className={ui.typography.h2}>Difficulty Breakdown</h2>
            </div>
            <DonutChart easy={stats.easy} medium={stats.medium} hard={stats.hard} />
          </GlassCard>
        </div>

        <GlassCard animate={false} className="p-5">
          <div className="mb-4">
            <h2 className={ui.typography.h2}>Recent Solves</h2>
          </div>
          {recentSolved.length ? (
            <div className="space-y-2">
              {recentSolved.map((problem) => (
                <div key={problem._id} className="flex items-center gap-3 border-b border-slate-800/70 py-3 last:border-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{problem.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatTag(getProblemTag(problem))}</p>
                  </div>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={GitBranch} title="No activity" description="This user hasn't solved any problems yet." />
          )}
        </GlassCard>
      </main>
    </ProductShell>
  );
}

export default PublicProfile;
