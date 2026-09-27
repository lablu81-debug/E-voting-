import React, { useState } from 'react';
import {
  RotateCcw,
  UserPlus,
  Sliders,
  Send,
  Plus,
  FileSpreadsheet,
  FileDown,
  Download,
  UploadCloud,
  Search,
  PenSquare,
  Trash2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Users,
  Vote,
  ShieldCheck,
  Shield,
  Eye,
  Save,
  Edit3,
  Trophy,
  Lock,
  Unlock,
  ShieldAlert,
  Crown,
  CheckCircle2,
  XCircle,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Printer,
  Award,
  FileText,
  Check,
  List,
  LayoutGrid,
  SlidersHorizontal,
  KeyRound,
  Filter,
  UserCheck,
  Settings2,
  Fingerprint,
  FileCode
} from 'lucide-react';
import { AuditLog, Candidate, CommitteeMember, ElectionStatus, Language, PositionCategory, Voter, UserRole, NavigationTab, RolePermissions } from '../types';
import { i18n } from '../data/initialData';
import { ROLE_CONFIGS, RoleConfig, DEFAULT_ROLES_CONFIG, isTabPermittedForRole } from '../data/rolesData';
import { AdminVoteModal } from './AdminVoteModal';
import { DeleteConfirmationModal, DeleteModalData } from './DeleteConfirmationModal';
import { CommitteeMemberModal } from './CommitteeMemberModal';
import { EditRoleModal } from './EditRoleModal';
import {
  toBanglaNum,
  downloadSampleExcelTemplate,
  exportVoterRegistryCSV,
  exportResultsCSV,
  parseExcelVoters
} from '../utils/helpers';
import { exportResultsHTML, exportVoterRegistryHTML } from '../utils/htmlExport';

export const PERMISSION_DEFINITIONS: {
  key: keyof RolePermissions;
  icon: string;
  title: { en: string; bn: string };
  short: { en: string; bn: string };
  desc: { en: string; bn: string };
}[] = [
  {
    key: 'canVote',
    icon: '🗳️',
    title: { en: 'Cast Secret Ballot (EC Election)', bn: 'কার্যনির্বাহী নির্বাচনে ভোট' },
    short: { en: 'EC Vote', bn: 'ইসি ভোট' },
    desc: { en: 'Access general worker secret ballot booth', bn: 'সাধারণ কর্মী গোপন ব্যালট বুথ ব্যবহারের অধিকার' }
  },
  {
    key: 'canConductVpBallot',
    icon: '🏆',
    title: { en: 'VP Secret Ballot (Electoral College)', bn: 'সহ-সভাপতি গোপন ব্যালট' },
    short: { en: 'VP Vote', bn: 'ভিপি ভোট' },
    desc: { en: 'Cast vote in Electoral College VP ballot (1 Seat)', bn: 'ইলেকটোরাল কলেজ সহ-সভাপতি ব্যালটে ভোটদান' }
  },
  {
    key: 'canViewDashboard',
    icon: '📊',
    title: { en: 'Live Results & Analytics Dashboard', bn: 'সরাসরি ফলাফল ড্যাশবোর্ড' },
    short: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    desc: { en: 'View live vote tallies, turnout %, and audit logs', bn: 'সরাসরি ভোট গণনা ও টার্নআউট পর্যবেক্ষণ' }
  },
  {
    key: 'canViewAdminPanel',
    icon: '⚙️',
    title: { en: 'Admin Panel & Presiding Booth Operations', bn: 'প্রিজাইডিং বুথ ও প্রশাসন' },
    short: { en: 'Admin Booth', bn: 'বুথ ও অ্যাডমিন' },
    desc: { en: 'Access returning officer control console', bn: 'রিটার্নিং অফিসার কনসোল ও বুথে প্রবেশাধিকার' }
  },
  {
    key: 'canManageCandidates',
    icon: '👥',
    title: { en: 'Nominate & Manage Candidates', bn: 'প্রার্থী মনোনয়ন ও পরিচালনা' },
    short: { en: 'Candidates', bn: 'প্রার্থী' },
    desc: { en: 'Add, edit, or remove VP/EC candidate slates', bn: 'প্রার্থী যোগ, এডিট বা প্রার্থিতা প্রত্যাহার' }
  },
  {
    key: 'canManageVoterRegistry',
    icon: '📑',
    title: { en: 'Voter Registry Add & Excel Bulk Import', bn: 'ভোটার নিবন্ধন ও এক্সেল আপলোড' },
    short: { en: 'Voter Registry', bn: 'ভোটার তালিকা' },
    desc: { en: 'Maintain factory electorate roster & bulk import', bn: 'ভোটার তালিকা তৈরি ও এক্সেল ফাইল আপলোড' }
  },
  {
    key: 'canManageElectionStatus',
    icon: '🚦',
    title: { en: 'Control Polling Status (Active/Pause/Close)', bn: 'ভোটগ্রহণের অবস্থা নিয়ন্ত্রণ' },
    short: { en: 'Polling Status', bn: 'ভোট অবস্থা' },
    desc: { en: 'Start polling, pause temporarily, or declare closed', bn: 'ভোটগ্রহণ শুরু, স্থগিত বা চূড়ান্ত সমাপ্ত ঘোষণা' }
  },
  {
    key: 'canDownloadReports',
    icon: '📄',
    title: { en: 'Export Certified Excel, PDF & CSV Reports', bn: 'প্রত্যয়িত রিপোর্ট ডাউনলোড' },
    short: { en: 'Export Reports', bn: 'রিপোর্ট' },
    desc: { en: 'Download gazette notices, certificates & data sheets', bn: 'গেজেট নোটিশ, সার্টিফিকেট ও এক্সেল শিট ডাউনলোড' }
  },
  {
    key: 'canManageCommittee',
    icon: '🛡️',
    title: { en: 'Manage Election Organizing Committee', bn: 'নির্বাচন কমিশন পরিচালনা' },
    short: { en: 'EC Roster', bn: 'কমিটি' },
    desc: { en: 'Appoint returning officers and presiding commissioners', bn: 'রিটার্নিং কর্মকর্তা ও প্রিজাইডিং সদস্য নিয়োগ' }
  },
  {
    key: 'canResetDatabase',
    icon: '🔄',
    title: { en: 'Purge / Reset All Election Tallies & Logs', bn: 'সকল ডেটা সম্পূর্ণ রিসেট' },
    short: { en: 'Data Purge', bn: 'ডেটা রিসেট' },
    desc: { en: 'High-security root purge of all ballots and audit trail', bn: 'সর্বোচ্চ নিরাপত্তা স্তর: সকল ব্যালট ও অডিট ট্রেইল রিসেট' }
  }
];

export const getRoleTierBadge = (roleKey: string) => {
  switch (roleKey) {
    case 'admin':
      return {
        tier: 'Tier 1',
        titleEn: 'Root Super Admin',
        titleBn: 'রুট সুপার অ্যাডমিন',
        descEn: 'Full sovereign administrative, purge, and nomination control.',
        descBn: 'সার্বভৌম প্রশাসনিক, ডেটাবেস পার্জ ও চূড়ান্ত মনোনয়ন ক্ষমতা।',
        color: 'bg-rose-100 text-rose-800 border-rose-200'
      };
    case 'system_admin':
      return {
        tier: 'Tier 2',
        titleEn: 'Returning Officer',
        titleBn: 'রিটার্নিং অফিসার',
        descEn: 'Operational supervision, polling status, nominations & certified reports.',
        descBn: 'অপারেশনাল তত্ত্বাবধান, ভোট স্ট্যাটাস, মনোনয়ন ও ফলাফল নোটিশ।',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'observer':
      return {
        tier: 'Tier 3',
        titleEn: 'Independent Scrutiny',
        titleBn: 'নিরপেক্ষ কমপ্লায়েন্স অডিটর',
        descEn: 'Audit scrutiny, live turnout telemetry, and official report inspection.',
        descBn: 'নিরপেক্ষ নিরীক্ষা, সরাসরি উপস্থিতি টেলিমেট্রি ও রিপোর্ট পরিদর্শন।',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
      };
    case 'ec_committee':
      return {
        tier: 'Tier 4',
        titleEn: 'Presiding Commission',
        titleBn: 'প্রিজাইডিং কমিশন',
        descEn: 'Walk-in voter assistance, ballot verification, and VP secret ballot.',
        descBn: 'ওয়াক-ইন ভোটার সহায়তা, ব্যালট যাচাই ও ভিপি গোপন ব্যালট।',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      };
    case 'voter':
      return {
        tier: 'Tier 5',
        titleEn: 'General Electorate',
        titleBn: 'সাধারণ ভোটার',
        descEn: 'Direct secret ballot casting and public turnout monitoring.',
        descBn: 'সাধারণ কর্মীদের সরাসরি গোপন ব্যালট ও উপস্থিতি দেখা।',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
    default:
      return {
        tier: 'Custom',
        titleEn: 'Delegated Officer',
        titleBn: 'অর্পিত কর্মকর্তা',
        descEn: 'Custom granular delegated administrative access.',
        descBn: 'কাস্টম অর্পিত প্রশাসনিক সুবিধা।',
        color: 'bg-purple-100 text-purple-800 border-purple-200'
      };
  }
};

interface AdminPanelViewProps {
  currentLang: Language;
  vpCandidates: Candidate[];
  ecCandidates: Candidate[];
  committeeMembers: CommitteeMember[];
  voterRegistry: Voter[];
  electionStatus: ElectionStatus;
  auditLogs: AuditLog[];
  currentRole?: UserRole;
  rolesConfig?: Record<string, RoleConfig>;
  onOpenRoleModal?: () => void;
  onSelectRole?: (role: UserRole) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  onAddCandidate: (cand: Candidate) => void;
  onEditCandidateClick: (cand: Candidate) => void;
  onDeleteCandidate: (category: PositionCategory, id: string) => void;
  onAddVoter: (voter: Voter) => void;
  onDeleteVoter: (id: string) => void;
  onBulkImportVoters: (voters: Voter[]) => void;
  onUpdateElectionStatus: (status: ElectionStatus) => void;
  onBroadcastLinks: () => void;
  onResetElectionData: () => void;
  onCastVote: (ecId: string, voterId?: string) => void;
  onAddCommitteeMember: (member: CommitteeMember) => void;
  onUpdateCommitteeMember: (member: CommitteeMember) => void;
  onDeleteCommitteeMember: (id: string) => void;
  onResetCommitteeMembers: () => void;
  onOpenVpBallot?: () => void;
  isGeneralElectionComplete?: boolean;
  onToggleGeneralElectionComplete?: (completed: boolean) => void;
  onOpenReportModal?: (reportType: 'declaration' | 'voters') => void;
  onUpdateRole?: (role: RoleConfig) => void;
  onAddRole?: (role: RoleConfig) => void;
  onDeleteRole?: (roleKey: string) => void;
  onResetRoles?: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentLang,
  vpCandidates,
  ecCandidates,
  committeeMembers,
  voterRegistry,
  electionStatus,
  auditLogs,
  currentRole = 'admin',
  rolesConfig,
  onOpenRoleModal,
  onSelectRole,
  onNavigateTab,
  onAddCandidate,
  onEditCandidateClick,
  onDeleteCandidate,
  onAddVoter,
  onDeleteVoter,
  onBulkImportVoters,
  onUpdateElectionStatus,
  onBroadcastLinks,
  onResetElectionData,
  onCastVote,
  onAddCommitteeMember,
  onUpdateCommitteeMember,
  onDeleteCommitteeMember,
  onResetCommitteeMembers,
  onOpenVpBallot,
  isGeneralElectionComplete = true,
  onToggleGeneralElectionComplete,
  onOpenReportModal,
  onUpdateRole,
  onAddRole,
  onDeleteRole,
  onResetRoles
}) => {
  const t = i18n[currentLang];
  const isEn = currentLang === 'en';

  const activeRoles = rolesConfig || ROLE_CONFIGS;
  const currentRoleConfig = activeRoles[currentRole] || activeRoles.admin || ROLE_CONFIGS.admin;

  // If active role does not have admin permissions, access to the Admin / Committee portal is restricted
  if (!isTabPermittedForRole(currentRoleConfig, 'admin')) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full">
            {isEn ? 'Restricted Menu' : 'সংরক্ষিত মেনু'}
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-3">
            {isEn ? 'Admin & Committee Portal Access Restricted' : 'অ্যাডমিন ও কমিটি পোর্টাল প্রবেশাধিকার সংরক্ষিত'}
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {isEn
              ? `You are currently signed in under the "${currentRoleConfig.badge.en}" role. This role does not have menu permissions to access administrative controls, alter rosters, or configure election settings.`
              : `আপনি বর্তমানে "${currentRoleConfig.badge.bn}" ভূমিকায় আছেন। এই ভূমিকার প্রশাসনিক কন্ট্রোল, ভোটার তালিকা হালনাগাদ বা নির্বাচনী সেটিংস নিয়ন্ত্রণের অনুমতি নেই।`}
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-2">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{isEn ? 'Required Menu Permissions:' : 'প্রয়োজনীয় মেনু অনুমতিসমূহ:'}</span>
          </div>
          <p>
            {isEn
              ? 'Please switch to "Super Admin", "Admin", "Observer", or "EC Committee" role to inspect the administrative panel, presiding booth, and voter registry.'
              : 'প্রশাসনিক প্যানেল, প্রিজাইডিং বুথ ও ভোটার তালিকা ব্যবহার করতে অনুগ্রহ করে "সুপার অ্যাডমিন", "অ্যাডমিন", "পর্যবেক্ষক" বা "নির্বাচন কমিশন" ভূমিকায় পরিবর্তন করুন।'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {onSelectRole && (
            <>
              {currentRole !== 'system_admin' && (
                <button
                  type="button"
                  onClick={() => onSelectRole('admin')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>{isEn ? 'Super Admin' : 'সুপার অ্যাডমিন'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectRole('system_admin')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>{isEn ? 'Admin' : 'অ্যাডমিন'}</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('observer')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>{isEn ? 'Observer' : 'পর্যবেক্ষক'}</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('ec_committee')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isEn ? 'EC Member' : 'নির্বাচন কমিশন'}</span>
              </button>
            </>
          )}
          {onOpenRoleModal && (
            <button
              id="btn-switch-role-from-denied"
              type="button"
              onClick={onOpenRoleModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isEn ? 'Permissions Matrix' : 'পারমিশন ম্যাট্রিক্স'}</span>
            </button>
          )}
          {onNavigateTab && isTabPermittedForRole(currentRoleConfig, 'ballot') && (
            <button
              id="btn-return-ballot-from-denied"
              type="button"
              onClick={() => onNavigateTab('ballot')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Vote className="w-4 h-4" />
              <span>{isEn ? 'Go to Ballot' : 'ব্যালটে ফিরে যান'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }


  // In-app Notification Feedback State
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Delete Confirmation Modal State
  const [deleteModalData, setDeleteModalData] = useState<DeleteModalData | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteModalData) return;

    if (deleteModalData.type === 'candidate' && deleteModalData.category && deleteModalData.id) {
      onDeleteCandidate(deleteModalData.category, deleteModalData.id);
      showNotification(
        currentLang === 'en'
          ? `Candidate "${deleteModalData.itemName}" has been successfully deleted.`
          : `প্রার্থী "${deleteModalData.itemName}" সফলভাবে মুছে ফেলা হয়েছে।`,
        'success'
      );
    } else if (deleteModalData.type === 'voter' && deleteModalData.id) {
      onDeleteVoter(deleteModalData.id);
      showNotification(
        currentLang === 'en'
          ? `Voter "${deleteModalData.itemName}" has been removed from the registry.`
          : `ভোটার "${deleteModalData.itemName}" তালিকা থেকে সফলভাবে মুছে ফেলা হয়েছে।`,
        'success'
      );
    } else if (deleteModalData.type === 'committee-member' && deleteModalData.id) {
      onDeleteCommitteeMember(deleteModalData.id);
      showNotification(
        currentLang === 'en'
          ? `Committee member "${deleteModalData.itemName}" has been removed from Election Organizing Committee.`
          : `কমিটি সদস্য "${deleteModalData.itemName}" নির্বাচন পরিচালনা কমিটি থেকে মুছে ফেলা হয়েছে।`,
        'success'
      );
    } else if (deleteModalData.type === 'reset-data') {
      onResetElectionData();
      showNotification(
        currentLang === 'en'
          ? 'All election vote tallies and ballots have been successfully reset!'
          : 'সকল প্রদত্ত ভোট ও ব্যালট সফলভাবে রিসেট করা হয়েছে!',
        'success'
      );
    } else if (deleteModalData.type === 'role' && deleteModalData.id) {
      if (onDeleteRole) {
        onDeleteRole(deleteModalData.id);
      }
      showNotification(
        currentLang === 'en'
          ? `Role "${deleteModalData.itemName}" has been successfully deleted.`
          : `ভূমিকা "${deleteModalData.itemName}" সফলভাবে মুছে ফেলা হয়েছে।`,
        'success'
      );
    } else if (deleteModalData.type === 'reset-roles') {
      if (onResetRoles) {
        onResetRoles();
      }
      showNotification(
        currentLang === 'en'
          ? 'RBAC role configurations have been reset to factory defaults.'
          : 'আরব্যাক ভূমিকা কনফিগারেশন ফ্যাক্টরি ডিফল্টে রিসেট করা হয়েছে।',
        'success'
      );
    }

    setDeleteModalData(null);
  };

  // RBAC Role Management Modal State
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState<boolean>(false);
  const [editingRoleConfig, setEditingRoleConfig] = useState<RoleConfig | null>(null);

  const activeRoleKeys = Object.keys(activeRoles) as UserRole[];

  const handleOpenAddRole = () => {
    setEditingRoleConfig(null);
    setIsEditRoleModalOpen(true);
  };

  const handleOpenEditRole = (cfg: RoleConfig) => {
    setEditingRoleConfig(cfg);
    setIsEditRoleModalOpen(true);
  };

  const handleSaveRole = (role: RoleConfig) => {
    // Lock role assignment once saved by Super Admin
    const securedRole: RoleConfig = {
      ...role,
      isRoleLocked: true,
      assignedBy: 'Super Admin (admin)',
      assignedAt: role.assignedAt || new Date().toISOString(),
      lockReason: {
        en: "Role assigned and saved by Super Admin (admin). Policy prohibits altering this user's assigned role.",
        bn: "সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।"
      }
    };

    if (editingRoleConfig) {
      if (onUpdateRole) {
        onUpdateRole(securedRole);
      }
      showNotification(
        currentLang === 'en'
          ? `Role "${securedRole.badge.en}" has been saved. User role assignment is permanently locked by Super Admin.`
          : `ভূমিকা "${securedRole.badge.bn}" সংরক্ষিত হয়েছে। সুপার অ্যাডমিন দ্বারা ব্যবহারকারীর ভূমিকা স্থায়ীভাবে লক করা হয়েছে।`,
        'success'
      );
    } else {
      if (onAddRole) {
        onAddRole(securedRole);
      }
      showNotification(
        currentLang === 'en'
          ? `New role "${securedRole.badge.en}" assigned to ${securedRole.defaultUser.name.en} and permanently locked by Super Admin.`
          : `নতুন ভূমিকা "${securedRole.badge.bn}" নির্ধারিত এবং সুপার অ্যাডমিন দ্বারা স্থায়ীভাবে লক সহ সংরক্ষিত হয়েছে।`,
        'success'
      );
    }
  };

  const isRoleProtected = (roleKey: string) => {
    if (roleKey === 'admin') {
      const adminRoles = Object.values(activeRoles).filter(
        (r) => r.role === 'admin' || r.permissions.canViewAdminPanel
      );
      return adminRoles.length <= 1;
    }
    return false;
  };

  const handleDeleteRoleClick = (cfg: RoleConfig) => {
    if (cfg.isRoleLocked) {
      showNotification(
        currentLang === 'en'
          ? `Cannot change or delete role: The role "${cfg.badge.en}" assigned to ${cfg.defaultUser.name.en} has been assigned and saved by Super Admin (admin). Policy prohibits altering saved user roles.`
          : `ভূমিকা পরিবর্তন বা মুছে ফেলা যাবে না: "${cfg.badge.bn}" ভূমিকাটি ${cfg.defaultUser.name.bn}-কে সুপার অ্যাডমিন (admin) দ্বারা প্রদান ও সংরক্ষণ করা হয়েছে।`,
        'error'
      );
      return;
    }

    if (isRoleProtected(cfg.role)) {
      showNotification(
        currentLang === 'en'
          ? 'Cannot delete the primary administrative role as at least one admin role is required.'
          : 'প্রধান অ্যাডমিন ভূমিকা মুছে ফেলা যাবে না, কারণ সিস্টেমে অন্তত একজন অ্যাডমিন থাকা আবশ্যক।',
        'error'
      );
      return;
    }

    const roleName = currentLang === 'en' ? cfg.badge.en : cfg.badge.bn;
    const officerName = currentLang === 'en' ? cfg.defaultUser.name.en : cfg.defaultUser.name.bn;

    setDeleteModalData({
      type: 'role',
      id: cfg.role,
      title: currentLang === 'en' ? 'Delete Role from RBAC' : 'আরব্যাক থেকে ভূমিকা মুছে ফেলুন',
      description: currentLang === 'en'
        ? `Are you sure you want to delete the role "${roleName}" (${officerName})? Users assigned to this role will lose their custom permissions, and any active session using this role will revert to standard Admin.`
        : `আপনি কি নিশ্চিত যে "${roleName}" (${officerName}) ভূমিকাটি মুছে ফেলতে চান? এই ভূমিকায় থাকা পারমিশন মুছে যাবে।`,
      itemName: roleName,
      itemDetail: `${cfg.defaultUser.empId} • ${currentLang === 'en' ? cfg.defaultUser.roleTitle.en : cfg.defaultUser.roleTitle.bn}`,
      itemPhoto: cfg.defaultUser.avatar,
      itemBadge: roleName
    });
  };

  const handleResetRolesClick = () => {
    setDeleteModalData({
      type: 'reset-roles',
      title: currentLang === 'en' ? 'Reset All RBAC Roles to Factory Defaults' : 'সকল আরব্যাক ভূমিকা ফ্যাক্টরি ডিফল্টে রিসেট করুন',
      description: currentLang === 'en'
        ? 'Are you sure you want to reset all Role-Based Access Control (RBAC) configurations? All custom roles, modified permissions, and updated titles will be restored to the initial default settings.'
        : 'আপনি কি নিশ্চিত যে সমস্ত আরব্যাক কনফিগারেশন ফ্যাক্টরি ডিফল্টে রিসেট করতে চান? সকল কাস্টম রোল ও পরিবর্তিত পারমিশন প্রাথমিক ডিফল্টে ফিরে যাবে।',
      itemName: currentLang === 'en' ? 'All Custom RBAC Roles & Permissions' : 'সকল কাস্টম আরব্যাক ভূমিকা ও পারমিশন',
      itemBadge: currentLang === 'en' ? 'FACTORY RESET' : 'ফ্যাক্টরি রিসেট'
    });
  };

  // Committee Member Modal State
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState<boolean>(false);
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<CommitteeMember | null>(null);

  const handleOpenAddCommittee = () => {
    setEditingCommitteeMember(null);
    setIsCommitteeModalOpen(true);
  };

  const handleOpenEditCommittee = (member: CommitteeMember) => {
    setEditingCommitteeMember(member);
    setIsCommitteeModalOpen(true);
  };

  const handleSaveCommitteeMember = (member: CommitteeMember) => {
    if (editingCommitteeMember) {
      onUpdateCommitteeMember(member);
      showNotification(
        currentLang === 'en'
          ? `Committee member "${member.name.en}" successfully updated and saved.`
          : `কমিটি সদস্য "${member.name.bn}" সফলভাবে আপডেট ও সংরক্ষিত হয়েছে।`,
        'success'
      );
    } else {
      onAddCommitteeMember(member);
      showNotification(
        currentLang === 'en'
          ? `New member "${member.name.en}" successfully added and saved.`
          : `নতুন সদস্য "${member.name.bn}" সফলভাবে যুক্ত ও সংরক্ষিত হয়েছে।`,
        'success'
      );
    }
  };

  const handleDeleteCommitteeClick = (member: CommitteeMember) => {
    const name = currentLang === 'en' ? member.name.en : member.name.bn;
    const badge = currentLang === 'en' ? member.badge.en : member.badge.bn;
    const dept = currentLang === 'en' ? member.dept.en : member.dept.bn;
    setDeleteModalData({
      type: 'committee-member',
      id: member.id,
      title: currentLang === 'en' ? 'Remove Committee Member' : 'কমিটি সদস্য মুছে ফেলুন',
      description: currentLang === 'en'
        ? `Are you sure you want to remove ${name} (${badge}) from the Election Organizing Committee? This will update official certificates, seals, and compliance audit records.`
        : `আপনি কি নিশ্চিত যে ${name} (${badge})-কে নির্বাচন পরিচালনা কমিটি থেকে বাদ দিতে চান? এটি অফিশিয়াল সার্টিফিকেট ও নিরীক্ষা রেকর্ডে আপডেট হবে।`,
      itemName: name,
      itemDetail: `${dept} • ${badge}`,
      itemPhoto: member.img,
      itemBadge: badge
    });
  };

  // Admin Vote Modal State
  const [isAdminVoteModalOpen, setIsAdminVoteModalOpen] = useState<boolean>(false);
  const [adminVoteTargetVoterId, setAdminVoteTargetVoterId] = useState<string | null>(null);

  // Role-Based Control (RBC) & Multi-Role Governance View Mode
  const [rbcViewMode, setRbcViewMode] = useState<'list' | 'cards' | 'matrix'>('list');
  const [rbcSearchQuery, setRbcSearchQuery] = useState<string>('');
  const [rbcTierFilter, setRbcTierFilter] = useState<string>('all');
  const [isRbcMatrixExpanded, setIsRbcMatrixExpanded] = useState<boolean>(false);

  // Granular System Permissions (Click to Toggle) for Super Admin (admin) & Admin (system_admin)
  const [granularPermRoleFilter, setGranularPermRoleFilter] = useState<'both' | 'admin' | 'system_admin'>('both');
  const [granularPermSearch, setGranularPermSearch] = useState<string>('');
  const [isGranularPermSectionCollapsed, setIsGranularPermSectionCollapsed] = useState<boolean>(false);

  // Granular Polling System Security Policies
  const [electionPolicyAssistedBallot, setElectionPolicyAssistedBallot] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('pc_election_policy_assisted');
      return s !== null ? JSON.parse(s) : true;
    } catch {
      return true;
    }
  });

  const [electionPolicyStrictVerification, setElectionPolicyStrictVerification] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('pc_election_policy_strict_verify');
      return s !== null ? JSON.parse(s) : true;
    } catch {
      return true;
    }
  });

  const [electionPolicyAutoLock, setElectionPolicyAutoLock] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('pc_election_policy_autolock');
      return s !== null ? JSON.parse(s) : true;
    } catch {
      return true;
    }
  });

  const [electionPolicyLiveTurnoutFeed, setElectionPolicyLiveTurnoutFeed] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('pc_election_policy_live_turnout');
      return s !== null ? JSON.parse(s) : true;
    } catch {
      return true;
    }
  });

  const [isGranularElectionPoliciesOpen, setIsGranularElectionPoliciesOpen] = useState<boolean>(false);

  const toggleElectionPolicy = (policy: 'assisted' | 'strict' | 'autolock' | 'turnout') => {
    if (policy === 'assisted') {
      const next = !electionPolicyAssistedBallot;
      setElectionPolicyAssistedBallot(next);
      localStorage.setItem('pc_election_policy_assisted', JSON.stringify(next));
      showNotification(
        isEn
          ? `Presiding Officer Assisted Voting booth is now ${next ? 'ENABLED' : 'DISABLED'}.`
          : `প্রিসাইডিং অফিসার সহায়তামূলক ভোট বুথ এখন ${next ? 'সচল' : 'বন্ধ'}।`,
        'success'
      );
    } else if (policy === 'strict') {
      const next = !electionPolicyStrictVerification;
      setElectionPolicyStrictVerification(next);
      localStorage.setItem('pc_election_policy_strict_verify', JSON.stringify(next));
      showNotification(
        isEn
          ? `Strict Voter ID & Registry cross-verification is now ${next ? 'ENFORCED' : 'RELAXED'}.`
          : `কঠোর ভোটার আইডি ও তথ্য যাচাই এখন ${next ? 'বাধ্যতামূলক' : 'শিথিল'} করা হয়েছে।`,
        'success'
      );
    } else if (policy === 'autolock') {
      const next = !electionPolicyAutoLock;
      setElectionPolicyAutoLock(next);
      localStorage.setItem('pc_election_policy_autolock', JSON.stringify(next));
      showNotification(
        isEn
          ? `Instant Registry Lockout upon ballot deposit is now ${next ? 'ACTIVE' : 'INACTIVE'}.`
          : `ব্যালট গ্রহণের সাথে সাথে স্বয়ংক্রিয় ভোটার লক এখন ${next ? 'সক্রিয়' : 'নিষ্ক্রিয়'}।`,
        'success'
      );
    } else if (policy === 'turnout') {
      const next = !electionPolicyLiveTurnoutFeed;
      setElectionPolicyLiveTurnoutFeed(next);
      localStorage.setItem('pc_election_policy_live_turnout', JSON.stringify(next));
      showNotification(
        isEn
          ? `Real-time public turnout analytics streaming is now ${next ? 'LIVE' : 'MUTED'}.`
          : `পাবলিক ড্যাশবোর্ডে সরাসরি ভোটার উপস্থিতি স্ট্রিমিং ${next ? 'চালু' : 'স্থগিত'} করা হয়েছে।`,
        'success'
      );
    }
  };

  const handleQuickTogglePermission = (roleKey: string, permKey: keyof RolePermissions) => {
    const cfg = activeRoles[roleKey];
    if (!cfg) return;

    if (roleKey === 'admin' && permKey === 'canResetDatabase' && cfg.permissions.canResetDatabase) {
      showNotification(
        isEn
          ? 'Notice: Root Super Admin requires at least one role with Database Purge authority.'
          : 'সতর্কতা: রুট সুপার অ্যাডমিনের অন্তত একটি ভূমিকায় ডেটাবেস পারমিশন থাকা আবশ্যক।',
        'error'
      );
      return;
    }

    const updated: RoleConfig = {
      ...cfg,
      permissions: {
        ...cfg.permissions,
        [permKey]: !cfg.permissions[permKey]
      }
    };

    if (onUpdateRole) {
      onUpdateRole(updated);
      showNotification(
        isEn
          ? `Permission "${permKey}" toggled to ${updated.permissions[permKey] ? 'ALLOWED' : 'RESTRICTED'} for ${cfg.badge.en}.`
          : `${cfg.badge.bn}-এর জন্য "${permKey}" পারমিশন ${updated.permissions[permKey] ? 'অনুমোদিত' : 'সীমাবদ্ধ'} করা হয়েছে।`,
        'success'
      );
    }
  };

  const handleSelectRolePerspective = (role: UserRole) => {
    if (onSelectRole) {
      onSelectRole(role);
      const cfg = activeRoles[role] || ROLE_CONFIGS[role as UserRole];
      showNotification(
        isEn
          ? `Operational perspective switched to ${cfg?.badge?.en || role} (${cfg?.defaultUser?.name?.en || ''}).`
          : `সক্রিয় প্রশাসনিক ভূমিকা "${cfg?.badge?.bn || role}" (${cfg?.defaultUser?.name?.bn || ''})-এ সফলভাবে পরিবর্তিত হয়েছে।`,
        'success'
      );
    }
  };

  const handleBulkGrantRolePermissions = (targetRoleKey: 'admin' | 'system_admin') => {
    const cfg = activeRoles[targetRoleKey];
    if (!cfg) return;
    const allGranted: RolePermissions = {
      canVote: true,
      canViewDashboard: true,
      canViewAdminPanel: true,
      canManageCandidates: true,
      canManageVoterRegistry: true,
      canManageElectionStatus: true,
      canResetDatabase: true,
      canDownloadReports: true,
      canManageCommittee: true,
      canConductVpBallot: true
    };
    const updated: RoleConfig = {
      ...cfg,
      permissions: allGranted
    };
    if (onUpdateRole) {
      onUpdateRole(updated);
      showNotification(
        isEn
          ? `All 10 granular system permissions successfully GRANTED to ${cfg.badge.en}.`
          : `${cfg.badge.bn}-এর জন্য সকল ১০টি গ্র্যানুলার পারমিশন সফলভাবে অনুমোদিত করা হয়েছে।`,
        'success'
      );
    }
  };

  const handleResetRolePermissionsDefault = (targetRoleKey: 'admin' | 'system_admin') => {
    const defaultCfg = ROLE_CONFIGS[targetRoleKey];
    const currentCfg = activeRoles[targetRoleKey] || defaultCfg;
    if (!defaultCfg) return;
    const updated: RoleConfig = {
      ...currentCfg,
      permissions: { ...defaultCfg.permissions }
    };
    if (onUpdateRole) {
      onUpdateRole(updated);
      showNotification(
        isEn
          ? `Permissions for ${currentCfg.badge.en} restored to standard system defaults.`
          : `${currentCfg.badge.bn}-এর পারমিশন স্ট্যান্ডার্ড সিস্টেম ডিফল্টে ফিরিয়ে নেওয়া হয়েছে।`,
        'success'
      );
    }
  };

  const handleSyncAdminWithSuperAdmin = () => {
    const superAdminCfg = activeRoles['admin'];
    const adminCfg = activeRoles['system_admin'];
    if (!superAdminCfg || !adminCfg) return;
    const updated: RoleConfig = {
      ...adminCfg,
      permissions: { ...superAdminCfg.permissions }
    };
    if (onUpdateRole) {
      onUpdateRole(updated);
      showNotification(
        isEn
          ? 'All granular permissions from Super Admin (admin) successfully synchronized to Admin.'
          : 'সুপার অ্যাডমিনের (admin) সকল পারমিশন সফলভাবে অ্যাডমিনের সাথে সিঙ্ক করা হয়েছে।',
        'success'
      );
    }
  };

  // Candidate Form State
  const [candType, setCandType] = useState<PositionCategory>('vp');
  const [candId, setCandId] = useState<string>('');
  const [candNameEn, setCandNameEn] = useState<string>('');
  const [candNameBn, setCandNameBn] = useState<string>('');
  const [candDept, setCandDept] = useState<string>('');
  const [candImgUrl, setCandImgUrl] = useState<string>('');
  const [candPhotoPreview, setCandPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );

  // Voter Form State
  const [voterId, setVoterId] = useState<string>('');
  const [voterEmpId, setVoterEmpId] = useState<string>('');
  const [voterName, setVoterName] = useState<string>('');
  const [voterDesig, setVoterDesig] = useState<string>('');
  const [voterDoj, setVoterDoj] = useState<string>('');
  const [voterGender, setVoterGender] = useState<string>('');
  const [voterCategory, setVoterCategory] = useState<string>('');
  const [voterDept, setVoterDept] = useState<string>('');
  const [voterSec, setVoterSec] = useState<string>('');
  const [voterSubSec, setVoterSubSec] = useState<string>('');
  const [voterLineInfo, setVoterLineInfo] = useState<string>('');
  const [voterPhotoUrl, setVoterPhotoUrl] = useState<string>('');
  const [voterPhotoPreview, setVoterPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
  );

  // Search and Filter State for Voter Registry
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Handle Candidate Photo File Upload
  const handleCandPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCandPhotoPreview(base64);
      setCandImgUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleCandPhotoUrlChange = (url: string) => {
    setCandImgUrl(url);
    if (url.trim()) {
      setCandPhotoPreview(url.trim());
    }
  };

  // Handle Candidate Form Submit
  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate =
      vpCandidates.some((c) => c.id.toLowerCase() === candId.trim().toLowerCase()) ||
      ecCandidates.some((c) => c.id.toLowerCase() === candId.trim().toLowerCase());

    if (isDuplicate) {
      showNotification(
        currentLang === 'en' ? 'Candidate ID already exists!' : 'এই প্রার্থী আইডিটি ইতিমধ্যে বিদ্যমান আছে!',
        'error'
      );
      return;
    }

    const newCandidate: Candidate = {
      id: candId.trim(),
      nameEn: candNameEn.trim(),
      nameBn: candNameBn.trim(),
      deptEn: candDept.trim(),
      deptBn: candDept.trim(),
      votes: 0,
      category: candType,
      img: candPhotoPreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    onAddCandidate(newCandidate);
    showNotification(
      currentLang === 'en'
        ? `Candidate ${newCandidate.nameEn} added successfully.`
        : `প্রার্থী ${newCandidate.nameBn} সফলভাবে যুক্ত করা হয়েছে।`,
      'success'
    );

    // Reset Form
    setCandId('');
    setCandNameEn('');
    setCandNameBn('');
    setCandDept('');
    setCandImgUrl('');
    setCandPhotoPreview('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  };

  // Handle Voter Photo File Upload
  const handleVoterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setVoterPhotoPreview(base64);
      setVoterPhotoUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleVoterPhotoUrlChange = (url: string) => {
    setVoterPhotoUrl(url);
    if (url.trim()) {
      setVoterPhotoPreview(url.trim());
    }
  };

  // Handle Single Voter Registration Submit
  const handleVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = voterRegistry.some(
      (v) =>
        v.id.toLowerCase() === voterId.trim().toLowerCase() ||
        (v.empId && v.empId.toLowerCase() === voterEmpId.trim().toLowerCase())
    );

    if (isDuplicate) {
      showNotification(
        currentLang === 'en'
          ? 'Voter ID or Employee ID is already registered!'
          : 'এই ভোটার আইডি অথবা কর্মী আইডিটি ইতিমধ্যে নিবন্ধিত আছে!',
        'error'
      );
      return;
    }

    const newVoter: Voter = {
      id: voterId.trim(),
      empId: voterEmpId.trim(),
      name: voterName.trim(),
      desig: voterDesig.trim(),
      doj: voterDoj.trim() || undefined,
      gender: voterGender.trim() || undefined,
      empCategory: voterCategory.trim() || undefined,
      dept: voterDept.trim(),
      section: voterSec.trim(),
      subSection: voterSubSec.trim(),
      lineInfo: voterLineInfo.trim() || undefined,
      linkSent: true,
      status: 'Pending',
      photo: voterPhotoPreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    };

    onAddVoter(newVoter);
    showNotification(
      currentLang === 'en'
        ? `Voter ${newVoter.name} registered successfully.`
        : `ভোটার ${newVoter.name} সফলভাবে নিবন্ধিত হয়েছে।`,
      'success'
    );

    // Reset Form
    setVoterId('');
    setVoterEmpId('');
    setVoterName('');
    setVoterDesig('');
    setVoterDoj('');
    setVoterGender('');
    setVoterCategory('');
    setVoterDept('');
    setVoterSec('');
    setVoterSubSec('');
    setVoterLineInfo('');
    setVoterPhotoUrl('');
    setVoterPhotoPreview('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80');
  };

  // Handle Excel Upload
  const handleExcelFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelVoters(file);
      if (parsed.length === 0) {
        showNotification(
          currentLang === 'en' ? 'No valid voter rows found.' : 'ফাইলে কোনো ভোটার তথ্য পাওয়া যায়নি।',
          'error'
        );
        return;
      }
      onBulkImportVoters(parsed);
      showNotification(
        currentLang === 'en'
          ? `Successfully imported ${parsed.length} voters!`
          : `সফলভাবে ${toBanglaNum(parsed.length, currentLang)} জন ভোটার তালিকাভুক্ত হয়েছেন!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showNotification(
        currentLang === 'en' ? 'Failed to parse Excel file.' : 'এক্সেল ফাইল পড়তে সমস্যা হয়েছে।',
        'error'
      );
    }
  };

  // Filter voters
  const filteredVoters = voterRegistry.filter((v) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      v.name.toLowerCase().includes(query) ||
      v.id.toLowerCase().includes(query) ||
      (v.empId && v.empId.toLowerCase().includes(query)) ||
      (v.section && v.section.toLowerCase().includes(query)) ||
      (v.dept && v.dept.toLowerCase().includes(query)) ||
      (v.desig && v.desig.toLowerCase().includes(query)) ||
      (v.lineInfo && v.lineInfo.toLowerCase().includes(query)) ||
      (v.empCategory && v.empCategory.toLowerCase().includes(query));

    const matchesDept = !deptFilter || v.dept.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesStatus = !statusFilter || v.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* System Admin Access Banner */}
      {currentRole === 'system_admin' && (
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {isEn ? 'Admin Operational Management Mode' : 'অ্যাডমিন পরিচালনা মোড'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/40 text-blue-200 border border-blue-400/30">
                  {isEn ? 'Authorized Election Administrator' : 'অনুমোদিত নির্বাচন প্রশাসক'}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                {isEn
                  ? 'You are signed in as Farhana Yasmin (Admin). Authorized for operational election management: Candidate nomination & management, voter registry & single voter additions, presiding officer booth, 5-member committee management, results declaration, and official print center. System-wide permissions, role governance, audit logs, and election reset are restricted to Super Admin.'
                  : 'আপনি ফারহানা ইয়াসমিন (অ্যাডমিন) হিসেবে সাইন ইন করেছেন। অনুমোদিত মডিউল: প্রার্থী মনোনয়ন ও ব্যবস্থাপনা, ভোটার তালিকা ও নতুন ভোটার নিবন্ধন, প্রিজাইডিং বুথ, ৫ সদস্যের কমিটি, ফলাফল ঘোষণা ও অফিসিয়াল রিপোর্ট। সিস্টেম পারমিশন, রোল গভর্নেন্স, অডিট ট্রেইল ও ডেটাবেস রিসেট কেবল সুপার অ্যাডমিনের জন্য সংরক্ষিত।'}
              </p>
            </div>
          </div>
          {onOpenRoleModal && (
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="text-xs font-semibold px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs shrink-0 transition-colors cursor-pointer"
            >
              {isEn ? 'Switch Role' : 'ভূমিকা পরিবর্তন'}
            </button>
          )}
        </div>
      )}

      {/* Observer Access Banner */}
      {currentRole === 'observer' && (
        <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {isEn ? 'Independent Observer & Scrutiny Mode' : 'নিরপেক্ষ নির্বাচন পর্যবেক্ষণ ও নিরীক্ষা মোড'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                  {isEn ? 'Compliance Auditor' : 'কমপ্লায়েন্স নিরীক্ষক'}
                </span>
              </div>
              <p className="text-xs text-cyan-200 mt-1 leading-relaxed">
                {isEn
                  ? 'You are signed in as Advocate Anwar Hossain. Authorized for: Transparent voting booth observation, turnout tally verification, voter roster inspection, and certified report review. Data modifications are restricted.'
                  : 'আপনি অ্যাডভোকেট আনোয়ার হোসেন হিসেবে লগইন আছেন। অনুমতি: সরাসরি ভোটকেন্দ্র পর্যবেক্ষণ, ফলাফল ও ভোটার উপস্থিতি যাচাই এবং অফিসিয়াল রিপোর্ট পরিদর্শন। তথ্য পরিবর্তন বা মোছা নিষিদ্ধ।'}
              </p>
            </div>
          </div>
          {onOpenRoleModal && (
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="text-xs font-semibold px-3.5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl shadow-xs shrink-0 transition-colors cursor-pointer"
            >
              {isEn ? 'Switch Role' : 'ভূমিকা পরিবর্তন'}
            </button>
          )}
        </div>
      )}

      {/* EC Committee Oversight Access Banner */}
      {currentRole === 'ec_committee' && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {isEn ? 'EC Committee Oversight & Verification Mode' : 'নির্বাচন কমিশন তদারকি ও যাচাই মোড'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                  {isEn ? 'Authorized Presiding Officer' : 'অনুমোদিত প্রিজাইডিং অফিসার'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                {isEn
                  ? 'You are signed in as Md. Jahirul Islam. Authorized for: Voter verification, presiding manual ballot booth, audit inspection, and certified reports. Candidate modifications and database purges are restricted to Super Admin.'
                  : 'আপনি মো: জহিরুল ইসলাম হিসেবে লগইন আছেন। অনুমতি: ভোটার যাচাইকরণ, প্রিজাইডিং ব্যালট বুথ, অডিট ট্র্যাকিং এবং প্রত্যয়িত রিপোর্ট। প্রার্থী সম্পাদনা ও ডেটাবেস রিসেট কেবল সুপার অ্যাডমিনের জন্য সংরক্ষিত।'}
              </p>
            </div>
          </div>
          {onOpenRoleModal && (
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="text-xs font-semibold px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs shrink-0 transition-colors cursor-pointer"
            >
              {isEn ? 'Switch Role' : 'ভূমিকা পরিবর্তন'}
            </button>
          )}
        </div>
      )}

      {/* Admin Panel Top Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="admin-main-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentRole === 'ec_committee'
                ? (isEn ? 'Election Committee Oversight Portal' : 'নির্বাচন কমিশন তদারকি পোর্টাল')
                : currentRole === 'observer'
                ? (isEn ? 'Election Observer & Audit Portal' : 'নির্বাচন পর্যবেক্ষণ ও নিরীক্ষা পোর্টাল')
                : currentRole === 'admin'
                ? (isEn ? 'Super Admin Portal' : 'সুপার অ্যাডমিন পোর্টাল')
                : (isEn ? 'Admin Operations Portal' : 'অ্যাডমিন পরিচালনা পোর্টাল')}
            </h2>
            {currentRole === 'admin' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                <Crown className="w-3 h-3" />
                <span>Super Admin</span>
              </span>
            ) : currentRole === 'system_admin' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </span>
            ) : currentRole === 'observer' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                <Eye className="w-3 h-3" />
                <span>Observer</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldCheck className="w-3 h-3" />
                <span>EC Member</span>
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{t.adminSub}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reset Election Data - Only visible to roles with canResetDatabase permission */}
          {currentRoleConfig.permissions?.canResetDatabase && (
            <button
              id="btn-reset-election-data"
              type="button"
              onClick={() => {
                setDeleteModalData({
                  type: 'reset-data',
                  title: currentLang === 'en' ? 'Reset All Election Data?' : 'সকল নির্বাচন ডেটা রিসেট করবেন?',
                  description: currentLang === 'en'
                    ? 'Warning: This will reset all vote counts and ballots to 0, clear ballot logs, and set all registered voters back to Pending status. This cannot be undone.'
                    : 'সতর্কতা: এটি সকল ভোট সংখ্যা ০ তে রিসেট করবে, ব্যালট লগ মুছে দেবে এবং সকল নিবন্ধিত ভোটারের স্ট্যাটাস পেন্ডিং-এ ফিরিয়ে দেবে। এটি অপরিবর্তনীয়।',
                  itemName: currentLang === 'en' ? 'Election Tallies & Ballots Reset' : 'নির্বাচন ফলাফল ও ব্যালট রিসেট',
                  itemDetail: currentLang === 'en' ? 'Votes: 0 • Turnout: 0% • Ballots cleared' : 'ভোট: ০ • ভোটার উপস্থিতি: ০% • ব্যালট ক্লিয়ার',
                  itemBadge: currentLang === 'en' ? 'Destructive Action' : 'রিসেট অ্যাকশন'
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 cursor-pointer transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.btnResetElection}</span>
            </button>
          )}
          {/* Granular System Permissions Jump Button - Super Admin Only */}
          {currentRole === 'admin' && (
            <button
              id="btn-admin-open-granular-perms"
              type="button"
              onClick={() => {
                const el = document.getElementById('section-granular-permissions-control');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold rounded-xl border border-purple-200 transition-colors shadow-xs cursor-pointer"
              title={isEn ? 'Jump to Granular Permissions for Super Admin' : 'সুপার অ্যাডমিনের গ্র্যানুলার পারমিশনে যান'}
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              <span>{isEn ? 'Granular Permissions' : 'গ্র্যানুলার পারমিশন'}</span>
              <span className="bg-purple-200/80 text-purple-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {isEn ? 'Toggle & Roles' : 'টগল ও রোলস'}
              </span>
            </button>
          )}
          {/* Role-Based Control (RBC) Button - Super Admin Only */}
          {currentRole === 'admin' && (
            <button
              id="btn-admin-open-rbc"
              type="button"
              onClick={() => {
                const el = document.getElementById('section-admin-rbc-control');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else if (onOpenRoleModal) {
                  onOpenRoleModal();
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-200 transition-colors shadow-xs cursor-pointer"
              title={isEn ? 'Jump to Role-Based Control (RBC) settings' : 'ভূমিকাভিত্তিক নিয়ন্ত্রণ (RBC) সেটিংসে যান'}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{isEn ? 'Role-Based Control (RBC)' : 'ভূমিকা নিয়ন্ত্রণ (RBC)'}</span>
              <span className="bg-indigo-200/80 text-indigo-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                Super Admin
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Granular System Permissions (Click to Toggle) Dedicated Area for Super Admin (admin) */}
      {currentRole === 'admin' && (
      <div id="section-granular-permissions-control" className="bg-white border-2 border-indigo-200/90 rounded-2xl p-5 shadow-sm space-y-5 ring-4 ring-indigo-50/50">
        {/* Header with Title, Badges and Quick Select Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {isEn ? 'Granular System Permissions (Click to Toggle)' : 'গ্র্যানুলার সিস্টেম পারমিশন (ক্লিক করে টগল করুন)'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide">
                  Super Admin (admin)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                  Admin (system_admin)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isEn ? '10 System Permissions' : '১০টি সিস্টেম পারমিশন'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                {isEn
                  ? 'All 10 granular system capabilities available with instant click-to-toggle switches for Super Admin (admin) and Admin. Select either role as your active operational perspective with one click.'
                  : 'সুপার অ্যাডমিন (admin) ও অ্যাডমিনের জন্য সকল ১০টি গ্র্যানুলার সিস্টেম পারমিশন সরাসরি ক্লিক করে টগল করুন। যেকোনো ভূমিকাকে এক ক্লিকে সক্রিয় ভূমিকা হিসেবে নির্বাচন করুন।'}
              </p>
            </div>
          </div>

          {/* Quick Perspective Switching Bar */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <button
              id="btn-quick-select-superadmin-top"
              type="button"
              onClick={() => handleSelectRolePerspective('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs ${
                currentRole === 'admin'
                  ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
              title={isEn ? 'Select Super Admin (admin) as active role' : 'সুপার অ্যাডমিন (admin) হিসেবে ভূমিকা নির্বাচন করুন'}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{isEn ? 'Select Super Admin (admin)' : 'সুপার অ্যাডমিন (admin) নির্বাচন'}</span>
              {currentRole === 'admin' && <Check className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            <button
              id="btn-quick-select-admin-top"
              type="button"
              onClick={() => handleSelectRolePerspective('system_admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs ${
                currentRole === 'system_admin'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
              title={isEn ? 'Select Admin as active role' : 'অ্যাডমিন হিসেবে ভূমিকা নির্বাচন করুন'}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isEn ? 'Select Admin' : 'অ্যাডমিন নির্বাচন'}</span>
              {currentRole === 'system_admin' && <Check className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            <button
              id="btn-toggle-granular-section-collapse"
              type="button"
              onClick={() => setIsGranularPermSectionCollapsed(!isGranularPermSectionCollapsed)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
              title={isGranularPermSectionCollapsed ? (isEn ? 'Expand Section' : 'সেকশন খুলুন') : (isEn ? 'Collapse Section' : 'সেকশন ছোট করুন')}
            >
              {isGranularPermSectionCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isGranularPermSectionCollapsed && (
          <>
            {/* Dual Role Profile & Authority Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Super Admin (admin) */}
              {(() => {
                const superAdminCfg = activeRoles['admin'] || ROLE_CONFIGS['admin'];
                const superAdminPerms = superAdminCfg?.permissions || {};
                const grantedCount = Object.values(superAdminPerms).filter(Boolean).length;
                const totalCount = 10;
                const isCurrent = currentRole === 'admin';

                return (
                  <div
                    id="card-role-super-admin-perspective"
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-200 shadow-sm'
                        : 'border-slate-200/90 bg-slate-50/50 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={superAdminCfg?.defaultUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt="Super Admin"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-rose-300 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {isEn ? superAdminCfg?.defaultUser?.name.en : superAdminCfg?.defaultUser?.name.bn}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              {superAdminCfg?.defaultUser?.empId || 'EMP-ADM-001'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 truncate mt-0.5">
                            {isEn ? superAdminCfg?.defaultUser?.roleTitle.en : superAdminCfg?.defaultUser?.roleTitle.bn}
                          </div>
                          <div className="text-[11px] text-rose-700 font-semibold mt-0.5 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>Role: Super Admin (admin)</span>
                          </div>
                        </div>
                      </div>

                      {/* Select as Role Button or Active Indicator */}
                      <div>
                        {isCurrent ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-2xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isEn ? 'ACTIVE ROLE' : 'সক্রিয় ভূমিকা'}</span>
                          </div>
                        ) : (
                          <button
                            id="btn-select-role-super-admin"
                            type="button"
                            onClick={() => handleSelectRolePerspective('admin')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Select as Super Admin' : 'সুপার অ্যাডমিন সিলেক্ট'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Granted Count */}
                    <div className="mt-3 pt-3 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-700">
                          {isEn ? 'Super Admin Permissions:' : 'সুপার অ্যাডমিন পারমিশন:'}
                        </span>
                        <span className="font-mono font-bold text-rose-700">
                          {grantedCount}/{totalCount} {isEn ? 'Granted' : 'অনুমোদিত'} ({Math.round((grantedCount / totalCount) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-600 rounded-full transition-all duration-300"
                          style={{ width: `${(grantedCount / totalCount) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Bulk Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-200/60">
                      <button
                        id="btn-grant-all-super-admin"
                        type="button"
                        onClick={() => handleBulkGrantRolePermissions('admin')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                        title={isEn ? 'Grant all 10 system permissions to Super Admin' : 'সুপার অ্যাডমিনকে সকল ১০টি পারমিশন দিন'}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isEn ? 'Grant All (10)' : 'সব পারমিশন দিন (১০)'}</span>
                      </button>

                      <button
                        id="btn-reset-super-admin-defaults"
                        type="button"
                        onClick={() => handleResetRolePermissionsDefault('admin')}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        title={isEn ? 'Restore Super Admin default permissions' : 'সুপার অ্যাডমিন ডিফল্ট পারমিশন পুনরুদ্ধার'}
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>{isEn ? 'Reset Defaults' : 'ডিফল্ট রিসেট'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGranularPermRoleFilter(granularPermRoleFilter === 'admin' ? 'both' : 'admin')}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ml-auto ${
                          granularPermRoleFilter === 'admin'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        <span>{granularPermRoleFilter === 'admin' ? (isEn ? 'Show Both' : 'উভয়টি দেখান') : (isEn ? 'Filter Only' : 'ফিল্টার')}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Card 2: Admin (system_admin) */}
              {(() => {
                const adminCfg = activeRoles['system_admin'] || ROLE_CONFIGS['system_admin'];
                const adminPerms = adminCfg?.permissions || {};
                const grantedCount = Object.values(adminPerms).filter(Boolean).length;
                const totalCount = 10;
                const isCurrent = currentRole === 'system_admin';

                return (
                  <div
                    id="card-role-admin-perspective"
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-200 shadow-sm'
                        : 'border-slate-200/90 bg-slate-50/50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={adminCfg?.defaultUser?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'}
                          alt="Admin"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-blue-300 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {isEn ? adminCfg?.defaultUser?.name.en : adminCfg?.defaultUser?.name.bn}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {adminCfg?.defaultUser?.empId || 'EMP-ADM-012'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 truncate mt-0.5">
                            {isEn ? adminCfg?.defaultUser?.roleTitle.en : adminCfg?.defaultUser?.roleTitle.bn}
                          </div>
                          <div className="text-[11px] text-blue-700 font-semibold mt-0.5 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Role: Admin (system_admin)</span>
                          </div>
                        </div>
                      </div>

                      {/* Select as Role Button or Active Indicator */}
                      <div>
                        {isCurrent ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-2xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isEn ? 'ACTIVE ROLE' : 'সক্রিয় ভূমিকা'}</span>
                          </div>
                        ) : (
                          <button
                            id="btn-select-role-admin"
                            type="button"
                            onClick={() => handleSelectRolePerspective('system_admin')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Select as Admin' : 'অ্যাডমিন সিলেক্ট'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Granted Count */}
                    <div className="mt-3 pt-3 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-700">
                          {isEn ? 'Admin Permissions:' : 'অ্যাডমিন পারমিশন:'}
                        </span>
                        <span className="font-mono font-bold text-blue-700">
                          {grantedCount}/{totalCount} {isEn ? 'Granted' : 'অনুমোদিত'} ({Math.round((grantedCount / totalCount) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${(grantedCount / totalCount) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Bulk Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-200/60">
                      <button
                        id="btn-grant-all-admin"
                        type="button"
                        onClick={() => handleBulkGrantRolePermissions('system_admin')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                        title={isEn ? 'Grant all 10 system permissions to Admin' : 'অ্যাডমিনকে সকল ১০টি পারমিশন দিন'}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isEn ? 'Grant All (10)' : 'সব পারমিশন দিন (১০)'}</span>
                      </button>

                      <button
                        id="btn-sync-admin-with-super-admin"
                        type="button"
                        onClick={handleSyncAdminWithSuperAdmin}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg transition-colors cursor-pointer"
                        title={isEn ? 'Synchronize Admin permissions with Super Admin' : 'সুপার অ্যাডমিনের পারমিশন অনুযায়ী সিঙ্ক করুন'}
                      >
                        <RotateCcw className="w-3 h-3 text-indigo-600" />
                        <span>{isEn ? 'Sync from Super Admin' : 'সুপার অ্যাডমিন হতে সিঙ্ক'}</span>
                      </button>

                      <button
                        id="btn-reset-admin-defaults"
                        type="button"
                        onClick={() => handleResetRolePermissionsDefault('system_admin')}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        title={isEn ? 'Restore Admin default permissions' : 'অ্যাডমিন ডিফল্ট পারমিশন পুনরুদ্ধার'}
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>{isEn ? 'Reset' : 'ডিফল্ট'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGranularPermRoleFilter(granularPermRoleFilter === 'system_admin' ? 'both' : 'system_admin')}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ml-auto ${
                          granularPermRoleFilter === 'system_admin'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        <span>{granularPermRoleFilter === 'system_admin' ? (isEn ? 'Show Both' : 'উভয়টি দেখান') : (isEn ? 'Filter Only' : 'ফিল্টার')}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Filter Toolbar & Perspective Selection Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEn ? 'Role View & Toggle Mode:' : 'পারমিশন টগল মোড:'}</span>
                </span>
                <div className="inline-flex p-0.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setGranularPermRoleFilter('both')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      granularPermRoleFilter === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isEn ? 'Both Roles (Side-by-Side)' : 'উভয় ভূমিকা পাশাপাশি'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGranularPermRoleFilter('admin')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      granularPermRoleFilter === 'admin' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isEn ? 'Super Admin (admin)' : 'সুপার অ্যাডমিন'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGranularPermRoleFilter('system_admin')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      granularPermRoleFilter === 'system_admin' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isEn ? 'Admin (system_admin)' : 'অ্যাডমিন'}
                  </button>
                </div>
              </div>

              {/* Search permission box */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={granularPermSearch}
                  onChange={(e) => setGranularPermSearch(e.target.value)}
                  placeholder={isEn ? 'Search permission capability...' : 'পারমিশন খুঁজুন...'}
                  className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-slate-300 rounded-lg outline-hidden focus:border-indigo-500"
                />
                {granularPermSearch && (
                  <button
                    type="button"
                    onClick={() => setGranularPermSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* All 10 System Permissions List (Click to Toggle Area) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {isEn ? 'System Capability & Scope' : 'সিস্টেম পারমিশন ও পরিধি'}
                </span>
                <span className="font-semibold text-[11px] hidden sm:block">
                  {isEn ? 'Click switches below to toggle live permissions' : 'পারমিশন টগল করতে সরাসরি সুইচে ক্লিক করুন'}
                </span>
              </div>

              {(() => {
                const superAdminCfg = activeRoles['admin'] || ROLE_CONFIGS['admin'];
                const adminCfg = activeRoles['system_admin'] || ROLE_CONFIGS['system_admin'];

                const filtered = PERMISSION_DEFINITIONS.filter((p) => {
                  if (!granularPermSearch.trim()) return true;
                  const q = granularPermSearch.toLowerCase();
                  return (
                    p.key.toLowerCase().includes(q) ||
                    p.title.en.toLowerCase().includes(q) ||
                    p.title.bn.toLowerCase().includes(q) ||
                    p.desc.en.toLowerCase().includes(q) ||
                    p.desc.bn.toLowerCase().includes(q) ||
                    p.short.en.toLowerCase().includes(q) ||
                    p.short.bn.toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      {isEn ? 'No system permissions matched your search criteria.' : 'কোনো সিস্টেম পারমিশন খুঁজে পাওয়া যায়নি।'}
                    </div>
                  );
                }

                return filtered.map((perm, idx) => {
                  const isSuperAdminAllowed = !!superAdminCfg?.permissions[perm.key];
                  const isAdminAllowed = !!adminCfg?.permissions[perm.key];

                  return (
                    <div
                      key={perm.key}
                      id={`perm-toggle-row-${perm.key}`}
                      className="p-3.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:shadow-2xs"
                    >
                      {/* Left: Permission Info */}
                      <div className="flex items-start gap-3 min-w-0 max-w-xl">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-2xs mt-0.5">
                          <span>{perm.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.2 rounded-md">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {isEn ? perm.title.en : perm.title.bn}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-md">
                              {perm.key}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {isEn ? perm.desc.en : perm.desc.bn}
                          </p>
                        </div>
                      </div>

                      {/* Right: Click to Toggle Switches for Super Admin (admin) & Admin */}
                      <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                        {/* Super Admin (admin) Toggle Switch */}
                        {(granularPermRoleFilter === 'both' || granularPermRoleFilter === 'admin') && (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-rose-800 px-1">
                              <span>Super Admin (admin)</span>
                              <span>{isSuperAdminAllowed ? 'ON' : 'OFF'}</span>
                            </div>
                            <button
                              id={`toggle-super-admin-${perm.key}`}
                              type="button"
                              onClick={() => handleQuickTogglePermission('admin', perm.key)}
                              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                isSuperAdminAllowed
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              }`}
                              title={
                                isEn
                                  ? `Click to toggle "${perm.title.en}" for Super Admin (admin)`
                                  : `সুপার অ্যাডমিনের জন্য "${perm.title.bn}" টগল করতে ক্লিক করুন`
                              }
                            >
                              {/* Custom Interactive Switch Graphic */}
                              <div
                                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                                  isSuperAdminAllowed ? 'bg-emerald-600' : 'bg-slate-300'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform flex items-center justify-center text-[9px] font-bold ${
                                    isSuperAdminAllowed ? 'translate-x-4 text-emerald-700' : 'translate-x-0 text-slate-400'
                                  }`}
                                >
                                  {isSuperAdminAllowed ? <Check className="w-3 h-3" /> : '✕'}
                                </div>
                              </div>
                              <span className="min-w-[62px] text-left">
                                {isSuperAdminAllowed ? (isEn ? 'ALLOWED' : 'অনুমোদিত') : (isEn ? 'RESTRICTED' : 'সীমাবদ্ধ')}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Admin (system_admin) Toggle Switch */}
                        {(granularPermRoleFilter === 'both' || granularPermRoleFilter === 'system_admin') && (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 px-1">
                              <span>Admin</span>
                              <span>{isAdminAllowed ? 'ON' : 'OFF'}</span>
                            </div>
                            <button
                              id={`toggle-admin-${perm.key}`}
                              type="button"
                              onClick={() => handleQuickTogglePermission('system_admin', perm.key)}
                              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                isAdminAllowed
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                              }`}
                              title={
                                isEn
                                  ? `Click to toggle "${perm.title.en}" for Admin`
                                  : `অ্যাডমিনের জন্য "${perm.title.bn}" টগল করতে ক্লিক করুন`
                              }
                            >
                              {/* Custom Interactive Switch Graphic */}
                              <div
                                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                                  isAdminAllowed ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform flex items-center justify-center text-[9px] font-bold ${
                                    isAdminAllowed ? 'translate-x-4 text-blue-700' : 'translate-x-0 text-slate-400'
                                  }`}
                                >
                                  {isAdminAllowed ? <Check className="w-3 h-3" /> : '✕'}
                                </div>
                              </div>
                              <span className="min-w-[62px] text-left">
                                {isAdminAllowed ? (isEn ? 'ALLOWED' : 'অনুমোদিত') : (isEn ? 'RESTRICTED' : 'সীমাবদ্ধ')}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Parity Status Badge */}
                        <div className="hidden xl:flex items-center text-[10px] font-semibold px-2 py-1 rounded-md border shrink-0">
                          {isSuperAdminAllowed && isAdminAllowed ? (
                            <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-1.5 py-0.5 rounded">
                              {isEn ? 'Full Parity' : 'উভয়ের অধিকার'}
                            </span>
                          ) : isSuperAdminAllowed && !isAdminAllowed ? (
                            <span className="text-amber-700 bg-amber-50 border-amber-200 px-1.5 py-0.5 rounded">
                              {isEn ? 'Super Admin Only' : 'কেবল সুপার অ্যাডমিন'}
                            </span>
                          ) : !isSuperAdminAllowed && isAdminAllowed ? (
                            <span className="text-blue-700 bg-blue-50 border-blue-200 px-1.5 py-0.5 rounded">
                              {isEn ? 'Admin Only' : 'কেবল অ্যাডমিন'}
                            </span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 border-slate-200 px-1.5 py-0.5 rounded">
                              {isEn ? 'Both Restricted' : 'সবার জন্য বন্ধ'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </>
        )}
      </div>
      )}

      {/* Role-Based Control (RBC) & Multi-Role Access Management - Super Admin Only */}
      {currentRole === 'admin' && (
      <div id="section-admin-rbc-control" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base">
                  {isEn ? 'Role-Based Control (RBC) & Multi-Role Governance' : 'ভূমিকাভিত্তিক নিয়ন্ত্রণ (RBC) ও পারমিশন গভর্ন্যান্স'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wide">
                  {isEn ? 'RBAC Access Tiers' : 'ভূমিকাভিত্তিক স্তরসমূহ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn
                  ? 'Centralized control over operational roles, authorized navigation menus, presiding booth privileges, and database management.'
                  : 'প্রশাসনিক ভূমিকা, অনুমোদিত মেনু, প্রিজাইডিং বুথ ও ডেটাবেস পারমিশনের কেন্দ্রীয় নিয়ন্ত্রণ।'}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <button
              id="btn-add-new-rbac-role"
              type="button"
              onClick={handleOpenAddRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? 'Add Role' : 'নতুন ভূমিকা'}</span>
            </button>
            <button
              id="btn-reset-rbac-roles"
              type="button"
              onClick={handleResetRolesClick}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title={isEn ? 'Reset RBAC roles to factory defaults' : 'ফ্যাক্টরি ডিফল্টে রিসেট করুন'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEn ? 'Defaults' : 'ডিফল্ট'}</span>
            </button>
            {onOpenRoleModal && (
              <button
                type="button"
                onClick={onOpenRoleModal}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {isEn ? 'Modal View' : 'মডেল ভিউ'}
              </button>
            )}
            <button
              id="btn-toggle-rbc-matrix"
              type="button"
              onClick={() => setIsRbcMatrixExpanded(!isRbcMatrixExpanded)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>{isRbcMatrixExpanded ? (isEn ? 'Hide Matrix' : 'ম্যাট্রিক্স লুকান') : (isEn ? 'Matrix' : 'পারমিশন ম্যাট্রিক্স')}</span>
              {isRbcMatrixExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Super Admin Immutable Role Policy Notice Banner */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-slate-50 border border-amber-200/90 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-950 flex items-center gap-2">
                <span>{isEn ? 'Role Assignment Immutability Policy Active' : 'ভূমিকা নির্ধারণ অপরিবর্তনীয় নীতিমালা সক্রিয়'}</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wide">
                  {isEn ? 'Locked Assignment' : 'লকড অ্যাসাইনমেন্ট'}
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                {isEn
                  ? "Strict Governance: Any role assigned and saved by Super Admin (admin) is permanent. The user's role assignment cannot be altered, reassigned, or deleted."
                  : "কঠোর নিরাপত্তা নীতি: সুপার অ্যাডমিন (admin) কর্তৃক একবার কোনো ব্যবহারকারীর ভূমিকা নির্ধারিত ও সংরক্ষিত হলে, উক্ত ব্যবহারকারীর ভূমিকা আর পরিবর্তন বা মুছে ফেলা যাবে না।"}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded-lg shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>{isEn ? 'Immutable Security' : 'স্থায়ী নিরাপত্তা'}</span>
          </span>
        </div>

        {/* Governance Metrics & Status Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
              {activeRoleKeys.length}
            </div>
            <div>
              <div className="font-bold text-slate-800">
                {isEn ? 'Active System Roles' : 'সক্রিয় প্রশাসনিক ভূমিকা'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isEn ? '5 Core Tiers • 10 System Permissions' : '৫টি মূল স্তর • ১০টি সিস্টেম পারমিশন'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <img
              src={activeRoles[currentRole]?.defaultUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-indigo-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 truncate">
                  {isEn ? activeRoles[currentRole]?.defaultUser?.name.en : activeRoles[currentRole]?.defaultUser?.name.bn}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white">
                  {isEn ? 'ACTIVE' : 'সক্রিয়'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {isEn ? activeRoles[currentRole]?.badge.en : activeRoles[currentRole]?.badge.bn} ({currentRole})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:justify-end">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-slate-700 text-[11px]">
                {isEn ? 'Election Bylaw Security' : 'নির্বাচন বিধিমালা নিরাপত্তা'}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{isEn ? 'EPZ Labour Act 2019 & Rules 2022' : 'ইপিজেড শ্রম আইন ২০১৯ ও বিধি ২০২২ অনুবর্তী'}</span>
              </div>
            </div>
            <a
              href="#section-admin-reports"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEn ? 'Reports' : 'রিপোর্ট'}</span>
            </a>
          </div>
        </div>

        {/* View Mode Switcher, Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* View Mode Switcher */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              id="btn-rbc-view-list"
              type="button"
              onClick={() => setRbcViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rbcViewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{isEn ? 'Role List (Table)' : 'ভূমিকা তালিকা (টেবিল)'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${rbcViewMode === 'list' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                {activeRoleKeys.length}
              </span>
            </button>

            <button
              id="btn-rbc-view-cards"
              type="button"
              onClick={() => setRbcViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rbcViewMode === 'cards'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isEn ? 'Role Cards' : 'ভূমিকা কার্ডস'}</span>
            </button>

            <button
              id="btn-rbc-view-matrix"
              type="button"
              onClick={() => setRbcViewMode('matrix')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rbcViewMode === 'matrix'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEn ? 'Granular Matrix' : 'পারমিশন ম্যাট্রিক্স'}</span>
            </button>
          </div>

          {/* Search & Tier Filters */}
          <div className="flex items-center flex-wrap gap-2 grow md:justify-end">
            <div className="relative min-w-[200px] grow sm:grow-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-rbc-search"
                type="text"
                value={rbcSearchQuery}
                onChange={(e) => setRbcSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search role, officer, or ID...' : 'ভূমিকা বা কর্মকর্তার নাম দিয়ে খুঁজুন...'}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:bg-white focus:border-indigo-500 transition-colors"
              />
              {rbcSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRbcSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              id="select-rbc-tier-filter"
              value={rbcTierFilter}
              onChange={(e) => setRbcTierFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-hidden focus:border-indigo-500 font-medium"
            >
              <option value="all">{isEn ? 'All Tiers' : 'সকল স্তর'}</option>
              <option value="admin">{isEn ? 'Admin Tiers (T1 & T2)' : 'অ্যাডমিন স্তর'}</option>
              <option value="observer">{isEn ? 'Observer (T3)' : 'নিরীক্ষক (T3)'}</option>
              <option value="ec_committee">{isEn ? 'EC Commission (T4)' : 'নির্বাচন কমিশন (T4)'}</option>
              <option value="voter">{isEn ? 'Electorate (T5)' : 'সাধারণ ভোটার (T5)'}</option>
              <option value="custom">{isEn ? 'Custom Roles' : 'কাস্টম রোল'}</option>
            </select>
          </div>
        </div>

        {/* View 1: Detailed Role List (Table View) */}
        {rbcViewMode === 'list' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3.5 min-w-[180px]">{isEn ? 'Role & System Tier' : 'ভূমিকা ও সিস্টেম স্তর'}</th>
                    <th className="py-3 px-3.5 min-w-[190px]">{isEn ? 'Assigned Officer / User' : 'দায়িত্বপ্রাপ্ত কর্মকর্তা'}</th>
                    <th className="py-3 px-3 min-w-[160px]">{isEn ? 'Authorized Menus' : 'অনুমোদিত মেনু'}</th>
                    <th className="py-3 px-3 min-w-[280px]">{isEn ? 'Granular System Permissions (Click to Toggle)' : 'গ্র্যানুলার পারমিশন (ক্লিক করে পরিবর্তন)'}</th>
                    <th className="py-3 px-3.5 text-right min-w-[140px]">{isEn ? 'Status & Action' : 'অবস্থা ও নিয়ন্ত্রণ'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeRoleKeys
                    .filter((roleKey) => {
                      // Admin (system_admin) cannot see Super Admin (admin)'s menu or role
                      if (currentRole === 'system_admin' && roleKey === 'admin') return false;

                      const cfg = activeRoles[roleKey];
                      if (!cfg) return false;
                      const user = cfg.defaultUser;
                      const q = rbcSearchQuery.trim().toLowerCase();

                      if (rbcTierFilter !== 'all') {
                        if (rbcTierFilter === 'admin' && roleKey !== 'admin' && roleKey !== 'system_admin') return false;
                        if (rbcTierFilter === 'observer' && roleKey !== 'observer') return false;
                        if (rbcTierFilter === 'ec_committee' && roleKey !== 'ec_committee') return false;
                        if (rbcTierFilter === 'voter' && roleKey !== 'voter') return false;
                        if (rbcTierFilter === 'custom' && ['admin', 'system_admin', 'observer', 'ec_committee', 'voter'].includes(roleKey)) return false;
                      }

                      if (!q) return true;
                      return (
                        roleKey.toLowerCase().includes(q) ||
                        cfg.badge.en.toLowerCase().includes(q) ||
                        cfg.badge.bn.toLowerCase().includes(q) ||
                        user.name.en.toLowerCase().includes(q) ||
                        user.name.bn.toLowerCase().includes(q) ||
                        (user.empId && user.empId.toLowerCase().includes(q)) ||
                        user.roleTitle.en.toLowerCase().includes(q) ||
                        user.roleTitle.bn.toLowerCase().includes(q)
                      );
                    })
                    .map((roleKey) => {
                      const cfg = activeRoles[roleKey] || ROLE_CONFIGS.admin;
                      const isCurrent = currentRole === roleKey;
                      const user = cfg.defaultUser;
                      const tierInfo = getRoleTierBadge(roleKey);
                      const isProtected = isRoleProtected(roleKey);

                      const grantedCount = Object.values(cfg.permissions).filter(Boolean).length;
                      const totalCount = Object.keys(cfg.permissions).length;

                      return (
                        <tr
                          key={roleKey}
                          id={`rbc-role-list-row-${roleKey}`}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isCurrent ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {/* Column 1: Role & System Tier */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${cfg.badge.bg} ${cfg.badge.color} ${cfg.badge.border}`}>
                                  {isEn ? cfg.badge.en : cfg.badge.bn}
                                </span>
                                {cfg.isRoleLocked && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                                    title={isEn ? "Role assigned and saved by Super Admin (admin). Role assignment cannot be altered." : "সুপার অ্যাডমিন কর্তৃক নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর ভূমিকা পরিবর্তন নিষিদ্ধ।"}
                                  >
                                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                                    <span>{isEn ? 'Locked' : 'লকড'}</span>
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>{isEn ? 'ACTIVE' : 'সক্রিয়'}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm border ${tierInfo.color}`}>
                                  {tierInfo.tier}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-700">
                                  {isEn ? tierInfo.titleEn : tierInfo.titleBn}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                id: <span className="font-semibold text-slate-600">{roleKey}</span>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Assigned Officer Profile */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="flex items-start gap-2.5">
                              <img
                                src={user.avatar}
                                alt={isEn ? user.name.en : user.name.bn}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs mt-0.5"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate text-xs">
                                  {isEn ? user.name.en : user.name.bn}
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium truncate">
                                  {isEn ? user.roleTitle.en : user.roleTitle.bn}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                    {user.empId || 'SYS-ID'}
                                  </span>
                                  {user.dept && (
                                    <span className="truncate">
                                      • {isEn ? user.dept.en : user.dept.bn}
                                    </span>
                                  )}
                                  {(cfg.credentials?.username || user.username) && (
                                    <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 font-semibold" title={isEn ? "Officer Login User ID" : "কর্মকর্তা লগইন ইউজার আইডি"}>
                                      ID: @{cfg.credentials?.username || user.username}
                                    </span>
                                  )}
                                </div>
                                {cfg.isRoleLocked && (
                                  <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 font-semibold">
                                    <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                    <span>{isEn ? 'Locked by Super Admin' : 'সুপার অ্যাডমিন দ্বারা লকড'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Column 3: Authorized Menus */}
                          <td className="py-3 px-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {(['ballot', 'vp_ballot', 'dashboard', 'admin'] as NavigationTab[]).map((tabKey) => {
                                const isAllowed = cfg.allowedTabs.includes(tabKey);
                                const tabLabels: Record<NavigationTab, { en: string; bn: string }> = {
                                  ballot: { en: 'EC Ballot', bn: 'ইসি ব্যালট' },
                                  vp_ballot: { en: 'VP Ballot', bn: 'ভিপি ব্যালট' },
                                  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
                                  admin: { en: 'Admin Panel', bn: 'অ্যাডমিন বুথ' }
                                };
                                return (
                                  <span
                                    key={tabKey}
                                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${
                                      isAllowed
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                                    }`}
                                  >
                                    {isEn ? tabLabels[tabKey].en : tabLabels[tabKey].bn}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Column 4: Granular System Permissions */}
                          <td className="py-3 px-3 align-top">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                                  grantedCount >= 9
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : grantedCount >= 5
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {grantedCount}/{totalCount} {isEn ? 'Granted' : 'অনুমোদিত'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {isEn ? 'Click chip to toggle' : 'টগল করতে ক্লিক করুন'}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {PERMISSION_DEFINITIONS.map((perm) => {
                                  const isAllowed = cfg.permissions[perm.key];
                                  return (
                                    <button
                                      key={perm.key}
                                      type="button"
                                      onClick={() => handleQuickTogglePermission(roleKey, perm.key)}
                                      title={`${isEn ? perm.title.en : perm.title.bn}: ${isAllowed ? (isEn ? 'Granted' : 'অনুমোদিত') : (isEn ? 'Restricted' : 'সীমাবদ্ধ')} - ${isEn ? perm.desc.en : perm.desc.bn}`}
                                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm border transition-all cursor-pointer ${
                                        isAllowed
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-2xs'
                                          : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                                      }`}
                                    >
                                      <span className="text-[10px]">{perm.icon}</span>
                                      <span>{isEn ? perm.short.en : perm.short.bn}</span>
                                      {isAllowed ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                      ) : (
                                        <span className="text-[9px] text-slate-400">✗</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </td>

                          {/* Column 5: Status & Controls */}
                          <td className="py-3 px-3.5 align-top text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              {isCurrent ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{isEn ? 'Active Session' : 'বর্তমান সেশন'}</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onSelectRole) {
                                      onSelectRole(roleKey);
                                      showNotification(
                                        isEn
                                          ? `Operational perspective switched to ${cfg.badge.en} (${user.name.en})`
                                          : `সক্রিয় ভূমিকা "${cfg.badge.bn}" (${user.name.bn})-এ পরিবর্তিত হয়েছে`,
                                        'success'
                                      );
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                                >
                                  <KeyRound className="w-3 h-3" />
                                  <span>{isEn ? 'Activate' : 'সক্রিয় করুন'}</span>
                                </button>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditRole(cfg)}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-colors cursor-pointer"
                                  title={isEn ? 'Configure role permissions' : 'ভূমিকার পারমিশন কনফিগার করুন'}
                                >
                                  <Edit3 className="w-3 h-3 text-slate-600" />
                                  <span>{isEn ? 'Configure' : 'এডিট'}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isProtected || Boolean(cfg.isRoleLocked)}
                                  onClick={() => handleDeleteRoleClick(cfg)}
                                  className={`p-1 rounded-md transition-colors ${
                                    isProtected || cfg.isRoleLocked
                                      ? 'text-slate-300 cursor-not-allowed opacity-50'
                                      : 'text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer'
                                  }`}
                                  title={
                                    cfg.isRoleLocked
                                      ? (isEn ? 'Role was assigned and saved by Super Admin and cannot be deleted' : 'সুপার অ্যাডমিন দ্বারা সংরক্ষিত ভূমিকা মুছে ফেলা যাবে না')
                                      : isProtected
                                      ? (isEn ? 'Primary role is protected' : 'মূল ভূমিকা সুরক্ষিত')
                                      : (isEn ? 'Delete role' : 'ভূমিকা মুছে ফেলুন')
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 2: Dynamic Role Cards Grid */}
        {rbcViewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRoleKeys
              .filter((roleKey) => {
                // Admin (system_admin) cannot see Super Admin (admin)'s menu or role
                if (currentRole === 'system_admin' && roleKey === 'admin') return false;

                const cfg = activeRoles[roleKey];
                if (!cfg) return false;
                const user = cfg.defaultUser;
                const q = rbcSearchQuery.trim().toLowerCase();

                if (rbcTierFilter !== 'all') {
                  if (rbcTierFilter === 'admin' && roleKey !== 'admin' && roleKey !== 'system_admin') return false;
                  if (rbcTierFilter === 'observer' && roleKey !== 'observer') return false;
                  if (rbcTierFilter === 'ec_committee' && roleKey !== 'ec_committee') return false;
                  if (rbcTierFilter === 'voter' && roleKey !== 'voter') return false;
                  if (rbcTierFilter === 'custom' && ['admin', 'system_admin', 'observer', 'ec_committee', 'voter'].includes(roleKey)) return false;
                }

                if (!q) return true;
                return (
                  roleKey.toLowerCase().includes(q) ||
                  cfg.badge.en.toLowerCase().includes(q) ||
                  cfg.badge.bn.toLowerCase().includes(q) ||
                  user.name.en.toLowerCase().includes(q) ||
                  user.name.bn.toLowerCase().includes(q) ||
                  (user.empId && user.empId.toLowerCase().includes(q))
                );
              })
              .map((roleKey) => {
                const cfg = activeRoles[roleKey] || ROLE_CONFIGS.admin;
                const isCurrent = currentRole === roleKey;
                const user = cfg.defaultUser;
                const isProtected = isRoleProtected(roleKey);
                const tierInfo = getRoleTierBadge(roleKey);

                return (
                  <div
                    key={roleKey}
                    id={`admin-rbc-card-${roleKey}`}
                    className={`relative rounded-xl p-4 transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-2 border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/10'
                        : 'border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top user badge & actions row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={user.avatar}
                            alt={isEn ? user.name.en : user.name.bn}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {isEn ? user.name.en : user.name.bn}
                            </h4>
                            <div className="flex items-center gap-1 flex-wrap mt-0.5">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge.bg} ${cfg.badge.color} ${cfg.badge.border}`}>
                                {isEn ? cfg.badge.en : cfg.badge.bn}
                              </span>
                              {cfg.isRoleLocked && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                                  title={isEn ? "Role assigned and saved by Super Admin (admin)" : "সুপার অ্যাডমিন কর্তৃক নির্ধারিত ও সংরক্ষিত"}
                                >
                                  <Lock className="w-2.5 h-2.5 text-amber-600" />
                                  <span>{isEn ? 'Locked' : 'লকড'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 mr-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {isEn ? 'ACTIVE' : 'সক্রিয়'}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditRole(cfg)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title={isEn ? 'Edit role configuration' : 'ভূমিকা কনফিগারেশন সম্পাদনা করুন'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isProtected || Boolean(cfg.isRoleLocked)}
                            onClick={() => handleDeleteRoleClick(cfg)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isProtected || cfg.isRoleLocked
                                ? 'text-slate-300 cursor-not-allowed opacity-50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                            title={
                              cfg.isRoleLocked
                                ? (isEn ? 'Role was assigned and saved by Super Admin and cannot be deleted' : 'সুপার অ্যাডমিন দ্বারা সংরক্ষিত ভূমিকা মুছে ফেলা যাবে না')
                                : isProtected
                                ? (isEn ? 'Primary admin role is protected and cannot be deleted' : 'প্রধান অ্যাডমিন ভূমিকা মুছে ফেলা যাবে না')
                                : (isEn ? 'Delete this role' : 'এই ভূমিকাটি মুছে ফেলুন')
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Tier & Designation details */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-semibold text-[11px]">{isEn ? user.roleTitle.en : user.roleTitle.bn}</span>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {user.empId || 'SYS-ID'}
                          </span>
                        </div>
                        {user.dept && (
                          <div className="text-[11px] text-slate-500 truncate">
                            {isEn ? user.dept.en : user.dept.bn}
                          </div>
                        )}
                        {(cfg.credentials?.username || user.username) && (
                          <div className="flex items-center justify-between text-[10px] bg-indigo-50/70 border border-indigo-100 px-2 py-0.8 rounded-md">
                            <span className="text-slate-500 font-medium">{isEn ? 'Login User ID:' : 'লগইন আইডি:'}</span>
                            <span className="font-mono font-bold text-indigo-700">@{cfg.credentials?.username || user.username}</span>
                          </div>
                        )}
                        <div className="pt-0.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${tierInfo.color}`}>
                            {tierInfo.tier}: {isEn ? tierInfo.titleEn : tierInfo.titleBn}
                          </span>
                        </div>
                      </div>

                      {/* Authorized Menus */}
                      <div className="space-y-1 pt-1 border-t border-slate-200/60">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {isEn ? 'Authorized Menus' : 'অনুমোদিত মেনু'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(['ballot', 'vp_ballot', 'dashboard', 'admin'] as NavigationTab[]).map((tabKey) => {
                            const isAllowed = cfg.allowedTabs.includes(tabKey);
                            const tabLabels: Record<NavigationTab, { en: string; bn: string }> = {
                              ballot: { en: 'EC Ballot', bn: 'ইসি ব্যালট' },
                              vp_ballot: { en: 'VP Ballot', bn: 'ভিপি ব্যালট' },
                              dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
                              admin: { en: 'Admin Panel', bn: 'অ্যাডমিন বুথ' }
                            };
                            return (
                              <span
                                key={tabKey}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                  isAllowed
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                                }`}
                              >
                                {isEn ? tabLabels[tabKey].en : tabLabels[tabKey].bn}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Granular Permissions Chips */}
                      <div className="space-y-1 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>{isEn ? 'System Permissions' : 'সিস্টেম পারমিশন'}</span>
                          <span className="text-slate-500 font-mono">
                            {Object.values(cfg.permissions).filter(Boolean).length}/{Object.keys(cfg.permissions).length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {PERMISSION_DEFINITIONS.map((p) => {
                            const isAllowed = cfg.permissions[p.key];
                            return (
                              <button
                                key={p.key}
                                type="button"
                                onClick={() => handleQuickTogglePermission(roleKey, p.key)}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                                  isAllowed
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                                    : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                                }`}
                                title={`${isEn ? p.title.en : p.title.bn}: ${isAllowed ? 'Allowed' : 'Restricted'}`}
                              >
                                {p.icon} {isEn ? p.short.en : p.short.bn}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Role Switch / Activation Button */}
                    <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectRole) {
                            onSelectRole(roleKey);
                            showNotification(
                              isEn
                                ? `Operational perspective switched to ${cfg.badge.en} (${user.name.en})`
                                : `সক্রিয় ভূমিকা "${cfg.badge.bn}" (${user.name.bn})-এ পরিবর্তিত হয়েছে`,
                              'success'
                            );
                          }
                        }}
                        disabled={isCurrent}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white cursor-default shadow-xs'
                            : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 shadow-2xs cursor-pointer'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Current Active Session' : 'বর্তমান সক্রিয় সেশন'}</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Switch to this Role' : 'এই ভূমিকায় পরিবর্তন করুন'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* View 3: Granular Permissions Matrix Table */}
        {rbcViewMode === 'matrix' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-2">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>{isEn ? 'Granular System Permissions Matrix' : 'গ্র্যানুলার সিস্টেম পারমিশন ম্যাট্রিক্স'}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {isEn ? 'Click any cell to toggle permissions on the fly.' : 'সরাসরি পারমিশন অন/অফ করতে সেলে ক্লিক করুন।'}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-bold uppercase">
                    <th className="py-2.5 px-3.5 min-w-[220px]">{isEn ? 'Permission Capability' : 'পারমিশন সক্ষমতা'}</th>
                    {activeRoleKeys.map((key) => {
                      const cfg = activeRoles[key];
                      return (
                        <th key={key} className="py-2.5 px-3 text-center min-w-[110px]">
                          <div className="font-bold text-slate-800">{isEn ? cfg.badge.en : cfg.badge.bn}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-normal">({key})</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {PERMISSION_DEFINITIONS.map((perm) => (
                    <tr key={perm.key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{perm.icon}</span>
                          <span>{isEn ? perm.title.en : perm.title.bn}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pl-6">
                          {isEn ? perm.desc.en : perm.desc.bn}
                        </div>
                      </td>
                      {activeRoleKeys.map((roleKey) => {
                        const cfg = activeRoles[roleKey];
                        const hasPerm = cfg.permissions[perm.key];
                        return (
                          <td key={roleKey} className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleQuickTogglePermission(roleKey, perm.key)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                hasPerm
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200 opacity-60'
                              }`}
                              title={`${isEn ? cfg.badge.en : cfg.badge.bn} - ${isEn ? perm.title.en : perm.title.bn}`}
                            >
                              {hasPerm ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{isEn ? 'Granted' : 'অনুমোদিত'}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[10px]">✗</span>
                                  <span>{isEn ? 'Restricted' : 'সীমাবদ্ধ'}</span>
                                </>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Official Election Reports & Print Documentation */}
      <div id="section-admin-reports" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base">
                  {isEn ? 'Official Election Reports & Print Center' : 'অফিসিয়াল প্রতিবেদন ও প্রিন্ট সেন্টার'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                  {isEn ? 'Official Records' : 'প্রিন্টযোগ্য রেকর্ড'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn
                  ? 'Print-ready official documents for Election Commission archives: Voter Registry Report and Declaration of Results with official signatures.'
                  : 'নির্বাচন কমিশন আর্কাইভের জন্য প্রিন্টযোগ্য অফিসিয়াল নথি: ভোটার তালিকা রিপোর্ট ও স্বাক্ষরসহ ফলাফল ঘোষণা পত্র।'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-admin-print-voters-fast"
              type="button"
              onClick={() => onOpenReportModal && onOpenReportModal('voters')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>{isEn ? 'Voter List Report' : 'ভোটার তালিকা রিপোর্ট'}</span>
            </button>
            <button
              id="btn-admin-print-declaration-fast"
              type="button"
              onClick={() => onOpenReportModal && onOpenReportModal('declaration')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Declaration of Results' : 'ফলাফল ঘোষণা পত্র'}</span>
            </button>
          </div>
        </div>

        {/* 2 Print Reports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Declaration of Results */}
          <div className="border border-slate-200 bg-amber-50/20 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isEn ? 'Declaration of Election Results' : 'নির্বাচনী ফলাফল ঘোষণা পত্র'}
                    </h4>
                    <span className="text-[11px] text-amber-800 font-semibold">
                      {isEn ? 'Official Certificate with Seals & Signatures' : 'সিল ও স্বাক্ষরসহ প্রত্যয়নপত্র'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {isEn ? 'Certified' : 'প্রত্যয়িত'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? 'Includes official tabulation of 08 Executive Committee seats, Vice President winner, total votes cast, turnout %, and signatures of all Election Organizing Committee members.'
                  : 'কার্যনির্বাহী কমিটির ০৮টি নির্বাচিত পদ, সহ-সভাপতি ফলাফল, সর্বমোট প্রদত্ত ভোট, উপস্থিতির হার এবং নির্বাচন পরিচালনা কমিটির সকল সদস্যদের স্বাক্ষর সংবলিত প্রত্যয়নপত্র।'}
              </p>

              <div className="grid grid-cols-3 gap-2 py-2 bg-white/70 border border-amber-200/60 rounded-lg text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">{isEn ? 'EC Seats' : 'ইসি আসন'}</span>
                  <span className="font-bold text-slate-900">08 {isEn ? 'Seats' : 'টি আসন'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isEn ? 'VP Winner' : 'সহ-সভাপতি'}</span>
                  <span className="font-bold text-amber-700">1 {isEn ? 'Winner' : 'জন বিজয়ী'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isEn ? 'Signatories' : 'কমিটি সদস্য'}</span>
                  <span className="font-bold text-slate-900">{toBanglaNum(committeeMembers.length, currentLang)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-amber-200/50">
              <button
                id="btn-admin-open-declaration-report"
                type="button"
                onClick={() => onOpenReportModal && onOpenReportModal('declaration')}
                className="flex-1 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isEn ? 'Preview & Print Declaration' : 'ফলাফল ঘোষণা পত্র প্রিন্ট'}</span>
              </button>
              <button
                id="btn-admin-download-results-html"
                type="button"
                onClick={() => {
                  const castCount = voterRegistry.filter((v) => v.status === 'Voted').length;
                  exportResultsHTML(vpCandidates, ecCandidates, committeeMembers, voterRegistry.length, castCount, currentLang);
                }}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title={isEn ? 'Export results as standalone HTML' : 'ফলাফল HTML হিসেবে ডাউনলোড'}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>HTML</span>
              </button>
              <button
                id="btn-admin-download-results-csv"
                type="button"
                onClick={() => {
                  const castCount = voterRegistry.filter((v) => v.status === 'Voted').length;
                  exportResultsCSV(vpCandidates, ecCandidates, voterRegistry.length, castCount);
                }}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                title={isEn ? 'Export results to CSV' : 'ফলাফল CSV ডাউনলোড'}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Voter List Report */}
          <div className="border border-slate-200 bg-blue-50/20 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isEn ? 'Official Voter List Report' : 'চূড়ান্ত ভোটার তালিকা রিপোর্ট'}
                    </h4>
                    <span className="text-[11px] text-blue-800 font-semibold">
                      {isEn ? 'Complete Tabulation of Registered Voters' : 'সকল নিবন্ধিত ভোটারের বিস্তারিত তালিকা'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {toBanglaNum(voterRegistry.length, currentLang)} {isEn ? 'Voters' : 'জন'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? 'Official tabular printout of all voters with Employee ID, Department, Section, Designation, Voting Status (Voted/Pending), and ballot issuance timestamps.'
                  : 'এমপ্লয়মেন্ট আইডি, বিভাগ, সেকশন, পদবী এবং ভোটদানের অবস্থা (ভোট সম্পন্ন / পেন্ডিং) সংবলিত নির্বাচন কমিশনের অনুমোদিত পূর্ণাঙ্গ ভোটার তালিকা।'}
              </p>

              <div className="grid grid-cols-3 gap-2 py-2 bg-white/70 border border-blue-200/60 rounded-lg text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">{isEn ? 'Total Voters' : 'মোট ভোটার'}</span>
                  <span className="font-bold text-slate-900">{toBanglaNum(voterRegistry.length, currentLang)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isEn ? 'Votes Cast' : 'ভোট দিয়েছেন'}</span>
                  <span className="font-bold text-emerald-700">
                    {toBanglaNum(voterRegistry.filter((v) => v.status === 'Voted').length, currentLang)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isEn ? 'Pending' : 'পেন্ডিং'}</span>
                  <span className="font-bold text-amber-700">
                    {toBanglaNum(voterRegistry.filter((v) => v.status === 'Pending').length, currentLang)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-blue-200/50">
              <button
                id="btn-admin-open-voter-report"
                type="button"
                onClick={() => onOpenReportModal && onOpenReportModal('voters')}
                className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isEn ? 'Preview & Print Voter List' : 'ভোটার তালিকা প্রিন্ট'}</span>
              </button>
              <button
                id="btn-admin-export-voters-html"
                type="button"
                onClick={() => {
                  const castCount = voterRegistry.filter((v) => v.status === 'Voted').length;
                  exportVoterRegistryHTML(voterRegistry, currentLang, castCount, committeeMembers);
                }}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title={isEn ? 'Export voters as standalone HTML' : 'ভোটার তালিকা HTML হিসেবে ডাউনলোড'}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>HTML</span>
              </button>
              <button
                id="btn-admin-export-voters-csv"
                type="button"
                onClick={() => exportVoterRegistryCSV(voterRegistry)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                title={isEn ? 'Export voters to CSV' : 'ভোটার তালিকা CSV ডাউনলোড'}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* General Voting Option & Vice President Ballot Paper Transition Control */}
        <div id="section-vp-transition" className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isEn ? 'General Voting Option & VP Transition' : 'সাধারণ নির্বাচন ও সহ-সভাপতি ব্যালট অপশন'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isGeneralElectionComplete
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {isGeneralElectionComplete
                  ? isEn
                    ? '✓ General Vote Complete & Certified'
                    : '✓ সাধারণ ভোট সম্পন্ন ও চূড়ান্ত'
                  : isEn
                  ? '⏳ General Vote In Progress'
                  : '⏳ সাধারণ ভোট চলমান'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {isEn
                ? 'When general voting is complete, the 08 elected general candidates can vote to elect the Vice President by entering their Employee ID. Entering their ID immediately opens the Vice President ballot paper.'
                : 'সাধারণ নির্বাচন সম্পন্ন হওয়ার পর নির্বাচিত ০৮ জন সাধারণ প্রার্থী তাদের এমপ্লয়মেন্ট আইডি প্রদান করে সহ-সভাপতি নির্বাচন করতে পারেন। আইডি দিলেই সহ-সভাপতি ব্যালট পেপার খুলে যাবে।'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onToggleGeneralElectionComplete && (
              <button
                type="button"
                onClick={() => {
                  const next = !isGeneralElectionComplete;
                  onToggleGeneralElectionComplete(next);
                  showNotification(
                    isEn
                      ? next
                        ? 'General voting certified as complete. Elected candidates can now vote for Vice President using their Employee ID.'
                        : 'General voting status reopened to in-progress.'
                      : next
                      ? 'সাধারণ ভোট সম্পন্ন ও চূড়ান্ত। নির্বাচিত প্রার্থীরা এখন এমপ্লয়মেন্ট আইডি দিয়ে সহ-সভাপতি ভোট দিতে পারবেন।'
                      : 'সাধারণ নির্বাচন অবস্থা পুনরায় চলমান করা হয়েছে।',
                    'success'
                  );
                }}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                  isGeneralElectionComplete
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                }`}
              >
                {isGeneralElectionComplete
                  ? isEn
                    ? 'Reopen General Voting'
                    : 'সাধারণ ভোট পুনরায় চালু করুন'
                  : isEn
                  ? '✓ Certify General Vote Complete'
                  : '✓ সাধারণ ভোট সম্পন্ন ঘোষণা করুন'}
              </button>
            )}

            {onOpenVpBallot && (
              <button
                id="btn-admin-goto-vp-ballot"
                type="button"
                onClick={onOpenVpBallot}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>{isEn ? 'Open VP Ballot Paper' : 'সহ-সভাপতি ব্যালট খুলুন'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Nomination & Management Section */}
      <div id="section-candidate-management" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-5">
          <h3 className="font-bold text-slate-900 text-base">{t.candMgmtHeading}</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Candidate Form (5 columns) */}
          <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/70 rounded-xl p-4.5">
            <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>{t.lblAddNewCandidate}</span>
            </h4>

            <form onSubmit={handleCandidateSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblCandType}</label>
                <select
                  value={candType}
                  onChange={(e) => setCandType(e.target.value as PositionCategory)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                >
                  <option value="vp">Vice President (সহ-সভাপতি)</option>
                  <option value="ec">Executive Committee Member (কার্যনির্বাহী সদস্য)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblCandId}</label>
                <input
                  type="text"
                  value={candId}
                  placeholder="e.g. 10599"
                  onChange={(e) => setCandId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{t.lblCandNameEn}</label>
                  <input
                    type="text"
                    value={candNameEn}
                    placeholder="e.g. Mahbubur Rahman"
                    onChange={(e) => setCandNameEn(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{t.lblCandNameBn}</label>
                  <input
                    type="text"
                    value={candNameBn}
                    placeholder="যেমন: মাহবুবুর রহমান"
                    onChange={(e) => setCandNameBn(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblCandDept}</label>
                <input
                  type="text"
                  value={candDept}
                  placeholder="e.g. Quality / কোয়ালিটি"
                  onChange={(e) => setCandDept(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.lblCandPhoto}</span>
                </label>
                <div className="flex items-center gap-3 p-2.5 bg-white border border-dashed border-slate-300 rounded-lg">
                  <img
                    src={candPhotoPreview}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCandPhotoUpload}
                      className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <input
                      type="url"
                      value={candImgUrl}
                      placeholder="Or enter image URL..."
                      onChange={(e) => handleCandPhotoUrlChange(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-xs mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.btnAddCandBtn}</span>
              </button>
            </form>
          </div>

          {/* Active Candidates List (7 columns) */}
          <div className="lg:col-span-7 flex flex-col">
            <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center justify-between">
              <span>{t.lblActiveCandidateList}</span>
              <span className="text-xs text-slate-500 font-normal">
                {toBanglaNum(vpCandidates.length + ecCandidates.length, currentLang)}{' '}
                {currentLang === 'en' ? 'Candidates Total' : 'জন মোট প্রার্থী'}
              </span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-semibold text-slate-700">Type</th>
                    <th className="py-2 px-3 font-semibold text-slate-700">Candidate</th>
                    <th className="py-2 px-3 font-semibold text-slate-700">Department</th>
                    <th className="py-2 px-3 font-semibold text-slate-700 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* VP Candidates */}
                  {vpCandidates.map((c) => {
                    const name = currentLang === 'en' ? c.nameEn : c.nameBn;
                    const dept = currentLang === 'en' ? c.deptEn : c.deptBn;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3">
                          <span className="font-bold text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            VP
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.img}
                              alt={name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                ID: {toBanglaNum(c.id, currentLang)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{dept}</td>
                        <td className="py-2 px-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => onEditCandidateClick(c)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors"
                          >
                            <PenSquare className="w-3 h-3" />
                            <span>{t.edit}</span>
                          </button>
                          <button
                            type="button"
                            id={`btn-delete-vp-${c.id}`}
                            onClick={() => {
                              setDeleteModalData({
                                type: 'candidate',
                                category: 'vp',
                                id: c.id,
                                title: currentLang === 'en' ? 'Delete Candidate' : 'প্রার্থী মুছে ফেলুন',
                                description: currentLang === 'en'
                                  ? `Are you sure you want to delete candidate ${name} (ID: ${c.id})? This will permanently remove them from nominations and voter ballots.`
                                  : `আপনি কি নিশ্চিত যে ${name} (আইডি: ${c.id})-কে বাদ দিতে চান? এই প্রার্থীকে মনোনয়ন এবং ব্যালট তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।`,
                                itemName: name,
                                itemDetail: `${dept} • ID: ${toBanglaNum(c.id, currentLang)}`,
                                itemPhoto: c.img,
                                itemBadge: currentLang === 'en' ? 'Vice President' : 'সহ-সভাপতি'
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.delete}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* EC Candidates */}
                  {ecCandidates.map((c) => {
                    const name = currentLang === 'en' ? c.nameEn : c.nameBn;
                    const dept = currentLang === 'en' ? c.deptEn : c.deptBn;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3">
                          <span className="font-bold text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            EC
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.img}
                              alt={name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                ID: {toBanglaNum(c.id, currentLang)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{dept}</td>
                        <td className="py-2 px-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => onEditCandidateClick(c)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors"
                          >
                            <PenSquare className="w-3 h-3" />
                            <span>{t.edit}</span>
                          </button>
                          <button
                            type="button"
                            id={`btn-delete-ec-${c.id}`}
                            onClick={() => {
                              setDeleteModalData({
                                type: 'candidate',
                                category: 'ec',
                                id: c.id,
                                title: currentLang === 'en' ? 'Delete Candidate' : 'প্রার্থী মুছে ফেলুন',
                                description: currentLang === 'en'
                                  ? `Are you sure you want to delete candidate ${name} (ID: ${c.id})? This will permanently remove them from nominations and voter ballots.`
                                  : `আপনি কি নিশ্চিত যে ${name} (আইডি: ${c.id})-কে বাদ দিতে চান? এই প্রার্থীকে মনোনয়ন এবং ব্যালট তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।`,
                                itemName: name,
                                itemDetail: `${dept} • ID: ${toBanglaNum(c.id, currentLang)}`,
                                itemPhoto: c.img,
                                itemBadge: currentLang === 'en' ? 'EC Member' : 'কার্যনির্বাহী সদস্য'
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.delete}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Election Organizing Committee (5 Members) Management Section */}
      <div id="section-committee-management" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {currentLang === 'en'
                    ? `Election Organizing Committee (${committeeMembers.length} Members)`
                    : `নির্বাচন পরিচালনা কমিটি (${toBanglaNum(committeeMembers.length, currentLang)} জন সদস্য)`}
                </h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{currentLang === 'en' ? 'Auto-Saved' : 'সংরক্ষিত'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLang === 'en'
                  ? 'Add, edit, delete, or save committee members and certificate signature signatories'
                  : 'নির্বাচন পরিচালনা কমিটির সদস্য যোগ, সম্পাদনা, মুছে ফেলা এবং সার্টিফিকেটের জন্য সংরক্ষণ করুন'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-admin-add-committee-member"
              type="button"
              onClick={handleOpenAddCommittee}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{currentLang === 'en' ? '+ Add Member' : '+ নতুন সদস্য যোগ'}</span>
            </button>

            <button
              id="btn-admin-reset-committee-members"
              type="button"
              onClick={() => {
                onResetCommitteeMembers();
                showNotification(
                  currentLang === 'en'
                    ? 'Election Organizing Committee reset to official default 5 members.'
                    : 'নির্বাচন পরিচালনা কমিটি অফিশিয়াল ডিফল্ট ৫ সদস্যে পুনরুদ্ধার করা হয়েছে।',
                  'success'
                );
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              title={currentLang === 'en' ? 'Reset to Default 5 Members' : 'ডিফল্ট ৫ সদস্যে রিসেট'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLang === 'en' ? 'Reset Default 5' : 'ডিফল্ট ৫ সদস্য'}</span>
            </button>
          </div>
        </div>

        {/* Committee Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {committeeMembers.map((m) => {
            const badge = currentLang === 'en' ? m.badge.en : m.badge.bn;
            const name = currentLang === 'en' ? m.name.en : m.name.bn;
            const dept = currentLang === 'en' ? m.dept.en : m.dept.bn;
            const role = currentLang === 'en' ? m.roleDescription?.en : m.roleDescription?.bn;

            // Role badge color mapping
            const isChairman = m.badge.en.toUpperCase().includes('CHAIRMAN');
            const isSecretary = m.badge.en.toUpperCase().includes('SECRETARY');
            const isObserver = m.badge.en.toUpperCase().includes('OBSERVER');

            const badgeColorClass = isChairman
              ? 'bg-amber-600 text-white'
              : isSecretary
              ? 'bg-indigo-600 text-white'
              : isObserver
              ? 'bg-purple-600 text-white'
              : 'bg-blue-600 text-white';

            return (
              <div
                key={m.id}
                className="bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-2xs"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2.5">
                    <img
                      src={m.img}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-slate-200"
                    />
                    <span
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs ${badgeColorClass}`}
                    >
                      {badge}
                    </span>
                  </div>

                  <div className="mt-1.5 w-full">
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={name}>
                      {name}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5" title={dept}>
                      {dept}
                    </p>
                    {role && (
                      <p className="text-[10px] text-indigo-600 font-medium truncate mt-0.5" title={role}>
                        {role}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/70 w-full">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCommittee(m)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <PenSquare className="w-3 h-3" />
                    <span>{t.edit}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCommitteeClick(m)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.delete}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls & Add Single Voter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Election Controls & Presiding Officer Booth (5 cols) */}
        <div id="section-election-controls" className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          {currentRole === 'admin' ? (
            <>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">{t.ctrlHeading}</h3>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs sm:text-sm mb-1">
                  {t.lblElectionState}
                </label>
                <select
                  value={electionStatus}
                  onChange={(e) => onUpdateElectionStatus(e.target.value as ElectionStatus)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 font-medium"
                >
                  <option value="active">Active (Voting In Progress / ভোটগ্রহণ চলমান)</option>
                  <option value="paused">Paused (Temporarily Stopped / ভোটগ্রহণ স্থগিত)</option>
                  <option value="closed">Closed (Final Count Declared / ভোটগ্রহণ সমাপ্ত)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs sm:text-sm mb-1">
                  {t.lblBroadcast}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onBroadcastLinks();
                    showNotification(
                      currentLang === 'en'
                        ? 'Voting invitations successfully broadcasted to registered voters!'
                        : 'সফলভাবে নিবন্ধিত ভোটারদের কাছে ভোটিং লিংক পাঠানো হয়েছে!',
                      'success'
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.btnSendLinks}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {isEn ? 'Presiding Officer Booth' : 'প্রিসাইডিং অফিসার ভোট বুথ'}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {isEn ? 'Operational Module' : 'অপারেশনাল মডিউল'}
              </span>
            </div>
          )}

          {/* Admin Presiding Officer Vote Casting Booth Card */}
          <div id="section-presiding-booth" className="bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Vote className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-blue-950">
                  {currentLang === 'en' ? 'Presiding Officer Booth' : 'প্রিসাইডিং অফিসার ভোট বুথ'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {currentLang === 'en' ? 'Assisted / Walk-in' : 'সহায়তামূলক ভোট'}
              </span>
            </div>
            <p className="text-xs text-blue-900/80 leading-relaxed">
              {currentLang === 'en'
                ? 'Officially cast ballots on behalf of registered factory employees who need presiding officer assistance. Updates the voter registry and live results tally instantly.'
                : 'কর্মীদের উপস্থিতিতে প্রিসাইডিং বুথ থেকে তাদের পক্ষে অফিশিয়াল ব্যালটে ভোট গ্রহণ ও ভোটার তালিকায় সাথে সাথে রেকর্ড হালনাগাদ করুন।'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                id="btn-ctrl-launch-vote-booth"
                type="button"
                onClick={() => {
                  setAdminVoteTargetVoterId(null);
                  setIsAdminVoteModalOpen(true);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>{currentLang === 'en' ? 'EC Vote Booth' : 'ইসি ভোট বুথ'}</span>
              </button>

              {onOpenVpBallot && (
                <button
                  id="btn-ctrl-launch-vp-ballot"
                  type="button"
                  onClick={onOpenVpBallot}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{currentLang === 'en' ? 'VP Ballot (1 Seat)' : 'সহ-সভাপতি ব্যালট'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Audit Log Terminal: Strictly Super Admin Only */}
          {currentRole === 'admin' ? (
            <div id="section-audit-log">
              <label className="block font-semibold text-slate-700 text-xs sm:text-sm mb-1">
                {t.lblAuditTrail}
              </label>
              <div className="bg-slate-900 text-sky-400 font-mono text-[11px] p-3 rounded-xl h-32 overflow-y-auto space-y-1 border border-slate-800">
                {auditLogs.map((log) => (
                  <div key={log.id} className="leading-relaxed">
                    <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div id="section-audit-log" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>{isEn ? 'Election State:' : 'নির্বাচনী অবস্থা:'}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  electionStatus === 'active' ? 'bg-emerald-100 text-emerald-800' :
                  electionStatus === 'paused' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {electionStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? 'Election timeline controls, invitation broadcasts, and audit logs are governed by Super Admin.'
                  : 'নির্বাচনী সময়সূচী নিয়ন্ত্রণ, আমন্ত্রণ ব্রডকাস্ট ও অডিট লগ কেবল সুপার অ্যাডমিন কর্তৃক নিয়ন্ত্রিত।'}
              </p>
            </div>
          )}
        </div>

        {/* Add Single Eligible Voter Form (7 cols) */}
        <div id="section-add-voter" className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">{t.addVoterHeading}</h3>
          </div>

          <form onSubmit={handleVoterSubmit} className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblAddId}</label>
                <input
                  type="text"
                  value={voterId}
                  placeholder="e.g. EPZ-111"
                  onChange={(e) => setVoterId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblAddEmpId}</label>
                <input
                  type="text"
                  value={voterEmpId}
                  placeholder="e.g. EMP-9022"
                  onChange={(e) => setVoterEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblAddName}</label>
                <input
                  type="text"
                  value={voterName}
                  placeholder="e.g. Nazmul Huda"
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblAddDesig}</label>
                <input
                  type="text"
                  value={voterDesig}
                  placeholder="e.g. Quality Inspector"
                  onChange={(e) => setVoterDesig(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{currentLang === 'en' ? 'DOJ (Joining Date)' : 'যোগদানের তারিখ (DOJ)'}</label>
                <input
                  type="date"
                  value={voterDoj}
                  onChange={(e) => setVoterDoj(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">{currentLang === 'en' ? 'Gender Info' : 'জেন্ডার তথ্য'}</label>
                <select
                  value={voterGender}
                  onChange={(e) => setVoterGender(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                >
                  <option value="">{currentLang === 'en' ? 'Select Gender' : 'জেন্ডার নির্বাচন করুন'}</option>
                  <option value="Male">{currentLang === 'en' ? 'Male' : 'পুরুষ'}</option>
                  <option value="Female">{currentLang === 'en' ? 'Female' : 'নারী'}</option>
                  <option value="Other">{currentLang === 'en' ? 'Other' : 'অন্যান্য'}</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">{currentLang === 'en' ? 'Employee Category' : 'কর্মীর ক্যাটাগরি'}</label>
                <input
                  type="text"
                  value={voterCategory}
                  placeholder="e.g. Permanent / Staff"
                  onChange={(e) => setVoterCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblAddDept}</label>
                <input
                  type="text"
                  value={voterDept}
                  placeholder="e.g. Quality"
                  onChange={(e) => setVoterDept(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblAddSec}</label>
                <input
                  type="text"
                  value={voterSec}
                  placeholder="e.g. Line 04"
                  onChange={(e) => setVoterSec(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t.lblAddSubSec}</label>
                <input
                  type="text"
                  value={voterSubSec}
                  placeholder="e.g. Overlock"
                  onChange={(e) => setVoterSubSec(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">{currentLang === 'en' ? 'Line info' : 'লাইন তথ্য'}</label>
                <input
                  type="text"
                  value={voterLineInfo}
                  placeholder="e.g. Line 01"
                  onChange={(e) => setVoterLineInfo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Voter Photo Upload */}
            <div>
              <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.lblVoterPhotoUpload}</span>
              </label>
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                <img
                  src={voterPhotoPreview}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-200"
                />
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleVoterPhotoUpload}
                    className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <input
                    type="url"
                    value={voterPhotoUrl}
                    placeholder="Or enter image URL..."
                    onChange={(e) => handleVoterPhotoUrlChange(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-xs mt-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.btnAddVoterBtn}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Eligible Voter Registry & Status with Excel Import/Export */}
      <div id="section-voter-registry" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">{t.voterListHeading}</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.btnUploadExcel}</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelFileInput}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={downloadSampleExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.btnDownloadTemplate}</span>
            </button>

            <button
              type="button"
              onClick={() => exportVoterRegistryCSV(voterRegistry)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.btnExportVoters}</span>
            </button>

            <button
              id="btn-admin-export-voters-table-html"
              type="button"
              onClick={() => {
                const castCount = voterRegistry.filter((v) => v.status === 'Voted').length;
                exportVoterRegistryHTML(voterRegistry, currentLang, castCount, committeeMembers);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-300 transition-colors"
              title={isEn ? 'Export voters to standalone HTML' : 'ভোটার তালিকা HTML ডাউনলোড'}
            >
              <FileCode className="w-3.5 h-3.5 text-amber-700" />
              <span>{isEn ? 'Export HTML' : 'HTML রফতানি'}</span>
            </button>
          </div>
        </div>

        {/* Drag and Drop / Click dropzone */}
        <label className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/80 rounded-xl p-4 text-center cursor-pointer transition-colors block">
          <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-1" />
          <p className="text-xs sm:text-sm font-semibold text-blue-900">{t.dropzoneText}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{t.dropzoneHint}</span>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelFileInput}
            className="hidden"
          />
        </label>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              placeholder={t.searchPlaceholder}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 font-medium"
          >
            <option value="">{t.optAllDept}</option>
            <option value="Quality">Quality / কোয়ালিটি</option>
            <option value="Cutting">Cutting / কাটিং</option>
            <option value="Sewing">Sewing / সুইং</option>
            <option value="Finishing">Finishing / ফিনিশিং</option>
            <option value="Maintenance">Maintenance / মেইনটেন্যান্স</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 font-medium"
          >
            <option value="">{t.optAllStatus}</option>
            <option value="Voted">Voted / ভোট সম্পন্ন</option>
            <option value="Pending">Pending / ভোট অপেক্ষমান</option>
          </select>
        </div>

        {/* Table of Voters */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[480px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
            <thead className="bg-slate-100/90 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thSl}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thPhoto}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thId}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thEmpId}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thName}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thDesig}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thDoj}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thGender}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thCategory}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thDept}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thSec}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thSubSec}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thLineInfo}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{t.thStatus}</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap text-right">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-400 text-xs">
                    {currentLang === 'en' ? 'No matching voters found.' : 'কোনো ভোটার পাওয়া যায়নি।'}
                  </td>
                </tr>
              ) : (
                filteredVoters.map((v, idx) => {
                  const isVoted = v.status === 'Voted';

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      {/* 1. SL */}
                      <td className="py-2 px-3 text-slate-500 font-mono whitespace-nowrap">
                        {toBanglaNum(idx + 1, currentLang)}
                      </td>

                      {/* 2. Photo */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <img
                          src={v.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                          alt={v.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                      </td>

                      {/* 3. Voter ID */}
                      <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {toBanglaNum(v.id, currentLang)}
                      </td>

                      {/* 4. Employee ID */}
                      <td className="py-2 px-3 font-mono font-semibold text-blue-700 text-[11px] whitespace-nowrap">
                        {v.empId || '-'}
                      </td>

                      {/* 5. Employee Name */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{v.name}</div>
                        {v.assignedRole && !(currentRole === 'system_admin' && (v.assignedRole === 'admin' || v.assignedRole === 'Super Admin')) && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-md">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>{v.assignedRole}</span>
                              <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">{currentLang === 'en' ? 'Locked' : 'লকড'}</span>
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 6. Designation */}
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{v.desig}</td>

                      {/* 7. DOJ */}
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{v.doj || ''}</td>

                      {/* 8. Gender Info */}
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{v.gender || ''}</td>

                      {/* 9. Employee Category */}
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{v.empCategory || ''}</td>

                      {/* 10. Department */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="inline-block text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                          {v.dept}
                        </span>
                      </td>

                      {/* 11. Section */}
                      <td className="py-2 px-3 text-[11px] text-slate-600 whitespace-nowrap">{v.section || '-'}</td>

                      {/* 12. Subsection */}
                      <td className="py-2 px-3 text-[11px] text-slate-600 whitespace-nowrap">{v.subSection || '-'}</td>

                      {/* 13. Line info */}
                      <td className="py-2 px-3 text-[11px] text-slate-600 whitespace-nowrap">{v.lineInfo || ''}</td>

                      {/* 14. Status */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isVoted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isVoted ? t.statusVoted : t.statusPending}
                        </span>
                      </td>

                      {/* 15. Actions */}
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isVoted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>{currentLang === 'en' ? 'Recorded' : 'গৃহীত'}</span>
                            </span>
                          ) : (
                            <button
                              id={`btn-vote-voter-${v.id}`}
                              type="button"
                              onClick={() => {
                                setAdminVoteTargetVoterId(v.id);
                                setIsAdminVoteModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
                            >
                              <Vote className="w-3 h-3" />
                              <span>{t.btnCastVoterVote}</span>
                            </button>
                          )}

                          <button
                            id={`btn-delete-voter-${v.id}`}
                            type="button"
                            title={currentLang === 'en' ? 'Delete Voter' : 'ভোটার মুছুন'}
                            onClick={() => {
                              setDeleteModalData({
                                type: 'voter',
                                id: v.id,
                                title: currentLang === 'en' ? 'Delete Eligible Voter' : 'ভোটার তালিকা থেকে মুছুন',
                                description: currentLang === 'en'
                                  ? `Are you sure you want to remove "${v.name}" from the verified voter registry? Their voting credentials and token will be permanently revoked.`
                                  : `আপনি কি নিশ্চিত যে "${v.name}"-কে ভোটার তালিকা থেকে মুছে ফেলতে চান? তার ভোটিং টোকেন স্থায়ীভাবে বাতিল হয়ে যাবে।`,
                                itemName: v.name,
                                itemDetail: `${v.dept || 'Staff'} • Emp ID: ${v.empId || v.id} • Token: ${v.id}`,
                                itemPhoto: v.photo,
                                itemBadge: v.status === 'Voted'
                                  ? (currentLang === 'en' ? 'Voted' : 'ভোট সম্পন্ন')
                                  : (currentLang === 'en' ? 'Pending' : 'অপেক্ষমান')
                              });
                            }}
                            className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Presiding Officer Vote Casting Modal */}
      <AdminVoteModal
        isOpen={isAdminVoteModalOpen}
        onClose={() => {
          setIsAdminVoteModalOpen(false);
          setAdminVoteTargetVoterId(null);
        }}
        currentLang={currentLang}
        ecCandidates={ecCandidates}
        voterRegistry={voterRegistry}
        initialSelectedVoterId={adminVoteTargetVoterId}
        electionStatus={electionStatus}
        onCastVote={onCastVote}
      />

      {/* Workable Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteModalData}
        data={deleteModalData}
        currentLang={currentLang}
        onClose={() => setDeleteModalData(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* RBAC Role Edit / Save / Add Modal */}
      <EditRoleModal
        isOpen={isEditRoleModalOpen}
        onClose={() => {
          setIsEditRoleModalOpen(false);
          setEditingRoleConfig(null);
        }}
        roleConfig={editingRoleConfig}
        onSave={handleSaveRole}
        currentLang={currentLang}
        existingRoleKeys={activeRoleKeys}
      />

      {/* Committee Member Add / Edit Modal */}
      <CommitteeMemberModal
        isOpen={isCommitteeModalOpen}
        onClose={() => setIsCommitteeModalOpen(false)}
        onSave={handleSaveCommitteeMember}
        memberToEdit={editingCommitteeMember}
        currentLang={currentLang}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div
          id="admin-notification-toast"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold transition-all ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700 shadow-rose-600/30'
              : 'bg-emerald-700 text-white border-emerald-800 shadow-emerald-700/30'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2 text-white/80 hover:text-white p-0.5 rounded cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
