import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Send,
  Youtube,
  Shield,
  Sparkles,
  Lock,
  FileText,
  Clock,
  Zap,
  Users,
  ChevronRight,
} from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Background Glowing Orb Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3">
              <img
                src="/forestwallah.jpg"
                alt="ForestWaala Logo"
                className="w-10 h-10 rounded-full border-2 border-brand-400 object-cover shadow-lg shadow-brand-500/20"
              />
              <div>
                <div className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-1.5">
                  <span className="text-white">સરકારી</span>
                  <span className="text-brand-400">मित्र</span>
                </div>
                <div className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by ForestWaala</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/practice"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-600/30 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Practice Portal</span>
              </Link>

              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Admin Login</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 space-y-10">
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            {/* Platform Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-extrabold uppercase tracking-wider shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gujarat Competitive Exam Test Portal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2]">
              ગુજરાત સ્પર્ધાત્મક પરીક્ષા તૈયારી માટેનું <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                નંબર-૧ ઓનલાઇન મોક ટેસ્ટ પ્લેટફોર્મ
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
              Forest Guard, CCE, GSSSB, GPSC, Police Constable અને તલાટી વગેરે સ્પર્ધાત્મક પરીક્ષાઓ માટે ફ્રી લાઈવ મોક ટેસ્ટ, ઓનલાઇન પ્રેક્ટિસ અને પીડીએફ રિઝલ્ટ રેન્ક લિસ્ટ.
            </p>

            {/* Main Call to Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/practice"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                <span>સર્વ પ્રેક્ટિસ ટેસ્ટ જુઓ (Practice Portal)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-sky-500/30 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
                <span>જોડાઓ Telegram ચેનલમાં</span>
              </a>
            </div>
          </div>

          {/* Government Exam Portal Overview Box with Subtle Logo Watermark Background */}
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Background Logo Watermark with Low Opacity */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <img
                src="/forestwallah.jpg"
                alt="ForestWaala Background Watermark"
                className="w-80 h-80 rounded-full object-cover filter grayscale"
              />
            </div>

            {/* Foreground Overview Content */}
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-white text-base sm:text-lg">
                      સરકારી मित्र — Portal Overview
                    </h2>
                    <p className="text-xs text-amber-400 font-extrabold">
                      Powered by ForestWaala Community
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase">
                  <Zap className="w-3.5 h-3.5" />
                  100% Free Access
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>રીઅલ-ટાઇમ લાઈવ ઓનલાઇન ટેસ્ટ</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    સરકારી પરીક્ષાના માળખા અનુસાર ટાઈમર સાથે વાસ્તવિક પરીક્ષા જેવો જ અનુભવ આપતી લાઈવ મોક ટેસ્ટ શ્રschedule.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    <span>ઓટોમેટેડ પીડીએફ રેન્ક લીડરબોર્ડ</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    પરીક્ષા પૂર્ણ થયા બાદ ટોપ ૧૦ રેન્કર્સ ઓનર રોલ અને તમામ વિદ્યાર્થીઓના પરિણામનું ઓટોમેટેડ Gujarati PDF Leaderboard!
                  </p>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>વિગતવાર જવાબ અને સમજૂતી</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    દરેક પ્રશ્ન પછી તમારો જવાબ અને સાચા જવાબ મૂલ્ય (Option Value) સાથે ગુજરાતીમાં સંપૂર્ણ સમજૂતી.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>અનલિમિટેડ પ્રેક્ટિસ આર્કાઇવ</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    જે વિદ્યાર્થીઓ લાઈવ સમયમાં પરીક્ષા આપી ન શક્યા હોય તેઓ પાછળથી પણ કમ્પ્લીટ થયેલ તમામ ટેસ્ટ ગમે ત્યારે પ્રેક્ટિસ કરી શકે છે.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Community Join Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Telegram Community Card */}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800/80 border border-sky-500/30 rounded-3xl p-6 transition-all hover:scale-[1.02] flex items-center gap-4 shadow-xl group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Send className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base">ForestWaala Telegram</h3>
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-full border border-sky-500/30">
                    Official Channel
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  દરરોજ ફ્રી PDF મટીરીયલ, લીડરબોર્ડ પરિણામો અને નોટિફિકેશન મેળવવા માટે Telegram ગ્રુપમાં જોડાઓ.
                </p>
              </div>
            </a>

            {/* YouTube Community Card */}
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800/80 border border-rose-500/30 rounded-3xl p-6 transition-all hover:scale-[1.02] flex items-center gap-4 shadow-xl group"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <Youtube className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base">ForestWaala YouTube</h3>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full border border-rose-500/30">
                    Subscribe
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  સ્પર્ધાત્મક પરીક્ષાના વિડીયો લેક્ચર અને મોક ટેસ્ટ સોલ્યુશન માટે YouTube ચેનલ સબ્સ્ક્રાઇબ કરો.
                </p>
              </div>
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 relative z-10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/forestwallah.jpg" alt="Logo" className="w-6 h-6 rounded-full" />
            <span className="font-bold text-slate-300">સરકારી मित्र — Powered by ForestWaala</span>
          </div>

          <p>© {new Date().getFullYear()} SarkariMitra Exam Portal. All rights reserved.</p>

          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/practice" className="hover:text-white transition-colors">
              Practice Portal
            </Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
