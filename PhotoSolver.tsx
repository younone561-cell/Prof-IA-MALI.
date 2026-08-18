import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  BookmarkCheck, 
  Share2, 
  RefreshCw, 
  FileText,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Calculator,
  Zap,
  FlaskConical,
  Languages,
  Hourglass,
  Globe2,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { SUBJECTS, EDUCATION_LEVELS } from '../data/subjects';
import { SubjectId, EducationLevel, SolvedExercise } from '../types';
import { voiceTutor } from '../lib/audio';
import { saveSolvedExerciseToDb } from '../lib/firebase';
import { cleanMathText, sanitizeMathObject } from '../lib/mathFormatter';
import { SubjectLogo, SubjectBadge } from './SubjectLogo';

interface PhotoSolverProps {
  currentCountry: string;
  user: any;
  onOpenAuth: () => void;
  onSolveComplete?: (exercise: SolvedExercise) => void;
}

const SAMPLE_EXERCISES: {
  subject: SubjectId;
  level: EducationLevel;
  title: string;
  problemText: string;
}[] = [
  {
    subject: 'maths',
    level: 'bac_tse',
    title: 'Équation différentielle & Limite (Bac TSE)',
    problemText: 'Résoudre sur ℝ l\'équation différentielle y\'\' + 4y = 0 avec y(0) = 1 et y\'(0) = 2. Calculer ensuite la limite quand x tend vers +∞ de f(x) = (e^x - 1) / x.'
  },
  {
    subject: 'physique',
    level: 'bac_tss',
    title: 'Circuit RLC et Résonance (Bac Mali)',
    problemText: 'Un dipôle RLC série est alimenté par une tension sinusoïdale u(t) = 12√2 sin(100πt). On donne R = 40 Ω, L = 0.2 H, C = 25 µF. Calculer l\'impédance Z du circuit, l\'intensité efficace I et la fréquence de résonance.'
  },
  {
    subject: 'chimie',
    level: 'bac_tse',
    title: 'Dosage Acido-Basique & pH (Bac Mali)',
    problemText: 'On dose 20 mL d\'une solution d\'acide éthanoïque CH3COOH de concentration Ca inconnue par une solution d\'hydroxyde de sodium NaOH à 0.1 mol/L. Le volume à l\'équivalence est Vbe = 15 mL. Déterminer Ca et calculer le pH à la demi-équivalence (pKa = 4.8).'
  },
  {
    subject: 'francais',
    level: 'def_9eme',
    title: 'Commentaire & Figures de style (DEF 9ème)',
    problemText: 'Expliquer et analyser la citation d\'Amadou Hampâté Bâ : « En Afrique, un vieillard qui meurt est une bibliothèque qui brûle ». Identifier la figure de style et donner deux arguments pour la commenter.'
  },
  {
    subject: 'histoire',
    level: 'bac_tll',
    title: 'L\'Empire du Mali & Soundiata Keïta',
    problemText: 'Expliquer le rôle de la Charte de Kurukan Fuga (1236) sous le règne de Soundiata Keïta et son importance historique pour les droits de l\'Homme et la cohésion sociale au Mandé.'
  },
  {
    subject: 'geographie',
    level: 'bac_tseco',
    title: 'Le Fleuve Niger & l\'Économie Malienne',
    problemText: 'Analyser les atouts hydro-agricoles et énergétiques du fleuve Niger pour le Mali (Office du Niger, barrages de Sélingué et Markala) face aux défis du changement climatique.'
  },
  {
    subject: 'anglais',
    level: 'def_9eme',
    title: 'Tenses & Passive Voice (DEF / BAC)',
    problemText: 'Put the verbs into the correct tense and transform into Passive Voice:\n1. The students (complete) the national exam yesterday.\n2. Malian farmers (produce) high quality cotton every year.'
  }
];

export const PhotoSolver: React.FC<PhotoSolverProps> = ({ currentCountry, user, onOpenAuth, onSolveComplete }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('maths');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>('bac_tse');
  const [problemText, setProblemText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<SolvedExercise | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [practiceRevealed, setPracticeRevealed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const unsub = voiceTutor.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsub();
      stopCamera();
      voiceTutor.stop();
    };
  }, []);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (JPEG, PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // Camera start / stop / capture
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Impossible d\'accéder à la caméra. Veuillez autoriser la caméra dans votre navigateur ou importer une photo.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  // Submit to API
  const handleSolveExercise = async () => {
    if (!imagePreview && !problemText.trim()) {
      setErrorMsg('Veuillez photographier un exercice ou saisir son énoncé.');
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
      setLoading(true);
      setErrorMsg(null);
      voiceTutor.stop();

      const response = await fetch('/api/solve-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          problemText: problemText.trim(),
          subject: selectedSubject,
          level: selectedLevel,
          country: currentCountry
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erreur lors de la résolution');
      }

      const rawData = await response.json();
      const cleanData: SolvedExercise = sanitizeMathObject(rawData);
      setSolution(cleanData);
      if (onSolveComplete) onSolveComplete(cleanData);
      
      // Auto-save if logged in
      if (user) {
        saveSolvedExerciseToDb(user.uid, cleanData).then(() => setSavedSuccess(true));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Impossible d\'analyser l\'exercice.');
    } finally {
      setLoading(false);
    }
  };

  // Read steps aloud with voice (purged from math symbols and dollars)
  const handleToggleVoice = () => {
    if (isSpeaking) {
      voiceTutor.stop();
    } else if (solution) {
      const fullSpeechText = `Voici la résolution étape par étape de votre exercice de ${SUBJECTS[solution.subject]?.name || solution.subject}. ` +
        solution.steps.map(s => `Étape ${s.stepNumber} : ${cleanMathText(s.title)}. ${cleanMathText(s.content)}. ${s.proTip ? 'Astuce du professeur : ' + cleanMathText(s.proTip) : ''}`).join('. ') +
        `. Réponse finale : ${cleanMathText(solution.finalAnswer)}`;
      voiceTutor.speak(fullSpeechText);
    }
  };

  const handleSaveToNotebook = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (solution) {
      await saveSolvedExerciseToDb(user.uid, solution);
      setSavedSuccess(true);
    }
  };

  const handleShare = () => {
    if (!solution) return;
    const textToShare = `💡 Exercice résolu avec Prof IA Mali 🇲🇱\n\n📌 Énoncé: ${cleanMathText(solution.problemStatement).slice(0, 100)}...\n\n✅ Réponse finale: ${cleanMathText(solution.finalAnswer)}\n\nExplication pas à pas complète disponible sur l'app !`;
    if (navigator.share) {
      navigator.share({
        title: 'Solution d\'exercice - Prof IA Mali',
        text: textToShare,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(textToShare);
      alert('Résumé copié dans le presse-papier !');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6">
      
      {/* Top iOS Card: Subject Selection & Level */}
      <div id="solver-subject-selector" className="p-4 sm:p-5 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[28px] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60 mb-1">
              <Camera className="w-3 h-3 text-emerald-600" />
              <span>Module Scanner IA</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Photographie ton exercice pour une résolution pas à pas
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Niveau :</label>
            <select
              id="solver-level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as EducationLevel)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 7 Subjects Buttons with iOS Squircle Style & Subject Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2 pt-1">
          {(Object.keys(SUBJECTS) as SubjectId[]).map((subId) => {
            const sub = SUBJECTS[subId];
            const isSelected = selectedSubject === subId;
            return (
              <button
                key={subId}
                id={`subject-btn-${subId}`}
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
                  setSelectedSubject(subId);
                }}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all active:scale-95 cursor-pointer gap-1.5 ${
                  isSelected
                    ? `${sub.bgColor} ${sub.borderColor} ring-2 ring-emerald-500/40 shadow-xs font-bold`
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 text-slate-600'
                }`}
              >
                <SubjectLogo subjectId={subId} size="sm" variant={isSelected ? 'outline' : 'subtle'} />
                <div>
                  <span className={`block text-xs ${isSelected ? sub.color : 'text-slate-700 font-semibold'}`}>
                    {sub.shortName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-full block">
                    {sub.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area: Photo / Camera / Text */}
      <div id="solver-input-card" className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left column: Photo Upload & Live Camera */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[28px] shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              Capture Photo de l'exercice
            </h3>

            {isCameraActive ? (
              <div className="relative overflow-hidden rounded-2xl bg-black aspect-4/3 flex items-center justify-center shadow-inner">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                  <button
                    id="capture-photo-btn"
                    type="button"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Prendre la photo
                  </button>
                  <button
                    id="cancel-camera-btn"
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-900 active:scale-95 text-white text-xs font-medium rounded-full cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <img 
                  src={imagePreview} 
                  alt="Exercice scanné" 
                  referrerPolicy="no-referrer"
                  className="w-full max-h-60 object-contain rounded-xl mx-auto"
                />
                <button
                  id="remove-image-btn"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-4 right-4 px-3 py-1.5 text-xs bg-slate-900/80 hover:bg-slate-900 text-white rounded-full backdrop-blur-xs cursor-pointer shadow-xs active:scale-95"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 sm:p-6 text-center bg-slate-50/50 transition-colors"
              >
                <div className="flex justify-center gap-2.5 mb-3">
                  <button
                    id="open-camera-btn"
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold rounded-full shadow-xs transition-transform cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    Ouvrir la Caméra
                  </button>
                  <button
                    id="select-file-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-semibold rounded-full shadow-xs transition-transform cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Importer Image
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Prenez en photo une feuille de cahier, un manuel ou un sujet d'examen.
                </p>
              </div>
            )}

            {/* Quick samples bar */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Exemples rapides d'examen :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_EXERCISES.map((sample, idx) => (
                  <button
                    key={idx}
                    id={`sample-exercise-btn-${idx}`}
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
                      setSelectedSubject(sample.subject);
                      setSelectedLevel(sample.level);
                      setProblemText(sample.problemText);
                      setImagePreview(null);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-full border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <SubjectLogo subjectId={sample.subject} size="xs" variant="plain" />
                    <span className="truncate max-w-[170px]">{sample.title}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Text Question & Action */}
        <div className="lg:col-span-6 space-y-4 flex flex-col">
          <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[28px] shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Énoncé ou précision sur l'exercice
              </h3>
              <textarea
                id="problem-statement-input"
                rows={4}
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Tapez votre énoncé d'exercice ou ajoutez des détails pour le professeur..."
                className="w-full p-3 text-xs border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none bg-slate-50/50"
              />
            </div>

            {errorMsg && (
              <div id="solver-error-banner" className="my-2 p-3 text-xs text-red-700 bg-red-50/90 border border-red-200 rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-3">
              <button
                id="run-solve-btn"
                type="button"
                onClick={handleSolveExercise}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Professeur IA en cours d'analyse...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Obtenir l'Explication Pas à Pas</span>
                  </>
                )}
              </button>
              <div className="mt-2 text-center">
                <span className="text-[11px] text-slate-400">
                  Résolution conforme aux programmes scolaires du Mali & UEMOA
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Generated Solution Section */}
      {solution && (
        <motion.div 
          id="solver-solution-container" 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-7 bg-white/95 backdrop-blur-2xl border border-emerald-200 shadow-md rounded-[32px] space-y-6"
        >
          
          {/* Solution Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-start gap-3">
              <SubjectLogo subjectId={solution.subject} size="md" variant="subtle" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SubjectBadge subjectId={solution.subject} size="xs" />
                  <span className="text-xs text-slate-500 font-medium">
                    Correction Officielle Professeur IA
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {cleanMathText(solution.problemStatement)}
                </h3>
              </div>
            </div>

            {/* Audio Voice Player & Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="voice-tutor-play-btn"
                type="button"
                onClick={handleToggleVoice}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all active:scale-95 cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                    : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800'
                }`}
                title="Écouter l'explication vocale du professeur"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Écouter le Prof</span>
                  </>
                )}
              </button>

              <button
                id="save-to-notebook-btn"
                type="button"
                onClick={handleSaveToNotebook}
                className={`p-2.5 rounded-full border transition-all active:scale-95 cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100/80 border-slate-200 hover:bg-slate-200 text-slate-600'
                }`}
                title="Enregistrer dans mon carnet de révision"
              >
                <BookmarkCheck className="w-4 h-4" />
              </button>

              <button
                id="share-solution-btn"
                type="button"
                onClick={handleShare}
                className="p-2.5 bg-slate-100/80 border border-slate-200 hover:bg-slate-200 text-slate-600 rounded-full transition-all active:scale-95 cursor-pointer"
                title="Partager avec un camarade"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Methodology Rule Callout */}
          {solution.methodologySummary && (
            <div id="methodology-rule-callout" className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Méthode et Règle Clé à retenir
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {cleanMathText(solution.methodologySummary)}
                </p>
              </div>
            </div>
          )}

          {/* Step-by-Step Breakdown (Explication étape par étape) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Explication pas à pas
            </h4>

            <div className="space-y-2.5">
              {solution.steps.map((step, idx) => (
                <div 
                  key={idx}
                  id={`step-card-${step.stepNumber}`}
                  className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800">
                        {cleanMathText(step.title)}
                      </h5>
                    </div>
                    {step.formulaOrRule && (
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 rounded-full border border-emerald-200">
                        {cleanMathText(step.formulaOrRule)}
                      </span>
                    )}
                  </div>

                  <div className="pl-8 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {cleanMathText(step.content)}
                  </div>

                  {step.proTip && (
                    <div className="mt-2.5 ml-8 p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Astuce du Prof :</strong> {cleanMathText(step.proTip)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final Answer Banner */}
          <div id="solution-final-answer-card" className="p-4 bg-linear-to-r from-emerald-800 to-teal-900 text-white rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
              🎯 Conclusion & Réponse Finale
            </span>
            <p className="text-sm font-bold tracking-tight">
              {cleanMathText(solution.finalAnswer)}
            </p>
          </div>

          {/* Traps to avoid (Pièges à éviter le jour de l'examen) */}
          {solution.trapsToAvoid && solution.trapsToAvoid.length > 0 && (
            <div id="traps-avoid-card" className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
              <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Pièges classiques à éviter à l'examen
              </h5>
              <ul className="space-y-1 pl-5 list-disc text-xs text-rose-800">
                {solution.trapsToAvoid.map((trap, tIdx) => (
                  <li key={tIdx}>{cleanMathText(trap)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Exercise Challenge (Exercice similaire) */}
          {solution.practiceExercise && (
            <div id="practice-exercise-card" className="p-4 sm:p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Exercice d'entraînement similaire (Testez-vous !)
                </h5>
                <button
                  id="toggle-practice-solution-btn"
                  type="button"
                  onClick={() => setPracticeRevealed(!practiceRevealed)}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                >
                  {practiceRevealed ? 'Masquer le corrigé' : 'Voir le corrigé'}
                </button>
              </div>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {cleanMathText(solution.practiceExercise.statement)}
              </p>
              {solution.practiceExercise.hint && (
                <p className="text-[11px] text-indigo-800 italic">
                  💡 Indice : {cleanMathText(solution.practiceExercise.hint)}
                </p>
              )}
              {practiceRevealed && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800"
                >
                  <strong>Corrigé type :</strong> {cleanMathText(solution.practiceExercise.solution)}
                </motion.div>
              )}
            </div>
          )}

        </motion.div>
      )}

    </div>
  );
};
