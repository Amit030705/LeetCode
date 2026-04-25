import { CalendarClock, Crown, Timer, Trophy, Users } from 'lucide-react';
import { GlassCard, ProductShell, SectionHeader, StatPill } from '../components/ProductShell';

const contests = [
  { title: 'Weekly Sprint 42', starts: 'Tomorrow, 8:00 PM', duration: '90 min', level: 'Rated', players: '2,418' },
  { title: 'Placement Grand Challenge', starts: 'Sunday, 10:00 AM', duration: '150 min', level: 'Company', players: '8,901' },
  { title: 'DP Knockout', starts: 'Apr 30, 7:30 PM', duration: '120 min', level: 'Advanced', players: '1,204' },
];

function Contests() {
  return (
    <ProductShell>
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Contests"
            title="Compete under real interview pressure"
            description="Join timed contests, climb leaderboards, and sharpen speed with premium challenge sets."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <StatPill icon={Trophy} value="24" label="Upcoming" />
            <StatPill icon={Users} value="18k+" label="Participants" />
            <StatPill icon={Crown} value="Rated" label="Leaderboard" />
          </div>

          <div className="mt-8 grid gap-5">
            {contests.map((contest) => (
              <GlassCard key={contest.title} className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-400/10 text-violet-200">
                      <CalendarClock className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="mb-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">{contest.level}</div>
                      <h2 className="text-2xl font-black text-white">{contest.title}</h2>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-400">
                        <span className="inline-flex items-center gap-2"><Timer className="h-4 w-4" /> {contest.starts}</span>
                        <span>{contest.duration}</span>
                        <span>{contest.players} registered</span>
                      </div>
                    </div>
                  </div>
                  <button className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">Join contest</button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </ProductShell>
  );
}

export default Contests;
