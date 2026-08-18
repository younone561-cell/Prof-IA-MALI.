import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  BookCheck, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Users
} from 'lucide-react';
import { SUBJECTS, EDUCATION_LEVELS } from '../data/subjects';
import { SubjectId, EducationLevel, MockExam, ExamEvaluation, ExamResultRecord } from '../types';
import { recordExamResultInDb } from '../lib/firebase';
import { cleanMathText, sanitizeMathObject } from '../lib/mathFormatter';
import { SubjectLogo, SubjectBadge } from './SubjectLogo';

interface MockExamArenaProps {
  currentCountry: string;
  user: any;
  onOpenAuth: () => void;
  onViewLeaderboard: () => void;
}

export const MockExamArena: React.FC<MockExamArenaProps> = ({
  currentCountry,
  user,
  onOpenAuth,
  onViewLeaderboard
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('maths');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>('bac_tse');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [gameState, setGameState] = useState<'lobby' | 'in_progress' | 'completed'>('lobby');
  const [loading, setLoading] = useState(false);
  const [currentExam, setCurrentExam] = useState<MockExam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [evaluation, setEvaluation] = useState<ExamEvaluation | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const timerRef = useRef<any>(null);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'in_progress' && timeLeftSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeftSeconds]);

  // Start exam
  const handleStartExam = async () => {
    try {
      setLoading(true);
      setUserAnswers({});
      setEvaluation(null);

      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          level: selectedLevel,
          country: currentCountry,
          durationMinutes: durationMinutes
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de l\'épreuve');
      }

      const rawExamData: MockExam = await response.json();
      const examData: MockExam = sanitizeMathObject(rawExamData);
      setCurrentExam(examData);
      setTimeLeftSeconds(durationMinutes * 60);
      setGameState('in_progress');
    } catch (err: any) {
      console.error(err);
      alert('Impossible de générer l\'examen blanc. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Auto submit when time runs out
  const handleAutoSubmit = () => {
    handleSubmitExam();
  };

  // Submit and evaluate
  const handleSubmitExam = async () => {
    if (!currentExam) return;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      setLoading(true);
      const timeSpent = Math.max(10, durationMinutes * 60 - timeLeftSeconds);

      const response = await fetch('/api/evaluate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: currentExam,
          userAnswers,
          timeSpentSeconds: timeSpent,
          studentName: user?.displayName || 'Élève Courageux'
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la correction');
      }

      const rawEvalData: ExamEvaluation = await response.json();
      const evalData: ExamEvaluation = sanitizeMathObject(rawEvalData);
      setEvaluation(evalData);
      setGameState('completed');

      // Trigger Confetti if good grade
      if (evalData.gradeOver20 >= 12) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }

      // Record to Firestore if logged in
      if (user) {
        const record: ExamResultRecord = {
          id: 'res_' + Date.now(),
          userId: user.uid,
          userName: user.displayName || 'Élève',
          country: currentCountry,
          examTitle: currentExam.title,
          subject: currentExam.subject,
          level: currentExam.level,
          score: evalData.score,
          maxScore: evalData.maxScore,
          percentage: evalData.percentage,
          gradeOver20: evalData.gradeOver20,
          mention: evalData.mention,
          timeSpentSeconds: timeSpent,
          createdAt: Date.now()
        };
        recordExamResultInDb(record).catch(console.error);
      }

    } catch (err: any) {
      console.error(err);
      alert('Erreur lors de l\'évaluation de votre examen.');
    } finally {
      setLoading(false);
    }
  };

  // Share Score card
  const handleShareScore = () => {
    if (!evaluation || !currentExam) return;
    const shareText = `🎓 J'ai obtenu ${evaluation.gradeOver20}/20 (Mention ${evaluation.mention}) à l'Épreuve Blanche de ${SUBJECTS[currentExam.subject]?.name} sur Prof IA Mali 🇲🇱 !\n\nPeux-tu faire mieux ? Teste ton niveau pour le DEF / Baccalauréat !`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mon Résultat d\'Examen Blanc',
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* 1. Lobby: Exam Configuration & Subject Picker */}
      {gameState === 'lobby' && (
        <div id="exam-lobby-card" className="space-y-6">
          
          {/* Hero Banner */}
          <div className="p-6 sm:p-8 bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl border border-emerald-600/30 shadow-lg space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulateur d'Examens Officiels 2026</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Arène d'Examens Blancs & Évaluation Chronométrée
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Mettez-vous en condition réelle d'examen du DEF ou du Baccalauréat. 
              Recevez instantanément votre note sur 20, votre mention officielle, et une analyse pédagogique personnalisée.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Barème officiel /20</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Chronomètre temps réel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Classement National</span>
              </div>
            </div>
          </div>

          {/* Configuration Box */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-6">
            
            {/* Subject selection with Subject Logos */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Choisissez la matière de l'épreuve
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {(Object.keys(SUBJECTS) as SubjectId[]).map((subId) => {
                  const sub = SUBJECTS[subId];
                  const isSelected = selectedSubject === subId;
                  return (
                    <button
                      key={subId}
                      type="button"
                      onClick={() => setSelectedSubject(subId)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? `${sub.bgColor} ${sub.borderColor} ring-2 ring-emerald-600 font-bold shadow-xs`
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <SubjectLogo subjectId={subId} size="sm" variant={isSelected ? 'outline' : 'subtle'} />
                      <div>
                        <span className={`block text-xs font-bold ${isSelected ? sub.color : 'text-slate-800'}`}>
                          {sub.shortName}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5 max-w-[90px]">
                          {sub.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level & Time selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  2. Niveau d'examen
                </label>
                <select
                  id="exam-level-select"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as EducationLevel)}
                  className="w-full p-2.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  3. Durée de l'épreuve
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        durationMinutes === mins
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {mins} minutes
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                id="view-rankings-from-lobby-btn"
                type="button"
                onClick={onViewLeaderboard}
                className="flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Voir le classement actuel des majors</span>
              </button>

              <button
                id="launch-exam-btn"
                type="button"
                onClick={handleStartExam}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Génération du sujet d'examen...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>Démarrer l'Épreuve Blanche</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. In Progress: Timed Exam Session */}
      {gameState === 'in_progress' && currentExam && (
        <div id="exam-in-progress-container" className="space-y-6">
          
          {/* Floating Timer & Exam Title Header with Subject Badge */}
          <div className="sticky top-16 z-30 p-4 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-2xl shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <SubjectLogo subjectId={currentExam.subject} size="md" variant="subtle" />
              <div>
                <div className="flex items-center gap-2">
                  <SubjectBadge subjectId={currentExam.subject} size="xs" />
                  <span className="text-[11px] text-slate-500 font-semibold">{currentExam.level}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5 truncate max-w-md">
                  {cleanMathText(currentExam.title)}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                timeLeftSeconds < 180 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' 
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}>
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              <button
                id="finish-exam-early-btn"
                type="button"
                onClick={handleSubmitExam}
                disabled={loading}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Correction...' : 'Terminer & Rendre'}
              </button>
            </div>
          </div>

          {/* Exam Instructions banner */}
          {currentExam.instructions && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-1">Consignes officielles :</span>
              <ul className="list-disc pl-5 space-y-0.5">
                {currentExam.instructions.map((ins, i) => (
                  <li key={i}>{cleanMathText(ins)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {currentExam.questions.map((q, qIndex) => (
              <div 
                key={q.id}
                id={`exam-question-card-${q.id}`}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">
                      {qIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {q.type === 'mcq' ? 'Question à Choix Multiples' : 'Problème de rédaction / calcul'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-md">
                    {q.points} points
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                  {cleanMathText(q.question)}
                </p>

                {/* MCQ Options */}
                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {q.options.map((opt, optIndex) => {
                      const isChecked = userAnswers[q.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => setUserAnswers({ ...userAnswers, [q.id]: optIndex })}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${
                            isChecked ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="leading-tight">{cleanMathText(opt)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Open Question Text Answer */}
                {q.type === 'open' && (
                  <div className="pt-2">
                    <textarea
                      rows={3}
                      value={userAnswers[q.id] || ''}
                      onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                      placeholder="Rédigez votre réponse ou les étapes de votre calcul ici..."
                      className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50/50"
                    />
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Submit footer */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Questions répondues : {Object.keys(userAnswers).length} / {currentExam.questions.length}
            </span>
            <button
              id="submit-exam-bottom-btn"
              type="button"
              onClick={handleSubmitExam}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Calcul de la note...' : 'Valider et Voir ma Note'}
            </button>
          </div>

        </div>
      )}

      {/* 3. Completed: Score, Mention, Confetti & Viral Share Card */}
      {gameState === 'completed' && evaluation && currentExam && (
        <div id="exam-completed-container" className="space-y-6">
          
          {/* Viral Score Board Card */}
          <div className="p-6 bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <SubjectLogo subjectId={currentExam.subject} size="lg" variant="outline" />
                <div>
                  <div className="flex items-center gap-2">
                    <SubjectBadge subjectId={currentExam.subject} size="xs" />
                    <span className="text-xs text-emerald-300 font-semibold">{currentExam.level}</span>
                  </div>
                  <h3 className="text-xl font-extrabold mt-0.5">
                    Relevé de Notes du Candidat
                  </h3>
                  <p className="text-xs text-slate-300 truncate max-w-md">
                    {cleanMathText(currentExam.title)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  id="share-exam-score-btn"
                  type="button"
                  onClick={handleShareScore}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedShare ? 'Lien copié !' : 'Partager mon Score 🔥'}</span>
                </button>
              </div>
            </div>

            {/* Score & Mention Big Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              <div className="md:col-span-1 p-6 bg-white/10 rounded-2xl border border-white/10 text-center">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                  Note d'Examen
                </span>
                <div className="text-5xl font-black text-amber-400 mt-1">
                  {evaluation.gradeOver20}
                  <span className="text-2xl text-emerald-200 font-medium">/20</span>
                </div>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-200">
                  Mention {evaluation.mention}
                </div>
              </div>

              <div className="md:col-span-2 space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  Appréciation Pédagogique du Professeur IA
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "{cleanMathText(evaluation.globalFeedback)}"
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl">
                    <span className="font-bold text-emerald-300 block mb-1">💪 Points forts :</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-emerald-100 text-[11px]">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i}>{cleanMathText(s)}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2.5 bg-amber-950/60 border border-amber-500/30 rounded-xl">
                    <span className="font-bold text-amber-300 block mb-1">🎯 À perfectionner :</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-100 text-[11px]">
                      {evaluation.areasToImprove.map((a, i) => (
                        <li key={i}>{cleanMathText(a)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-800/40">
              <button
                id="retry-exam-btn"
                type="button"
                onClick={() => setGameState('lobby')}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refaire un autre Examen Blanc</span>
              </button>

              <button
                id="view-leaderboard-after-exam-btn"
                type="button"
                onClick={onViewLeaderboard}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Voir mon rang au Classement National 🏆</span>
              </button>
            </div>

          </div>

          {/* Detailed Question by Question Correction */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BookCheck className="w-4 h-4 text-emerald-600" />
              Corrigé Détaillé et Barème de Notation
            </h4>

            <div className="space-y-3">
              {evaluation.questionResults.map((qr, idx) => {
                const originalQ = currentExam.questions.find(q => q.id === qr.questionId);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      qr.isCorrect 
                        ? 'bg-emerald-50/40 border-emerald-200' 
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {qr.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800">
                          Question {idx + 1} : {cleanMathText(originalQ?.question)}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        qr.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {qr.pointsEarned} / {qr.maxPoints} pts
                      </span>
                    </div>

                    <div className="pl-6 text-xs text-slate-600 space-y-1">
                      <p>
                        <strong>Votre réponse :</strong> <span className={qr.isCorrect ? 'text-emerald-700 font-semibold' : 'text-rose-700 line-through'}>{cleanMathText(qr.userAnswer)}</span>
                      </p>
                      <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 mt-1">
                        💡 <strong>Corrigé officiel :</strong> {cleanMathText(qr.correction)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
