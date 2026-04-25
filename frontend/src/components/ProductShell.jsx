import { useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Braces,
  Code2,
  Github,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { logoutUser } from '../authSlice';

const navItems = [
  { label: 'Problems', to: '/problems', icon: Braces },
  { label: 'Contests', to: '/contests', icon: Trophy },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Resources', to: '/resources', icon: BookOpen },
];

export function BrandLogo() {
  return (
    <NavLink to="/" className="group flex items-center gap-3">
      <div className="relative grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 shadow-[0_0_32px_rgba(34,211,238,0.22)]">
        <Code2 className="h-5 w-5 text-cyan-200" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-white">LeecoAI</p>
        <p className="text-xs font-medium text-slate-400">Code. Rank. Get hired.</p>
      </div>
    </NavLink>
  );
}

function UserAvatar({ user }) {
  if (user?.profileImage) {
    return <img src={user.profileImage} alt={user.firstName || 'Profile'} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10" />;
  }

  return (
    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-white ring-2 ring-white/10">
      {(user?.firstName || 'U').charAt(0).toUpperCase()}
    </div>
  );
}

export function ProductNavbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/78 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white/10 text-white shadow-inner shadow-white/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-100 transition hover:bg-violet-400/20">
              Admin
            </NavLink>
          )}
          <button className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-300/40 hover:text-white" aria-label="Dark mode">
            <Moon className="h-4 w-4" />
          </button>
          <NavLink to="/profile" className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-4 text-sm font-semibold text-white transition hover:bg-white/10">
            <UserAvatar user={user} />
            <span>{user?.firstName || 'Profile'}</span>
          </NavLink>
          <button onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-red-300/40 hover:text-red-200" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <button className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Open menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 bg-slate-950/96 px-4 py-4 lg:hidden"
        >
          <div className="space-y-2">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <NavLink to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white">
              <UserRound className="h-4 w-4" />
              Profile
            </NavLink>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-200 hover:bg-red-500/10">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
}

export function ProductFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <BrandLogo />
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
          <NavLink to="/problems" className="hover:text-white">Problems</NavLink>
          <NavLink to="/contests" className="hover:text-white">Contests</NavLink>
          <NavLink to="/resources" className="hover:text-white">Resources</NavLink>
          <a href="mailto:contact@leecoai.dev" className="hover:text-white">Contact</a>
          <a href="https://github.com" className="inline-flex items-center gap-2 hover:text-white">
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export function ProductShell({ children, footer = true }) {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(139,92,246,0.20),transparent_32%),linear-gradient(180deg,#020617_0%,#08111f_45%,#020617_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
      <ProductNavbar />
      {children}
      {footer && <ProductFooter />}
    </div>
  );
}

export function GlassCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl transition duration-500 group-hover:bg-violet-400/15" />
      {children}
    </motion.div>
  );
}

export function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-black tracking-normal text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-slate-400">{description}</p>}
    </div>
  );
}

export function StatPill({ icon: Icon = BarChart3, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-black text-white">{value}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
