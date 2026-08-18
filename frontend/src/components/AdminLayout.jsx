import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  HelpCircle,
  FileCheck,
  LogOut,
  Youtube,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { label: 'Exams', path: '/admin/exams', icon: FileCheck },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(`${path}`));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 pb-14 lg:pb-0">
      {/* Top Header Bar with ForestWaala Logo and Title */}
      <header className="h-16 bg-slate-900 text-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-md border-b border-slate-800">
        {/* ForestWaala Logo and Brand Title */}
        <Link to="/admin/dashboard" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
          <img
            src="/forestwallah.jpg"
            alt="ForestWaala Logo"
            className="w-10 h-10 rounded-full border-2 border-brand-400 shadow-md object-cover flex-shrink-0"
          />
          <div>
            <div className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span className="text-white">સરકારી</span>
              <span className="text-brand-400">मित्र</span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Powered by ForestWaala
              </span>
            </div>
            <p className="text-[11px] text-amber-300 font-semibold sm:hidden">Powered by ForestWaala</p>
            <p className="text-[11px] text-slate-400 hidden sm:block">Government Competitive Exam Portal</p>
          </div>
        </Link>

        {/* Desktop Navigation Links inside Header */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Social Channel Links & Admin Profile Info */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-800 hover:bg-sky-600/20 text-sky-400 hover:text-sky-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            title="Join ForestWaala Telegram Channel"
          >
            <Send className="w-4 h-4" />
            <span className="hidden md:inline">Telegram</span>
          </a>

          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-800 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            title="Subscribe ForestWaala YouTube Channel"
          >
            <Youtube className="w-4 h-4" />
            <span className="hidden md:inline">YouTube</span>
          </a>

          <div className="hidden sm:flex flex-col text-right pl-2 border-l border-slate-800">
            <span className="text-xs font-bold text-slate-200">{admin?.name || 'Administrator'}</span>
            <span className="text-[10px] text-slate-400">{admin?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>

      {/* Sleek Compact Mobile & Tablet Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl px-2 py-1 flex items-center justify-around h-13">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg transition-all ${
                active
                  ? 'text-brand-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  active ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-0.5 px-2 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
        >
          <div className="p-1 rounded-lg">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-bold mt-0.5 tracking-tight">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
