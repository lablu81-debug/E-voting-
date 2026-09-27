import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Users,
  Trophy,
  Vote,
  IdCard,
  Search,
  LogOut,
  ArrowRight,
  User,
  Hash,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Candidate, ElectionStatus, Language, VpElectorVote, UserRole, Voter } from '../types';
import { i18n } from '../data/initialData';
import { toBanglaNum } from '../utils/helpers';
import { ROLE_CONFIGS } from '../data/rolesData';
import { VicePresidentBallotView } from './VicePresidentBallotView';

interface BallotViewProps {
  currentLang: Language;
  vpCandidates: Candidate[];
  ecCandidates: Candidate[];
  voterRegistry: Voter[];
  electionStatus: ElectionStatus;
  vpElectorVotes: VpElectorVote[];
  currentRole?: UserRole;
  onOpenRoleModal?: () => void;
  onCastVote: (ecId: string, voterId?: string) => void;
  onCastVpVote: (vpCandidateId: string, ecMemberId: string) => void;
  initialBallotType?: 'ec' | 'vp';
  onNavigateToDashboard?: () => void;
  onNavigateToVpBallot?: () => void;
}

export const BallotView: React.FC<BallotViewProps> = ({
  currentLang,
  vpCandidates,
  ecCandidates,
  voterRegistry = [],
  electionStatus,
  vpElectorVotes,
  currentRole = 'voter',
  onOpenRoleModal,
  onCastVote,
  onCastVpVote,
  initialBallotType = 'ec',
  onNavigateToDashboard,
  onNavigateToVpBallot
}) => {
  const t = i18n[currentLang];
  const isEn = currentLang === 'en';
  const [activeBallot, setActiveBallot] = useState<'ec' | 'vp'>(initialBallotType);

  useEffect(() => {
    if (initialBallotType) {
      setActiveBallot(initialBallotType);
    }
  }, [initialBallotType]);

  // Employment ID Verification State for Voters
  const [inputEmpId, setInputEmpId] = useState<string>('');
  const [verifiedVoter, setVerifiedVoter] = useState<Voter | null>(null);
  const [verificationError, setVerificationError] = useState<{
    type: 'not_found' | 'already_voted' | 'empty' | 'inactive';
    message: string;
    voter?: Voter;
  } | null>(null);

  // Executive Committee Ballot state
  const [selectedEc, setSelectedEc] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    voterName: string;
    empId: string;
    dept: string;
    section?: string;
    candidateName: string;
    candidateDept: string;
    timestamp: string;
    receiptToken: string;
  } | null>(null);

  // Verify voter by Employment ID or Voter ID
  const handleVerifyEmployeeId = (targetIdOverride?: string) => {
    const rawTarget = (targetIdOverride !== undefined ? targetIdOverride : inputEmpId).trim();
    if (!rawTarget) {
      setVerificationError({
        type: 'empty',
        message: isEn
          ? 'Please enter your Employment ID number to access the ballot.'
          : 'ব্যালট পেপার পেতে অনুগ্রহ করে আপনার এমপ্লয়মেন্ট আইডি নম্বর লিখুন।'
      });
      return;
    }

    if (electionStatus !== 'active') {
      setVerificationError({
        type: 'inactive',
        message: isEn
          ? 'Voting is currently inactive or closed by the Election Commission.'
          : 'নির্বাচন কমিশন কর্তৃক ভোটগ্রহণ বর্তমানে স্থগিত বা বন্ধ আছে।'
      });
      return;
    }

    const cleanTarget = rawTarget.toLowerCase();
    const numericTarget = rawTarget.replace(/[^0-9]/g, '');

    // Search voter in registry matching empId, id, or numeric badge
    const matchedVoter = voterRegistry.find((v) => {
      const empIdClean = (v.empId || '').toLowerCase();
      const idClean = v.id.toLowerCase();
      const empIdNum = (v.empId || '').replace(/[^0-9]/g, '');
      const idNum = v.id.replace(/[^0-9]/g, '');

      return (
        empIdClean === cleanTarget ||
        idClean === cleanTarget ||
        (numericTarget.length >= 3 && (empIdNum === numericTarget || idNum === numericTarget))
      );
    });

    if (!matchedVoter) {
      setVerificationError({
        type: 'not_found',
        message: isEn
          ? `Employment ID "${rawTarget}" was not found in the verified voter roll. Please verify your employee badge or contact the presiding officer.`
          : `এমপ্লয়মেন্ট আইডি "${rawTarget}" ভোটার তালিকায় পাওয়া যায়নি। আপনার কর্মীর ব্যাজ নম্বর পরীক্ষা করুন অথবা প্রিজাইডিং অফিসারের সাথে যোগাযোগ করুন।`
      });
      return;
    }

    if (matchedVoter.status === 'Voted') {
      setVerificationError({
        type: 'already_voted',
        voter: matchedVoter,
        message: isEn
          ? `Voter ${matchedVoter.name} (${matchedVoter.empId || matchedVoter.id}) from ${matchedVoter.dept} has already cast their official ballot. Duplicate voting is strictly prohibited.`
          : `ভোটার ${matchedVoter.name} (${matchedVoter.empId || matchedVoter.id}, বিভাগ: ${matchedVoter.dept}) ইতিমধ্যে ভোট প্রদান করেছেন। পুনরাবৃত্তি ভোট দেওয়া সম্পূর্ণ নিষিদ্ধ।`
      });
      return;
    }

    // Success: Voter is verified and eligible!
    setVerificationError(null);
    setVerifiedVoter(matchedVoter);
    setInputEmpId(matchedVoter.empId || matchedVoter.id);
    setSelectedEc(null);
    setErrorMessage(null);
  };

  const handleClearVerifiedVoter = () => {
    setVerifiedVoter(null);
    setSelectedEc(null);
    setErrorMessage(null);
    setVerificationError(null);
    setInputEmpId('');
  };

  const handleSelectEc = (id: string) => {
    if (electionStatus !== 'active') return;
    setSelectedEc(id);
    setErrorMessage(null);
  };

  const handleSubmitEc = (e: React.FormEvent) => {
    e.preventDefault();
    if (electionStatus !== 'active') {
      setErrorMessage(
        isEn
          ? 'Voting is currently inactive or closed!'
          : 'ভোটগ্রহণ বর্তমানে স্থগিত বা বন্ধ আছে!'
      );
      return;
    }

    if (!verifiedVoter) {
      setErrorMessage(
        isEn
          ? 'Voter Employment ID verification is required before casting a ballot.'
          : 'ভোট প্রদানের পূর্বে এমপ্লয়মেন্ট আইডি যাচাইকরণ আবশ্যক।'
      );
      return;
    }

    if (!selectedEc) {
      setErrorMessage(
        isEn
          ? 'Please select 1 candidate for Executive Committee Member.'
          : 'অনুগ্রহ করে কার্যনির্বাহী সদস্য পদের জন্য ১ জন প্রার্থী নির্বাচন করুন।'
      );
      return;
    }

    const candidate = ecCandidates.find((c) => c.id === selectedEc);
    const candidateName = candidate ? (isEn ? candidate.nameEn : candidate.nameBn) : selectedEc;
    const candidateDept = candidate ? (isEn ? candidate.deptEn : candidate.deptBn) : '';

    // Cast vote with voterId linked directly
    onCastVote(selectedEc, verifiedVoter.id);

    const now = new Date();
    const token = `#VOTE-EC-${(verifiedVoter.empId || verifiedVoter.id).replace(/[^0-9]/g, '') || '00'}-${Math.floor(1000 + Math.random() * 9000)}`;

    setLastReceipt({
      voterName: verifiedVoter.name,
      empId: verifiedVoter.empId || verifiedVoter.id,
      dept: verifiedVoter.dept,
      section: verifiedVoter.section,
      candidateName,
      candidateDept,
      timestamp: now.toLocaleString(),
      receiptToken: token
    });

    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored if canvas-confetti cannot run
    }
  };

  const handleResetEcBallot = () => {
    setSelectedEc(null);
    setIsSubmitted(false);
    setErrorMessage(null);
    setVerifiedVoter(null);
    setInputEmpId('');
    setVerificationError(null);
    setLastReceipt(null);
  };

  // Top elected EC members count & turnout for badges (8 seats)
  const sortedEc = [...ecCandidates].sort((a, b) => b.votes - a.votes);
  const electedEcMembers = sortedEc.slice(0, 8);
  const votedEcElectorCount = electedEcMembers.filter((m) =>
    vpElectorVotes.some((v) => v.ecMemberId === m.id)
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Render Ballot */}
      {isSubmitted ? (
        <div className="max-w-2xl mx-auto my-8 bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 id="vote-success-heading" className="text-2xl font-bold text-slate-800 mb-2">
            {t.successTitle}
          </h3>
          <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
            {isEn
              ? 'Your official ballot for 1 Executive Committee Member has been securely recorded and verified in the election registry.'
              : 'কার্যনির্বাহী সদস্য পদের জন্য আপনার ব্যালট ভোট সফলভাবে সংরক্ষিত ও নিবন্ধিত হয়েছে।'}
          </p>

          {/* Official Vote Receipt Details */}
          {lastReceipt && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-md mx-auto mb-8 text-xs text-slate-600 space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <IdCard className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? 'Voter Identity:' : 'ভোটারের পরিচয়:'}</span>
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {lastReceipt.voterName} ({lastReceipt.empId})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">{isEn ? 'Department:' : 'শাখা:'}</span>
                <span className="text-slate-800 font-medium">{lastReceipt.dept}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">{isEn ? 'Candidate Chosen:' : 'নির্বাচিত প্রার্থী:'}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {lastReceipt.candidateName} {lastReceipt.candidateDept ? `(${lastReceipt.candidateDept})` : ''}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">{isEn ? 'Audit Token:' : 'অডিট টোকেন:'}</span>
                <span className="font-mono text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                  {lastReceipt.receiptToken}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">{isEn ? 'Timestamp:' : 'সময়:'}</span>
                <span className="font-mono text-slate-500">{lastReceipt.timestamp}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-cast-another-vote"
              type="button"
              onClick={handleResetEcBallot}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isEn ? 'Cast Vote with Another Employee ID' : 'পরবর্তী ভোটার আইডি দিয়ে ভোট দিন'}</span>
            </button>

            {onNavigateToDashboard && (
              <button
                id="btn-view-results-after-vote"
                type="button"
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium text-sm rounded-xl transition-colors cursor-pointer"
              >
                <Vote className="w-4 h-4 text-blue-600" />
                <span>{isEn ? 'View Live Results Dashboard' : 'লাইভ ফলাফল ড্যাশবোর্ড দেখুন'}</span>
              </button>
            )}
          </div>
        </div>
      ) : !verifiedVoter ? (
        /* STEP 1: Employment ID Verification Gate */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <IdCard className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEn ? 'Step 1 of 2: Voter Verification' : 'ধাপ ১/২: ভোটার পরিচয় যাচাই'}</span>
            </div>
            <h2 id="elector-id-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isEn ? 'Enter Employment ID to Access Ballot' : 'ব্যালট পেতে আপনার কর্মকর্তা/কর্মচারী আইডি দিন'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {isEn
                ? 'Under official factory election rules, each registered worker must verify their Employment ID (Badge Number) before the Executive Committee ballot is unlocked.'
                : 'কারখানা অংশীদারিত্ব নির্বাচন বিধি অনুযায়ী, ব্যালট পেপার পাওয়ার পূর্বে প্রতিটি নিবন্ধিত শ্রমিককে তাদের অফিসিয়াল কর্মকর্তা/কর্মচারী আইডি (ব্যাজ নম্বর) যাচাই করতে হবে।'}
            </p>
          </div>

          {/* Election state warning banner if not active */}
          {electionStatus !== 'active' && (
            <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold">
                  {electionStatus === 'paused'
                    ? isEn ? 'Voting Paused:' : 'ভোটগ্রহণ স্থগিত:'
                    : isEn ? 'Voting Closed:' : 'ভোটগ্রহণ সমাপ্ত:'}
                </span>{' '}
                {electionStatus === 'paused'
                  ? isEn
                    ? 'The election committee has temporarily paused the ballot.'
                    : 'নির্বাচন কমিশন সাময়িকভাবে ভোটগ্রহণ স্থগিত রেখেছে।'
                  : isEn
                  ? 'The election period has concluded. No further ballots accepted.'
                  : 'নির্বাচনের সময়সীমা শেষ হয়েছে। আর কোনো ব্যালট গ্রহণ করা হবে না।'}
              </div>
            </div>
          )}

          {/* Verification Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyEmployeeId();
            }}
            className="max-w-md mx-auto space-y-3.5"
          >
            <div>
              <label htmlFor="input-elector-emp-id" className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isEn ? 'Workplace Employment ID Number:' : 'কর্মকর্তা/কর্মচারী আইডি নম্বর:'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  id="input-elector-emp-id"
                  type="text"
                  value={inputEmpId}
                  onChange={(e) => {
                    setInputEmpId(e.target.value);
                    if (verificationError) setVerificationError(null);
                  }}
                  placeholder={isEn ? 'e.g. EMP-4103, EMP-4107, 4103' : 'যেমন: EMP-4103, EMP-4107 বা 4103'}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-xl text-base font-mono font-medium text-slate-900 placeholder:text-slate-400 outline-hidden transition-all shadow-xs"
                  autoFocus
                />
              </div>
            </div>

            <button
              id="btn-verify-elector-id"
              type="submit"
              disabled={electionStatus !== 'active'}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-5 font-semibold text-sm sm:text-base rounded-xl transition-all shadow-md ${
                electionStatus === 'active'
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-emerald-600/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isEn ? 'Verify ID & Open EC Ballot' : 'আইডি যাচাই করুন ও ব্যালট খুলুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Verification Feedback: Error Alert */}
          {verificationError && (
            <div
              id="elector-verification-alert"
              className={`max-w-md mx-auto p-4 rounded-xl border text-xs sm:text-sm ${
                verificationError.type === 'already_voted'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`w-5 h-5 shrink-0 ${verificationError.type === 'already_voted' ? 'text-amber-600' : 'text-rose-600'}`} />
                <div className="space-y-1.5 flex-1">
                  <p className="font-semibold">{verificationError.message}</p>
                  {verificationError.voter && (
                    <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200/80 text-xs text-slate-700 space-y-1 mt-2">
                      <div className="font-bold text-slate-900">{verificationError.voter.name}</div>
                      <div className="flex flex-wrap gap-2 text-slate-600">
                        <span>{isEn ? 'Dept:' : 'বিভাগ:'} {verificationError.voter.dept}</span>
                        <span>•</span>
                        <span>{isEn ? 'ID:' : 'আইডি:'} {verificationError.voter.empId || verificationError.voter.id}</span>
                        <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          {isEn ? 'Already Voted' : 'ভোট সম্পন্ন'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: Executive Committee Ballot */
        <div className="space-y-6">
          {/* Verified Elector Identity Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              {verifiedVoter.photo ? (
                <img
                  src={verifiedVoter.photo}
                  alt={verifiedVoter.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/80 shadow-xs shrink-0 bg-slate-800"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-700 border-2 border-emerald-400/80 flex items-center justify-center font-bold text-lg text-white shrink-0">
                  {verifiedVoter.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-white">{verifiedVoter.name}</h3>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                    {verifiedVoter.empId || verifiedVoter.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100 border border-emerald-400/30">
                    {isEn ? 'Verified Elector' : 'অনুমোদিত ভোটার'}
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-1">
                  {isEn ? 'Department:' : 'শাখা:'} <span className="text-white font-medium">{verifiedVoter.dept}</span>
                  {verifiedVoter.section && <> • {isEn ? 'Section:' : 'সেকশন:'} <span className="text-white font-medium">{verifiedVoter.section}</span></>}
                  {verifiedVoter.desig && <> • {isEn ? 'Designation:' : 'পদবি:'} <span className="text-white font-medium">{verifiedVoter.desig}</span></>}
                </p>
              </div>
            </div>

            <button
              id="btn-switch-elector"
              type="button"
              onClick={handleClearVerifiedVoter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold rounded-xl border border-emerald-600/60 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isEn ? 'Change Elector ID' : 'আইডি পরিবর্তন'}</span>
            </button>
          </div>

          {/* Main Ballot Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 shadow-sm">
            {/* Header inside ballot */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5 mb-6">
              <div>
                <h2 id="ballot-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {t.ballotHeader}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {isEn
                    ? 'Select 1 Executive Committee Member below, then click Submit Ballot.'
                    : 'নিচের তালিকা হতে কার্যনির্বাহী সদস্য পদের জন্য ১ জন প্রার্থী নির্বাচন করুন এবং ব্যালট জমা দিন।'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.voterBadge}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitEc} className="space-y-8">
              {/* Executive Committee Member */}
              <section className="space-y-3">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 border-l-4 border-emerald-600 rounded-lg p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>
                      {isEn ? 'Executive Committee Member' : 'কার্যনির্বাহী সদস্য'}
                    </span>
                  </div>
                  <span className="text-xs bg-white text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                    {t.ecSub} ({toBanglaNum(ecCandidates.length, currentLang)})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                  {ecCandidates.map((c) => {
                    const isSelected = selectedEc === c.id;
                    const name = currentLang === 'en' ? c.nameEn : c.nameBn;
                    const dept = currentLang === 'en' ? c.deptEn : c.deptBn;

                    return (
                      <div
                        key={c.id}
                        id={`candidate-card-ec-${c.id}`}
                        onClick={() => handleSelectEc(c.id)}
                        className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20 scale-[1.01]'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70 bg-white'
                        } ${electionStatus !== 'active' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <img
                          src={c.img}
                          alt={name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{name}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {t.idPrefix} {toBanglaNum(c.id, currentLang)}
                          </p>
                          <span className="inline-block text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md mt-1">
                            {dept}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Validation error notification */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                id="btn-submit-ballot"
                type="submit"
                disabled={electionStatus !== 'active'}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 font-semibold text-base rounded-xl transition-all shadow-md ${
                  electionStatus === 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-[0.99] cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>
                  {selectedEc
                    ? isEn
                      ? `Cast Ballot for ${ecCandidates.find((c) => c.id === selectedEc)?.nameEn || ''} (${verifiedVoter.empId || verifiedVoter.id})`
                      : `ভোট প্রদান করুন (${verifiedVoter.empId || verifiedVoter.id})`
                    : t.btnSubmitVote}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
