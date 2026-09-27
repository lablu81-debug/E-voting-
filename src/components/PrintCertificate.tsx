import React from 'react';
import { Candidate, CommitteeMember, Language } from '../types';
import { i18n } from '../data/initialData';
import { toBanglaNum } from '../utils/helpers';
import { ShieldCheck, Award } from 'lucide-react';

interface PrintCertificateProps {
  id?: string;
  className?: string;
  currentLang: Language;
  vpCandidates: Candidate[];
  ecCandidates: Candidate[];
  committeeMembers: CommitteeMember[];
  totalVoters: number;
  totalVotesCast: number;
}

export const PrintCertificate: React.FC<PrintCertificateProps> = ({
  id = 'pc-official-certificate',
  className = 'printable-sheet hidden print:block bg-white text-slate-900 p-6 max-w-4xl mx-auto',
  currentLang,
  vpCandidates,
  ecCandidates,
  committeeMembers,
  totalVoters,
  totalVotesCast
}) => {
  const t = i18n[currentLang];
  const sortedVp = [...vpCandidates].sort((a, b) => b.votes - a.votes);
  const sortedEc = [...ecCandidates].sort((a, b) => b.votes - a.votes);
  const turnoutPct = totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(1) : '0';

  const todayStr = new Date().toLocaleDateString(currentLang === 'en' ? 'en-US' : 'bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div id={id} className={className}>
      {/* Official Top Seal & Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 relative">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-blue-800" />
          <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
            {t.printOfficialHeader}
          </h1>
        </div>
        <h2 className="text-base font-semibold text-blue-900">
          {t.printOfficialTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.printOfficialSub}</p>
        <div className="absolute right-0 top-0 hidden sm:flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-mono text-slate-600">
          <span>REF: PC-ELEC-2026/CERT-01</span>
        </div>
      </div>

      {/* Meta Information Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded-md p-3 mb-5 text-xs">
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">{t.printDate}</strong>
          <span className="font-semibold text-slate-900">{todayStr}</span>
        </div>
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">{t.lblTotalVoters}</strong>
          <span className="font-semibold text-slate-900">
            {toBanglaNum(totalVoters, currentLang)} {currentLang === 'en' ? 'Voters' : 'জন'}
          </span>
        </div>
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">{t.lblTotalCast}</strong>
          <span className="font-semibold text-slate-900">
            {toBanglaNum(totalVotesCast, currentLang)} ({toBanglaNum(turnoutPct, currentLang)}%)
          </span>
        </div>
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">{t.lblStatus}</strong>
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 inline" /> {t.printAuditStatus}
          </span>
        </div>
      </div>

      {/* Position 1: Vice President Table */}
      <div className="mb-5">
        <div className="flex items-center justify-between border-l-4 border-blue-800 pl-2 mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase">
            {t.printVpHeading}
          </h3>
          <span className="text-[10px] text-slate-500 italic">
            {currentLang === 'en'
              ? 'Elected by Executive Committee Members (1 Seat)'
              : 'কার্যনির্বাহী সদস্য কর্তৃক নির্বাচিত (১টি আসন)'}
          </span>
        </div>
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-900 text-left font-semibold">
              <th className="border border-slate-300 px-2 py-1.5 w-12 text-center">Rank</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24">ID</th>
              <th className="border border-slate-300 px-2 py-1.5">Candidate Name</th>
              <th className="border border-slate-300 px-2 py-1.5 w-32">Department</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24 text-right">Votes</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {sortedVp.map((c, idx) => {
              const isWinner = idx === 0 && c.votes > 0;
              const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';

              return (
                <tr key={c.id} className={isWinner ? 'bg-emerald-50/80 font-medium' : ''}>
                  <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                    #{idx + 1}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 font-mono text-[11px]">{c.id}</td>
                  <td className="border border-slate-300 px-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-300 overflow-hidden shrink-0">
                        {c.img ? (
                          <img
                            src={c.img}
                            alt={c.nameEn}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          c.nameEn.charAt(0)
                        )}
                      </div>
                      <span>
                        <strong>{c.nameEn}</strong> ({c.nameBn})
                      </span>
                    </div>
                  </td>
                  <td className="border border-slate-300 px-2 py-1">{c.deptEn}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    <strong>{toBanglaNum(c.votes, currentLang)}</strong> ({toBanglaNum(pct, currentLang)}%)
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    {isWinner ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                        {t.electedBadge}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">{t.runnerUpBadge}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Position 2: Executive Committee Member Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-900 uppercase border-l-4 border-emerald-800 pl-2 mb-2">
          {t.printEcHeading}
        </h3>
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-900 text-left font-semibold">
              <th className="border border-slate-300 px-2 py-1.5 w-12 text-center">Rank</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24">ID</th>
              <th className="border border-slate-300 px-2 py-1.5">Candidate Name</th>
              <th className="border border-slate-300 px-2 py-1.5 w-32">Department</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24 text-right">Votes</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {sortedEc.map((c, idx) => {
              const isElected = idx < 8 && c.votes > 0;
              const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';

              return (
                <tr key={c.id} className={isElected ? 'bg-emerald-50/80 font-medium' : ''}>
                  <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                    #{idx + 1}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 font-mono text-[11px]">{c.id}</td>
                  <td className="border border-slate-300 px-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-300 overflow-hidden shrink-0">
                        {c.img ? (
                          <img
                            src={c.img}
                            alt={c.nameEn}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          c.nameEn.charAt(0)
                        )}
                      </div>
                      <span>
                        <strong>{c.nameEn}</strong> ({c.nameBn})
                      </span>
                    </div>
                  </td>
                  <td className="border border-slate-300 px-2 py-1">{c.deptEn}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    <strong>{toBanglaNum(c.votes, currentLang)}</strong> ({toBanglaNum(pct, currentLang)}%)
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    {isElected ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                        {t.electedBadge} (Seat #{idx + 1})
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">{t.runnerUpBadge}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Compliance Note */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[10px] text-slate-600 mb-6">
        <p>
          <strong>Statutory Compliance Statement:</strong> This declaration certifies that the Worker Participation Committee (PC) election was completed in compliance with the EPZ Labour Act 2019 and EPZ Labour Rules 2022 for EPZ Factories. All eligible factory employees cast secret ballots without coercion.
        </p>
      </div>

      {/* Election Organizing Committee Signatures */}
      <div className="pt-2 border-t border-dashed border-slate-400 break-inside-avoid">
        <h4 className="text-center font-bold text-xs uppercase text-slate-800 tracking-wider mb-5">
          {currentLang === 'en'
            ? `Election Organizing Committee Authentication & Signatures (${committeeMembers.length} Members)`
            : `নির্বাচন পরিচালনা কমিটির সত্যায়ন ও স্বাক্ষর (${toBanglaNum(committeeMembers.length, currentLang)} জন সদস্য)`}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {committeeMembers.map((m) => {
            const role = currentLang === 'en' ? m.roleDescription?.en : m.roleDescription?.bn;
            const name = currentLang === 'en' ? m.name.en : m.name.bn;
            const dept = currentLang === 'en' ? m.dept.en : m.dept.bn;

            return (
              <div key={m.id} className="flex flex-col items-center">
                <div className="h-7 flex items-end justify-center">
                  <span className="font-serif italic text-slate-400 text-xs select-none">
                    {m.name.en.split(' ')[0]}...
                  </span>
                </div>
                <div className="w-full border-b border-slate-700 mt-1 mb-1.5" />
                <span className="text-[11px] font-bold text-slate-900 leading-tight">{name}</span>
                <span className="text-[10px] text-slate-600 leading-tight">{role}</span>
                <span className="text-[9px] text-slate-500 leading-tight">{dept}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
