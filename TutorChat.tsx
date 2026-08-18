import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  BookOpen, 
  Lightbulb,
  CornerDownLeft,
  RotateCcw
} from 'lucide-react';
import { SUBJECTS, EDUCATION_LEVELS } from '../data/subjects';
import { SubjectId, EducationLevel, ChatMessage } from '../types';
import { voiceTutor } from '../lib/audio';
import { cleanMathText } from '../lib/mathFormatter';
import { SubjectLogo, SubjectBadge } from './SubjectLogo';

interface TutorChatProps {
  currentCountry: string;
  user: any;
}

const QUICK_PROMPTS: { subject: SubjectId; text: string }[] = [
  { subject: 'maths', text: 'Comment calculer la dérivée d\'une fonction composée f(g(x)) ?' },
  { subject: 'physique', text: 'Peux-tu m\'expliquer simplement la 2ème loi de Newton (Principe fondamental de la dynamique) ?' },
  { subject: 'chimie', text: 'Comment déterminer si une réaction acido-basique est totale ou partielle ?' },
  { subject: 'francais', text: 'Donne-moi un plan détaillé de dissertation sur la tradition et la modernité en Afrique.' },
  { subject: 'histoire', text: 'Raconte-moi l\'épopée de Soundiata Keïta et la bataille de Kirina (1235).' },
  { subject: 'geographie', text: 'Quels sont les trois grands ensembles climatiques du Mali (Sahélien, Soudanien, Saharien) ?' },
  { subject: 'anglais', text: 'Explain the difference between "used to" and "be used to" with clear examples.' }
];

export const TutorChat: React.FC<TutorChatProps> = ({ currentCountry, user }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('maths');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>('bac_tse');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm0',
      sender: 'tutor',
      text: `Bonjour ${user?.displayName || 'cher élève'} ! Je suis le Professeur IA Mali 🇲🇱. Dans quelle matière souhaites-tu progresser aujourd'hui ? Tu peux me poser n'importe quelle question de cours, me demander une démonstration ou une méthode de révision.`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const unsub = voiceTutor.subscribe((speaking) => {
      if (!speaking) setSpeakingMessageId(null);
    });
    return () => unsub();
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      subject: selectedSubject,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          subject: selectedSubject,
          level: selectedLevel,
          country: currentCountry,
          history: messages.slice(-6)
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec le professeur');
      }

      const data = await response.json();
      const tutorMsg: ChatMessage = {
        id: 'tut_' + Date.now(),
        sender: 'tutor',
        text: cleanMathText(data.text),
        subject: selectedSubject,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, tutorMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'tutor',
          text: 'Pardonnez-moi, une petite difficulté technique est survenue. Pouvez-vous reformuler votre question ?',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoice = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      voiceTutor.stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msgId);
      voiceTutor.speak(cleanMathText(text), () => setSpeakingMessageId(null));
    }
  };

  const resetChat = () => {
    voiceTutor.stop();
    setMessages([
      {
        id: 'm0',
        sender: 'tutor',
        text: `Discussion réinitialisée. Posez-moi votre nouvelle question dans la matière de votre choix !`,
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      
      {/* Subject & Level Config Header */}
      <div id="tutor-chat-header" className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              👨🏾‍🏫
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Professeur IA Mali • Tuteur Particulier
              </h3>
              <p className="text-[11px] text-slate-500">
                Disponible 24/7 pour vos révisions, devoirs et interrogations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              id="tutor-level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as EducationLevel)}
              className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>

            <button
              id="reset-chat-btn"
              type="button"
              onClick={resetChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Effacer l'historique de discussion"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Subjects Selector with SubjectLogos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          {(Object.keys(SUBJECTS) as SubjectId[]).map((sId) => {
            const sub = SUBJECTS[sId];
            const isSelected = selectedSubject === sId;
            return (
              <button
                key={sId}
                type="button"
                onClick={() => setSelectedSubject(sId)}
                className={`px-2.5 py-1 text-xs rounded-xl border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? `${sub.bgColor} ${sub.borderColor} ${sub.color} font-bold ring-2 ring-emerald-500/30 shadow-2xs`
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <SubjectLogo subjectId={sId} size="xs" variant={isSelected ? 'plain' : 'subtle'} />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div id="tutor-messages-box" className="p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xs min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">
        
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';
          const isAudioActive = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isTutor ? 'justify-start' : 'justify-end'}`}
            >
              {isTutor && (
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-sm shrink-0 mt-1 shadow-xs">
                  👨🏾‍🏫
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                  isTutor
                    ? 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
                    : 'bg-emerald-700 text-white rounded-tr-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">
                  {cleanMathText(msg.text)}
                </div>

                {isTutor && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-800">Prof IA</span>
                    <button
                      type="button"
                      onClick={() => handleToggleVoice(msg.id, msg.text)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        isAudioActive 
                          ? 'bg-amber-100 text-amber-800 animate-pulse' 
                          : 'hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isAudioActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isAudioActive ? 'Stop' : 'Écouter'}</span>
                    </button>
                  </div>
                )}
              </div>

              {!isTutor && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-sm shrink-0">
              👨🏾‍🏫
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span>Le professeur rédige sa réponse...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Suggestions :
        </span>
        {QUICK_PROMPTS.filter(p => p.subject === selectedSubject).map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt.text)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[11px] rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs truncate max-w-[280px] flex items-center gap-1.5 active:scale-95"
          >
            <SubjectLogo subjectId={prompt.subject} size="xs" variant="plain" />
            <span className="truncate">{prompt.text}</span>
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative">
        <textarea
          id="tutor-chat-input"
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Posez votre question en ${SUBJECTS[selectedSubject]?.name} (Appuyez sur Entrée pour envoyer)...`}
          className="w-full pl-4 pr-12 py-3 text-xs border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none bg-white shadow-xs"
        />
        <button
          id="send-chat-message-btn"
          type="button"
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          className="absolute right-3 bottom-3.5 p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
