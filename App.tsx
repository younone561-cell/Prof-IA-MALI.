/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MessageCircle, Sparkles } from 'lucide-react';
import { auth, logoutUser, syncUserProfile } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { PhotoSolver } from './components/PhotoSolver';
import { MockExamArena } from './components/MockExamArena';
import { LeaderboardView } from './components/LeaderboardView';
import { TutorChat } from './components/TutorChat';
import { StudentNotebook } from './components/StudentNotebook';
import { AuthModal } from './components/AuthModal';
import { BusinessActivityModal } from './components/BusinessActivityModal';
import { UserProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solver' | 'exam' | 'chat' | 'notebook' | 'leaderboard'>('solver');
  const [currentCountry, setCurrentCountry] = useState<string>('ML');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  // Auto-detect country via API
  useEffect(() => {
    fetch('/api/country-info')
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          setCurrentCountry(data.country);
        }
      })
      .catch(() => {});
  }, []);

  // Firebase auth state subscription (Google Account)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        try {
          const profile = await syncUserProfile(fbUser);
          setCurrentUser(profile);
        } catch (e) {
          setCurrentUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Élève Courageux',
            photoURL: fbUser.photoURL || '',
            country: currentCountry,
            level: 'bac_tse',
            points: 100,
            solvedExercisesCount: 0,
            examsTakenCount: 0,
            averageGradeOver20: 15,
            badges: ['Nouveau Prodige 🌟']
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [currentCountry]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTab = (tab: 'solver' | 'exam' | 'chat' | 'notebook' | 'leaderboard') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* iOS Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentCountry={currentCountry}
        onSelectCountry={setCurrentCountry}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenBusinessActivity={() => setIsBusinessModalOpen(true)}
      />

      {/* Main Content Area with iOS Tab Switch Animations and Safe Area Bottom Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 lg:pb-12 space-y-4 sm:space-y-6">
        
        {/* Quick Collaboration Banner for Younoussa TOGO */}
        <div 
          id="younoussa-togo-activity-banner"
          onClick={() => setIsBusinessModalOpen(true)}
          className="p-3 sm:p-3.5 bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-sm border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 cursor-pointer hover:border-emerald-400/40 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl p-1.5 bg-white/10 rounded-xl">👨‍💻</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                  Développer mon activité — Younoussa TOGO
                </span>
                <span className="px-2 py-0.2 text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                  Recrutement Développeurs 🚀
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Projets numériques au Mali (Apps mobiles, Web, IA, Contenu) • Contact direct WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-full shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Voir la Présentation & WhatsApp</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* Tab 1: Photo Scanner & Step-by-Step Solver */}
          {activeTab === 'solver' && (
            <motion.div
              key="solver"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            >
              <PhotoSolver
                currentCountry={currentCountry}
                user={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onSolveComplete={() => {}}
              />
            </motion.div>
          )}

          {/* Tab 2: Viral Mock Exam & Evaluation */}
          {activeTab === 'exam' && (
            <motion.div
              key="exam"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            >
              <MockExamArena
                currentCountry={currentCountry}
                user={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onViewLeaderboard={() => setActiveTab('leaderboard')}
              />
            </motion.div>
          )}

          {/* Tab 3: National & Global Leaderboard */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            >
              <LeaderboardView
                currentCountry={currentCountry}
                onTakeExam={() => setActiveTab('exam')}
              />
            </motion.div>
          )}

          {/* Tab 4: Interactive Tutor Chat */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            >
              <TutorChat
                currentCountry={currentCountry}
                user={currentUser}
              />
            </motion.div>
          )}

          {/* Tab 5: Student Notebook */}
          {activeTab === 'notebook' && (
            <motion.div
              key="notebook"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            >
              <StudentNotebook
                user={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onSelectSavedExercise={() => setActiveTab('solver')}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* iOS Minimal Footer (Desktop / Web) */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-5 text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🇲🇱</span>
            <span className="font-bold text-slate-800">Prof IA Mali</span>
            <span>— Plateforme scolaire mobile pour DEF & Baccalauréat</span>
          </div>
          
          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setIsBusinessModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-950 font-bold underline cursor-pointer flex items-center gap-1"
            >
              <Briefcase className="w-3 h-3 text-emerald-600" />
              <span>Développer mon activité (Younoussa TOGO)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* iOS Sheet Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          setIsAuthModalOpen(false);
        }}
      />

      <BusinessActivityModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />

    </div>
  );
}
