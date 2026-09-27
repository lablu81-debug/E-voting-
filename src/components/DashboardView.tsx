import React, { useState } from 'react';
import {
  Users,
  Archive,
  PieChart,
  ClipboardCheck,
  Printer,
  Trophy,
  ShieldAlert
} from 'lucide-react';
import { Candidate, CommitteeMember, ElectionStatus, Language, Voter, VpElectorVote } from '../types';
import { i18n } from '../data/initialData';
import { toBanglaNum } from '../utils/helpers';
import { EcTallyChart } from './EcTallyChart';
import { DepartmentTurnoutTrend } from './DepartmentTurnoutTrend';

interface DashboardViewProps {
  currentLang: Language;
  vpCandidates: Candidate[];
  ecCandidates: Candidate[];
  committeeMembers: CommitteeMember[];
  voterRegistry?: Voter[];
  totalVoters: number;
  totalVotesCast: number;
  electionStatus: ElectionStatus;
  vpElectorVotes?: VpElectorVote[];
  onPrint: () => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  pdfDownloadSuccess?: boolean;
  onOpenCertificateModal?: (reportType?: 'declaration' | 'voters') => void;
  onOpenVpBallot?: () => void;
  onAddCommitteeMember?: (member: CommitteeMember) => void;
  onUpdateCommitteeMember?: (member: CommitteeMember) => void;
  onDeleteCommitteeMember?: (id: string) => void;
  onResetCommitteeMembers?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentLang,
  vpCandidates,
  ecCandidates,
  committeeMembers,
  voterRegistry = [],
  totalVoters,
  totalVotesCast,
  electionStatus,
  vpElectorVotes = [],
  onPrint,
  onDownloadPdf,
  isDownloadingPdf = false,
  pdfDownloadSuccess = false,
  onOpenCertificateModal,
  onOpenVpBallot
}) => {
  const t = i18n[currentLang];
  const turnoutPercent = totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(1) : '0';

  const sortedVp = [...vpCandidates].sort((a, b) => b.votes - a.votes);
  const sortedEc = [...ecCandidates].sort((a, b) => b.votes - a.votes);

  const getStatusDisplay = () => {
    switch (electionStatus) {
      case 'active':
        return {
          text: t.statusValueActive,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'paused':
        return {
          text: t.statusValuePaused,
          color: 'text-amber-700 bg-amber-50 border-amber-200'
        };
      case 'closed':
        return {
          text: t.statusValueClosed,
          color: 'text-rose-700 bg-rose-50 border-rose-200'
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 id="dash-main-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.dashHeader}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">{t.dashSub}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          {/* Declaration of Results Certificate Modal & Print Button */}
          <button
            id="btn-print-results-pdf"
            type="button"
            onClick={() => (onOpenCertificateModal ? onOpenCertificateModal('declaration') : onPrint())}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm"
            title={currentLang === 'en' ? 'Preview and print official declaration of results' : 'ফলাফল ঘোষণা প্রত্যয়নপত্র প্রিভিউ ও প্রিন্ট করুন'}
          >
            <Printer className="w-4 h-4" />
            <span>{t.btnPreviewCert}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Eligible */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 tracking-wide">{t.lblTotalVoters}</h4>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {toBanglaNum(totalVoters, currentLang)}
            </p>
          </div>
        </div>

        {/* Votes Cast */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 tracking-wide">{t.lblTotalCast}</h4>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {toBanglaNum(totalVotesCast, currentLang)}
            </p>
          </div>
        </div>

        {/* Voter Turnout */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 tracking-wide">{t.lblTurnout}</h4>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {toBanglaNum(turnoutPercent, currentLang)}%
            </p>
          </div>
        </div>

        {/* Election Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 tracking-wide">{t.lblStatus}</h4>
            <div className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md border mt-1 ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
          </div>
        </div>
      </div>

      {/* Department-Wise Vote Cast % Trend */}
      <div id="section-dept-trends">
        <DepartmentTurnoutTrend
          voterRegistry={voterRegistry}
          totalVoters={totalVoters}
          totalVotesCast={totalVotesCast}
          currentLang={currentLang}
        />
      </div>

      {/* Vice President Tally */}
      <div id="section-vp-tally" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">{t.vpTallyHeading}</h3>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                  {currentLang === 'en' ? '1 Seat Only' : '১টি আসন'}
                </span>
                <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {currentLang === 'en' ? 'Elected by EC Members' : 'নির্বাচিত ইসি সদস্যদের ভোটে'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLang === 'en'
                  ? 'Official vote count for Vice President (1 Seat) cast by elected Executive Committee Members'
                  : 'নির্বাচিত কার্যনির্বাহী সদস্যদের ভোটে সহ-সভাপতি পদের (১টি আসন) চূড়ান্ত ফলাফল'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {toBanglaNum(vpCandidates.length, currentLang)} {currentLang === 'en' ? 'Candidates' : 'প্রার্থী'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {sortedVp.map((c, idx) => {
            const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';
            const isLead = idx === 0 && c.votes > 0;
            const isRunnerUp = idx === 1 && c.votes > 0;
            const name = currentLang === 'en' ? c.nameEn : c.nameBn;
            const dept = currentLang === 'en' ? c.deptEn : c.deptBn;

            let badgeText = `#${toBanglaNum(idx + 1, currentLang)}`;
            let badgeColor = 'bg-slate-600 text-white';

            if (isLead) {
              badgeText = currentLang === 'en' ? '★ #1 Lead' : '★ ১ম বিজয়ী';
              badgeColor = 'bg-emerald-600 text-white';
            } else if (isRunnerUp) {
              badgeText = currentLang === 'en' ? '#2 Runner Up' : '২য় রানার আপ';
              badgeColor = 'bg-blue-600 text-white';
            }

            return (
              <div
                key={c.id}
                className={`relative rounded-xl p-3.5 text-center flex flex-col items-center justify-between border transition-all ${
                  isLead
                    ? 'bg-gradient-to-b from-amber-50/60 to-white border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200/80 hover:border-blue-300 hover:bg-white'
                }`}
              >
                {isLead && (
                  <div className="absolute top-2 right-2 text-amber-500" title="Current Leader">
                    <Trophy className="w-4 h-4 fill-amber-400" />
                  </div>
                )}

                <div className="relative mb-3 mt-1">
                  <img
                    src={c.img}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 shadow-sm bg-slate-200 ${
                      isLead ? 'border-amber-500 ring-2 ring-amber-200' : 'border-white'
                    }`}
                  />
                  <span
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${badgeColor}`}
                  >
                    {badgeText}
                  </span>
                </div>

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

                <div className="w-full mt-3 pt-2.5 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {toBanglaNum(c.votes, currentLang)}
                      <span className="text-[10px] font-normal text-slate-500 ml-1">{t.votesLabel}</span>
                    </span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                        isLead ? 'text-emerald-700 bg-emerald-100/70' : 'text-blue-700 bg-blue-50'
                      }`}
                    >
                      {toBanglaNum(pct, currentLang)}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLead ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Executive Committee Member Tally Chart — Styled as Election Organizing Committee */}
      <div id="section-ec-tally">
        <EcTallyChart
          ecCandidates={ecCandidates}
          totalVotesCast={totalVotesCast}
          currentLang={currentLang}
        />
      </div>

      {/* 5-Member Election Organizing Committee Card */}
      <div id="section-committee-roster" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {currentLang === 'en'
                ? `Election Organizing Committee (${committeeMembers.length} Members)`
                : `নির্বাচন পরিচালনা কমিটি (${toBanglaNum(committeeMembers.length, currentLang)} জন সদস্য)`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {currentLang === 'en' ? 'Audit & Election Commission' : 'নিরীক্ষা ও নির্বাচন কমিশন'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {committeeMembers.map((m) => {
            const badge = currentLang === 'en' ? m.badge.en : m.badge.bn;
            const name = currentLang === 'en' ? m.name.en : m.name.bn;
            const dept = currentLang === 'en' ? m.dept.en : m.dept.bn;

            const isChairman = m.badge.en.toUpperCase().includes('CHAIRMAN');
            const isSecretary = m.badge.en.toUpperCase().includes('SECRETARY');
            const isObserver = m.badge.en.toUpperCase().includes('OBSERVER');

            const badgeBg = isChairman
              ? 'bg-amber-600'
              : isSecretary
              ? 'bg-indigo-600'
              : isObserver
              ? 'bg-purple-600'
              : 'bg-blue-600';

            return (
              <div
                key={m.id}
                className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between hover:border-indigo-300 hover:bg-white transition-all group shadow-2xs"
              >
                <div className="flex flex-col items-center w-full">
                  <div className="relative mb-2.5">
                    <img
                      src={m.img}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-slate-200"
                    />
                    <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold ${badgeBg} text-white px-2 py-0.5 rounded-full shadow-xs`}>
                      {badge}
                    </span>
                  </div>

                  <div className="mt-1 w-full">
                    <h5 className="font-semibold text-slate-900 text-xs sm:text-sm truncate" title={name}>{name}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={dept}>{dept}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
