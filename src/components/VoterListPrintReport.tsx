import React, { useState } from 'react';
import { Voter, Language, CommitteeMember } from '../types';
import { i18n } from '../data/initialData';
import { toBanglaNum } from '../utils/helpers';
import { Users, CheckCircle, Clock, ShieldCheck, Filter, Search } from 'lucide-react';

interface VoterListPrintReportProps {
  id?: string;
  className?: string;
  currentLang: Language;
  voterRegistry: Voter[];
  totalVotesCast?: number;
  totalVoters?: number;
  committeeMembers?: CommitteeMember[];
  interactiveControls?: boolean;
}

export const VoterListPrintReport: React.FC<VoterListPrintReportProps> = ({
  id = 'pc-voter-list-report',
  className = 'bg-white text-slate-900 p-6 max-w-5xl mx-auto',
  currentLang,
  voterRegistry = [],
  totalVotesCast,
  totalVoters,
  committeeMembers = [],
  interactiveControls = false
}) => {
  const isEn = currentLang === 'en';
  const t = i18n[currentLang];

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Voted' | 'Pending'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const departments = ['all', ...Array.from(new Set(voterRegistry.map((v) => v.dept))).filter(Boolean)];

  const filteredVoters = voterRegistry.filter((v) => {
    const matchDept = selectedDept === 'all' || v.dept.toLowerCase() === selectedDept.toLowerCase();
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchSearch =
      !searchTerm.trim() ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.empId && v.empId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.desig && v.desig.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchDept && matchStatus && matchSearch;
  });

  const totalVotersCount = voterRegistry.length;
  const votedCount = voterRegistry.filter((v) => v.status === 'Voted').length;
  const pendingCount = totalVotersCount - votedCount;
  const turnoutRate = totalVotersCount > 0 ? ((votedCount / totalVotersCount) * 100).toFixed(1) : '0';

  const todayStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div id={id} className={className}>
      {/* Interactive Controls (Hidden during print) */}
      {interactiveControls && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>{isEn ? 'Filter Report View Before Print' : 'প্রিন্টের পূর্বে রিপোর্ট ফিল্টার করুন'}</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {isEn ? `Showing ${filteredVoters.length} of ${totalVotersCount} Voters` : `${totalVotersCount} জনের মধ্যে ${filteredVoters.length} জন প্রদর্শিত`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={isEn ? 'Search Name, ID or Emp ID...' : 'নাম, ভোটার বা এমপ্লয়ী আইডি...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">{isEn ? 'All Departments' : 'সকল বিভাগ'}</option>
              {departments.filter((d) => d !== 'all').map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Voting Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Voted' | 'Pending')}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">{isEn ? 'All Statuses (Voted & Pending)' : 'সকল স্ট্যাটাস (ভোটপ্রাপ্ত ও অপেক্ষমান)'}</option>
              <option value="Voted">{isEn ? 'Voted Only' : 'শুধুমাত্র ভোট প্রদানকারী'}</option>
              <option value="Pending">{isEn ? 'Pending Only' : 'শুধুমাত্র অপেক্ষমান'}</option>
            </select>
          </div>
        </div>
      )}

      {/* Official Top Seal & Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 relative">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-blue-900" />
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900">
            {isEn
              ? 'PARTICIPATION COMMITTEE (PC) ELECTION 2026'
              : 'অংশগ্রহণমূলক কমিটি (PC) নির্বাচন ২০২৬'}
          </h1>
        </div>
        <h2 className="text-base font-bold text-blue-900">
          {isEn
            ? 'OFFICIAL VOTER ROLL & POLLING VERIFICATION REPORT'
            : 'চূড়ান্ত ভোটার তালিকা ও পোলিং যাচাইকরণ রিপোর্ট'}
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          {isEn
            ? 'Statutory Workplace Representation Electoral Register & Presiding Officer Audit Sheet'
            : 'বিধিবদ্ধ কর্মক্ষেত্র প্রতিনিধিত্ব নির্বাচনী রেজিস্টার ও প্রিজাইডিং অফিসার অডিট শিট'}
        </p>
        <div className="mt-1 sm:mt-0 sm:absolute sm:right-0 sm:top-0 flex items-center justify-center gap-1 text-[10px] bg-slate-100 border border-slate-300 px-2.5 py-1 rounded font-mono text-slate-700">
          <span>REF: PC-ELEC-2026/VOTER-ROLL</span>
        </div>
      </div>

      {/* Meta Information Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded-md p-3 mb-4 text-xs">
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">
            {isEn ? 'Verification Date' : 'রিপোর্ট তারিখ'}
          </strong>
          <span className="font-semibold text-slate-900">{todayStr}</span>
        </div>
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">
            {isEn ? 'Total Eligible Roll' : 'মোট ভোটার'}
          </strong>
          <span className="font-semibold text-slate-900">
            {toBanglaNum(totalVotersCount, currentLang)} {isEn ? 'Workers' : 'জন'}
          </span>
        </div>
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">
            {isEn ? 'Turnout / Cast' : 'ভোট দিয়েছেন / টার্নআউট'}
          </strong>
          <span className="font-semibold text-emerald-700">
            {toBanglaNum(votedCount, currentLang)} ({toBanglaNum(turnoutRate, currentLang)}%)
          </span>
        </div>
        <div>
          <strong className="block uppercase text-[10px] text-slate-500">
            {isEn ? 'Pending Ballots' : 'অবশিষ্ট ভোটার'}
          </strong>
          <span className="font-semibold text-amber-700">
            {toBanglaNum(pendingCount, currentLang)} {isEn ? 'Workers' : 'জন'}
          </span>
        </div>
      </div>

      {/* Voter Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-900 text-left font-semibold border-b-2 border-slate-300">
              <th className="border border-slate-300 px-2 py-1.5 text-center w-10">SL</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24">Voter ID</th>
              <th className="border border-slate-300 px-2 py-1.5 w-24">Employee ID</th>
              <th className="border border-slate-300 px-2.5 py-1.5">Worker Name</th>
              <th className="border border-slate-300 px-2 py-1.5">Designation</th>
              <th className="border border-slate-300 px-2 py-1.5">Department</th>
              <th className="border border-slate-300 px-2 py-1.5">Section</th>
              <th className="border border-slate-300 px-2 py-1.5 text-center w-14">Gender</th>
              <th className="border border-slate-300 px-2 py-1.5 text-center w-20">Status</th>
              <th className="border border-slate-300 px-3 py-1.5 text-center w-36">
                Elector Signature
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredVoters.length === 0 ? (
              <tr>
                <td colSpan={10} className="border border-slate-300 py-6 text-center text-slate-400">
                  {isEn ? 'No voter records found matching filter criteria.' : 'ফিল্টার অনুযায়ী কোনো ভোটার রেকর্ড পাওয়া যায়নি।'}
                </td>
              </tr>
            ) : (
              filteredVoters.map((v, idx) => {
                const isVoted = v.status === 'Voted';
                return (
                  <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">
                      {toBanglaNum(idx + 1, currentLang)}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold font-mono text-slate-900">
                      {toBanglaNum(v.id, currentLang)}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 font-mono text-blue-800 font-semibold">
                      {v.empId || '-'}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-1.5 font-semibold text-slate-900">
                      {v.name}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                      {v.desig}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 font-medium text-slate-700">
                      {v.dept}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                      {v.section || '-'}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-600">
                      {v.gender || '-'}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isVoted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isVoted ? (isEn ? 'VOTED' : 'ভোট সম্পন্ন') : (isEn ? 'PENDING' : 'অপেক্ষমান')}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center text-[10px] text-slate-400">
                      {isVoted ? (
                        <span className="font-mono text-emerald-700 font-medium">✓ Verified & Cast</span>
                      ) : (
                        <div className="h-5 border-b border-dashed border-slate-400 mx-2"></div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Official Signatures and Seals */}
      <div className="mt-8 pt-4 border-t-2 border-slate-300 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="h-10 border-b border-slate-400 mx-auto w-3/4 mb-1"></div>
            <p className="font-bold text-slate-900">{isEn ? 'Presiding Officer' : 'প্রিজাইডিং অফিসার'}</p>
            <p className="text-[10px] text-slate-500">{isEn ? 'Election Operations' : 'নির্বাচনী কার্যক্রম'}</p>
          </div>

          <div>
            <div className="h-10 border-b border-slate-400 mx-auto w-3/4 mb-1"></div>
            <p className="font-bold text-slate-900">{isEn ? 'Polling Officer' : 'পোলিং অফিসার'}</p>
            <p className="text-[10px] text-slate-500">{isEn ? 'Voter Verification' : 'ভোটার পরিচয় যাচাই'}</p>
          </div>

          <div>
            <div className="h-10 border-b border-slate-400 mx-auto w-3/4 mb-1"></div>
            <p className="font-bold text-slate-900">{isEn ? 'Worker Rep. Observer' : 'শ্রমিক প্রতিনিধি পর্যবেক্ষক'}</p>
            <p className="text-[10px] text-slate-500">{isEn ? 'Neutral Polling Observer' : 'নিরপেক্ষ নির্বাচন পর্যবেক্ষক'}</p>
          </div>

          <div>
            <div className="h-10 border-b border-slate-400 mx-auto w-3/4 mb-1"></div>
            <p className="font-bold text-slate-900">{isEn ? 'Election Commission Lead' : 'নির্বাচন কমিশন প্রধান'}</p>
            <p className="text-[10px] text-slate-500">{isEn ? 'Official Seal & Cert.' : 'অফিসিয়াল সিল ও প্রত্যয়ন'}</p>
          </div>
        </div>

        {/* Audit footer note */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>{isEn ? 'Participation Committee Election Registry — Printed from Certified Digital Database' : 'অংশগ্রহণমূলক কমিটি নির্বাচন রেজিস্টার — ডিজিটাল ডাটাবেজ থেকে মুদ্রিত'}</span>
          <span className="font-mono">{isEn ? 'Official Record • Retain for 3 Years Under EPZ Labour Law' : 'অফিসিয়াল রেকর্ড • ইপিজেড শ্রম আইনানুযায়ী ৩ বছর সংরক্ষণযোগ্য'}</span>
        </div>
      </div>
    </div>
  );
};
