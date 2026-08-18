import { SubjectInfo, SubjectId, EducationLevel } from '../types';

export const SUBJECTS: Record<SubjectId, SubjectInfo> = {
  maths: {
    id: 'maths',
    name: 'Mathématiques',
    shortName: 'Maths',
    icon: 'Calculator',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Algèbre, Géométrie, Analyse, Probabilités, Suites numériques, Nombres complexes, Trigonométrie',
    typicalTopics: ['Équations et Inéquations', 'Fonctions exponentielles & logarithmes', 'Géométrie dans l’espace', 'Probabilités & Statistiques', 'Matrices & Intégrales']
  },
  physique: {
    id: 'physique',
    name: 'Physique',
    shortName: 'Physique',
    icon: 'Zap',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Mécanique de Newton, Électricité, Ondes & Optique, Électromagnétisme, Physique Nucléaire',
    typicalTopics: ['Lois de Newton & Balistique', 'Circuits RLC & Oscillations', 'Optique géométrique', 'Ondes lumineuses & sonores', 'Radioactivité & Énergie']
  },
  chimie: {
    id: 'chimie',
    name: 'Chimie',
    shortName: 'Chimie',
    icon: 'FlaskConical',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Chimie organique, Réactions acido-basiques, Cinétique chimique, Oxydoréduction, Dosages',
    typicalTopics: ['Alcanes, Alcools, Estérification', 'pH-métrie et titrages', 'Cinétique & catalyse', 'Piles électrochimiques', 'Chimie des solutions']
  },
  francais: {
    id: 'francais',
    name: 'Français',
    shortName: 'Français',
    icon: 'BookOpen',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Dissertation littéraire, Commentaire composé, Résumé & Discussion, Grammaire, Figures de style',
    typicalTopics: ['Littérature négro-africaine (Césaire, Senghor, Hampâté Bâ)', 'Dissertation littéraire & argumentation', 'Commentaire de texte', 'Grammaire & Conjugaison', 'Figures de style & rhétorique']
  },
  histoire: {
    id: 'histoire',
    name: 'Histoire',
    shortName: 'Histoire',
    icon: 'Hourglass',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Grands Empires du Mali (Soundiata Keïta, Kankou Moussa), Colonisation, Indépendance, Guerres mondiales, Géopolitique',
    typicalTopics: ['Empire du Mandé & Charte de Kurukan Fuga', 'Soudan Français & Luttes d’indépendance', 'Première et Seconde Guerre mondiale', 'Guerre Froide & Décolonisation', 'Histoire contemporaine africaine']
  },
  geographie: {
    id: 'geographie',
    name: 'Géographie',
    shortName: 'Géographie',
    icon: 'Globe2',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'Géographie physique et humaine du Mali (Fleuve Niger, Sahel), Économie africaine, Mondialisation, Démographie',
    typicalTopics: ['Le Mali : Relief, Climat, Bassin du Niger', 'Agriculture sahélo-saharienne & enjeux climatiques', 'Démographie & Urbanisation en Afrique de l’Ouest', 'Mondialisation & flux économiques', 'Aménagement du territoire']
  },
  anglais: {
    id: 'anglais',
    name: 'Anglais',
    shortName: 'Anglais',
    icon: 'Languages',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Grammar, Reading Comprehension, Essay Writing, Tenses, Vocabulary, Translation (Traduction / Thème & Version)',
    typicalTopics: ['Tenses & Conditional sentences', 'Reading comprehension techniques', 'Essay & Paragraph writing', 'Passive voice & Indirect speech', 'Vocabulary for exams (DEF & BAC)']
  }
};

export const EDUCATION_LEVELS: { id: EducationLevel; label: string; group: 'mali' | 'france' | 'sup' }[] = [
  { id: 'def_9eme', label: 'DEF (9ème Année - Diplôme d\'Études Fondamentales 🇲🇱)', group: 'mali' },
  { id: 'lycee_10eme', label: '10ème Année Lycée (Tronc Commun 🇲🇱)', group: 'mali' },
  { id: 'lycee_11eme', label: '11ème Année (Sciences / Lettres 🇲🇱)', group: 'mali' },
  { id: 'bac_tse', label: 'Terminale TSE (Sciences Exactes - Baccalauréat 🇲🇱)', group: 'mali' },
  { id: 'bac_tss', label: 'Terminale TSS (Sciences Sociales / Expérimentales 🇲🇱)', group: 'mali' },
  { id: 'bac_tseco', label: 'Terminale TSEco (Sciences Économiques 🇲🇱)', group: 'mali' },
  { id: 'bac_tll', label: 'Terminale TLL (Langues et Littérature 🇲🇱)', group: 'mali' },
  { id: 'bac_tal', label: 'Terminale TAL (Arts et Lettres 🇲🇱)', group: 'mali' },
  { id: 'college_fr', label: 'Collège - Brevet des collèges 🇫🇷', group: 'france' },
  { id: 'lycee_fr', label: 'Lycée - Baccalauréat Général 🇫🇷', group: 'france' },
  { id: 'superieur', label: 'Enseignement Supérieur / Université 🎓', group: 'sup' }
];

export const COUNTRIES = [
  { code: 'ML', name: 'Mali', flag: '🇲🇱', defaultProgram: 'def_9eme' },
  { code: 'FR', name: 'France', flag: '🇫🇷', defaultProgram: 'lycee_fr' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', defaultProgram: 'bac_tse' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', defaultProgram: 'bac_tse' },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', defaultProgram: 'bac_tse' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', defaultProgram: 'bac_tse' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', defaultProgram: 'bac_tse' },
  { code: 'OTHER', name: 'International', flag: '🌍', defaultProgram: 'bac_tse' }
];
