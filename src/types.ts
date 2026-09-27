export type Language = 'en' | 'bn';

export type PositionCategory = 'vp' | 'ec';

export type ElectionStatus = 'active' | 'paused' | 'closed';

export type VoterStatus = 'Voted' | 'Pending';

export interface Candidate {
  id: string;
  nameEn: string;
  nameBn: string;
  deptEn: string;
  deptBn: string;
  votes: number;
  img: string;
  category: PositionCategory;
  empId?: string;
}

export interface Voter {
  id: string;
  empId: string;
  name: string;
  desig: string;
  dept: string;
  section: string;
  subSection: string;
  linkSent: boolean;
  status: VoterStatus;
  photo: string;
  doj?: string;
  gender?: string;
  empCategory?: string;
  lineInfo?: string;
  assignedRole?: UserRole;
  isRoleLocked?: boolean;
  roleAssignedBy?: string;
  roleAssignedAt?: string;
}

export interface CommitteeMember {
  id: string;
  badge: { en: string; bn: string };
  name: { en: string; bn: string };
  dept: { en: string; bn: string };
  img: string;
  roleDescription?: { en: string; bn: string };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  message: string;
}

export interface VpElectorVote {
  ecMemberId: string;
  ecMemberNameEn: string;
  ecMemberNameBn: string;
  ecMemberDeptEn: string;
  ecMemberDeptBn: string;
  vpCandidateId: string;
  vpCandidateNameEn: string;
  vpCandidateNameBn: string;
  timestamp: string;
}

export type UserRole = 'admin' | 'system_admin' | 'observer' | 'ec_committee' | 'voter' | (string & {});

export type NavigationTab = 'ballot' | 'vp_ballot' | 'dashboard' | 'admin';

export interface UserCredentials {
  username: string;
  password?: string;
  lastLogin?: string;
}

export interface UserProfile {
  id: string;
  name: { en: string; bn: string };
  role: UserRole;
  roleTitle: { en: string; bn: string };
  empId?: string;
  dept?: { en: string; bn: string };
  avatar?: string;
  email?: string;
  username?: string;
  password?: string;
  credentials?: UserCredentials;
}

export interface RolePermissions {
  canVote: boolean;
  canViewDashboard: boolean;
  canViewAdminPanel: boolean;
  canManageCandidates: boolean;
  canManageVoterRegistry: boolean;
  canManageElectionStatus: boolean;
  canResetDatabase: boolean;
  canDownloadReports: boolean;
  canManageCommittee: boolean;
  canConductVpBallot: boolean;
}

