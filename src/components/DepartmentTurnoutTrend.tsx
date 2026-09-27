import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  LayoutGrid,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  AlertCircle,
  Users2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import { Language, Voter } from '../types';
import { toBanglaNum } from '../utils/helpers';

interface DepartmentTurnoutTrendProps {
  voterRegistry?: Voter[];
  totalVoters: number;
  totalVotesCast: number;
  currentLang: Language;
}

type TrendViewMode = 'bar' | 'trend' | 'cards';

interface DepartmentData {
  deptEn: string;
  deptBn: string;
  name: string;
  total: number;
  voted: number;
  pending: number;
  turnoutPct: number;
  variance: number; // vs average turnout
  color: string;
  badge: {
    en: string;
    bn: string;
    bg: string;
    text: string;
  };
}

const DEPT_COLORS = [
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#e11d48'  // rose-600
];

export const DepartmentTurnoutTrend: React.FC<DepartmentTurnoutTrendProps> = ({
  voterRegistry = [],
  totalVoters,
  totalVotesCast,
  currentLang
}) => {
  const [viewMode, setViewMode] = useState<TrendViewMode>('bar');
  const [sortBy, setSortBy] = useState<'turnout' | 'total' | 'name'>('turnout');

  const avgTurnoutPct = totalVoters > 0 ? Number(((totalVotesCast / totalVoters) * 100).toFixed(1)) : 0;

  // Process department data dynamically from voterRegistry or scaled factory baseline
  const departmentsData: DepartmentData[] = useMemo(() => {
    const isEn = currentLang === 'en';

    // If registry has sufficient entries (user imported custom voters), compute directly
    if (voterRegistry.length >= 20) {
      const deptMap = new Map<string, { total: number; voted: number }>();

      voterRegistry.forEach((v) => {
        const deptName = (v.dept || 'General').trim();
        const existing = deptMap.get(deptName) || { total: 0, voted: 0 };
        existing.total += 1;
        if (v.status === 'Voted') {
          existing.voted += 1;
        }
        deptMap.set(deptName, existing);
      });

      const list: DepartmentData[] = [];
      let colorIndex = 0;

      deptMap.forEach((stats, deptName) => {
        const turnoutPct = stats.total > 0 ? Number(((stats.voted / stats.total) * 100).toFixed(1)) : 0;
        const variance = Number((turnoutPct - avgTurnoutPct).toFixed(1));

        let badge = {
          en: 'Target Met',
          bn: 'লক্ষ্য অর্জিত',
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-700'
        };

        if (turnoutPct >= 90) {
          badge = {
            en: 'High Turnout',
            bn: 'সর্বোচ্চ উপস্থিতি',
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-700'
          };
        } else if (turnoutPct < avgTurnoutPct - 4) {
          badge = {
            en: 'Attention Needed',
            bn: 'মনোযোগ প্রয়োজন',
            bg: 'bg-amber-50 border-amber-200',
            text: 'text-amber-700'
          };
        }

        list.push({
          deptEn: deptName,
          deptBn: deptName,
          name: deptName,
          total: stats.total,
          voted: stats.voted,
          pending: stats.total - stats.voted,
          turnoutPct,
          variance,
          color: DEPT_COLORS[colorIndex % DEPT_COLORS.length],
          badge
        });
        colorIndex++;
      });

      return list;
    }

    // Default standard factory distribution scaled to totalVoters & totalVotesCast
    const baselineDepartments = [
      {
        deptEn: 'Sewing',
        deptBn: 'সেলাই বিভাগ',
        weight: 0.42, // ~190 of 450
        turnoutFactor: 1.025,
        color: '#2563eb'
      },
      {
        deptEn: 'Finishing',
        deptBn: 'ফিনিশিং বিভাগ',
        weight: 0.19, // ~85 of 450
        turnoutFactor: 1.015,
        color: '#059669'
      },
      {
        deptEn: 'Cutting',
        deptBn: 'কাটিং বিভাগ',
        weight: 0.145, // ~65 of 450
        turnoutFactor: 0.965,
        color: '#d97706'
      },
      {
        deptEn: 'Quality & QC',
        deptBn: 'কোয়ালিটি বিভাগ',
        weight: 0.11, // ~50 of 450
        turnoutFactor: 1.0,
        color: '#7c3aed'
      },
      {
        deptEn: 'Maintenance',
        deptBn: 'রক্ষণাবেক্ষণ ও টেকনিক্যাল',
        weight: 0.08, // ~35 of 450
        turnoutFactor: 0.975,
        color: '#0891b2'
      },
      {
        deptEn: 'Admin & Store',
        deptBn: 'প্রশাসন ও স্টোর',
        weight: 0.055, // ~25 of 450
        turnoutFactor: 0.91,
        color: '#e11d48'
      }
    ];

    let allocatedVoters = 0;
    let allocatedVotes = 0;

    const list: DepartmentData[] = baselineDepartments.map((d, index) => {
      const isLast = index === baselineDepartments.length - 1;
      const deptTotal = isLast
        ? Math.max(1, totalVoters - allocatedVoters)
        : Math.round(totalVoters * d.weight);
      allocatedVoters += deptTotal;

      const targetTurnout = Math.min(99.5, Math.max(10, avgTurnoutPct * d.turnoutFactor));
      let deptVoted = Math.round((deptTotal * targetTurnout) / 100);

      if (isLast) {
        deptVoted = Math.max(0, Math.min(deptTotal, totalVotesCast - allocatedVotes));
      } else {
        deptVoted = Math.min(deptTotal, deptVoted);
        allocatedVotes += deptVoted;
      }

      const calculatedTurnout = deptTotal > 0 ? Number(((deptVoted / deptTotal) * 100).toFixed(1)) : 0;
      const variance = Number((calculatedTurnout - avgTurnoutPct).toFixed(1));

      let badge = {
        en: 'Target Met',
        bn: 'লক্ষ্য অর্জিত',
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700'
      };

      if (calculatedTurnout >= 90) {
        badge = {
          en: 'High Turnout',
          bn: 'সর্বোচ্চ উপস্থিতি',
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700'
        };
      } else if (calculatedTurnout < avgTurnoutPct - 3) {
        badge = {
          en: 'Below Average',
          bn: 'গড়ের নিচে',
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-700'
        };
      }

      return {
        deptEn: d.deptEn,
        deptBn: d.deptBn,
        name: isEn ? d.deptEn : d.deptBn,
        total: deptTotal,
        voted: deptVoted,
        pending: Math.max(0, deptTotal - deptVoted),
        turnoutPct: calculatedTurnout,
        variance,
        color: d.color,
        badge
      };
    });

    return list;
  }, [voterRegistry, totalVoters, totalVotesCast, currentLang, avgTurnoutPct]);

  // Sort department data
  const sortedDepartments = useMemo(() => {
    return [...departmentsData].sort((a, b) => {
      if (sortBy === 'turnout') return b.turnoutPct - a.turnoutPct;
      if (sortBy === 'total') return b.total - a.total;
      return a.name.localeCompare(b.name);
    });
  }, [departmentsData, sortBy]);

  // Hourly timeline trend data (simulated hourly progression curve leading up to current totals)
  const hourlyTrendData = useMemo(() => {
    const hours = [
      { time: '09:00 AM', timeBn: 'সকাল ০৯:০০', factor: 0.22 },
      { time: '11:00 AM', timeBn: 'সকাল ১১:০০', factor: 0.52 },
      { time: '01:00 PM', timeBn: 'দুপুর ০১:০০', factor: 0.72 },
      { time: '03:00 PM', timeBn: 'বিকাল ০৩:০০', factor: 0.86 },
      { time: '05:00 PM', timeBn: 'বিকাল ০৫:০০', factor: 1.0 }
    ];

    return hours.map((h) => {
      const entry: Record<string, string | number> = {
        time: currentLang === 'en' ? h.time : h.timeBn,
        factoryAvg: Number((avgTurnoutPct * h.factor).toFixed(1))
      };

      departmentsData.forEach((dept) => {
        // slight variance per department across hours
        let deptFactor = h.factor;
        if (dept.deptEn === 'Sewing') deptFactor = Math.min(1.0, h.factor * 1.03);
        if (dept.deptEn === 'Finishing') deptFactor = Math.min(1.0, h.factor * 1.02);
        if (dept.deptEn === 'Cutting') deptFactor = Math.min(1.0, h.factor * 0.96);

        entry[dept.name] = Number((dept.turnoutPct * deptFactor).toFixed(1));
      });

      return entry;
    });
  }, [departmentsData, avgTurnoutPct, currentLang]);

  // Best & lowest performing departments
  const topDept = sortedDepartments[0];
  const lowestDept = sortedDepartments[sortedDepartments.length - 1];

  return (
    <div id="section-department-turnout-trend" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header with Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {currentLang === 'en' ? 'Department-Wise Vote Cast % Trend' : 'বিভাগভিত্তিক ভোট প্রদানের শতকরা হার ও ট্রেন্ড'}
              </h3>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                {currentLang === 'en' ? 'Factory Turnout Benchmark' : 'ফ্যাক্টরি টার্নআউট বেঞ্চমার্ক'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentLang === 'en'
                ? 'Comparative department participation velocity and voter turnout percentage against factory average'
                : 'ফ্যাক্টরির সার্বিক গড়ের তুলনায় বিভিন্ন বিভাগের ভোট প্রদানের শতকরা হার ও সক্রিয় অংশগ্রহণের প্রবণতা'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            id="btn-dept-view-bar"
            type="button"
            onClick={() => setViewMode('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'bar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={currentLang === 'en' ? 'Bar Comparison Chart' : 'বার চার্ট তুলনা'}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{currentLang === 'en' ? 'Ranked Bar' : 'র‍্যাঙ্কড বার'}</span>
          </button>

          <button
            id="btn-dept-view-trend"
            type="button"
            onClick={() => setViewMode('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'trend'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={currentLang === 'en' ? 'Hourly Velocity Trend' : 'ঘণ্টাভিত্তিক গতিপ্রকৃতি'}
          >
            <LineChartIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentLang === 'en' ? 'Hourly Trend' : 'সময়ভিত্তিক ট্রেন্ড'}</span>
          </button>

          <button
            id="btn-dept-view-cards"
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={currentLang === 'en' ? 'Department Metric Cards' : 'ডিপার্টমেন্ট কার্ডসমূহ'}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
            <span>{currentLang === 'en' ? 'Cards Grid' : 'কার্ড গ্রিড'}</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {currentLang === 'en' ? 'Overall Turnout Avg' : 'সার্বিক গড় উপস্থিতি'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-slate-900">
              {toBanglaNum(avgTurnoutPct, currentLang)}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              ({toBanglaNum(totalVotesCast, currentLang)}/{toBanglaNum(totalVoters, currentLang)})
            </span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-emerald-800 block">
            {currentLang === 'en' ? 'Highest Turnout Dept' : 'সর্বোচ্চ ভোট প্রদান'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-emerald-900">
              {toBanglaNum(topDept ? topDept.turnoutPct : 0, currentLang)}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 truncate" title={topDept?.name}>
              {topDept?.name}
            </span>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-blue-800 block">
            {currentLang === 'en' ? 'Total Active Depts' : 'মোট সক্রিয় বিভাগ'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-blue-900">
              {toBanglaNum(departmentsData.length, currentLang)}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">
              {currentLang === 'en' ? 'Production & Support' : 'উৎপাদন ও সহযোগী'}
            </span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-amber-800 block">
            {currentLang === 'en' ? 'Pending Ballots' : 'অবশিষ্ট ভোটার'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-amber-900">
              {toBanglaNum(Math.max(0, totalVoters - totalVotesCast), currentLang)}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">
              ({toBanglaNum((100 - avgTurnoutPct).toFixed(1), currentLang)}%)
            </span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Ranked Bar Chart */}
      {viewMode === 'bar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600" />
              {currentLang === 'en' ? 'Department Vote Cast %' : 'বিভাগের ভোট প্রদানের শতকরা হার (%)'}
              <span className="inline-block w-3 h-0.5 border-t border-dashed border-rose-500 ml-3" />
              <span className="text-rose-600 font-semibold">
                {currentLang === 'en' ? `Factory Avg (${avgTurnoutPct}%)` : `ফ্যাক্টরি গড় (${toBanglaNum(avgTurnoutPct, currentLang)}%)`}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">{currentLang === 'en' ? 'Sort:' : 'সর্ট:'}</span>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'turnout' ? 'total' : 'turnout')}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer underline"
              >
                {sortBy === 'turnout'
                  ? currentLang === 'en' ? 'By Turnout %' : 'টার্নআউট অনুযায়ী'
                  : currentLang === 'en' ? 'By Voter Count' : 'ভোটার সংখ্যা অনুযায়ী'}
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedDepartments}
                margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={35}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DepartmentData;
                      const isAboveAvg = data.turnoutPct >= avgTurnoutPct;

                      return (
                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1.5 border border-slate-800 min-w-[200px]">
                          <div className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>{data.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                isAboveAvg ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {isAboveAvg ? `+${data.variance}%` : `${data.variance}%`}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>{currentLang === 'en' ? 'Turnout Rate:' : 'ভোটের হার:'}</span>
                            <span className="font-bold text-emerald-400 text-sm">{data.turnoutPct}%</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>{currentLang === 'en' ? 'Votes Cast:' : 'প্রদত্ত ভোট:'}</span>
                            <span className="font-medium text-slate-200">
                              {toBanglaNum(data.voted, currentLang)} / {toBanglaNum(data.total, currentLang)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                            <span>{currentLang === 'en' ? 'Pending:' : 'অবশিষ্ট:'}</span>
                            <span>{toBanglaNum(data.pending, currentLang)} ballots</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={avgTurnoutPct}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Bar
                  dataKey="turnoutPct"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
                  {sortedDepartments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.turnoutPct >= avgTurnoutPct ? '#3b82f6' : '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 2: Hourly Progression Trend */}
      {viewMode === 'trend' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-medium text-slate-700">
              {currentLang === 'en'
                ? 'Cumulative Vote Cast % Trajectory by Shift Hours (09:00 AM – 05:00 PM)'
                : 'ভোটগ্রহণের বিভিন্ন সময়ে (সকাল ০৯:০০ – বিকাল ০৫:০০) ক্রমান্বয়ে ভোট কাস্টিং বৃদ্ধির ট্রেন্ড'}
            </span>
            <span className="text-[11px] text-slate-400">
              {currentLang === 'en' ? '5 Inspection Intervals' : '৫টি নিরীক্ষণ বিরতি'}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={hourlyTrendData}
                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1.5 border border-slate-800 min-w-[210px]">
                          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>{label}</span>
                          </div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1.5 text-slate-300 truncate">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="truncate">{entry.name}:</span>
                              </span>
                              <span className="font-bold text-slate-100 font-mono">
                                {entry.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={avgTurnoutPct}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                {/* Overall Average Line */}
                <Line
                  type="monotone"
                  dataKey="factoryAvg"
                  name={currentLang === 'en' ? 'Factory Average' : 'ফ্যাক্টরি গড়'}
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#ef4444' }}
                />
                {/* Lines for Top Departments */}
                {departmentsData.slice(0, 4).map((d) => (
                  <Line
                    key={d.deptEn}
                    type="monotone"
                    dataKey={d.name}
                    name={d.name}
                    stroke={d.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: d.color }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold">
              <span className="w-3 h-0.5 bg-rose-500 inline-block" />
              {currentLang === 'en' ? 'Factory Average' : 'ফ্যাক্টরি গড়'}
            </span>
            {departmentsData.slice(0, 4).map((d) => (
              <span key={d.deptEn} className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                <span>{d.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Detailed Department Cards Grid */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedDepartments.map((dept) => {
            const isAboveAvg = dept.turnoutPct >= avgTurnoutPct;

            return (
              <div
                key={dept.deptEn}
                className="bg-slate-50/80 border border-slate-200/80 hover:border-indigo-300 rounded-xl p-4 transition-all hover:bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {dept.name}
                    </h5>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {toBanglaNum(dept.voted, currentLang)} / {toBanglaNum(dept.total, currentLang)} {currentLang === 'en' ? 'voters' : 'ভোটার'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dept.badge.bg} ${dept.badge.text}`}>
                    {currentLang === 'en' ? dept.badge.en : dept.badge.bn}
                  </span>
                </div>

                {/* Turnout Metric & Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {currentLang === 'en' ? 'Turnout Rate' : 'ভোটের হার'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-slate-900">
                        {toBanglaNum(dept.turnoutPct, currentLang)}%
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isAboveAvg ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {isAboveAvg ? `(+${toBanglaNum(dept.variance, currentLang)}%)` : `(${toBanglaNum(dept.variance, currentLang)}%)`}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAboveAvg ? 'bg-indigo-600' : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.min(100, dept.turnoutPct)}%` }}
                    />
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>
                    {currentLang === 'en' ? 'Pending Ballots:' : 'অবশিষ্ট ভোট:'}{' '}
                    <strong className="text-slate-700 font-semibold">{toBanglaNum(dept.pending, currentLang)}</strong>
                  </span>
                  <span className="text-slate-400">
                    {dept.turnoutPct >= avgTurnoutPct ? (
                      <span className="text-emerald-600 font-medium inline-flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        {currentLang === 'en' ? 'Above Avg' : 'গড়ের উপরে'}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium inline-flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        {currentLang === 'en' ? 'Below Avg' : 'গড়ের নিচে'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
