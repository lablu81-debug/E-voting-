import { UserProfile, UserRole, RolePermissions, NavigationTab } from '../types';

export interface RoleConfig {
  role: UserRole;
  badge: {
    en: string;
    bn: string;
    color: string;
    bg: string;
    border: string;
  };
  description: {
    en: string;
    bn: string;
  };
  allowedTabs: NavigationTab[];
  permissions: RolePermissions;
  defaultUser: UserProfile;
  credentials?: {
    username: string;
    password?: string;
  };
  isRoleLocked?: boolean;
  assignedBy?: string;
  assignedAt?: string;
  lockReason?: {
    en: string;
    bn: string;
  };
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    badge: {
      en: 'Super Admin',
      bn: 'সুপার অ্যাডমিন',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    },
    description: {
      en: 'Complete system oversight: candidate nomination, voter roster control, election lifecycle, and database administration.',
      bn: 'সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ: প্রার্থী মনোনয়ন, ভোটার তালিকা ব্যবস্থাপনা, নির্বাচন লাইফসাইকেল এবং ডেটাবেস প্রশাসন।'
    },
    allowedTabs: ['ballot', 'vp_ballot', 'dashboard', 'admin'],
    permissions: {
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
    },
    defaultUser: {
      id: 'usr-admin-01',
      name: { en: 'Md. Rafiqul Islam', bn: 'মো: রফিকুল ইসলাম' },
      role: 'admin',
      roleTitle: { en: 'Chief Election Admin & HR Director', bn: 'প্রধান নির্বাচন প্রশাসক ও মানবসম্পদ পরিচালক' },
      empId: 'EMP-ADM-001',
      dept: { en: 'Administration & HR', bn: 'প্রশাসন ও মানবসম্পদ' },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      email: 'admin.election@factory.com',
      username: 'superadmin',
      password: 'admin123'
    },
    credentials: {
      username: 'superadmin',
      password: 'admin123'
    },
    isRoleLocked: true,
    assignedBy: 'Super Admin (admin)',
    assignedAt: '2026-09-01 (Official Gazette)',
    lockReason: {
      en: 'Role assigned and saved by Super Admin (admin). Policy prohibits altering this user\'s assigned role.',
      bn: 'সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।'
    }
  },
  system_admin: {
    role: 'system_admin',
    badge: {
      en: 'Admin',
      bn: 'অ্যাডমিন',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    description: {
      en: 'Operational election management: candidate nomination & roster, voter registry & additions, presiding officer booth, committee management, results declaration, and official print center.',
      bn: 'অপারেশনাল নির্বাচন পরিচালনা: প্রার্থী মনোনয়ন ও তালিকা, ভোটার নিবন্ধন ও সংযোজন, প্রিজাইডিং অফিসার বুথ, ৫ সদস্যের কমিটি, ফলাফল ঘোষণা ও অফিসিয়াল রিপোর্ট সেন্টার।'
    },
    allowedTabs: ['ballot', 'vp_ballot', 'dashboard', 'admin'],
    permissions: {
      canVote: true,
      canViewDashboard: true,
      canViewAdminPanel: true,
      canManageCandidates: true,
      canManageVoterRegistry: true,
      canManageElectionStatus: false, // Super Admin only (Election Controls)
      canResetDatabase: false,        // Super Admin only (Reset Entire Election Data)
      canDownloadReports: true,
      canManageCommittee: true,
      canConductVpBallot: true
    },
    defaultUser: {
      id: 'usr-admin-02',
      name: { en: 'Farhana Yasmin', bn: 'ফারহানা ইয়াসমিন' },
      role: 'system_admin',
      roleTitle: { en: 'Election Returning Officer & HR Manager', bn: 'নির্বাচন রিটার্নিং কর্মকর্তা ও মানবসম্পদ ব্যবস্থাপক' },
      empId: 'EMP-ADM-012',
      dept: { en: 'Administration & HR', bn: 'প্রশাসন ও মানবসম্পদ' },
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      email: 'farhana.admin@factory.com',
      username: 'admin',
      password: 'admin123'
    },
    credentials: {
      username: 'admin',
      password: 'admin123'
    },
    isRoleLocked: true,
    assignedBy: 'Super Admin (admin)',
    assignedAt: '2026-09-01 (Official Gazette)',
    lockReason: {
      en: 'Role assigned and saved by Super Admin (admin). Policy prohibits altering this user\'s assigned role.',
      bn: 'সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।'
    }
  },
  observer: {
    role: 'observer',
    badge: {
      en: 'Observer',
      bn: 'পর্যবেক্ষক',
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-300'
    },
    description: {
      en: 'Independent election monitoring: transparent observation of voting booths, turnout verification, compliance scrutiny, and audit report inspection.',
      bn: 'নিরপেক্ষ নির্বাচন পর্যবেক্ষণ: ভোটকেন্দ্র তদারকি, ভোটার উপস্থিতি যাচাই, কমপ্লায়েন্স নিরীক্ষা এবং অফিসিয়াল রিপোর্ট পরিদর্শন।'
    },
    allowedTabs: ['ballot', 'dashboard', 'admin'],
    permissions: {
      canVote: true,
      canViewDashboard: true,
      canViewAdminPanel: true,
      canManageCandidates: false,
      canManageVoterRegistry: false,
      canManageElectionStatus: false,
      canResetDatabase: false,
      canDownloadReports: true,
      canManageCommittee: false,
      canConductVpBallot: false
    },
    defaultUser: {
      id: 'usr-obs-01',
      name: { en: 'Advocate Anwar Hossain', bn: 'অ্যাডভোকেট আনোয়ার হোসেন' },
      role: 'observer',
      roleTitle: { en: 'Independent Election Observer & Compliance Auditor', bn: 'নিরপেক্ষ নির্বাচন পর্যবেক্ষক ও কমপ্লায়েন্স নিরীক্ষক' },
      empId: 'EMP-OBS-007',
      dept: { en: 'Legal Compliance & Scrutiny', bn: 'আইন কমপ্লায়েন্স ও নিরপেক্ষ নিরীক্ষা' },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      email: 'anwar.observer@audit-org.bd',
      username: 'observer',
      password: 'obs2026'
    },
    credentials: {
      username: 'observer',
      password: 'obs2026'
    },
    isRoleLocked: true,
    assignedBy: 'Super Admin (admin)',
    assignedAt: '2026-09-01 (Official Gazette)',
    lockReason: {
      en: 'Role assigned and saved by Super Admin (admin). Policy prohibits altering this user\'s assigned role.',
      bn: 'সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।'
    }
  },
  ec_committee: {
    role: 'ec_committee',
    badge: {
      en: 'EC Committee',
      bn: 'নির্বাচন কমিশন',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    description: {
      en: 'Election management: presiding booth supervision, voter token check-in, vice-president secret ballot, and certified results audit.',
      bn: 'নির্বাচন পরিচালনা: ভোটকেন্দ্র তদারকি, ভোটার টোকেন যাচাই, সহ-সভাপতি গোপন ব্যালট এবং প্রত্যয়িত ফলাফল নিরীক্ষণ।'
    },
    allowedTabs: ['ballot', 'vp_ballot', 'dashboard', 'admin'],
    permissions: {
      canVote: true,
      canViewDashboard: true,
      canViewAdminPanel: true,
      canManageCandidates: false, // View only
      canManageVoterRegistry: true, // Can verify and mark status, but cannot purge
      canManageElectionStatus: true, // Can pause or activate polling
      canResetDatabase: false, // Strictly prohibited
      canDownloadReports: true,
      canManageCommittee: false,
      canConductVpBallot: true
    },
    defaultUser: {
      id: 'usr-ec-01',
      name: { en: 'Md. Jahirul Islam', bn: 'মো: জহিরুল ইসলাম' },
      role: 'ec_committee',
      roleTitle: { en: 'Presiding Officer & EC Returning Member', bn: 'প্রিজাইডিং অফিসার ও নির্বাচন কমিশন সদস্য' },
      empId: 'EMP-EC-042',
      dept: { en: 'Compliance & Legal', bn: 'কমপ্লায়েন্স ও লিগ্যাল' },
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      email: 'ec.presiding@factory.com',
      username: 'eccommittee',
      password: 'ec2026'
    },
    credentials: {
      username: 'eccommittee',
      password: 'ec2026'
    },
    isRoleLocked: true,
    assignedBy: 'Super Admin (admin)',
    assignedAt: '2026-09-01 (Official Gazette)',
    lockReason: {
      en: 'Role assigned and saved by Super Admin (admin). Policy prohibits altering this user\'s assigned role.',
      bn: 'সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।'
    }
  },
  voter: {
    role: 'voter',
    badge: {
      en: 'Registered Voter',
      bn: 'সাধারণ ভোটার',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    description: {
      en: 'General factory elector: secure secret ballot casting for Worker Representation and live turnout tracking.',
      bn: 'সাধারণ কারখানার ভোটার: শ্রমিক প্রতিনিধিত্বের জন্য গোপন ভোট প্রদান ও সরাসরি ফলাফল পর্যবেক্ষণ।'
    },
    allowedTabs: ['ballot', 'dashboard'], // Only authorized for Worker Ballot & Dashboard
    permissions: {
      canVote: true,
      canViewDashboard: true,
      canViewAdminPanel: false, // Admin menu hidden & restricted
      canManageCandidates: false,
      canManageVoterRegistry: false,
      canManageElectionStatus: false,
      canResetDatabase: false,
      canDownloadReports: false,
      canManageCommittee: false,
      canConductVpBallot: false // VP secret ballot restricted to EC members
    },
    defaultUser: {
      id: 'usr-voter-01',
      name: { en: 'Nazma Akter', bn: 'নাজমা আক্তার' },
      role: 'voter',
      roleTitle: { en: 'Registered General Voter (Elector)', bn: 'নিবন্ধিত সাধারণ ভোটার (নির্বাচক)' },
      empId: 'EMP-1042',
      dept: { en: 'Sewing Department - Line 04', bn: 'সেলাই বিভাগ - লাইন ০৪' },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      email: 'nazma.akter1042@factory.com'
    },
    isRoleLocked: true,
    assignedBy: 'Super Admin (admin)',
    assignedAt: '2026-09-01 (Official Gazette)',
    lockReason: {
      en: 'Role assigned and saved by Super Admin (admin). Policy prohibits altering this user\'s assigned role.',
      bn: 'সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।'
    }
  }
};

export const DEFAULT_ROLES_CONFIG = ROLE_CONFIGS;

export const ROLES_STORAGE_KEY = 'pc_election_roles_config_v7';

/**
 * Checks whether a user\'s role assignment is permanently locked.
 */
export function isUserRoleLocked(config: RoleConfig | undefined): boolean {
  if (!config) return false;
  return Boolean(config.isRoleLocked);
}

/**
 * Validates whether a specific navigation tab is permitted for a given role configuration.
 * Strictly verifies both allowedTabs inclusion and respective granular permission flags.
 */
export function isTabPermittedForRole(config: RoleConfig | undefined, tab: NavigationTab): boolean {
  if (!config) return false;
  if (!config.allowedTabs || !config.allowedTabs.includes(tab)) return false;
  if (config.permissions) {
    if (tab === 'ballot' && config.permissions.canVote === false) return false;
    if (tab === 'vp_ballot' && config.permissions.canConductVpBallot === false) return false;
    if (tab === 'dashboard' && config.permissions.canViewDashboard === false) return false;
    if (tab === 'admin' && config.permissions.canViewAdminPanel === false) return false;
  }
  return true;
}

/**
 * Returns strictly the authorized menu tabs that the role has explicit permission to view.
 */
export function getPermittedTabsForRole(config: RoleConfig | undefined): NavigationTab[] {
  if (!config) return [];
  const allTabs: NavigationTab[] = ['ballot', 'vp_ballot', 'dashboard', 'admin'];
  return allTabs.filter((tab) => isTabPermittedForRole(config, tab));
}

export function sanitizeRoleConfig(config: RoleConfig): RoleConfig {
  const permitted = getPermittedTabsForRole(config);
  return {
    ...config,
    allowedTabs: permitted
  };
}

export const ROLE_COLOR_THEMES = [
  { id: 'rose', name: 'Rose / Super Admin', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'blue', name: 'Blue / Admin', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'slate', name: 'Slate / Observer', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' },
  { id: 'indigo', name: 'Indigo / Commission', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'emerald', name: 'Emerald / Voter', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'amber', name: 'Amber / Auditor', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'purple', name: 'Purple / Presiding', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'cyan', name: 'Cyan / Scrutiny', color: 'text-cyan-800', bg: 'bg-cyan-50', border: 'border-cyan-200' },
];

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
];

export function loadStoredRolesConfig(): Record<string, RoleConfig> {
  try {
    const saved = localStorage.getItem(ROLES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // Ensure default roles (Super Admin, Admin, Observer, EC Committee, Registered Voter) are strictly ordered & present
        const merged: Record<string, RoleConfig> = {};
        for (const key of Object.keys(DEFAULT_ROLES_CONFIG)) {
          const raw = parsed[key] || DEFAULT_ROLES_CONFIG[key as UserRole];
          merged[key] = sanitizeRoleConfig(raw);
        }
        for (const key of Object.keys(parsed)) {
          if (!merged[key]) {
            merged[key] = sanitizeRoleConfig(parsed[key]);
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to load roles from localStorage, using default:', err);
  }
  return { ...DEFAULT_ROLES_CONFIG };
}

export function saveStoredRolesConfig(roles: Record<string, RoleConfig>): void {
  try {
    const sanitized: Record<string, RoleConfig> = {};
    for (const [k, v] of Object.entries(roles)) {
      sanitized[k] = sanitizeRoleConfig(v);
    }
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Failed to save roles to localStorage:', err);
  }
}

export function resetStoredRolesConfig(): Record<string, RoleConfig> {
  try {
    localStorage.removeItem(ROLES_STORAGE_KEY);
    localStorage.removeItem('pc_election_roles_config_v6');
    localStorage.removeItem('pc_election_roles_config_v5');
    localStorage.removeItem('pc_election_roles_config_v4');
    localStorage.removeItem('pc_election_roles_config_v3');
    localStorage.removeItem('pc_election_roles_config_v2');
  } catch (err) {
    console.error('Failed to reset roles storage:', err);
  }
  return { ...DEFAULT_ROLES_CONFIG };
}

