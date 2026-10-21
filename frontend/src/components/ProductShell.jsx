import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from 'lucide-react';
import { logoutUser } from '../authSlice';
import { cx, formatDifficulty, getDifficultyStyle, getStatusStyle, ui } from '../utils/uiHelpers';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Problems', to: '/problems', icon: Search, match: (pathname) => pathname === '/' || pathname.startsWith('/problem') || pathname.startsWith('/problems') },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, match: (pathname) => pathname.startsWith('/dashboard') || pathname.startsWith('/profile') },
];

export function BrandLogo() {
  return (
    <NavLink to="/problems" className="group flex items-center gap-3" aria-label="LeecoAI problems">
      <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white shadow-[0_8px_28px_rgba(59,130,246,0.28)] transition group-hover:-rotate-3 group-hover:scale-105">
        <div className="absolute inset-px rounded-[14px] border border-white/20" />
        <Code2 className="relative h-5 w-5" strokeWidth={2.1} />
      </div>
      <div className="leading-none">
        <p className="text-[15px] font-bold tracking-tight text-slate-900">LeecoAI</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Code with focus</p>
      </div>
    </NavLink>
  );
}

function UserAvatar({ user, size = 'sm' }) {
  const dimensions = size === 'lg' ? 'h-14 w-14 text-xl' : 'h-9 w-9 text-sm';

  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.firstName || 'Profile'}
        className={cx(dimensions, 'rounded-lg object-cover ring-1 ring-slate-700')}
      />
    );
  }

  return (
    <div className={cx(dimensions, 'grid place-items-center rounded-lg bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-200')}>
      {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
    </div>
  );
}

function NavItem({ item, pathname, onClick }) {
  const active = item.match(pathname);
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={cx(
        'inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-[13px] font-semibold transition',
        active ? 'border border-blue-200 bg-blue-50 text-blue-700' : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  );
}

export function ProductNavbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-[0_4px_18px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
      <nav className={cx(ui.layout.navbarHeight, 'mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8')}>
        <BrandLogo />

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} pathname={pathname} />
          ))}
          <form onSubmit={handleSearch} className="relative ml-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Find a coder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-52 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] font-medium text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-400/10"
            />
          </form>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className="flex h-10 items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/[0.08] px-3.5 text-[13px] font-bold text-indigo-200 transition hover:border-indigo-300/40 hover:bg-indigo-400/[0.14]"
            >
              <ShieldAlert className="h-4 w-4" /> Admin
            </NavLink>
          )}
          <NavLink
            to="/dashboard"
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-1.5 pr-3 text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <UserAvatar user={user} />
            <span className="max-w-28 truncate">{user?.firstName || user?.username || 'Profile'}</span>
          </NavLink>
          <button onClick={handleLogout} className={ui.button.icon} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <button className={cx(ui.button.icon, 'md:hidden')} onClick={() => setOpen((value) => !value)} aria-label="Open navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl backdrop-blur-2xl md:hidden"
        >
          <div className="mx-auto max-w-[1440px] space-y-1">
            <div className="mb-3 flex justify-end"><ThemeToggle /></div>
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} pathname={pathname} onClick={() => setOpen(false)} />
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
              >
                <ShieldAlert className="h-4 w-4" />
                Admin Panel
              </NavLink>
            )}
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
            >
              <UserRound className="h-4 w-4" />
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10"
            >
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
    <footer className="border-t border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between text-xs font-medium text-slate-500">
        <span>LeecoAI</span>
        <span>Focused coding practice workspace</span>
      </div>
    </footer>
  );
}

export function ProductShell({ children, footer = false }) {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_8%_0%,rgba(59,130,246,0.09),transparent_34%),radial-gradient(ellipse_at_92%_10%,rgba(99,102,241,0.06),transparent_30%),linear-gradient(180deg,#f8faff_0%,#f6f8fc_55%,#f3f6fb_100%)]" />
      <ProductNavbar />
      {children}
      {footer && <ProductFooter />}
    </div>
  );
}

export function GlassCard({ children, className = '', animate = true }) {
  const Component = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-24px' },
        transition: { duration: 0.25, ease: 'easeOut' },
      }
    : {};

  return (
    <Component {...motionProps} className={cx(ui.card, className)}>
      {children}
    </Component>
  );
}

export function SectionHeader({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={cx('mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {eyebrow && <p className={ui.typography.overline}>{eyebrow}</p>}
        {title && <h2 className={cx(ui.typography.h2, eyebrow && 'mt-2')}>{title}</h2>}
        {description && <p className={cx(ui.typography.body, 'mt-2 max-w-2xl')}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className={ui.typography.overline}>{eyebrow}</p>}
        <h1 className={cx(ui.typography.h1, eyebrow && 'mt-2')}>{title}</h1>
        {description && <p className={cx(ui.typography.body, 'mt-2 max-w-3xl')}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={cx(ui.button[variant] || ui.button.primary, className)} {...props}>
      {children}
    </button>
  );
}

export function IconButton({ children, className = '', ...props }) {
  return (
    <button className={cx(ui.button.icon, className)} {...props}>
      {children}
    </button>
  );
}

export function DifficultyBadge({ difficulty, className = '' }) {
  return (
    <span className={cx('inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-semibold', getDifficultyStyle(difficulty), className)}>
      {formatDifficulty(difficulty)}
    </span>
  );
}

export function StatusBadge({ status, children, className = '' }) {
  return (
    <span className={cx('inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold capitalize', getStatusStyle(status), className)}>
      {children || status}
    </span>
  );
}

export function StatPill({ icon: Icon = BarChart3, label, value, detail }) {
  return (
    <div className={cx(ui.card, 'p-4')}>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/10 text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold text-slate-50">{value}</p>
          <p className={ui.typography.caption}>{label}</p>
          {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = '' }) {
  return <div className={cx(ui.skeleton, className)} />;
}

export function EmptyState({ icon: Icon = CheckCircle2, title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/44 px-6 py-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-slate-800 text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-100">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Heatmap({ activityData = {} }) {
  const daysInYear = 364; // 52 weeks * 7 days
  const today = new Date();
  const days = [];

  for (let i = daysInYear - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    const count = activityData[dateStr] || 0;
    days.push({ date: dateStr, count });
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-slate-800';
    if (count === 1) return 'bg-emerald-900';
    if (count <= 3) return 'bg-emerald-700';
    if (count <= 5) return 'bg-emerald-500';
    return 'bg-emerald-400';
  };

  return (
    <div className="flex flex-col gap-2 overflow-x-auto pb-2 custom-scrollbar">
      <div className="grid grid-cols-[repeat(52,minmax(0,1fr))] grid-rows-7 grid-flow-col gap-[3px] min-w-max">
        {days.map((day, index) => (
          <div
            key={index}
            title={`${day.count} submissions on ${day.date}`}
            className={cx('h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[2px]', getColor(day.count))}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 text-xs text-slate-500 mt-2">
        <span>Less</span>
        <div className="flex gap-[3px]">
          <div className="h-3 w-3 rounded-[2px] bg-slate-800"></div>
          <div className="h-3 w-3 rounded-[2px] bg-emerald-900"></div>
          <div className="h-3 w-3 rounded-[2px] bg-emerald-700"></div>
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500"></div>
          <div className="h-3 w-3 rounded-[2px] bg-emerald-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
