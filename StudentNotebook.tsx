import React, { useState, useEffect } from 'react';
import { 
  BookmarkCheck, 
  GraduationCap, 
  Trash2, 
  BookOpen, 
  Award, 
  Clock, 
  Calendar, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { SolvedExercise, ExamResultRecord } from '../types';
import { SUBJECTS } from '../data/subjects';
import { cleanMathText } from '../lib/mathFormatter';
import { SubjectLogo, SubjectBadge } from './SubjectLogo';

interface StudentNotebookProps {
  user: any;
  onOpenAuth: () => void;
  onSelectSavedExercise?: (exercise: SolvedExercise) => void;
}

export const StudentNotebook: React.FC<StudentNotebookProps> = ({ user, onOpenAuth, onSelectSavedExercise }) => {
  const [savedExercises, setSavedExercises] = useState<SolvedExercise[]>([]);
  const [examHistory, setExamHistory] = useState<ExamResultRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'exercises' | 'exams'>('exercises');

  useEffect(() => {
    // Load local stored items
    try {
      const rawEx = localStorage.getItem('prof_ia_saved_exercises');
      if (rawEx) setSavedExercises(JSON.parse(rawEx));

      const rawHis = localStorage.getItem('prof_ia_exam_history');
      if (rawHis) setExamHistory(JSON.parse(rawHis));
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleDeleteExercise = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedExercises.filter(ex => ex.id !== id);
    setSavedExercises(updated);
    localStorage.setItem('prof_ia_saved_exercises', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner with Stats */}
      <div id="notebook-header" className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Espace Personnel • Révisions
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Mon Carnet de Notes & Historique d'Apprentissage
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Retrouvez l'ensemble de vos exercices scannés, résolutions et relevés d'examens blancs.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center min-w-[100px]">
              <span className="text-xs text-emerald-700 font-medium block">Exercices</span>
              <span className="text-xl font-extrabold text-emerald-900">{savedExercises.length}</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-center min-w-[100px]">
              <span className="text-xs text-amber-700 font-medium block">Examens</span>
              <span className="text-xl font-extrabold text-amber-900">{examHistory.length}</span>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'exercises'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Exercices Enregistrés ({savedExercises.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'exams'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Historique Examens Blancs ({examHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Saved Exercises */}
      {activeTab === 'exercises' && (
        <div className="space-y-3">
          {savedExercises.length > 0 ? (
            savedExercises.map((ex) => {
              return (
                <div
                  key={ex.id}
                  onClick={() => onSelectSavedExercise && onSelectSavedExercise(ex)}
                  className="p-4 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs transition-all flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <SubjectLogo subjectId={ex.subject} size="md" variant="subtle" />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <SubjectBadge subjectId={ex.subject} size="xs" />
                        <span className="text-[11px] text-slate-400">
                          {new Date(ex.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {cleanMathText(ex.problemStatement)}
                      </h4>
                      <p className="text-[11px] text-emerald-800 line-clamp-1">
                        🎯 Réponse : {cleanMathText(ex.finalAnswer)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteExercise(ex.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer du carnet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Vous n'avez pas encore d'exercices enregistrés.</p>
              <p className="text-[11px]">Scannez un exercice ou résolvez une équation pour l'ajouter à vos fiches de révision.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Exam History */}
      {activeTab === 'exams' && (
        <div className="space-y-3">
          {examHistory.length > 0 ? (
            examHistory.map((rec) => {
              return (
                <div
                  key={rec.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <SubjectLogo subjectId={rec.subject} size="md" variant="subtle" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SubjectBadge subjectId={rec.subject} size="xs" />
                        <span className="text-[11px] text-slate-400">
                          {new Date(rec.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {cleanMathText(rec.examTitle)}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Temps : {Math.round(rec.timeSpentSeconds / 60)} min</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">Mention {rec.mention}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-800">
                      {rec.gradeOver20}
                      <span className="text-xs text-slate-400 font-medium">/20</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Score : {rec.score}/{rec.maxScore}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Aucun examen blanc complété pour le moment.</p>
              <p className="text-[11px]">Rendez-vous dans l'onglet "Examen Blanc" pour tester vos connaissances chronométrées.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
