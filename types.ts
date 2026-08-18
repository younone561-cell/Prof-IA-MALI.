export type SubjectId = 
  | 'maths' 
  | 'physique' 
  | 'chimie' 
  | 'francais' 
  | 'histoire' 
  | 'geographie' 
  | 'anglais';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  typicalTopics: string[];
}

export type EducationLevel = 
  | 'def_9eme' // DEF (Diplôme d'Études Fondamentales - 9ème année)
  | 'lycee_10eme' // 10ème Année (Commune)
  | 'lycee_11eme' // 11ème Sciences / Lettres
  | 'bac_tse' // Terminale Sciences Exactes
  | 'bac_tss' // Terminale Sciences Sociales / Expérimentales
  | 'bac_tseco' // Terminale Sciences Économiques
  | 'bac_tll' // Terminale Lettres et Littérature
  | 'bac_tal' // Terminale Arts et Lettres
  | 'college_fr' // Collège (Programme France / International)
  | 'lycee_fr' // Lycée / Bac Français
  | 'superieur'; // Université / Classes Préparatoires

export interface ExplanationStep {
  stepNumber: number;
  title: string;
  content: string;
  formulaOrRule?: string;
  proTip?: string;
}

export interface SolvedExercise {
  id: string;
  userId?: string;
  subject: SubjectId;
  level: EducationLevel;
  country: string;
  problemStatement: string;
  imageBase64?: string;
  steps: ExplanationStep[];
  finalAnswer: string;
  methodologySummary: string;
  trapsToAvoid: string[];
  practiceExercise?: {
    statement: string;
    hint: string;
    solution: string;
  };
  createdAt: number;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  type: 'mcq' | 'open';
  question: string;
  options?: string[]; // For MCQ
  correctAnswerIndex?: number;
  expectedAnswerHint?: string;
  points: number;
  explanation: string;
}

export interface MockExam {
  id: string;
  title: string;
  subject: SubjectId;
  level: EducationLevel;
  country: string;
  durationMinutes: number;
  totalPoints: number;
  instructions: string[];
  questions: ExamQuestion[];
}

export interface ExamEvaluation {
  score: number;
  maxScore: number;
  percentage: number;
  gradeOver20: number;
  mention: 'Très Bien' | 'Bien' | 'Assez Bien' | 'Passable' | 'Ajourné';
  globalFeedback: string;
  questionResults: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    correction: string;
  }[];
  strengths: string[];
  areasToImprove: string[];
}

export interface ExamResultRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userSchool?: string;
  subject: SubjectId;
  level: EducationLevel;
  country: string;
  examTitle: string;
  gradeOver20: number;
  percentage: number;
  score: number;
  maxScore: number;
  mention: string;
  timeSpentSeconds: number;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  country: string; // 'ML' | 'FR' | 'SN' | 'CI' | 'GN' | etc.
  schoolName?: string;
  level: EducationLevel;
  points: number;
  solvedExercisesCount: number;
  examsTakenCount: number;
  averageGradeOver20: number;
  badges: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  subject?: SubjectId;
  timestamp: number;
  formulaHighlight?: string;
}
