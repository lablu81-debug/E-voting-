import React, { useState } from 'react';
import {
  Vote,
  Users,
  Trophy,
  BarChart3,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Printer,
  UserPlus,
  FolderArchive,
  Sliders,
  ShieldCheck,
  ScrollText,
  X,
  Search,
  CheckCircle2,
  ChevronRight,
  Flame,
  PieChart,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import { Language, NavigationTab, ElectionStatus, UserRole } from '../types';
import { toBanglaNum } from '../utils/helpers';
import { RoleConfig, ROLE_CONFIGS } from '../data/rolesData';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  activeTab: NavigationTab;
  onNavigateTab: (tab: NavigationTab, targetSectionId?: string) => void;
  onOpenReportModal?: (type: 'declaration' | 'voter_list') => void;
  electionStatus?: ElectionStatus;
  totalVotesCast?: number;
  totalVoters?: number;
  currentRole?: UserRole;
  rolesConfig?: Record<string, RoleConfig>;
  onOpenLoginModal?: (targetRole?: UserRole) => void;
}

interface NavItem {
  id: string;
  tab?: NavigationTab;
  sectionId?: string;
  modalType?: 'declaration' | 'voter_list';
  labelEn: string;
  labelBn: string;
  subEn: string;
  subBn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    en: string;
    bn: string;
    color: string;
  };
}

interface NavGroup {
  groupEn: string;
  groupBn: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentLang,
  activeTab,
  onNavigateTab,
  onOpenReportModal,
  electionStatus = 'active',
  totalVotesCast = 0,
  totalVoters = 450,
  currentRole = 'admin',
  rolesConfig,
  onOpenLoginModal
}) => {
  const isEn = currentLang === 'en';
  const [searchQuery, setSearchQuery] = useState('');

  // Active Role and Statutory Permissions
  const activeRole = currentRole || 'admin';
  const roleConfig =
    (rolesConfig && rolesConfig[activeRole]) ||
    ROLE_CONFIGS[activeRole] ||
    ROLE_CONFIGS.admin;
  const allowedTabs = roleConfig.allowedTabs || ['ballot', 'dashboard'];
  const permissions = roleConfig.permissions;

  // Complete list of existing features, sections, and modules in the application
  const navGroups: NavGroup[] = [
    {
      groupEn: 'Election Voting',
      groupBn: 'নির্বাচনী ভোটগ্রহণ',
      items: [
        {
          id: 'nav-ballot',
          tab: 'ballot',
          labelEn: 'Executive Committee Ballot',
          labelBn: 'কার্যনির্বাহী সদস্য ব্যালট',
          subEn: 'Cast secret vote for EC worker representatives',
          subBn: 'শ্রমিক প্রতিনিধি নির্বাচনের জন্য গোপন ভোট দিন',
          icon: Users,
          badge: {
            en: 'Secret Ballot',
            bn: 'গোপন ব্যালট',
            color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }
        },
        {
          id: 'nav-vp-ballot',
          tab: 'vp_ballot',
          labelEn: 'Vice President Ballot',
          labelBn: 'সহ-সভাপতি ব্যালট',
          subEn: 'Electoral college ballot by elected candidates',
          subBn: 'নির্বাচিত ০৮ জন সদস্যের সহ-সভাপতি ব্যালট',
          icon: Trophy,
          badge: {
            en: 'Phase 2',
            bn: '২য় ধাপ',
            color: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }
        }
      ]
    },
    {
      groupEn: 'Results & Analytics',
      groupBn: 'ফলাফল ও লাইভ অ্যানালিটিক্স',
      items: [
        {
          id: 'nav-dashboard',
          tab: 'dashboard',
          labelEn: 'Live Results Dashboard',
          labelBn: 'লাইভ ফলাফল ড্যাশবোর্ড',
          subEn: 'Turnout counter, vote counts & elected winners',
          subBn: 'রিয়েল-টাইম ভোটার উপস্থিতি ও ফলাফল ঘোষণা',
          icon: BarChart3
        },
        {
          id: 'nav-dept-trends',
          tab: 'dashboard',
          sectionId: 'section-dept-trends',
          labelEn: 'Department Turnout Trends',
          labelBn: 'বিভাগীয় ভোটার টার্নআউট ও বিশ্লেষণ',
          subEn: 'Departmental turnout rates, variances & benchmarks',
          subBn: 'বিভাগ অনুযায়ী ভোটের শতকরা হার ও চার্ট',
          icon: TrendingUp
        },
        {
          id: 'nav-ec-tally',
          tab: 'dashboard',
          sectionId: 'section-ec-tally',
          labelEn: 'Candidate Vote Tally & Status',
          labelBn: 'প্রার্থী ভোট তালিকা ও ফলাফল',
          subEn: 'Elected candidates, rankings and vote distribution',
          subBn: 'প্রার্থীদের প্রাপ্ত ভোটের হিসাব ও অবস্থান',
          icon: PieChart
        }
      ]
    },
    {
      groupEn: 'Official Reports & Print Center',
      groupBn: 'অফিসিয়াল রিপোর্ট ও প্রিন্ট সেন্টার',
      items: [
        {
          id: 'nav-reports-center',
          tab: 'admin',
          sectionId: 'section-admin-reports',
          labelEn: 'Official Print & Reports Center',
          labelBn: 'রিপোর্ট ও প্রিন্ট সেন্টার',
          subEn: 'Central printing hub with legal certificates',
          subBn: 'আইনসম্মত প্রত্যয়নপত্র ও মুদ্রিত ডকুমেন্টস',
          icon: Printer
        },
        {
          id: 'nav-declaration-cert',
          modalType: 'declaration',
          labelEn: 'Declaration of Election Results',
          labelBn: 'ফলাফল ঘোষণা ও প্রত্যয়নপত্র',
          subEn: 'Official signed Form-A certification document',
          subBn: 'স্বাক্ষরিত অফিসিয়াল ফরম-এ সনদপত্র ও ফলাফল',
          icon: FileText,
          badge: {
            en: 'PDF & Print',
            bn: 'পিডিএফ ও প্রিন্ট',
            color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }
        },
        {
          id: 'nav-voter-list-report',
          modalType: 'voter_list',
          labelEn: 'Official Voter List Report',
          labelBn: 'অফিসিয়াল ভোটার তালিকা রিপোর্ট',
          subEn: 'Complete certified tabular registry printout',
          subBn: 'প্রত্যয়িত পূর্ণাঙ্গ ভোটার রেজিস্ট্রি তালিকা',
          icon: FileSpreadsheet,
          badge: {
            en: 'Official Gazette',
            bn: 'গেজেট প্রিন্ট',
            color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
          }
        }
      ]
    },
    {
      groupEn: 'Election Operations',
      groupBn: 'নির্বাচন অপারেশন ও ব্যবস্থাপনা',
      items: [
        {
          id: 'nav-vp-transition',
          tab: 'admin',
          sectionId: 'section-vp-transition',
          labelEn: 'General Voting & VP Transition',
          labelBn: 'সাধারণ ভোট ও সহ-সভাপতি ট্রানজিশন',
          subEn: 'Toggle general election certification & unlock VP vote',
          subBn: 'সাধারণ ভোট চূড়ান্তকরণ ও সহ-সভাপতি ভোট চালু',
          icon: Flame
        },
        {
          id: 'nav-candidate-mgmt',
          tab: 'admin',
          sectionId: 'section-candidate-management',
          labelEn: 'Candidate Nomination & Roster',
          labelBn: 'প্রার্থী মনোনয়ন ও পরিচালনা',
          subEn: 'Add, edit, nominate and inspect candidate profiles',
          subBn: 'প্রার্থী সংযোজন, তথ্য সংশোধন ও তালিকা',
          icon: Users
        },
        {
          id: 'nav-voter-registry',
          tab: 'admin',
          sectionId: 'section-voter-registry',
          labelEn: 'Eligible Voter Registry & Status',
          labelBn: 'যোগ্য ভোটার ডাটাবেজ ও রেজিস্ট্রি',
          subEn: 'Searchable roster, Excel bulk upload & voting status',
          subBn: 'এক্সেল ইমপোর্ট, ভোটার সার্চ ও ভোট স্ট্যাটাস',
          icon: FolderArchive
        },
        {
          id: 'nav-add-voter',
          tab: 'admin',
          sectionId: 'section-add-voter',
          labelEn: 'Add Single Eligible Voter',
          labelBn: 'নতুন ভোটার সংযোজন ফরম',
          subEn: 'Register employee with ID, designation & department',
          subBn: 'আইডি, পদবী ও বিভাগ দিয়ে নতুন ভোটার যুক্ত করুন',
          icon: UserPlus
        },
        {
          id: 'nav-presiding-booth',
          tab: 'admin',
          sectionId: 'section-presiding-booth',
          labelEn: 'Presiding Officer Booth',
          labelBn: 'প্রিজাইডিং অফিসার বুথ',
          subEn: 'Cast assisted or verified ballot on behalf of voter',
          subBn: 'অনুমোদিত সহায়তা বা বুথে সরাসরি ভোট রেকর্ড',
          icon: ShieldCheck
        },
        {
          id: 'nav-committee-mgmt',
          tab: 'admin',
          sectionId: 'section-committee-management',
          labelEn: '5-Member Organizing Committee',
          labelBn: '৫ সদস্যের নির্বাচন পরিচালনা কমিটি',
          subEn: 'Manage presiding, neutral observer & worker members',
          subBn: 'প্রিজাইডিং, নিরপেক্ষ পর্যবেক্ষক ও সদস্য পরিচালনা',
          icon: Users
        }
      ]
    },
    {
      groupEn: 'System Governance & Controls',
      groupBn: 'সিস্টেম নিয়ন্ত্রণ ও অডিট',
      items: [
        {
          id: 'nav-election-controls',
          tab: 'admin',
          sectionId: 'section-election-controls',
          labelEn: 'Election Controls & Broadcast',
          labelBn: 'নির্বাচন নিয়ন্ত্রণ ও ঘোষণা',
          subEn: 'Start, pause, complete election and broadcast links',
          subBn: 'ভোটগ্রহণ শুরু, স্থগিত, সমাপ্তি ও নোটিশ',
          icon: Sliders
        },
        {
          id: 'nav-audit-log',
          tab: 'admin',
          sectionId: 'section-audit-log',
          labelEn: 'Audit Log & Activity Trail',
          labelBn: 'অডিট লগ ও কার্যক্রম ইতিহাস',
          subEn: 'Tamper-evident timestamped system security events',
          subBn: 'নির্বাচনী প্রতিটি পদক্ষেপের ডিজিটাল প্রমাণ ও লগ',
          icon: ScrollText
        }
      ]
    }
  ];

  // Role Permission Validator: Checks if a menu item is permitted for the active User Role
  const isItemPermitted = (item: NavItem): boolean => {
    // If item is associated with a main tab, the tab must be allowed for this user role
    if (item.tab && !allowedTabs.includes(item.tab)) {
      return false;
    }

    switch (item.id) {
      case 'nav-ballot':
        return Boolean(permissions.canVote && allowedTabs.includes('ballot'));

      case 'nav-vp-ballot':
        return Boolean(permissions.canConductVpBallot && allowedTabs.includes('vp_ballot'));

      case 'nav-dashboard':
      case 'nav-dept-trends':
      case 'nav-ec-tally':
        return Boolean(permissions.canViewDashboard && allowedTabs.includes('dashboard'));

      case 'nav-reports-center':
        return Boolean(
          permissions.canViewAdminPanel &&
          permissions.canDownloadReports &&
          allowedTabs.includes('admin')
        );

      case 'nav-declaration-cert':
        return Boolean(permissions.canDownloadReports || permissions.canViewDashboard);

      case 'nav-voter-list-report':
        return Boolean(
          permissions.canDownloadReports &&
          (permissions.canViewAdminPanel ||
            activeRole === 'observer' ||
            activeRole === 'admin' ||
            activeRole === 'system_admin' ||
            activeRole === 'ec_committee')
        );

      case 'nav-vp-transition':
        return Boolean(
          permissions.canViewAdminPanel &&
          (permissions.canConductVpBallot || permissions.canManageElectionStatus) &&
          allowedTabs.includes('admin')
        );

      case 'nav-candidate-mgmt':
        return Boolean(
          permissions.canViewAdminPanel &&
          permissions.canManageCandidates &&
          allowedTabs.includes('admin')
        );

      case 'nav-voter-registry':
      case 'nav-add-voter':
        return Boolean(
          permissions.canViewAdminPanel &&
          permissions.canManageVoterRegistry &&
          allowedTabs.includes('admin')
        );

      case 'nav-presiding-booth':
        return Boolean(
          permissions.canViewAdminPanel &&
          (permissions.canManageVoterRegistry ||
            activeRole === 'admin' ||
            activeRole === 'system_admin' ||
            activeRole === 'ec_committee') &&
          allowedTabs.includes('admin')
        );

      case 'nav-committee-mgmt':
        return Boolean(
          permissions.canViewAdminPanel &&
          permissions.canManageCommittee &&
          allowedTabs.includes('admin')
        );

      case 'nav-election-controls':
        return Boolean(
          permissions.canViewAdminPanel &&
          permissions.canManageElectionStatus &&
          allowedTabs.includes('admin')
        );

      case 'nav-audit-log':
        return Boolean(permissions.canViewAdminPanel && allowedTabs.includes('admin'));

      default:
        if (item.tab === 'admin') {
          return Boolean(permissions.canViewAdminPanel && allowedTabs.includes('admin'));
        }
        return item.tab ? allowedTabs.includes(item.tab) : true;
    }
  };

  // Filter groups: only include items permitted for user role, then apply search query
  const filteredGroups = navGroups
    .map((group) => {
      const permittedItems = group.items.filter((item) => isItemPermitted(item));
      const searchedItems = permittedItems.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.labelEn.toLowerCase().includes(q) ||
          item.labelBn.toLowerCase().includes(q) ||
          item.subEn.toLowerCase().includes(q) ||
          item.subBn.toLowerCase().includes(q)
        );
      });
      return { ...group, items: searchedItems };
    })
    .filter((group) => group.items.length > 0);

  const totalPermittedCount = navGroups.reduce(
    (acc, g) => acc + g.items.filter((item) => isItemPermitted(item)).length,
    0
  );

  const handleItemClick = (item: NavItem) => {
    if (item.modalType && onOpenReportModal) {
      onOpenReportModal(item.modalType);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        onClose();
      }
      return;
    }

    if (item.tab) {
      onNavigateTab(item.tab, item.sectionId);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  const turnoutPercentage =
    totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(1) : '0';

  return (
    <>
      {/* Mobile Backdrop - Positioned below top header */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 top-[61px] bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Docked on desktop, drawer on mobile below header */}
      <aside
        id="app-sidebar-menu"
        aria-label="Application Navigation"
        className={`bg-slate-900 border-r border-slate-800 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          /* Mobile: fixed drawer under header */
          isOpen
            ? 'fixed lg:sticky top-[61px] bottom-0 left-0 z-40 w-84 sm:w-88 xl:w-92 shadow-2xl lg:shadow-none translate-x-0'
            : 'fixed lg:relative top-[61px] bottom-0 left-0 z-40 w-0 -translate-x-full lg:translate-x-0 overflow-hidden border-r-0 pointer-events-none'
        } lg:h-[calc(100vh-61px)]`}
      >
        {/* Top Header inside Sidebar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <Vote className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold tracking-tight text-white uppercase">
                {isEn ? 'Election Navigation' : 'নির্বাচনী নেভিগেশন'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {isEn ? 'Authorized Role Menus' : 'অনুমোদিত ভূমিকাভিত্তিক মেনু'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-sidebar"
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isEn ? 'Collapse Sidebar' : 'সাইডবার লুকান'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active User Role Context Strip */}
        <div className="px-3 py-2.5 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={roleConfig.defaultUser.avatar}
                  alt={roleConfig.defaultUser.name.en}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${roleConfig.badge.bg} ${roleConfig.badge.color} ${roleConfig.badge.border}`}
                  >
                    {isEn ? roleConfig.badge.en : roleConfig.badge.bn}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-200 truncate leading-tight mt-0.5">
                  {isEn ? roleConfig.defaultUser.name.en : roleConfig.defaultUser.name.bn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenLoginModal && (
                <button
                  id="btn-sidebar-user-login"
                  type="button"
                  onClick={() => onOpenLoginModal()}
                  className="px-2 py-0.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-semibold border border-blue-500/60 shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                  title={isEn ? 'Officer Login (Without Registered Voter)' : 'কর্মকর্তা লগইন'}
                >
                  <LogIn className="w-3 h-3" />
                  <span>{isEn ? 'Login' : 'লগইন'}</span>
                </button>
              )}
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
                {isEn
                  ? `${totalPermittedCount} ${totalPermittedCount === 1 ? 'Menu' : 'Menus'}`
                  : `${toBanglaNum(totalPermittedCount, currentLang)}টি মেনু`}
              </span>
            </div>
          </div>
        </div>

        {/* Live Election Status Quick Banner */}
        <div className="p-3 bg-slate-800/60 border-b border-slate-800 text-xs shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                electionStatus === 'active'
                  ? 'bg-emerald-400 animate-pulse'
                  : electionStatus === 'closed'
                  ? 'bg-blue-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-slate-300 capitalize text-[11px]">
              {isEn ? `Election ${electionStatus}` : `নির্বাচন অবস্থা: ${electionStatus}`}
            </span>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
            {isEn
              ? `${turnoutPercentage}% Turnout`
              : `${toBanglaNum(turnoutPercentage, currentLang)}% উপস্থিতি`}
          </span>
        </div>

        {/* Search Bar for fast access to permitted modules */}
        {totalPermittedCount > 0 && (
          <div className="p-3 border-b border-slate-800 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-sidebar-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Filter your permitted menus...' : 'অনুমোদিত মেনু খুঁজুন...'}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Navigation List - Strictly filtered as per User Role */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 sidebar-scrollbar">
          {totalPermittedCount === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-slate-400 space-y-2">
              <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="font-bold text-slate-200">
                {isEn ? 'No Menus Permitted' : 'কোনো মেনু দেখার অনুমতি নেই'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isEn
                  ? 'Your active user account does not have permission to view any election menus.'
                  : 'আপনার বর্তমান অ্যাকাউন্টের কোনো নির্বাচনী মেনু দেখার অনুমতি নেই।'}
              </p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 space-y-1">
              <p>{isEn ? 'No permitted menus match your search.' : 'কোনো অনুমোদিত মেনু পাওয়া যায়নি।'}</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-blue-400 hover:underline text-[11px]"
              >
                {isEn ? 'Clear search filter' : 'সার্চ ক্লিয়ার করুন'}
              </button>
            </div>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? group.groupEn : group.groupBn}
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      !item.modalType &&
                      item.tab === activeTab &&
                      !item.sectionId;

                    return (
                      <button
                        key={item.id}
                        id={item.id}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/30'
                            : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-750'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                          <span className="text-xs font-semibold text-slate-100 truncate">
                            {isEn ? item.labelEn : item.labelBn}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 tracking-wide ${item.badge.color}`}
                            >
                              {isEn ? item.badge.en : item.badge.bn}
                            </span>
                          )}
                        </div>

                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-white group-hover:translate-x-0.5'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Officer Login Portal Promotion for Registered Voters */}
          {activeRole === 'voter' && onOpenLoginModal && (
            <div className="p-3 rounded-2xl bg-gradient-to-b from-blue-950/60 to-slate-900 border border-blue-500/30 text-center space-y-2 mt-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center mx-auto">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {isEn ? 'Officer Login Portal' : 'কর্মকর্তা লগইন পোর্টাল'}
                </p>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                  {isEn
                    ? 'Login as Super Admin, Admin, EC Committee or Observer to access election operations.'
                    : 'প্রশাসনিক মেনু ও অপারেশনে প্রবেশ করতে কর্মকর্তা হিসেবে লগইন করুন।'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenLoginModal()}
                className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? 'User Login' : 'ইউজার লগইন'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer inside sidebar: Verified statutory information */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isEn ? 'EPZ Labour Act 2019 & Rules 2022' : 'ইপিজেড শ্রম আইন ২০১৯ ও বিধিমালা ২০২২'}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {isEn ? 'Digital Electoral Governance System' : 'ডিজিটাল নির্বাচনী পরিচালনা ব্যবস্থা'}
          </p>
        </div>
      </aside>
    </>
  );
};
