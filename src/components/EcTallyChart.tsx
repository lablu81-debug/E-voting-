import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  LayoutGrid,
  ListOrdered,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { Candidate, Language } from '../types';
import { toBanglaNum } from '../utils/helpers';
import { i18n } from '../data/initialData';

interface EcTallyChartProps {
  ecCandidates: Candidate[];
  totalVotesCast: number;
  currentLang: Language;
}

type ViewMode = 'cards' | 'chart' | 'list';

export const EcTallyChart: React.FC<EcTallyChartProps> = ({
  ecCandidates,
  totalVotesCast,
  currentLang
}) => {
  const t = i18n[currentLang];
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const sortedEc = [...ecCandidates].sort((a, b) => b.votes - a.votes);
  const maxVotes = sortedEc.length > 0 ? sortedEc[0].votes : 1;

  // Chart data for Recharts Bar Chart
  const chartData = sortedEc.map((c, idx) => {
    const name = currentLang === 'en' ? c.nameEn : c.nameBn;
    const dept = currentLang === 'en' ? c.deptEn : c.deptBn;
    const pct = totalVotesCast > 0 ? Number(((c.votes / totalVotesCast) * 100).toFixed(1)) : 0;
    const isElected = idx < 8 && c.votes > 0;
    const isLead = idx === 0 && c.votes > 0;

    return {
      id: c.id,
      name,
      shortName: name.length > 12 ? `${name.slice(0, 11)}…` : name,
      dept,
      votes: c.votes,
      pct,
      isLead,
      isElected,
      img: c.img,
      rank: idx + 1
    };
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {t.ecTallyHeading}
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {t.ecWinLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentLang === 'en'
                ? 'Executive Committee representation tally for 08 elected seats (Top 8 candidates are certified as EC Members)'
                : '০৮টি নির্বাচিত আসনের ফলাফল ও ভোট পরিসংখ্যান (শীর্ষ ৮ জন প্রার্থী কার্যনির্বাহী সদস্য হিসেবে নির্বাচিত হবেন)'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            id="btn-ec-view-cards"
            type="button"
            onClick={() => setViewMode('cards')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Committee Cards' : 'কমিটি কার্ড'}</span>
          </button>

          <button
            id="btn-ec-view-chart"
            type="button"
            onClick={() => setViewMode('chart')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'chart'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Bar Chart' : 'বার চার্ট'}</span>
          </button>

          <button
            id="btn-ec-view-list"
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'List View' : 'তালিকা'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Cards Grid (Styled directly as Election Organizing Committee) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {sortedEc.map((c, idx) => {
            const name = currentLang === 'en' ? c.nameEn : c.nameBn;
            const dept = currentLang === 'en' ? c.deptEn : c.deptBn;
            const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';
            const isElected = idx < 8 && c.votes > 0;
            const isLead = idx === 0 && c.votes > 0;

            // Committee-style badge text for 08 seats
            let badgeText = `#${toBanglaNum(idx + 1, currentLang)}`;
            let badgeColor = 'bg-slate-600 text-white';

            if (isLead) {
              badgeText = currentLang === 'en' ? '★ Seat #1 Lead' : '★ ১ম আসন (শীর্ষ)';
              badgeColor = 'bg-emerald-600 text-white';
            } else if (isElected) {
              badgeText = currentLang === 'en' ? `★ Seat #${idx + 1}` : `★ আসন #${toBanglaNum(idx + 1, currentLang)}`;
              badgeColor = 'bg-emerald-700 text-white';
            } else {
              badgeText = currentLang === 'en' ? `#${idx + 1} Contesting` : `#${toBanglaNum(idx + 1, currentLang)} প্রতিদ্বন্দ্বী`;
              badgeColor = 'bg-slate-600 text-white';
            }

            return (
              <div
                key={c.id}
                className={`relative rounded-xl p-3.5 text-center flex flex-col items-center justify-between border transition-all ${
                  isElected
                    ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200/80 hover:border-blue-300 hover:bg-white'
                }`}
              >
                {/* Winner Crown indicator if top leader or elected */}
                {isLead && (
                  <div className="absolute top-2 right-2 text-emerald-600" title="Top Leader">
                    <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                  </div>
                )}
                {!isLead && isElected && (
                  <div className="absolute top-2 right-2 text-emerald-600" title={`Elected Seat #${idx + 1}`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  </div>
                )}

                {/* Circular Portrait with Overlaid Badge — Matching Election Organizing Committee */}
                <div className="relative mb-3 mt-1">
                  <img
                    src={c.img}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 shadow-sm bg-slate-200 ${
                      isElected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-white'
                    }`}
                  />
                  <span
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${badgeColor}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Candidate Information */}
                <div className="w-full mt-1.5 space-y-0.5 min-w-0">
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={name}>
                    {name}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate" title={dept}>
                    {dept}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {toBanglaNum(c.id, currentLang)}
                  </p>
                </div>

                {/* Vote Counter & Share Meter */}
                <div className="w-full mt-3 pt-2.5 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-blue-600" />
                      {toBanglaNum(c.votes, currentLang)}
                      <span className="text-[10px] font-normal text-slate-500">{t.votesLabel}</span>
                    </span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                        isElected
                          ? 'text-emerald-700 bg-emerald-100/70'
                          : 'text-blue-700 bg-blue-50'
                      }`}
                    >
                      {toBanglaNum(pct, currentLang)}%
                    </span>
                  </div>

                  {/* Visual Progress Meter */}
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isElected ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Interactive Recharts Bar Chart */}
      {viewMode === 'chart' && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{currentLang === 'en' ? 'Horizontal comparison of candidate vote counts (08 Seats)' : 'প্রার্থীদের প্রাপ্ত ভোটের তুলনামূলক বার চার্ট (০৮টি আসন)'}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                {currentLang === 'en' ? 'Top 8 Elected Seats' : 'শীর্ষ ৮টি নির্বাচিত আসন'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
                {currentLang === 'en' ? 'Contesting Candidates' : 'অন্যান্য প্রার্থী'}
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={[0, Math.ceil(maxVotes * 1.15)]}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-44">
                          <div className="flex items-center gap-2">
                            <img
                              src={data.img}
                              alt={data.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-600"
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{data.name}</div>
                              <div className="text-[11px] text-slate-300">{data.dept}</div>
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">Votes:</span>
                            <span className="font-bold text-amber-400 text-sm">
                              {toBanglaNum(data.votes, currentLang)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Share:</span>
                            <span className="font-bold text-emerald-400">
                              {toBanglaNum(data.pct, currentLang)}%
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
                            <span>Rank: #{toBanglaNum(data.rank, currentLang)}</span>
                            {data.isElected && (
                              <span className="text-emerald-400 font-semibold">
                                {currentLang === 'en' ? `Elected (Seat #${data.rank})` : `নির্বাচিত (আসন #${toBanglaNum(data.rank, currentLang)})`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={entry.isElected ? '#10b981' : '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 3: List View */}
      {viewMode === 'list' && (
        <div className="divide-y divide-slate-100 space-y-2">
          {sortedEc.map((c, idx) => {
            const name = currentLang === 'en' ? c.nameEn : c.nameBn;
            const dept = currentLang === 'en' ? c.deptEn : c.deptBn;
            const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';
            const isElected = idx < 8 && c.votes > 0;

            return (
              <div
                key={c.id}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-colors ${
                  isElected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isElected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{toBanglaNum(idx + 1, currentLang)}
                </div>

                <img
                  src={c.img}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                      {name}{' '}
                      <span className="text-slate-500 font-normal text-xs">({dept})</span>
                      {isElected && (
                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {currentLang === 'en' ? `Elected (Seat #${idx + 1})` : `নির্বাচিত (আসন #${toBanglaNum(idx + 1, currentLang)})`}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-blue-700 shrink-0 flex items-center gap-2">
                      <span>{toBanglaNum(c.votes, currentLang)} {t.votesLabel}</span>
                      <span className="text-slate-400">|</span>
                      <span>{toBanglaNum(pct, currentLang)}%</span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isElected ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
