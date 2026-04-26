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
  Moon,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from 'lucide-react';
import { logoutUser } from '../authSlice';
import { cx, formatDifficulty, getDifficultyStyle, getStatusStyle, ui } from '../utils/uiHelpers';

const navItems = [
  { label: 'Problems', to: '/problems', icon: Search, match: (pathname) => pathname === '/' || pathname.startsWith('/problem') || pathname.startsWith('/problems') },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, match: (pathname) => pathname.startsWith('/dashboard') || pathname.startsWith('/profile') },
];

export function BrandLogo() {
  return (
    <NavLink to="/problems" className="group flex items-center gap-3" aria-label="LeecoAI problems">
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 transition group-hover:border-blue-400/40 group-hover:bg-blue-500/15">
        <Code2 className="h-5 w-5" />
      </div>
      <div className="leading-none">
        <p className="text-sm font-semibold text-slate-50">LeecoAI</p>
        <p className="mt-1 text-xs font-medium text-slate-500">Coding Platform</p>
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
    <div className={cx(dimensions, 'grid place-items-center rounded-lg bg-blue-500/15 font-semibold text-blue-200 ring-1 ring-blue-400/20')}>
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
        'inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition',
        active ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100',
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
    <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/86 backdrop-blur-xl">
      <nav className={cx(ui.layout.navbarHeight, 'mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8')}>
        <BrandLogo />

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} pathname={pathname} />
          ))}
          <form onSubmit={handleSearch} className="relative ml-4">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 rounded-md border border-slate-700 bg-slate-900 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </form>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className="flex h-10 items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 text-sm font-bold text-indigo-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/20"
            >
              Admin
            </NavLink>
          )}
          <button className={ui.button.icon} aria-label="Toggle dark mode">
            <Moon className="h-4 w-4" />
          </button>
          <NavLink
            to="/dashboard"
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2 pr-3 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800"
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
          className="border-t border-slate-800 bg-slate-950/96 px-4 py-3 md:hidden"
        >
          <div className="mx-auto max-w-[1440px] space-y-1">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
    <footer className="border-t border-slate-800/90 bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between text-xs font-medium text-slate-500">
        <span>LeecoAI</span>
        <span>Focused coding practice workspace</span>
      </div>
    </footer>
  );
}

export function ProductShell({ children, footer = false }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#020617_0%,#07111f_48%,#020617_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
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
