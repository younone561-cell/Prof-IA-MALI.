import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  MessageCircle, 
  MapPin, 
  UserCheck, 
  Phone, 
  Sparkles, 
  Code2, 
  Layers, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Smartphone,
  Globe2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BusinessActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessActivityModal: React.FC<BusinessActivityModalProps> = ({ isOpen, onClose }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!isOpen) return null;

  const phoneNumber = '+223 68 60 19 09';
  const rawPhoneNumber = '22368601909';
  const whatsappUrl = `https://wa.me/${rawPhoneNumber}?text=${encodeURIComponent(
    "Bonjour M. Younoussa TOGO, j'ai découvert votre présentation sur Prof IA Mali et je suis vivement intéressé(e) pour collaborer sur vos projets numériques (développement, applications, IA, web)."
  )}`;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+22368601909');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('Farako Mountougoula, Mali');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div 
      id="business-activity-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <motion.div
        id="business-activity-sheet"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-t sm:border border-slate-200/80 rounded-t-[32px] sm:rounded-[36px] shadow-2xl p-5 sm:p-7 space-y-5 select-text"
      >
        {/* iOS Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 sm:hidden opacity-80" />

        {/* Header with Close Button */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-600 via-teal-700 to-emerald-800 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-700/20 border border-emerald-400/30 shrink-0">
              👨‍💻
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60 mb-0.5">
                <Briefcase className="w-3 h-3 text-emerald-600" />
                <span>Développer mon activité</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Présentation professionnelle — Younoussa TOGO
              </h2>
            </div>
          </div>

          <button
            id="close-business-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Pitch Box */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl border border-emerald-500/20 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Vision & Projets Numériques</span>
          </div>

          <p className="text-sm sm:text-base font-semibold leading-snug">
            Bonjour,
          </p>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Je me présente, <strong className="text-white font-bold">Younoussa TOGO</strong>, créateur et porteur de projets numériques basé au Mali 🇲🇱.
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Je travaille sur plusieurs projets dans le domaine des <strong className="text-emerald-300">applications mobiles</strong>, <strong className="text-teal-300">plateformes web</strong>, <strong className="text-emerald-300">intelligence artificielle</strong>, <strong className="text-teal-300">création de contenu</strong> et <strong className="text-emerald-300">solutions numériques</strong>. Mon objectif est de développer des produits modernes, simples à utiliser et capables de répondre aux besoins du marché africain et international.
          </p>
        </div>

        {/* Quick Domains Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
            <Smartphone className="w-5 h-5 mx-auto text-emerald-600" />
            <span className="text-[11px] font-bold text-slate-800 block">Apps Mobiles</span>
            <span className="text-[10px] text-slate-500">Android & iOS</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
            <Globe2 className="w-5 h-5 mx-auto text-teal-600" />
            <span className="text-[11px] font-bold text-slate-800 block">Plateformes Web</span>
            <span className="text-[10px] text-slate-500">SaaS & EdTech</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
            <Cpu className="w-5 h-5 mx-auto text-indigo-600" />
            <span className="text-[11px] font-bold text-slate-800 block">Intelligence Artificielle</span>
            <span className="text-[10px] text-slate-500">IA & Génératif</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
            <Layers className="w-5 h-5 mx-auto text-amber-600" />
            <span className="text-[11px] font-bold text-slate-800 block">Contenus Digitaux</span>
            <span className="text-[10px] text-slate-500">Solutions Métier</span>
          </div>
        </div>

        {/* Professional Coordinates Card */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Coordonnées Officielles
          </h3>

          <div className="space-y-2.5">
            {/* Siège */}
            <div className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/70 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Siège</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Farako Mountougoula, Mali</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Copier l'adresse"
              >
                {copiedAddress ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAddress ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            {/* Responsable */}
            <div className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/70 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Responsable</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">Younoussa TOGO</span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                Porteur de projets
              </span>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">WhatsApp Direct</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-950">{phoneNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-200 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Copier le numéro"
              >
                {copiedPhone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPhone ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Opportunity / Collaboration Notice */}
        <div className="p-4 sm:p-5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl sm:rounded-3xl space-y-2 text-xs sm:text-sm text-indigo-950">
          <div className="flex items-center gap-2 font-bold text-indigo-900 text-xs uppercase tracking-wide">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Opportunité de Collaboration Développeurs</span>
          </div>
          <p className="leading-relaxed">
            Je recherche actuellement des <strong>développeurs sérieux, compétents et motivés</strong> pour collaborer sur différents projets numériques, avec la possibilité de construire une collaboration professionnelle sur le long terme.
          </p>
          <p className="text-xs text-indigo-900/90 leading-relaxed">
            Si vous êtes intéressé(e), contactez-moi directement sur WhatsApp afin que nous puissions discuter du projet, des fonctionnalités, du budget et des modalités de collaboration.
          </p>
        </div>

        {/* Primary CTA: WhatsApp */}
        <div className="space-y-2 pt-1">
          <a
            id="whatsapp-direct-cta-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-700/25 transition-all text-center no-underline"
          >
            <MessageCircle className="w-5 h-5 text-emerald-100" />
            <span>💬 Contacter Younoussa TOGO sur WhatsApp</span>
            <ExternalLink className="w-4 h-4 text-emerald-200" />
          </a>

          <div className="text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Younoussa TOGO • Créateur & porteur de projets numériques — Mali 🇲🇱
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
