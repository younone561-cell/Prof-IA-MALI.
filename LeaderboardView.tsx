import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Search, 
  Filter, 
  Globe, 
  Sparkles, 
  Clock, 
  GraduationCap, 
  ChevronDown,
  Flame,
  Award,
  Users
} from 'lucide-react';
import { getLeaderboardResults } from '../lib/firebase';
import { ExamResultRecord, SubjectId } from '../types';
import { SUBJECTS, COUNTRIES } from '../data/subjects';
import { SubjectLogo, SubjectBadge } from './SubjectLogo';

interface LeaderboardViewProps {
  currentCountry: string;
  onTakeExam: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentCountry, onTakeExam }) => {
  const [records, setRecords] = useState<ExamResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboardResults(countryFilter === 'ALL' ? undefined : countryFilter);
      setRecords(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [countryFilter]);

  const filteredRecords = records.filter(r => {
    if (subjectFilter !== 'ALL' && r.subject !== subjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.userName.toLowerCase().includes(q) ||
        (r.userSchool && r.userSchool.toLowerCase().includes(q)) ||
        r.examTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const topThree = filteredRecords.slice(0, 3);
  const remainingList = filteredRecords.slice(3);

  const getCountryFlag = (code?: string) => {
    const c = COUNTRIES.find(cnt => cnt.code === code);
    return c ? c.flag : '🌍';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div id="leaderboard-header" className="relative p-6 bg-linear-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl border border-emerald-500/30 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-xs font-bold text-amber-300 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Classement Général des Majors
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Tableau d'Honneur des Meilleurs Élèves 🇲🇱 🇫🇷
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              Consultez les scores réels obtenus lors des Examens Blancs. Passez votre épreuve pour intégrer le Top National !
            </p>
          </div>

          <button
            id="challenge-exam-btn"
            type="button"
            onClick={onTakeExam}
            className="self-start md:self-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-slate-900" />
            <span>Passer un Examen Blanc</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div id="leaderboard-toolbar" className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Country Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            id="filter-all-countries"
            type="button"
            onClick={() => setCountryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              countryFilter === 'ALL'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🌍 Tous les pays
          </button>
          <button
            id="filter-ml-country"
            type="button"
            onClick={() => setCountryFilter('ML')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              countryFilter === 'ML'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🇲🇱 Mali (National)
          </button>
          <button
            id="filter-fr-country"
            type="button"
            onClick={() => setCountryFilter('FR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              countryFilter === 'FR'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🇫🇷 France
          </button>
        </div>

        {/* Subject Filter & Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="leaderboard-subject-select"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="ALL">Toutes les matières</option>
            {(Object.keys(SUBJECTS) as SubjectId[]).map((sId) => (
              <option key={sId} value={sId}>
                {SUBJECTS[sId].name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="search-candidate-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher élève ou lycée..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
            />
          </div>
        </div>

      </div>

      {/* Top 3 Podium (Gold, Silver, Bronze) */}
      {topThree.length > 0 && (
        <div id="leaderboard-podium" className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* 2nd Place (Silver) */}
          {topThree[1] && (
            <div className="order-2 md:order-1 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs text-center flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-3 left-3 text-2xl font-black text-slate-300">#2</div>
              <div>
                <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl shadow-xs">
                  🥈
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {getCountryFlag(topThree[1].country)} {topThree[1].userName}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {topThree[1].userSchool || 'Lycée'}
                </p>
                <div className="mt-2 flex justify-center">
                  <SubjectBadge subjectId={topThree[1].subject} size="xs" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-2xl font-black text-slate-800">{topThree[1].gradeOver20}</span>
                <span className="text-xs text-slate-400 font-semibold">/20</span>
                <span className="block text-[10px] text-emerald-700 font-bold uppercase mt-0.5">{topThree[1].mention}</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold / Champion) */}
          {topThree[0] && (
            <div className="order-1 md:order-2 p-6 bg-linear-to-b from-amber-50 to-white border-2 border-amber-400/80 rounded-2xl shadow-md text-center flex flex-col justify-between relative overflow-hidden transform md:-translate-y-2">
              <div className="absolute top-3 left-3 text-2xl font-black text-amber-500">#1</div>
              <div>
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-md ring-4 ring-amber-300/40 animate-pulse">
                  🥇
                </div>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 rounded-full inline-block mb-1">
                  Major National
                </span>
                <h4 className="text-base font-extrabold text-slate-900 truncate">
                  {getCountryFlag(topThree[0].country)} {topThree[0].userName}
                </h4>
                <p className="text-xs text-slate-600 truncate mt-0.5">
                  {topThree[0].userSchool || 'Lycée Askia Mohamed'}
                </p>
                <div className="mt-2 flex justify-center">
                  <SubjectBadge subjectId={topThree[0].subject} size="sm" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <span className="text-3xl font-black text-amber-600">{topThree[0].gradeOver20}</span>
                <span className="text-sm text-slate-500 font-bold">/20</span>
                <span className="block text-xs text-amber-700 font-extrabold uppercase mt-0.5">{topThree[0].mention}</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {topThree[2] && (
            <div className="order-3 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs text-center flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-3 left-3 text-2xl font-black text-amber-700/30">#3</div>
              <div>
                <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-amber-50 border-2 border-amber-700/40 flex items-center justify-center text-xl shadow-xs">
                  🥉
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {getCountryFlag(topThree[2].country)} {topThree[2].userName}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {topThree[2].userSchool || 'Lycée'}
                </p>
                <div className="mt-2 flex justify-center">
                  <SubjectBadge subjectId={topThree[2].subject} size="xs" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-2xl font-black text-slate-800">{topThree[2].gradeOver20}</span>
                <span className="text-xs text-slate-400 font-semibold">/20</span>
                <span className="block text-[10px] text-emerald-700 font-bold uppercase mt-0.5">{topThree[2].mention}</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Full Leaderboard Table */}
      <div id="leaderboard-table-card" className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          Classement Général Complet
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Rang</th>
                <th className="py-2.5 px-3">Candidat</th>
                <th className="py-2.5 px-3">Établissement</th>
                <th className="py-2.5 px-3">Épreuve / Matière</th>
                <th className="py-2.5 px-3 text-right">Note /20</th>
                <th className="py-2.5 px-3 text-right">Mention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record, index) => (
                <tr 
                  key={record.id || index}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-slate-700">
                    {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span>{getCountryFlag(record.country)}</span>
                      <span className="font-bold text-slate-900">{record.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[180px]">
                    {record.userSchool || 'Établissement scolaire'}
                  </td>
                  <td className="py-3 px-3">
                    <SubjectBadge subjectId={record.subject} size="xs" />
                  </td>
                  <td className="py-3 px-3 text-right font-black text-sm text-emerald-700">
                    {record.gradeOver20}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {record.mention}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Aucun résultat trouvé pour ces filtres. Passez le premier examen blanc !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
