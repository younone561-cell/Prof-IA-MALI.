import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  BookmarkCheck, 
  Award, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, parseAuthError } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userProfile: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      setLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      setSuccessMsg('Connexion Google réussie ! Bienvenue sur Prof IA Mali.');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const parsed = parseAuthError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="auth-modal-backdrop" 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      >
        <motion.div
          id="auth-modal-card"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl rounded-t-[32px] sm:rounded-[32px] overflow-hidden text-slate-900"
        >
          {/* iOS Sheet Grabber on Mobile */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-10 h-1.2 bg-slate-300 rounded-full" />
          </div>

          {/* Close button */}
          <button 
            id="close-auth-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Header / Brand in iOS Style */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-b from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-700/20 text-2xl font-black mb-1">
                🇲🇱
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Espace Étudiant • Compte Google</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Connectez-vous à Prof IA
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Accédez à vos exercices scannés, conservez vos notes d'examens blancs et concourez au classement national.
              </p>
            </div>

            {/* Error & Success Banners */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2.5 p-3 text-xs text-red-800 bg-red-50/90 border border-red-200 rounded-2xl"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2.5 p-3 text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-200 rounded-2xl"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <span className="leading-relaxed font-medium">{successMsg}</span>
              </motion.div>
            )}

            {/* iOS Styled Google Sign In Button */}
            <div className="space-y-3 pt-1">
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continuer avec mon Compte Google</span>
                  </>
                )}
              </button>
            </div>

            {/* iOS Native List of Perks */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                </div>
                <span className="leading-snug">Carnet de révision synchronisé en temps réel</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="leading-snug">Scores et diplômes aux examens blancs DEF & BAC</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <span className="leading-snug">100% gratuit et optimisé pour votre smartphone</span>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Connexion sécurisée sans mot de passe à retenir</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
