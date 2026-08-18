import React from 'react';
import { 
  Camera, 
  Trophy, 
  MessageSquare, 
  BookmarkCheck, 
  LogIn, 
  LogOut, 
  Flame,
  ChevronDown,
  Sparkles,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { COUNTRIES } from '../data/subjects';

interface NavbarProps {
  activeTab: 'solver' | 'exam' | 'chat' | 'notebook' | 'leaderboard';
  onSelectTab: (tab: 'solver' | 'exam' | 'chat' | 'notebook' | 'leaderboard') => void;
  currentCountry: string;
  onSelectCountry: (code: string) => void;
  user: any;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenBusinessActivity: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentCountry,
  onSelectCountry,
  user,
  onOpenAuth,
  onLogout,
  onOpenBusinessActivity
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
  };

  const navItems: {
    id: 'solver' | 'exam' | 'leaderboard' | 'chat' | 'notebook';
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'solver',
      label: 'Scanner & Résoudre',
      shortLabel: 'Scanner',
      icon: Camera,
      accentColor: 'text-emerald-600'
    },
    {
      id: 'exam',
      label: 'Examen Blanc',
      shortLabel: 'Examens',
      icon: Flame,
      accentColor: 'text-amber-500'
    },
    {
      id: 'leaderboard',
      label: 'Classement',
      shortLabel: 'Palmarès',
      icon: Trophy,
      accentColor: 'text-yellow-500'
    },
    {
      id: 'chat',
      label: 'Tuteur IA',
      shortLabel: 'Tuteur IA',
      icon: MessageSquare,
      accentColor: 'text-indigo-600'
    },
    {
      id: 'notebook',
      label: 'Mon Carnet',
      shortLabel: 'Carnet',
      icon: BookmarkCheck,
      accentColor: 'text-teal-600'
    }
  ];

  return (
    <>
      {/* iOS Top Navigation Bar with Frosted Glass Blur */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            
            {/* Brand Logo - iOS App Icon style */}
            <div 
              id="brand-logo-container"
              onClick={() => {
                triggerHaptic();
                onSelectTab('solver');
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-linear-to-b from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-emerald-700/20 border border-emerald-500/30">
                🇲🇱
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                    Prof IA
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/60">
                    DEF • BAC
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block -mt-0.5">
                  Mali & UEMOA
                </span>
              </div>
            </div>

            {/* Desktop Center Segmented Control Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/70">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`desktop-nav-${item.id}`}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      onSelectTab(item.id);
                    }}
                    className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 z-10 ${
                      isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktop-active-pill"
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/60 -z-10"
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? item.accentColor : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Option: Développer mon activité (Younoussa TOGO) */}
              <button
                id="open-business-activity-btn"
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onOpenBusinessActivity();
                }}
                className="px-2.5 sm:px-3 py-1.5 text-emerald-900 bg-linear-to-r from-emerald-50 to-teal-100/80 hover:from-emerald-100 hover:to-teal-200/80 border border-emerald-300/80 rounded-full font-bold text-xs shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                title="Développer mon activité — Younoussa TOGO"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Développer mon activité</span>
                <span className="sm:hidden">Activité</span>
              </button>

              {/* iOS Country Selector Pill */}
              <div className="relative hidden md:block">
                <select
                  id="navbar-country-select"
                  value={currentCountry}
                  onChange={(e) => {
                    triggerHaptic();
                    onSelectCountry(e.target.value);
                  }}
                  className="pl-2.5 pr-6 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500 outline-hidden appearance-none cursor-pointer active:scale-95 transition-all"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Google Account Profile or 1-Click Login */}
              {user ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-emerald-50/90 border border-emerald-200/80 rounded-full shadow-2xs">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'Élève'} 
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-2xs" 
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center">
                        {(user.displayName || 'E')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-950 truncate max-w-[80px] sm:max-w-[120px]">
                      {user.displayName || 'Élève'}
                    </span>
                  </div>

                  <button
                    id="navbar-logout-btn"
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      onLogout();
                    }}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer active:scale-95"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="navbar-open-auth-btn"
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onOpenAuth();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google</span>
                </button>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* iOS 18 Bottom Floating Tab Bar (Mobile / Tablet Dock) */}
      <nav 
        id="ios-bottom-tab-bar"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-3 pb-[calc(env(safe-area-inset-bottom,8px)+6px)] pt-1.5 pointer-events-none"
      >
        <div className="max-w-md mx-auto pointer-events-auto bg-white/85 backdrop-blur-2xl border border-slate-200/80 shadow-xl shadow-slate-900/10 rounded-[28px] p-1.5 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-tab-${item.id}`}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onSelectTab(item.id);
                }}
                className="relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-2xl cursor-pointer active:scale-90 transition-transform"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-ios-active-pill"
                    className="absolute inset-0 bg-slate-900/5 rounded-2xl -z-10"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'scale-105' : 'opacity-70'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? item.accentColor : 'text-slate-500'}`} />
                  {isActive && (
                    <motion.div 
                      layoutId="tab-dot"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
