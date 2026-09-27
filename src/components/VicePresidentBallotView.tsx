import React, { useState } from 'react';
import {
  Trophy,
  ShieldCheck,
  Check,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Vote,
  Clock,
  ArrowRight,
  IdCard,
  Search,
  LogOut,
  Lock,
  Unlock,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Candidate, ElectionStatus, Language, VpElectorVote, Voter } from '../types';
import { i18n } from '../data/initialData';
import { toBanglaNum } from '../utils/helpers';

interface VicePresidentBallotViewProps {
  currentLang: Language;
  vpCandidates: Candidate[];
  ecCandidates: Candidate[];
  electionStatus: ElectionStatus;
  vpElectorVotes: VpElectorVote[];
  voterRegistry?: Voter[];
  isGeneralVoteCompleted?: boolean;
  onToggleGeneralVoteCompleted?: (completed: boolean) => void;
  onCastVpVote: (vpCandidateId: string, ecMemberId: string) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToEcBallot?: () => void;
}

export const VicePresidentBallotView: React.FC<VicePresidentBallotViewProps> = ({
  currentLang,
  vpCandidates,
  ecCandidates,
  electionStatus,
  vpElectorVotes,
  voterRegistry = [],
  isGeneralVoteCompleted = true,
  onToggleGeneralVoteCompleted,
  onCastVpVote,
  onNavigateToDashboard,
  onNavigateToEcBallot
}) => {
  const t = i18n[currentLang];
  const isEn = currentLang === 'en';

  // Derive elected EC members (top 8 vote getters from Executive Committee Election for 08 seats)
  const sortedEc = [...ecCandidates].sort((a, b) => b.votes - a.votes);
  const electedEcMembers = sortedEc.slice(0, 8);

  // Helper to get formatted Employee ID for each candidate
  const getCandidateEmpId = (c: Candidate): string => {
    if (c.empId) return c.empId;
    const matchedVoter = voterRegistry.find(
      (v) =>
        v.empId?.toLowerCase() === c.id.toLowerCase() ||
        v.id.toLowerCase() === c.id.toLowerCase() ||
        v.name.toLowerCase() === c.nameEn.toLowerCase()
    );
    return matchedVoter?.empId || `EMP-${c.id}`;
  };

  // State for Employee ID Entry and Verification (matching General Voting option)
  const [inputEmpId, setInputEmpId] = useState<string>('');
  const [verifiedElector, setVerifiedElector] = useState<Candidate | null>(null);
  const [verificationError, setVerificationError] = useState<{
    type: 'empty' | 'not_found' | 'not_elected' | 'already_voted' | 'inactive' | 'general_vote_pending';
    message: string;
  } | null>(null);

  // Ballot Selection & Submission State
  const [selectedVpCandidateId, setSelectedVpCandidateId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastSubmittedVote, setLastSubmittedVote] = useState<{
    electorName: string;
    electorEmpId: string;
    electorDept: string;
    vpName: string;
    timestamp: string;
    receiptToken: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check which elected EC members have voted
  const votedElectorMap = new Map<string, VpElectorVote>();
  vpElectorVotes.forEach((v) => {
    votedElectorMap.set(v.ecMemberId, v);
  });

  const totalElected = electedEcMembers.length;
  const totalElectedVoted = electedEcMembers.filter((m) => votedElectorMap.has(m.id)).length;
  const turnoutPercent = totalElected > 0 ? ((totalElectedVoted / totalElected) * 100).toFixed(0) : '0';

  // Verify Employee ID for Vice President Voting
  const handleVerifyEmployeeId = (targetIdOverride?: string) => {
    const rawTarget = (targetIdOverride !== undefined ? targetIdOverride : inputEmpId).trim();

    if (!isGeneralVoteCompleted) {
      setVerificationError({
        type: 'general_vote_pending',
        message: isEn
          ? 'General Voting is currently ongoing. Vice President voting opens once general voting concludes and the 08 EC winners are certified.'
          : 'সাধারণ নির্বাচন বর্তমানে চলমান। সাধারণ ভোট সম্পন্ন হওয়ার পর নির্বাচিত ০৮ জন সদস্য সহ-সভাপতি পদের ব্যালট পাবেন।'
      });
      return;
    }

    if (!rawTarget) {
      setVerificationError({
        type: 'empty',
        message: isEn
          ? 'Please enter your Employment ID number to access the Vice President ballot.'
          : 'সহ-সভাপতি ব্যালট পেপার পেতে অনুগ্রহ করে আপনার এমপ্লয়মেন্ট আইডি লিখুন।'
      });
      return;
    }

    if (electionStatus !== 'active') {
      setVerificationError({
        type: 'inactive',
        message: isEn
          ? 'Vice President voting is currently inactive or paused by the Election Commission.'
          : 'নির্বাচন কমিশন কর্তৃক সহ-সভাপতি ভোটগ্রহণ বর্তমানে স্থগিত বা বন্ধ আছে।'
      });
      return;
    }

    const cleanTarget = rawTarget.toLowerCase();
    const numericTarget = rawTarget.replace(/[^0-9]/g, '');

    // 1. Search among top 8 ELECTED Executive Committee Members (08 seats)
    const matchedElector = electedEcMembers.find((m) => {
      const cIdClean = m.id.toLowerCase();
      const empIdClean = getCandidateEmpId(m).toLowerCase();
      const cNumeric = m.id.replace(/[^0-9]/g, '');
      const empNumeric = empIdClean.replace(/[^0-9]/g, '');

      return (
        cIdClean === cleanTarget ||
        empIdClean === cleanTarget ||
        `emp-${cIdClean}` === cleanTarget ||
        `emp${cIdClean}` === cleanTarget ||
        (numericTarget.length >= 3 && (cNumeric === numericTarget || empNumeric === numericTarget))
      );
    });

    if (!matchedElector) {
      // Check if they are in the general voter roll but not elected
      const generalVoter = voterRegistry.find((v) => {
        const vEmpClean = (v.empId || '').toLowerCase();
        const vIdClean = v.id.toLowerCase();
        const vNumeric = (v.empId || v.id).replace(/[^0-9]/g, '');
        return (
          vEmpClean === cleanTarget ||
          vIdClean === cleanTarget ||
          (numericTarget.length >= 3 && vNumeric === numericTarget)
        );
      });

      if (generalVoter) {
        setVerificationError({
          type: 'not_elected',
          message: isEn
            ? `Employee ID "${rawTarget}" belongs to ${generalVoter.name} (${generalVoter.dept}), but this employee is NOT one of the 08 Elected Executive Committee Members. Under official factory election bylaws, only the 8 elected EC candidates may vote for Vice President.`
            : `এমপ্লয়মেন্ট আইডি "${rawTarget}" কর্মী ${generalVoter.name} (${generalVoter.dept})-এর, তবে তিনি কার্যনির্বাহী কমিটির ০৮ জন নির্বাচিত সদস্যের একজন নন। নির্বাচনী গঠনতন্ত্র অনুযায়ী শুধুমাত্র নির্বাচিত ৮ জন সদস্য সহ-সভাপতি নির্বাচনে ভোট দিতে পারেন।`
        });
      } else {
        setVerificationError({
          type: 'not_found',
          message: isEn
            ? `Employment ID "${rawTarget}" was not found among certified Elected Executive Committee Members. Please check your badge ID number.`
            : `এমপ্লয়মেন্ট আইডি "${rawTarget}" নির্বাচিত কার্যনির্বাহী সদস্যদের তালিকায় পাওয়া যায়নি। আপনার কর্মীর ব্যাজ নম্বর পরীক্ষা করুন।`
        });
      }
      return;
    }

    // 2. Check if this elected member has already voted
    if (votedElectorMap.has(matchedElector.id)) {
      const pastVote = votedElectorMap.get(matchedElector.id);
      setVerificationError({
        type: 'already_voted',
        message: isEn
          ? `Elected Member ${isEn ? matchedElector.nameEn : matchedElector.nameBn} (${getCandidateEmpId(matchedElector)}) has already cast their official secret ballot for Vice President on ${pastVote?.timestamp || 'record'}. Duplicate voting is strictly prohibited.`
          : `নির্বাচিত সদস্য ${matchedElector.nameBn} (${getCandidateEmpId(matchedElector)}) ইতোমধ্যে সহ-সভাপতি পদের জন্য ভোট প্রদান করেছেন। পুনরাবৃত্তি ভোট দেওয়া সম্পূর্ণ নিষিদ্ধ।`
      });
      return;
    }

    // Success: Elector is verified and ballot paper opens!
    setVerificationError(null);
    setVerifiedElector(matchedElector);
    setInputEmpId(getCandidateEmpId(matchedElector));
    setSelectedVpCandidateId(null);
    setErrorMessage(null);
  };

  const handleClearVerifiedElector = () => {
    setVerifiedElector(null);
    setSelectedVpCandidateId(null);
    setErrorMessage(null);
    setVerificationError(null);
    setInputEmpId('');
  };

  const handleSelectVp = (candidateId: string) => {
    if (electionStatus !== 'active') return;
    setSelectedVpCandidateId(candidateId);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (electionStatus !== 'active') {
      setErrorMessage(
        isEn
          ? 'Voting is currently inactive or closed!'
          : 'ভোটগ্রহণ বর্তমানে স্থগিত বা বন্ধ আছে!'
      );
      return;
    }

    if (!verifiedElector) {
      setErrorMessage(
        isEn
          ? 'Elected Member Employment ID verification is required before casting a ballot.'
          : 'ভোট প্রদানের পূর্বে নির্বাচিত সদস্যের এমপ্লয়মেন্ট আইডি যাচাইকরণ আবশ্যক।'
      );
      return;
    }

    if (votedElectorMap.has(verifiedElector.id)) {
      setErrorMessage(
        isEn
          ? `Elected member "${isEn ? verifiedElector.nameEn : verifiedElector.nameBn}" has already cast their official ballot!`
          : `নির্বাচিত সদস্য "${verifiedElector.nameBn}" ইতোমধ্যে ভোট প্রদান করেছেন!`
      );
      return;
    }

    if (!selectedVpCandidateId) {
      setErrorMessage(
        isEn
          ? 'Please select 1 Candidate for Vice President (1 Seat).'
          : 'অনুগ্রহ করে সহ-সভাপতি পদের (১টি আসন) জন্য ১ জন প্রার্থী নির্বাচন করুন।'
      );
      return;
    }

    const vp = vpCandidates.find((c) => c.id === selectedVpCandidateId);
    const token = `VP-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowTime = new Date().toLocaleTimeString();

    onCastVpVote(selectedVpCandidateId, verifiedElector.id);

    setLastSubmittedVote({
      electorName: isEn ? verifiedElector.nameEn : verifiedElector.nameBn,
      electorEmpId: getCandidateEmpId(verifiedElector),
      electorDept: isEn ? verifiedElector.deptEn : verifiedElector.deptBn,
      vpName: isEn ? vp?.nameEn || selectedVpCandidateId : vp?.nameBn || selectedVpCandidateId,
      timestamp: nowTime,
      receiptToken: token
    });

    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleVoteNextMember = () => {
    setVerifiedElector(null);
    setInputEmpId('');
    setSelectedVpCandidateId(null);
    setIsSubmitted(false);
    setErrorMessage(null);
    setVerificationError(null);
  };

  // Success Receipt View
  if (isSubmitted && lastSubmittedVote) {
    return (
      <div className="max-w-2xl mx-auto my-6 bg-white border border-amber-200/80 rounded-2xl p-6 sm:p-10 text-center shadow-md">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-200 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 border border-amber-300 rounded-full text-amber-900 text-xs font-semibold mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-700" />
          <span>{isEn ? 'Vice President Secret Ballot Recorded' : 'সহ-সভাপতি গোপন ভোট সফলভাবে সম্পন্ন'}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          {isEn ? 'Official Ballot Successfully Cast!' : 'ভোট সফলভাবে গৃহীত হয়েছে!'}
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6">
          {isEn
            ? 'The vote for the Vice President of the Participation Committee has been securely logged into the certified electoral college tally.'
            : 'অংশগ্রহণমূলক কমিটির সহ-সভাপতি পদের জন্য আপনার মূল্যবান ভোটটি সফলভাবে গণনা তালিকায় যুক্ত করা হয়েছে।'}
        </p>

        {/* Receipt Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 max-w-md mx-auto text-left text-xs sm:text-sm space-y-2.5 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-mono text-[11px] text-slate-500">
            <span>{isEn ? 'Confirmation Token' : 'নিশ্চিতকরণ টোকেন'}:</span>
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {lastSubmittedVote.receiptToken}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">{isEn ? 'Voting Elector (EC Member)' : 'ভোটদানকারী নির্বাচিত সদস্য'}:</span>
            <span className="font-bold text-slate-900">{lastSubmittedVote.electorName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">{isEn ? 'Employee ID' : 'এমপ্লয়মেন্ট আইডি'}:</span>
            <span className="font-semibold text-slate-800 font-mono">{lastSubmittedVote.electorEmpId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">{isEn ? 'Department' : 'বিভাগ'}:</span>
            <span className="font-medium text-slate-700">{lastSubmittedVote.electorDept}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-slate-500">{isEn ? 'Candidate Voted For' : 'নির্বাচিত সহ-সভাপতি প্রার্থী'}:</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {lastSubmittedVote.vpName}
            </span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>{isEn ? 'Timestamp' : 'ভোটের সময়'}:</span>
            <span>{lastSubmittedVote.timestamp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-vp-vote-next-member"
            type="button"
            onClick={handleVoteNextMember}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isEn ? 'Vote with Next Elected Member ID' : 'পরবর্তী নির্বাচিত সদস্যের ভোট দিন'}</span>
          </button>

          {onNavigateToDashboard && (
            <button
              id="btn-vp-view-tally"
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs sm:text-sm rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <span>{isEn ? 'View Vice President Tally' : 'সহ-সভাপতি ফলাফল দেখুন'}</span>
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Warning Banner if Inactive */}
      {electionStatus !== 'active' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">
              {electionStatus === 'paused'
                ? isEn
                  ? 'Voting Paused:'
                  : 'ভোটগ্রহণ স্থগিত:'
                : isEn
                ? 'Voting Closed:'
                : 'ভোটগ্রহণ সমাপ্ত:'}
            </span>{' '}
            {electionStatus === 'paused'
              ? isEn
                ? 'The election committee has temporarily paused the Vice President ballot.'
                : 'নির্বাচন কমিশন সাময়িকভাবে সহ-সভাপতি পদের ভোটগ্রহণ স্থগিত রেখেছে।'
              : isEn
              ? 'The election period has concluded. No further Vice President ballots can be accepted.'
              : 'নির্বাচন সম্পন্ন হয়েছে। আর কোনো ব্যালট গ্রহণ করা হবে না।'}
          </div>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 shadow-sm">
        {/* Header inside ballot */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                <span>{isEn ? '1 Seat Only' : '১টি নির্বাচিত পদ'}</span>
              </span>
              <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {isEn ? 'Electoral College: 08 Elected EC Members' : 'ভোটার: নির্বাচিত ০৮ জন কার্যনির্বাহী সদস্য'}
              </span>

              {/* General Election Status Pill & Toggle */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-300">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>
                  {isGeneralVoteCompleted
                    ? isEn
                      ? 'General Vote Completed & Certified'
                      : 'সাধারণ নির্বাচন সম্পন্ন ও বিজয়ী চূড়ান্ত'
                    : isEn
                    ? 'General Vote In Progress'
                    : 'সাধারণ নির্বাচন চলমান'}
                </span>
              </div>

              {onToggleGeneralVoteCompleted && (
                <button
                  id="btn-toggle-general-vote-status"
                  type="button"
                  onClick={() => onToggleGeneralVoteCompleted(!isGeneralVoteCompleted)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    isGeneralVoteCompleted
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  }`}
                >
                  {isGeneralVoteCompleted
                    ? isEn ? 'Switch to In-Progress' : 'চলমান করুন'
                    : isEn ? '✓ Complete General Vote' : '✓ সাধারণ নির্বাচন সম্পন্ন করুন'}
                </button>
              )}
            </div>

            <h2 id="vp-ballot-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isEn ? 'Vice President Election — Electoral College Ballot' : 'সহ-সভাপতি নির্বাচন — নির্বাচিত সদস্যদের গোপন ব্যালট'}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {isEn
                ? 'After completing general voting, the 08 elected Executive Committee candidates vote to elect the Vice President by entering their Employee ID.'
                : 'সাধারণ নির্বাচন সম্পন্ন হওয়ার পর নির্বাচিত ০৮ জন কার্যনির্বাহী সদস্য তাদের এমপ্লয়মেন্ট আইডি লিখে সহ-সভাপতি পদের গোপন ব্যালট আনলক করে ভোট প্রদান করবেন।'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-full text-xs font-semibold">
              <Vote className="w-4 h-4 text-amber-600" />
              <span>
                {isEn
                  ? `EC Turnout: ${totalElectedVoted} / ${totalElected} (${turnoutPercent}%)`
                  : `ইসি ভোটদান: ${toBanglaNum(totalElectedVoted, currentLang)} / ${toBanglaNum(totalElected, currentLang)} (${toBanglaNum(turnoutPercent, currentLang)}%)`}
              </span>
            </div>
          </div>
        </div>

        {/* Banner if General Vote is NOT complete */}
        {!isGeneralVoteCompleted && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {isEn ? 'General Election In Progress' : 'সাধারণ নির্বাচন এখনো চলমান'}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {isEn
                    ? 'General worker voting must be completed and certified before the 08 elected candidates can vote for Vice President. Click the button below to certify general voting completion.'
                    : 'সাধারণ কর্মী ভোটগ্রহণ সম্পন্ন ও বিজয়ী চূড়ান্ত হওয়ার পর নির্বাচিত ০৮ জন প্রার্থী সহ-সভাপতি পদে ভোট দিতে পারবেন। সাধারণ ভোট সম্পন্ন করতে পাশের বাটনে ক্লিক করুন।'}
                </p>
              </div>
            </div>

            {onToggleGeneralVoteCompleted && (
              <button
                type="button"
                onClick={() => onToggleGeneralVoteCompleted(true)}
                className="w-full sm:w-auto shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEn ? 'Certify General Vote Complete' : 'সাধারণ ভোট সম্পন্ন ও চূড়ান্ত করুন'}</span>
              </button>
            )}
          </div>
        )}

        {/* STEP 1: EMPLOYEE ID ENTRY & VERIFICATION (Just like General Voting Option) */}
        {!verifiedElector ? (
          <div className="max-w-2xl mx-auto py-3">
            <div className="text-center space-y-3 mb-6">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                <IdCard className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {isEn ? 'Step 1 of 2: Elected Candidate Verification' : 'ধাপ ১: নির্বাচিত সদস্য যাচাইকরণ'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isEn
                  ? 'Enter Employment ID to Access Vice President Ballot'
                  : 'সহ-সভাপতি ব্যালট পেতে এমপ্লয়মেন্ট আইডি লিখুন'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                {isEn
                  ? 'Only the 08 certified Elected General Candidates are authorized to cast a vote. Enter your Employee ID number (or badge ID) to open your ballot paper.'
                  : 'সাধারণ নির্বাচনে বিজয়ী ০৮ জন নির্বাচিত কার্যনির্বাহী সদস্য এই নির্বাচনে ভোট দিতে পারবেন। আপনার ব্যালট পেপার খুলতে এমপ্লয়মেন্ট আইডি নম্বর লিখুন।'}
              </p>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyEmployeeId();
              }}
              className="space-y-4 max-w-md mx-auto"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="input-vp-employee-id"
                  type="text"
                  value={inputEmpId}
                  onChange={(e) => {
                    setInputEmpId(e.target.value);
                    if (verificationError) setVerificationError(null);
                  }}
                  placeholder={isEn ? 'e.g. EMP-20114 or 20114' : 'যেমন: EMP-20114 বা 20114'}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-xs"
                />
                {inputEmpId && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputEmpId('');
                      setVerificationError(null);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Verification Error Box */}
              {verificationError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{verificationError.message}</p>
                    {verificationError.type === 'not_elected' && (
                      <p className="text-[11px] text-rose-600">
                        {isEn
                          ? 'Please ensure you are entering the ID of one of the 08 elected candidates listed below.'
                          : 'অনুগ্রহ করে নিচে উল্লেখিত নির্বাচিত ০৮ জন প্রার্থীর সঠিক আইডি প্রদান করুন।'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                id="btn-verify-vp-elector-id"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>{isEn ? 'Verify & Open Vice President Ballot' : 'যাচাই করুন ও ব্যালট পেপার খুলুন'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: VERIFIED ELECTOR CARD & BALLOT PAPER OPENS */
          <div className="space-y-6">
            {/* Verified Elector Header Card */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={verifiedElector.img}
                    alt={isEn ? verifiedElector.nameEn : verifiedElector.nameBn}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs bg-slate-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Verified Elected General Candidate' : 'যাচাইকৃত নির্বাচিত সদস্য'}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {getCandidateEmpId(verifiedElector)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {isEn ? verifiedElector.nameEn : verifiedElector.nameBn}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {isEn ? verifiedElector.deptEn : verifiedElector.deptBn} • {toBanglaNum(verifiedElector.votes, currentLang)} {isEn ? 'General Votes Received' : 'সাধারণ ভোট পেয়েছেন'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-clear-verified-vp-elector"
                  type="button"
                  onClick={handleClearVerifiedElector}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEn ? 'Change Elector ID' : 'আইডি পরিবর্তন করুন'}</span>
                </button>
              </div>
            </div>

            {/* BALLOT PAPER FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border-l-4 border-amber-500 rounded-xl p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm sm:text-base">
                  <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    {isEn
                      ? 'Step 2: Choose 1 Candidate for Vice President (1 Seat)'
                      : 'ধাপ ২: সহ-সভাপতি পদের (১টি আসন) প্রার্থী নির্বাচন করুন'}
                  </span>
                </div>
                <span className="text-xs bg-white text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-300 shrink-0">
                  {isEn
                    ? `${vpCandidates.length} Nominees`
                    : `${toBanglaNum(vpCandidates.length, currentLang)} জন প্রার্থী`}
                </span>
              </div>

              {/* Candidate Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {vpCandidates.map((c) => {
                  const isSelected = selectedVpCandidateId === c.id;
                  const name = isEn ? c.nameEn : c.nameBn;
                  const dept = isEn ? c.deptEn : c.deptBn;

                  return (
                    <div
                      key={c.id}
                      id={`vp-ballot-candidate-${c.id}`}
                      onClick={() => handleSelectVp(c.id)}
                      className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/90 shadow-md scale-[1.01]'
                          : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50/70 bg-white'
                      } ${electionStatus !== 'active' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <img
                        src={c.img}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0 bg-slate-100"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{name}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {t.idPrefix} {toBanglaNum(c.id, currentLang)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-300/80 px-2 py-0.5 rounded">
                            {dept}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {toBanglaNum(c.votes, currentLang)} {isEn ? 'votes' : 'ভোট'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-vp-ballot"
                  type="submit"
                  disabled={electionStatus !== 'active' || !selectedVpCandidateId}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 font-semibold text-base rounded-xl transition-all shadow-md ${
                    electionStatus === 'active' && selectedVpCandidateId
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 active:scale-[0.99] cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  <span>
                    {isEn
                      ? 'Cast Official Vice President Ballot (1 Seat)'
                      : 'সহ-সভাপতি পদের (১টি আসন) অফিসিয়াল ভোট নিশ্চিত করুন'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
