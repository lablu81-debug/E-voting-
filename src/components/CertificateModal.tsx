import React, { useState } from 'react';
import { X, Printer, Download, FileSpreadsheet, Check, Loader2, Award, Users, FileText, FileCode } from 'lucide-react';
import { Candidate, CommitteeMember, Language, Voter } from '../types';
import { i18n } from '../data/initialData';
import { PrintCertificate } from './PrintCertificate';
import { VoterListPrintReport } from './VoterListPrintReport';
import { downloadCertificatePDF, printCertificateElement } from '../utils/pdfExport';
import { exportResultsCSV, exportVoterRegistryCSV } from '../utils/helpers';
import { exportResultsHTML, exportVoterRegistryHTML } from '../utils/htmlExport';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  vpCandidates: Candidate[];
  ecCandidates: Candidate[];
  committeeMembers: CommitteeMember[];
  voterRegistry?: Voter[];
  totalVoters: number;
  totalVotesCast: number;
  initialReportType?: 'declaration' | 'voters';
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  vpCandidates,
  ecCandidates,
  committeeMembers,
  voterRegistry = [],
  totalVoters,
  totalVotesCast,
  initialReportType = 'declaration'
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'declaration' | 'voters'>(initialReportType);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [htmlDownloadSuccess, setHtmlDownloadSuccess] = useState(false);

  // Sync initial report tab when modal opens
  React.useEffect(() => {
    if (isOpen && initialReportType) {
      setActiveReportTab(initialReportType);
    }
  }, [isOpen, initialReportType]);

  if (!isOpen) return null;

  const isEn = currentLang === 'en';
  const t = i18n[currentLang];

  const handleDownloadHtml = () => {
    let success = false;
    if (activeReportTab === 'declaration') {
      success = exportResultsHTML(
        vpCandidates,
        ecCandidates,
        committeeMembers,
        totalVoters,
        totalVotesCast,
        currentLang
      );
    } else {
      success = exportVoterRegistryHTML(
        voterRegistry,
        currentLang,
        totalVotesCast,
        committeeMembers
      );
    }
    if (success) {
      setHtmlDownloadSuccess(true);
      setTimeout(() => setHtmlDownloadSuccess(false), 3000);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);
    try {
      const fileName = `PC_Election_Official_Results_2026_${new Date().toISOString().slice(0, 10)}.pdf`;
      const success = await downloadCertificatePDF('pc-modal-certificate', fileName, {
        currentLang,
        vpCandidates,
        ecCandidates,
        committeeMembers,
        totalVoters,
        totalVotesCast
      });
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (activeReportTab === 'declaration') {
      printCertificateElement('pc-modal-certificate');
    } else {
      printCertificateElement('pc-modal-voter-report');
    }
  };

  const handleExportCsv = () => {
    if (activeReportTab === 'declaration') {
      exportResultsCSV(vpCandidates, ecCandidates, totalVoters, totalVotesCast);
    } else {
      exportVoterRegistryCSV(voterRegistry);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[94vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>
                  {isEn
                    ? 'Official Election Reports & Print Documentation'
                    : 'অফিসিয়াল নির্বাচন প্রতিবেদন ও প্রিন্ট ডকুমেন্টেশন'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Certified workplace election audits for Declaration of Results and Voter Roll'
                  : 'ফলাফল ঘোষণা পত্র ও চূড়ান্ত ভোটার তালিকার প্রত্যয়িত অডিট রিপোর্ট'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Selector Tabs Bar */}
        <div className="px-5 pt-3 pb-0 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Tab 1: Declaration of Results */}
            <button
              id="tab-btn-report-declaration"
              type="button"
              onClick={() => setActiveReportTab('declaration')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeReportTab === 'declaration'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-lg'
              }`}
            >
              <Award className="w-4 h-4 text-blue-600" />
              <span>{isEn ? 'Declaration of Results (Print)' : 'ফলাফল ঘোষণা পত্র (প্রিন্ট)'}</span>
            </button>

            {/* Tab 2: Voter List Report */}
            <button
              id="tab-btn-report-voters"
              type="button"
              onClick={() => setActiveReportTab('voters')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeReportTab === 'voters'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-lg'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? 'Official Voter List Report' : 'ভোটার তালিকা রিপোর্ট'}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                {voterRegistry.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:block pb-2">
            <span className="text-xs text-slate-500 font-mono">
              A4 Format • Print Ready
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Print Button */}
            <button
              id="modal-btn-print-active-report"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>
                {activeReportTab === 'declaration'
                  ? isEn ? 'Print Declaration of Results' : 'ফলাফল ঘোষণা পত্র প্রিন্ট করুন'
                  : isEn ? 'Print Voter List' : 'ভোটার তালিকা প্রিন্ট করুন'}
              </span>
            </button>

            {/* Download PDF Button (Specifically calibrated for Declaration of Results) */}
            {activeReportTab === 'declaration' && (
              <button
                id="modal-btn-download-pdf"
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
                  downloadSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                } disabled:opacity-60`}
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isEn ? 'Generating PDF...' : 'পিডিএফ তৈরি হচ্ছে...'}</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Downloaded PDF!' : 'পিডিএফ ডাউনলোড সম্পন্ন!'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isEn ? 'Download PDF (.pdf)' : 'পিডিএফ ডাউনলোড (.pdf)'}</span>
                  </>
                )}
              </button>
            )}

            {/* Download HTML Button */}
            <button
              id="modal-btn-download-html"
              type="button"
              onClick={handleDownloadHtml}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                htmlDownloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
              }`}
              title={isEn ? 'Download standalone HTML report' : 'এইচটিএমএল ফাইল ডাউনলোড করুন'}
            >
              {htmlDownloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEn ? 'Downloaded HTML!' : 'এইচটিএমএল ডাউনলোড সম্পন্ন!'}</span>
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  <span>{isEn ? 'Download HTML (.html)' : 'এইচটিএমএল ডাউনলোড (.html)'}</span>
                </>
              )}
            </button>

            {/* Export CSV Button */}
            <button
              id="modal-btn-export-csv"
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>
                {activeReportTab === 'declaration'
                  ? isEn ? 'Results CSV' : 'ফলাফল সিএসভি'
                  : isEn ? 'Voter List CSV' : 'ভোটার তালিকা সিএসভি'}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            {activeReportTab === 'declaration'
              ? isEn ? 'Executive Committee: 08 Certified Seats' : 'কার্যনির্বাহী কমিটি: ০৮টি সার্টিফাইড আসন'
              : isEn ? `Total Roll: ${voterRegistry.length} Verified Electors` : `মোট ভোটার: ${voterRegistry.length} জন`}
          </div>
        </div>

        {/* Report Document Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          {activeReportTab === 'declaration' ? (
            <div className="bg-white shadow-md border border-slate-200 rounded-lg p-6 max-w-4xl mx-auto">
              <PrintCertificate
                id="pc-modal-certificate"
                className="block bg-white text-slate-900"
                currentLang={currentLang}
                vpCandidates={vpCandidates}
                ecCandidates={ecCandidates}
                committeeMembers={committeeMembers}
                totalVoters={totalVoters}
                totalVotesCast={totalVotesCast}
              />
            </div>
          ) : (
            <div className="bg-white shadow-md border border-slate-200 rounded-lg p-6 max-w-5xl mx-auto">
              <VoterListPrintReport
                id="pc-modal-voter-report"
                className="block bg-white text-slate-900"
                currentLang={currentLang}
                voterRegistry={voterRegistry}
                totalVotesCast={totalVotesCast}
                committeeMembers={committeeMembers}
                interactiveControls={true}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Worker Representation Participation Committee • Official Report Portal</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isEn ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>

      </div>
    </div>
  );
};
