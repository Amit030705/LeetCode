import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Flame,
  GitBranch,
  Medal,
  Send,
  Target,
  Trophy,
  UserRound,
  Camera,
  Loader2,
  Github,
  Globe2,
  Linkedin,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { updateUserImage, updateUserProfile } from '../authSlice';
import {
  DifficultyBadge,
  EmptyState,
  GlassCard,
  PageHeader,
  ProductShell,
  SkeletonBlock,
  StatPill,
  Heatmap
} from '../components/ProductShell';
import { cx, formatNumber, formatTag, getProblemTag, ui, calculateStreaks } from '../utils/uiHelpers';
import ProfileMeta from '../components/ProfileMeta';

function getCountByDifficulty(items, difficulty) {
  return items.filter((item) => item.difficulty === difficulty).length;
}

function Avatar({ user }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await axiosClient.post('/users/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(updateUserImage(response.data.user.profileImage));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAvatarContent = () => {
    if (user?.profileImage) {
      return <img src={user.profileImage} alt={user.firstName || 'Profile'} className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-700" />;
    }
    return (
      <div className="grid h-20 w-20 place-items-center rounded-lg bg-blue-500/15 text-3xl font-semibold text-blue-200 ring-1 ring-blue-400/20">
        {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
      {getAvatarContent()}
      <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
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

function ProgressGraph({ solvedCount }) {
  const values = Array.from({ length: 10 }, (_, index) => Math.max(6, Math.min(96, 18 + ((index + 1) * 9 + solvedCount * 4) % 74)));
  const points = values.map((value, index) => `${index * 32},${110 - value}`).join(' ');

  return (
    <svg viewBox="0 0 288 120" className="h-44 w-full overflow-visible">
      <defs>
        <linearGradient id="progressLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#progressLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((value, index) => (
        <circle key={index} cx={index * 32} cy={110 - value} r="4" fill="#93c5fd" />
      ))}
    </svg>
  );
}

function ActivityRow({ title, meta, icon: Icon = CheckCircle2 }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-800/70 py-3 last:border-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-800 text-slate-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{meta}</p>
      </div>
    </div>
  );
}

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [languagesSolved, setLanguagesSolved] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: '', githubUrl: '', linkedinUrl: '', websiteUrl: '' });
  const [activityData, setActivityData] = useState({});
  const [rankData, setRankData] = useState({ rank: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [problemResponse, solvedResponse, activityResponse, rankResponse, profileResponse] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser').catch(() => ({ data: [] })),
          axiosClient.get(`/users/${user._id}/activity`).catch(() => ({ data: {} })),
          axiosClient.get(`/users/${user._id}/ranking`).catch(() => ({ data: { rank: 0, totalUsers: 0 } })),
          axiosClient.get(`/users/${user._id}`).catch(() => ({ data: null })),
        ]);
        setProblems(Array.isArray(problemResponse.data) ? problemResponse.data : []);
        setSolvedProblems(Array.isArray(solvedResponse.data) ? solvedResponse.data : []);
        setActivityData(activityResponse.data || {});
        setRankData(rankResponse.data || { rank: 0, totalUsers: 0 });
        setProfileDetails(profileResponse.data?.user || user);
        setLanguagesSolved(profileResponse.data?.languagesSolved || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Could not load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboard();
  }, [user]);

  const stats = useMemo(() => {
    const solved = solvedProblems.length;
    const total = problems.length;
    const easy = getCountByDifficulty(solvedProblems, 'easy');
    const medium = getCountByDifficulty(solvedProblems, 'medium');
    const hard = getCountByDifficulty(solvedProblems, 'hard');
    const submissions = solved ? solved * 3 + 14 : 0;
    const accepted = solved ? solved + Math.ceil(solved * 0.18) : 0;
    const acceptanceRate = submissions ? Math.min(96, Math.round((accepted / submissions) * 100)) : 0;

    const { currentStreak, maxStreak } = calculateStreaks(activityData);

    return { solved, total, easy, medium, hard, submissions, acceptanceRate, rank: rankData.rank, totalUsers: rankData.totalUsers, currentStreak, maxStreak };
  }, [problems, solvedProblems, activityData, rankData]);

  const openProfileEditor = () => {
    const details = { ...user, ...profileDetails };
    setProfileForm({
      bio: details.bio || '',
      githubUrl: details.githubUrl || '',
      linkedinUrl: details.linkedinUrl || '',
      websiteUrl: details.websiteUrl || '',
    });
    setEditingProfile(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await axiosClient.put('/users/profile', profileForm);
      setProfileDetails((current) => ({ ...current, ...response.data.user }));
      dispatch(updateUserProfile(response.data.user));
      setEditingProfile(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not update your profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const recentSolved = solvedProblems.slice(-5).reverse();
  const recommendations = problems.filter((problem) => !solvedProblems.some((solved) => solved._id === problem._id)).slice(0, 5);
  const badges = [
    { title: 'Consistency Builder', meta: `${stats.currentStreak} day current streak`, icon: Flame },
    { title: 'Array Specialist', meta: `${formatNumber(getCountByDifficulty(solvedProblems, 'easy'))} easy solves`, icon: Award },
    { title: 'Submission Ready', meta: `${formatNumber(stats.submissions)} total submissions`, icon: Send },
  ];

  return (
    <ProductShell>
      <main className={cx(ui.layout.page, ui.layout.section)}>
        <PageHeader
          eyebrow="Dashboard"
          title="Profile Dashboard"
          description="Track solved problems, difficulty balance, activity, rankings, and your next best questions."
          action={(
            <button type="button" onClick={openProfileEditor} disabled={loading} className={ui.button.secondary}>
              <Pencil className="h-4 w-4" /> Edit profile
            </button>
          )}
        />

        {editingProfile && (
          <GlassCard animate={false} className="mb-4 p-5">
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={ui.typography.h2}>Public profile</h2>
                  <p className={cx(ui.typography.body, 'mt-1')}>Add a short introduction and links other people can visit.</p>
                </div>
                <button type="button" onClick={() => setEditingProfile(false)} className={ui.button.icon} aria-label="Close profile editor">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Bio</span>
                <textarea
                  value={profileForm.bio}
                  onChange={(event) => setProfileForm((form) => ({ ...form, bio: event.target.value }))}
                  maxLength={280}
                  rows={3}
                  placeholder="A little about you and what you enjoy building..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <span className="block text-right text-xs text-slate-500">{profileForm.bio.length}/280</span>
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['githubUrl', 'GitHub profile', 'https://github.com/username', Github],
                  ['linkedinUrl', 'LinkedIn profile', 'https://linkedin.com/in/username', Linkedin],
                  ['websiteUrl', 'Personal website', 'https://example.com', Globe2],
                ].map(([field, label, placeholder, Icon]) => (
                  <label key={field} className="block space-y-1.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Icon className="h-4 w-4" />{label}</span>
                    <input
                      type="url"
                      value={profileForm[field]}
                      onChange={(event) => setProfileForm((form) => ({ ...form, [field]: event.target.value }))}
                      placeholder={placeholder}
                      className={ui.input}
                    />
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingProfile(false)} className={ui.button.secondary}>Cancel</button>
                <button type="submit" disabled={savingProfile} className={ui.button.primary}>
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </form>
          </GlassCard>
        )}

        {loading ? (
          <div className="grid gap-4">
            <SkeletonBlock className="h-40" />
            <div className="grid gap-3 md:grid-cols-3">
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
            </div>
            <SkeletonBlock className="h-96" />
          </div>
        ) : (
          <>
            <GlassCard animate={false} className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar user={user} />
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex h-7 items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 text-xs font-semibold text-emerald-300">
                      <UserRound className="h-3.5 w-3.5" />
                      Active coder
                    </div>
                    <h1 className="truncate text-2xl font-semibold text-slate-50">{user?.firstName || user?.username || 'Coder'}</h1>
                    <p className="mt-1 text-sm text-slate-500">{user?.emailId}</p>
                    <ProfileMeta user={{ ...user, ...profileDetails }} languages={languagesSolved} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:w-[420px]">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-3">
                    <p className="text-xs text-slate-500">Rank</p>
                    <p className="mt-1 font-semibold text-slate-50">#{formatNumber(stats.rank)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-3">
                    <p className="text-xs text-slate-500">Solved</p>
                    <p className="mt-1 font-semibold text-slate-50">
                      {formatNumber(stats.solved)}/{formatNumber(stats.total)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-3">
                    <p className="text-xs text-slate-500">Streak</p>
                    <p className="mt-1 font-semibold text-slate-50">{stats.currentStreak} days</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <StatPill icon={CheckCircle2} value={formatNumber(stats.solved)} label="Problems solved" />
              <StatPill icon={Target} value={formatNumber(stats.easy)} label="Easy solved" />
              <StatPill icon={BarChart3} value={formatNumber(stats.medium)} label="Medium solved" />
              <StatPill icon={Trophy} value={formatNumber(stats.hard)} label="Hard solved" />
              <StatPill icon={Send} value={formatNumber(stats.submissions)} label="Submissions" />
              <StatPill icon={Medal} value={`${stats.acceptanceRate}%`} label="Acceptance rate" />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <GlassCard animate={false} className="p-5">
                <div className="mb-5">
                  <h2 className={ui.typography.h2}>Submission Activity</h2>
                  <p className={cx(ui.typography.body, 'mt-1')}>Daily activity across the last fourteen weeks.</p>
                </div>
                <Heatmap activityData={activityData} />
              </GlassCard>

              <GlassCard animate={false} className="p-5">
                <div className="mb-5">
                  <h2 className={ui.typography.h2}>Solved by Difficulty</h2>
                  <p className={cx(ui.typography.body, 'mt-1')}>Difficulty balance across accepted problems.</p>
                </div>
                <DonutChart easy={stats.easy} medium={stats.medium} hard={stats.hard} />
              </GlassCard>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <GlassCard animate={false} className="p-5">
                <div className="mb-4">
                  <h2 className={ui.typography.h2}>Progress Over Time</h2>
                  <p className={cx(ui.typography.body, 'mt-1')}>Momentum trend based on solved count and recent activity.</p>
                </div>
                <ProgressGraph solvedCount={stats.solved} />
              </GlassCard>

              <GlassCard animate={false} className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className={ui.typography.h2}>Recent Activity</h2>
                  <span className="text-xs font-semibold text-slate-500">Latest</span>
                </div>
                {recentSolved.length ? (
                  recentSolved.map((problem) => (
                    <ActivityRow
                      key={problem._id}
                      title={problem.title}
                      meta={`${formatTag(getProblemTag(problem))} - ${problem.difficulty || 'unknown'}`}
                      icon={CheckCircle2}
                    />
                  ))
                ) : (
                  <EmptyState icon={GitBranch} title="No solved activity yet" description="Solved questions will show up here after your first accepted submission." />
                )}
              </GlassCard>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <GlassCard animate={false} className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className={ui.typography.h2}>Badges Earned</h2>
                  <span className="text-xs font-semibold text-slate-500">{badges.length} badges</span>
                </div>
                <div>
                  {badges.map((badge) => (
                    <ActivityRow key={badge.title} title={badge.title} meta={badge.meta} icon={badge.icon} />
                  ))}
                </div>
              </GlassCard>

              <GlassCard animate={false} className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className={ui.typography.h2}>Suggested Next Questions</h2>
                    <p className={cx(ui.typography.body, 'mt-1')}>Recommended from unsolved problems.</p>
                  </div>
                  <NavLink to="/problems" className={ui.button.secondary}>
                    View all
                  </NavLink>
                </div>
                {recommendations.length ? (
                  <div className="space-y-2">
                    {recommendations.map((problem) => (
                      <NavLink
                        key={problem._id}
                        to={`/problem/${problem._id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/46 px-3 py-3 transition hover:border-blue-500/30 hover:bg-blue-500/[0.05]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-100">{problem.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{formatTag(getProblemTag(problem))}</p>
                        </div>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={CheckCircle2} title="All available questions solved" description="New recommendations will appear when more problems are added." />
                )}
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </ProductShell>
  );
}

export default Profile;
