import { useSelector } from 'react-redux';
import { Award, BarChart3, CheckCircle2, Flame, Github, MapPin, Sparkles, Target, Trophy } from 'lucide-react';
import { GlassCard, ProductShell, SectionHeader, StatPill } from '../components/ProductShell';

const skills = ['Arrays', 'Dynamic Programming', 'Graphs', 'Binary Search', 'Trees', 'System Design'];

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const days = Array.from({ length: 84 }, (_, index) => (index * 17) % 5);

  return (
    <ProductShell>
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.firstName} className="h-24 w-24 rounded-[28px] object-cover ring-4 ring-white/10" />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-cyan-300 to-violet-500 text-4xl font-black text-white ring-4 ring-white/10">
                    {(user?.firstName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Active Candidate
                  </div>
                  <h1 className="text-4xl font-black text-white">{user?.firstName || 'Coder'}</h1>
                  <p className="mt-2 text-slate-400">{user?.emailId}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-400">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> India</span>
                    <span className="inline-flex items-center gap-2"><Github className="h-4 w-4" /> github.com/leecoai</span>
                  </div>
                </div>
              </div>
              <button className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">Edit Profile</button>
            </div>
          </GlassCard>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatPill icon={CheckCircle2} value="128" label="Solved" />
            <StatPill icon={Flame} value="12" label="Streak" />
            <StatPill icon={Trophy} value="#2,418" label="Rank" />
            <StatPill icon={BarChart3} value="84%" label="Accuracy" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <GlassCard className="p-6">
              <SectionHeader eyebrow="Consistency" title="Solved Heatmap" description="A GitHub-style view of your coding habit." />
              <div className="grid grid-cols-12 gap-2">
                {days.map((level, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-md ${
                      level === 0 ? 'bg-white/5' : level === 1 ? 'bg-emerald-900' : level === 2 ? 'bg-emerald-700' : level === 3 ? 'bg-emerald-500' : 'bg-cyan-300'
                    }`}
                    title={`${level} submissions`}
                  />
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-2xl font-black text-white">Skills</h2>
              <p className="mt-2 text-sm text-slate-400">Topic mastery based on solved problem history.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                {['DSA Fundamentals', 'Interview Readiness', 'Contest Speed'].map((label, index) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span className="text-slate-300">{label}</span>
                      <span className="text-cyan-200">{78 + index * 6}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-500" style={{ width: `${78 + index * 6}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </ProductShell>
  );
}

export default Profile;
