import React, { useState, useEffect } from 'react';
import {
  X,
  Vote,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Candidate, ElectionStatus, Language, Voter } from '../types';
import { i18n } from '../data/initialData';
import { toBanglaNum } from '../utils/helpers';

interface AdminVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  ecCandidates: Candidate[];
  voterRegistry: Voter[];
  initialSelectedVoterId?: string | null;
  electionStatus: ElectionStatus;
  onCastVote: (ecId: string, voterId?: string) => void;
}

export const AdminVoteModal: React.FC<AdminVoteModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  ecCandidates,
  voterRegistry,
  initialSelectedVoterId,
  electionStatus,
  onCastVote
}) => {
  const t = i18n[currentLang];

  const [selectedVoterId, setSelectedVoterId] = useState<string>('');
  const [selectedEc, setSelectedEc] = useState<string | null>(null);
  const [voterSearch, setVoterSearch] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState<boolean>(false);
  const [lastVotedName, setLastVotedName] = useState<string>('');

  // Sync initial voter id when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccessSubmitted(false);
      setErrorMessage(null);
      setSelectedEc(null);

      if (initialSelectedVoterId) {
        setSelectedVoterId(initialSelectedVoterId);
      } else {
        // Default to first pending voter
        const firstPending = voterRegistry.find((v) => v.status === 'Pending');
        setSelectedVoterId(firstPending ? firstPending.id : (voterRegistry[0]?.id || ''));
      }
    }
  }, [isOpen, initialSelectedVoterId, voterRegistry]);

  if (!isOpen) return null;

  const currentVoter = voterRegistry.find((v) => v.id === selectedVoterId);
  const isVoterAlreadyVoted = currentVoter?.status === 'Voted';

  // Filter voters for the picker
  const filteredVoters = voterRegistry.filter((v) => {
    const q = voterSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      v.name.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      (v.empId && v.empId.toLowerCase().includes(q)) ||
      (v.dept && v.dept.toLowerCase().includes(q))
    );
  });

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (electionStatus === 'closed') {
      setErrorMessage(
        currentLang === 'en'
          ? 'Election is CLOSED. No further votes can be cast.'
          : 'নির্বাচন সমাপ্ত ঘোষিত হয়েছে। আর কোনো ভোট গ্রহণ সম্ভব নয়।'
      );
      return;
    }

    if (!selectedVoterId) {
      setErrorMessage(
        currentLang === 'en'
          ? 'Please select an eligible voter first.'
          : 'অনুগ্রহ করে প্রথমে একজন ভোটার নির্বাচন করুন।'
      );
      return;
    }

    if (isVoterAlreadyVoted) {
      setErrorMessage(
        currentLang === 'en'
          ? 'This voter has already voted! Duplicate voting is prohibited.'
          : 'এই ভোটার ইতিমধ্যে ভোট দিয়েছেন! দ্বিতীয়বার ভোট দেওয়া নিষিদ্ধ।'
      );
      return;
    }

    // First vote cast requirement: Executive Committee Member
    if (!selectedEc) {
      setErrorMessage(
        currentLang === 'en'
          ? 'Please select 1 member for Executive Committee.'
          : 'অনুগ্রহ করে কার্যনির্বাহী সদস্য পদের জন্য ১ জন প্রার্থী নির্বাচন করুন।'
      );
      return;
    }

    // Submit ballot
    onCastVote(selectedEc, selectedVoterId);
    setLastVotedName(currentVoter?.name || selectedVoterId);
    setSuccessSubmitted(true);

    try {
      confetti({
        particleCount: 70,
        spread: 55,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored if confetti fails
    }
  };

  const handleNextPendingVoter = () => {
    setSuccessSubmitted(false);
    setSelectedEc(null);
    setErrorMessage(null);

    const nextPending = voterRegistry.find((v) => v.status === 'Pending' && v.id !== selectedVoterId);
    if (nextPending) {
      setSelectedVoterId(nextPending.id);
    } else {
      const anyPending = voterRegistry.find((v) => v.status === 'Pending');
      if (anyPending) {
        setSelectedVoterId(anyPending.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {t.modalAdminVoteTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                  Admin Booth
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t.modalAdminVoteSub}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
          {/* Success Notification View */}
          {successSubmitted ? (
            <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-xs space-y-4 my-2">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">{t.adminVoteSuccess}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {currentLang === 'en'
                    ? `Official ballot for ${lastVotedName} has been encrypted and committed to the official registry.`
                    : `${lastVotedName}-এর অফিশিয়াল ভোট গ্রহণ সম্পন্ন হয়েছে এবং অডিট ট্রেইলে সংরক্ষিত হয়েছে।`}
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleNextPendingVoter}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    {currentLang === 'en'
                      ? 'Cast Vote for Another Voter'
                      : 'অন্য ভোটারের ভোট গ্রহণ করুন'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  {currentLang === 'en' ? 'Close Booth' : 'বুথ বন্ধ করুন'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVoteSubmit} className="space-y-5">
              {/* Election Status Warning if not active */}
              {electionStatus !== 'active' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    {electionStatus === 'paused'
                      ? currentLang === 'en'
                        ? 'Election is currently PAUSED. Presiding officer override is enabled.'
                        : 'ভোটগ্রহণ বর্তমানে স্থগিত আছে। প্রিসাইডিং অফিসার ওভাররাইড সক্রিয়।'
                      : currentLang === 'en'
                      ? 'Election is CLOSED. Votes cannot be recorded.'
                      : 'ভোটগ্রহণ সমাপ্ত ঘোষিত হয়েছে। ভোট দেওয়া যাবে না।'}
                  </span>
                </div>
              )}

              {/* Step 1: Voter Identity & Selection */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">{t.lblSelectVoter}</span>
                  </div>
                  {currentVoter && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        currentVoter.status === 'Voted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {currentVoter.status === 'Voted'
                        ? currentLang === 'en'
                          ? 'Already Voted (Ineligible)'
                          : 'ইতিমধ্যে ভোট দিয়েছেন (অনুপযুক্ত)'
                        : currentLang === 'en'
                        ? 'Verified Eligible to Vote'
                        : 'ভোট দেওয়ার জন্য উপযুক্ত'}
                    </span>
                  )}
                </div>

                {/* Voter Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={voterSearch}
                    onChange={(e) => setVoterSearch(e.target.value)}
                    placeholder={
                      currentLang === 'en'
                        ? 'Search voter by name, token ID or Employee ID...'
                        : 'ভোটারের নাম, টোকেন আইডি বা এমপ্লয়ি আইডি খুঁজুন...'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                {/* Voter Dropdown / Picker */}
                <select
                  value={selectedVoterId}
                  onChange={(e) => setSelectedVoterId(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium text-slate-800 bg-white"
                >
                  <option value="" disabled>
                    {currentLang === 'en' ? '-- Select Eligible Voter --' : '-- উপযুক্ত ভোটার নির্বাচন করুন --'}
                  </option>
                  {filteredVoters.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.empId || v.id}) - {v.dept || 'Operations'} [{v.status === 'Voted' ? 'VOTED' : 'PENDING'}]
                    </option>
                  ))}
                </select>

                {/* Selected Voter Info Card */}
                {currentVoter && (
                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{currentVoter.name}</span>
                      <span className="text-slate-500 ml-2">ID: {currentVoter.empId || currentVoter.id}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-600">{currentVoter.dept || 'Staff'}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      Token: {currentVoter.id}
                    </div>
                  </div>
                )}
              </div>

              {/* Executive Committee Member Candidates (First Vote Cast) */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {currentLang === 'en' ? 'Executive Committee Member' : 'কার্যনির্বাহী সদস্য'}
                    </h4>
                  </div>
                  <span className="text-xs text-emerald-700 font-medium">
                    {t.ecSub}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ecCandidates.map((c) => {
                    const isSelected = selectedEc === c.id;
                    const name = currentLang === 'en' ? c.nameEn : c.nameBn;
                    const dept = currentLang === 'en' ? c.deptEn : c.deptBn;

                    return (
                      <div
                        key={c.id}
                        onClick={() => !isVoterAlreadyVoted && setSelectedEc(c.id)}
                        className={`relative p-3 rounded-xl border transition-all flex items-center gap-3 ${
                          isVoterAlreadyVoted
                            ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                            : isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/30 cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer'
                        }`}
                      >
                        <img
                          src={c.img}
                          alt={name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-slate-300 bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{dept}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: {toBanglaNum(c.id, currentLang)}
                          </div>
                        </div>

                        {/* Radio Check Circle */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  {currentLang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>

                <button
                  id="btn-admin-submit-ballot"
                  type="submit"
                  disabled={
                    isVoterAlreadyVoted ||
                    !selectedEc ||
                    electionStatus === 'closed'
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.btnSubmitAdminVote}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
