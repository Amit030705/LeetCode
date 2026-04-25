import { BookOpen, Brain, Code2, FileText, GraduationCap, Video } from 'lucide-react';
import { GlassCard, ProductShell, SectionHeader } from '../components/ProductShell';

const resources = [
  { icon: Brain, title: 'DSA Roadmap', text: 'Structured path from arrays to graphs, DP, and advanced problem patterns.' },
  { icon: Video, title: 'Editorial Library', text: 'Watch solution breakdowns and compare approaches after solving.' },
  { icon: FileText, title: 'Interview Notes', text: 'Condensed patterns, templates, and company-specific prep checklists.' },
  { icon: Code2, title: 'Language Templates', text: 'Battle-tested JavaScript, Java, and C++ starter snippets.' },
];

function Resources() {
  return (
    <ProductShell>
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Resources"
            title="Everything around practice, organized"
            description="Guides, editorials, templates, and prep systems that make problem solving more deliberate."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {resources.map(({ icon: Icon, title, text }) => (
              <GlassCard key={title} className="p-6">
                <div className="flex gap-5">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{title}</h2>
                    <p className="mt-3 leading-7 text-slate-400">{text}</p>
                    <button className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
                      <BookOpen className="h-4 w-4" />
                      Open resource
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="mt-8 p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-violet-100">Placement Track</div>
                <h2 className="text-3xl font-black text-white">Ready for a 30-day interview sprint?</h2>
                <p className="mt-3 max-w-2xl text-slate-400">Use the roadmap with daily streak tracking and recommended problems to build a consistent prep loop.</p>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
                <GraduationCap className="h-4 w-4" />
                Start track
              </button>
            </div>
          </GlassCard>
        </div>
      </main>
    </ProductShell>
  );
}

export default Resources;
