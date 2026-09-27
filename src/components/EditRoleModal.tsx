import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Crown,
  User,
  Save,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  KeyRound,
  Layers,
  Lock,
  Sparkles,
  Palette,
  RefreshCw,
  Copy,
  CheckCheck
} from 'lucide-react';
import { RoleConfig, ROLE_COLOR_THEMES, AVATAR_PRESETS } from '../data/rolesData';
import { Language, NavigationTab, RolePermissions } from '../types';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleConfig: RoleConfig | null; // null means adding a new role
  onSave: (role: RoleConfig) => void;
  currentLang: Language;
  existingRoleKeys: string[];
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  onClose,
  roleConfig,
  onSave,
  currentLang,
  existingRoleKeys
}) => {
  const isEn = currentLang === 'en';
  const isEditing = Boolean(roleConfig);

  const [activeTab, setActiveTab] = useState<'details' | 'user' | 'auth' | 'permissions'>('details');

  // Form states
  const [roleKey, setRoleKey] = useState<string>('');
  const [badgeEn, setBadgeEn] = useState<string>('');
  const [badgeBn, setBadgeBn] = useState<string>('');
  const [descEn, setDescEn] = useState<string>('');
  const [descBn, setDescBn] = useState<string>('');
  const [themeId, setThemeId] = useState<string>('indigo');

  // User states
  const [userNameEn, setUserNameEn] = useState<string>('');
  const [userNameBn, setUserNameBn] = useState<string>('');
  const [roleTitleEn, setRoleTitleEn] = useState<string>('');
  const [roleTitleBn, setRoleTitleBn] = useState<string>('');
  const [empId, setEmpId] = useState<string>('');
  const [deptEn, setDeptEn] = useState<string>('');
  const [deptBn, setDeptBn] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');

  // Authentication & Credentials (User ID & Password)
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedCredentials, setCopiedCredentials] = useState<boolean>(false);

  // Menus
  const [allowedTabs, setAllowedTabs] = useState<NavigationTab[]>(['ballot', 'dashboard']);

  // Granular Permissions
  const [permissions, setPermissions] = useState<RolePermissions>({
    canVote: true,
    canViewDashboard: true,
    canViewAdminPanel: false,
    canManageCandidates: false,
    canManageVoterRegistry: false,
    canManageElectionStatus: false,
    canResetDatabase: false,
    canDownloadReports: true,
    canManageCommittee: false,
    canConductVpBallot: false
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form when opening or editing
  useEffect(() => {
    if (roleConfig) {
      setRoleKey(roleConfig.role);
      setBadgeEn(roleConfig.badge.en);
      setBadgeBn(roleConfig.badge.bn);
      setDescEn(roleConfig.description.en);
      setDescBn(roleConfig.description.bn);

      // Match theme
      const matchedTheme = ROLE_COLOR_THEMES.find((t) => t.color === roleConfig.badge.color);
      setThemeId(matchedTheme ? matchedTheme.id : 'indigo');

      // User
      setUserNameEn(roleConfig.defaultUser.name.en);
      setUserNameBn(roleConfig.defaultUser.name.bn);
      setRoleTitleEn(roleConfig.defaultUser.roleTitle.en);
      setRoleTitleBn(roleConfig.defaultUser.roleTitle.bn);
      setEmpId(roleConfig.defaultUser.empId || '');
      setDeptEn(roleConfig.defaultUser.dept?.en || '');
      setDeptBn(roleConfig.defaultUser.dept?.bn || '');
      setEmail(roleConfig.defaultUser.email || '');
      setAvatar(roleConfig.defaultUser.avatar || AVATAR_PRESETS[0]);

      // Credentials
      const existingUser = roleConfig.credentials?.username || roleConfig.defaultUser.username || roleConfig.role;
      const existingPass = roleConfig.credentials?.password || roleConfig.defaultUser.password || 'admin123';
      setUsername(existingUser);
      setPassword(existingPass);
      setConfirmPassword(existingPass);

      // Tabs & Permissions
      setAllowedTabs([...roleConfig.allowedTabs]);
      setPermissions({ ...roleConfig.permissions });
    } else {
      // New Role Defaults
      const newKey = `role_${Date.now().toString().slice(-4)}`;
      setRoleKey(newKey);
      setBadgeEn('');
      setBadgeBn('');
      setDescEn('');
      setDescBn('');
      setThemeId('purple');

      setUserNameEn('');
      setUserNameBn('');
      setRoleTitleEn('');
      setRoleTitleBn('');
      setEmpId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
      setDeptEn('Administration');
      setDeptBn('প্রশাসন');
      setEmail('officer@factory.com');
      setAvatar(AVATAR_PRESETS[3]);

      // Credentials default for new role
      const initialUname = `officer_${Math.floor(1000 + Math.random() * 9000)}`;
      const initialPass = `Elect#${Math.floor(1000 + Math.random() * 9000)}`;
      setUsername(initialUname);
      setPassword(initialPass);
      setConfirmPassword(initialPass);

      setAllowedTabs(['ballot', 'dashboard']);
      setPermissions({
        canVote: true,
        canViewDashboard: true,
        canViewAdminPanel: false,
        canManageCandidates: false,
        canManageVoterRegistry: false,
        canManageElectionStatus: false,
        canResetDatabase: false,
        canDownloadReports: true,
        canManageCommittee: false,
        canConductVpBallot: false
      });
    }
    setValidationError(null);
    setShowPassword(false);
    setCopiedCredentials(false);
    setActiveTab('details');
  }, [roleConfig, isOpen]);

  if (!isOpen) return null;

  const currentTheme = ROLE_COLOR_THEMES.find((t) => t.id === themeId) || ROLE_COLOR_THEMES[0];

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const specials = '!@#$%&*';
    generated += uppers.charAt(Math.floor(Math.random() * uppers.length));
    generated += digits.charAt(Math.floor(Math.random() * digits.length));
    generated += specials.charAt(Math.floor(Math.random() * specials.length));
    for (let i = 0; i < 5; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
  };

  const handleSuggestUsername = () => {
    if (userNameEn.trim()) {
      const clean = userNameEn
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      setUsername(clean || `officer_${roleKey || 'user'}`);
    } else if (roleKey.trim()) {
      setUsername(`officer_${roleKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
    } else {
      setUsername(`officer_${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleCopyCredentials = () => {
    const text = `Election Management Portal - Authorized Officer Credentials\nRole: ${badgeEn || roleKey}\nOfficer: ${userNameEn || 'Assigned Officer'}\nUser ID (Username): ${username}\nPassword: ${password}\nLogin Portal: Officer Login System`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  const handleToggleTab = (tab: NavigationTab) => {
    if (allowedTabs.includes(tab)) {
      if (allowedTabs.length === 1) {
        setValidationError(isEn ? 'At least one menu must remain accessible.' : 'অন্তত একটি মেনু অনুমোদিত থাকতে হবে।');
        return;
      }
      const nextTabs = allowedTabs.filter((t) => t !== tab);
      setAllowedTabs(nextTabs);
      // Synchronize corresponding permission
      setPermissions((prev) => {
        if (tab === 'admin') return { ...prev, canViewAdminPanel: false };
        if (tab === 'dashboard') return { ...prev, canViewDashboard: false };
        if (tab === 'vp_ballot') return { ...prev, canConductVpBallot: false };
        if (tab === 'ballot') return { ...prev, canVote: false };
        return prev;
      });
    } else {
      setAllowedTabs([...allowedTabs, tab]);
      // Synchronize corresponding permission
      setPermissions((prev) => {
        if (tab === 'admin') return { ...prev, canViewAdminPanel: true };
        if (tab === 'dashboard') return { ...prev, canViewDashboard: true };
        if (tab === 'vp_ballot') return { ...prev, canConductVpBallot: true };
        if (tab === 'ballot') return { ...prev, canVote: true };
        return prev;
      });
    }
  };

  const handleTogglePermission = (key: keyof RolePermissions) => {
    setPermissions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Synchronize allowedTabs with permission changes
      if (key === 'canViewAdminPanel') {
        if (next.canViewAdminPanel && !allowedTabs.includes('admin')) {
          setAllowedTabs((tabs) => [...tabs, 'admin']);
        } else if (!next.canViewAdminPanel && allowedTabs.includes('admin')) {
          setAllowedTabs((tabs) => tabs.filter((t) => t !== 'admin'));
        }
      }
      if (key === 'canViewDashboard') {
        if (next.canViewDashboard && !allowedTabs.includes('dashboard')) {
          setAllowedTabs((tabs) => [...tabs, 'dashboard']);
        } else if (!next.canViewDashboard && allowedTabs.includes('dashboard')) {
          setAllowedTabs((tabs) => tabs.filter((t) => t !== 'dashboard'));
        }
      }
      if (key === 'canConductVpBallot') {
        if (next.canConductVpBallot && !allowedTabs.includes('vp_ballot')) {
          setAllowedTabs((tabs) => [...tabs, 'vp_ballot']);
        } else if (!next.canConductVpBallot && allowedTabs.includes('vp_ballot')) {
          setAllowedTabs((tabs) => tabs.filter((t) => t !== 'vp_ballot'));
        }
      }
      if (key === 'canVote') {
        if (next.canVote && !allowedTabs.includes('ballot')) {
          setAllowedTabs((tabs) => [...tabs, 'ballot']);
        } else if (!next.canVote && allowedTabs.includes('ballot')) {
          setAllowedTabs((tabs) => tabs.filter((t) => t !== 'ballot'));
        }
      }
      return next;
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanKey = roleKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanKey) {
      setValidationError(isEn ? 'Role identifier is required.' : 'ভূমিকার আইডেন্টিফায়ার প্রয়োজন।');
      setActiveTab('details');
      return;
    }

    if (!isEditing && existingRoleKeys.includes(cleanKey)) {
      setValidationError(isEn ? 'A role with this identifier already exists.' : 'এই আইডেন্টিফায়ারের একটি ভূমিকা ইতোমধ্যে বিদ্যমান।');
      setActiveTab('details');
      return;
    }

    if (!badgeEn.trim() && !badgeBn.trim()) {
      setValidationError(isEn ? 'Role display name is required.' : 'ভূমিকার প্রদর্শিত নাম প্রয়োজন।');
      setActiveTab('details');
      return;
    }

    if (!userNameEn.trim() && !userNameBn.trim()) {
      setValidationError(isEn ? 'Assigned officer name is required.' : 'দায়িত্বপ্রাপ্ত কর্মকর্তার নাম প্রয়োজন।');
      setActiveTab('user');
      return;
    }

    // Validate User ID & Password Authentication System
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (!cleanUsername) {
      setValidationError(isEn ? 'Officer User ID (Username) is required for login.' : 'লগইনের জন্য কর্মকর্তার ইউজার আইডি (ইউজারনেম) আবশ্যক।');
      setActiveTab('auth');
      return;
    }

    if (cleanUsername.length < 3) {
      setValidationError(isEn ? 'User ID must be at least 3 characters long.' : 'ইউজার আইডি অন্তত ৩ অক্ষরের হতে হবে।');
      setActiveTab('auth');
      return;
    }

    if (!password || password.trim().length < 4) {
      setValidationError(isEn ? 'Password must be at least 4 characters long.' : 'পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।');
      setActiveTab('auth');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(isEn ? 'Password and confirm password do not match.' : 'পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।');
      setActiveTab('auth');
      return;
    }

    if (allowedTabs.length === 0) {
      setValidationError(isEn ? 'Please select at least one authorized menu.' : 'অনুগ্রহ করে অন্তত একটি অনুমোদিত মেনু নির্বাচন করুন।');
      setActiveTab('permissions');
      return;
    }

    const finalRoleKey = isEditing && roleConfig ? roleConfig.role : cleanKey;

    const updatedRole: RoleConfig = {
      role: finalRoleKey,
      badge: {
        en: badgeEn.trim() || badgeBn.trim(),
        bn: badgeBn.trim() || badgeEn.trim(),
        color: currentTheme.color,
        bg: currentTheme.bg,
        border: currentTheme.border
      },
      description: {
        en: descEn.trim() || (isEn ? 'Authorized operations role.' : 'অনুমোদিত প্রশাসনিক ভূমিকা।'),
        bn: descBn.trim() || (isEn ? 'Authorized operations role.' : 'অনুমোদিত প্রশাসনিক ভূমিকা।')
      },
      allowedTabs,
      permissions,
      credentials: {
        username: cleanUsername,
        password: password.trim()
      },
      defaultUser: isEditing && roleConfig
        ? {
            ...roleConfig.defaultUser,
            role: roleConfig.role,
            roleTitle: {
              en: roleTitleEn.trim() || roleConfig.defaultUser.roleTitle.en,
              bn: roleTitleBn.trim() || roleConfig.defaultUser.roleTitle.bn
            },
            username: cleanUsername,
            password: password.trim()
          }
        : {
            id: `usr-${cleanKey}-${Date.now().toString().slice(-4)}`,
            name: {
              en: userNameEn.trim() || userNameBn.trim(),
              bn: userNameBn.trim() || userNameEn.trim()
            },
            role: cleanKey,
            roleTitle: {
              en: roleTitleEn.trim() || badgeEn.trim(),
              bn: roleTitleBn.trim() || badgeBn.trim()
            },
            empId: empId.trim() || 'EMP-001',
            dept: {
              en: deptEn.trim() || 'General Operations',
              bn: deptBn.trim() || 'সাধারণ পরিচালনা'
            },
            avatar: avatar || AVATAR_PRESETS[0],
            email: email.trim() || `${cleanKey}@factory.com`,
            username: cleanUsername,
            password: password.trim()
          },
      isRoleLocked: true,
      assignedBy: roleConfig?.assignedBy || 'Super Admin (admin)',
      assignedAt: roleConfig?.assignedAt || new Date().toISOString(),
      lockReason: roleConfig?.lockReason || {
        en: "Role assigned and saved by Super Admin (admin). Policy prohibits altering this user's assigned role.",
        bn: "সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।"
      }
    };

    onSave(updatedRole);
    onClose();
  };

  return (
    <div
      id="modal-edit-role-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-edit-role-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isEditing
                    ? isEn ? 'Edit Role & Permissions (RBAC)' : 'ভূমিকা ও পারমিশন সম্পাদনা (RBAC)'
                    : isEn ? 'Create New Role (RBAC)' : 'নতুন ভূমিকা তৈরি করুন (RBAC)'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {isEditing ? (isEn ? 'Update' : 'হালনাগাদ') : (isEn ? 'New Role' : 'নতুন')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEn
                  ? 'Configure role identity, officer profile, login User ID & password, and granular capabilities'
                  : 'ভূমিকার নাম, কর্মকর্তা প্রোফাইল, লগইন ইউজার আইডি ও পাসওয়ার্ড এবং পারমিশন ম্যাট্রিক্স কনফিগার করুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-1.5 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {isEn ? '1. Role Identity' : '১. ভূমিকা ও থিম'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'user'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {isEn ? '2. Assigned Officer' : '২. দায়িত্বপ্রাপ্ত কর্মকর্তা'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'auth'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isEn ? '3. User ID & Password' : '৩. ইউজার আইডি ও পাসওয়ার্ড'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'permissions'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {isEn ? '4. Menus & Permissions' : '৪. মেনু ও পারমিশন'}
          </button>
        </div>

        {/* Lock Notice if role was assigned and saved by Super Admin */}
        {isEditing && (
          <div className="mx-5 mt-4 p-3.5 rounded-xl bg-amber-50/95 border border-amber-300 flex items-start gap-3 text-xs text-amber-950 shrink-0 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="font-bold flex items-center gap-2 flex-wrap">
                <span className="text-amber-900 text-xs sm:text-sm">
                  {isEn ? "Role Assignment Locked & Saved by Super Admin (admin)" : "ভূমিকা নির্ধারণ সম্পন্ন ও সুপার অ্যাডমিন দ্বারা লক করা"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
                  {isEn ? "Immutable Role" : "অপরিবর্তনীয়"}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {isEn
                  ? `Security Policy Enforced: The role "${roleConfig?.badge?.en}" assigned to ${roleConfig?.defaultUser?.name?.en || 'User'} (${roleConfig?.defaultUser?.empId || roleConfig?.defaultUser?.id}) has been assigned and saved by Super Admin. Policy strictly protects this role assignment.`
                  : `নিরাপত্তা নীতি কার্যকর: "${roleConfig?.badge?.bn}" ভূমিকাটি ${roleConfig?.defaultUser?.name?.bn || 'ব্যবহারকারী'}-কে সুপার অ্যাডমিন দ্বারা প্রদান ও সংরক্ষণ করা হয়েছে।`}
              </p>
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {validationError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <form id="form-edit-role" onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: ROLE IDENTITY & THEME */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role Identifier Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {isEn ? 'Role Identifier (Key)' : 'ভূমিকার আইডেন্টিফায়ার (কী)'}
                    </label>
                    {isEditing && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{isEn ? 'Locked' : 'লকড'}</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                    placeholder="e.g. returning_officer"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {isEditing
                      ? (isEn ? 'Role key is permanent and cannot be modified.' : 'ভূমিকার কোড অপরিবর্তনীয়।')
                      : (isEn ? 'Unique system slug (lowercase alphanumeric with underscores).' : 'অনন্য সিস্টেম কোড (ছোট হাতের অক্ষর ও আন্ডারস্কোর)।')}
                  </span>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Badge Color Theme' : 'ব্যাজ কালার থিম'}
                  </label>
                  <select
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {ROLE_COLOR_THEMES.map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">{isEn ? 'Preview:' : 'প্রিভিউ:'}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentTheme.bg} ${currentTheme.color} ${currentTheme.border}`}>
                      {badgeEn || (isEn ? 'Role Badge Preview' : 'রোল ব্যাজ প্রিভিউ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Names (EN & BN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Role Display Name (English)' : 'ভূমিকার নাম (ইংরেজি)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={badgeEn}
                    onChange={(e) => setBadgeEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Returning Officer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Role Display Name (Bangla)' : 'ভূমিকার নাম (বাংলা)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={badgeBn}
                    onChange={(e) => setBadgeBn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="যেমন: রিটার্নিং অফিসার"
                    required
                  />
                </div>
              </div>

              {/* Role Descriptions (EN & BN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Operational Scope & Duty (English)' : 'দায়িত্ব ও পরিধি (ইংরেজি)'}
                  </label>
                  <textarea
                    rows={3}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    placeholder="e.g. Oversees ballot distribution, token issuance, and official compliance audit."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Operational Scope & Duty (Bangla)' : 'দায়িত্ব ও পরিধি (বাংলা)'}
                  </label>
                  <textarea
                    rows={3}
                    value={descBn}
                    onChange={(e) => setDescBn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    placeholder="যেমন: ব্যালট পেপার বিতরণ, ভোটার টোকেন যাচাই ও কমপ্লায়েন্স নিরীক্ষণ পরিচালনা।"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED OFFICER PROFILE */}
          {activeTab === 'user' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {isEditing ? (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-950">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block">
                        {isEn ? "User Profile & Assigned Role are Locked" : "ব্যবহারকারীর প্রোফাইল ও নির্ধারিত ভূমিকা লক করা"}
                      </span>
                      <span className="text-[11px] text-amber-800">
                        {isEn
                          ? "This user's role was assigned and saved by Super Admin. Under security regulations, this user cannot be reassigned or have their role altered."
                          : "এই ব্যবহারকারীর ভূমিকা সুপার অ্যাডমিন দ্বারা নির্ধারিত ও সংরক্ষিত। নীতি অনুযায়ী ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wide shrink-0">
                    {isEn ? "Immutable" : "লকড"}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                  {isEn
                    ? 'Define the default persona/officer assigned to this operational role. Switching to this role will adopt this profile identity in the header and audit logs.'
                    : 'এই ভূমিকার জন্য নির্ধারিত দায়িত্বপ্রাপ্ত কর্মকর্তার পরিচয় নির্ধারণ করুন। ভূমিকা সক্রিয় করলে হেডারে এই কর্মকর্তার নাম ও পরিচিতি প্রদর্শিত হবে।'}
                </div>
              )}

              {/* Officer Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Officer Full Name (English)' : 'কর্মকর্তার নাম (ইংরেজি)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userNameEn}
                    onChange={(e) => setUserNameEn(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="e.g. Md. Tariqul Islam"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Officer Full Name (Bangla)' : 'কর্মকর্তার নাম (বাংলা)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userNameBn}
                    onChange={(e) => setUserNameBn(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="যেমন: মো: তারিকুল ইসলাম"
                    required
                  />
                </div>
              </div>

              {/* Official Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Official Title (English)' : 'পদবী / দায়িত্ব (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={roleTitleEn}
                    onChange={(e) => setRoleTitleEn(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="e.g. Senior Election Returning Officer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Official Title (Bangla)' : 'পদবী / দায়িত্ব (বাংলা)'}
                  </label>
                  <input
                    type="text"
                    value={roleTitleBn}
                    onChange={(e) => setRoleTitleBn(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="যেমন: সিনিয়র নির্বাচন রিটার্নিং কর্মকর্তা"
                  />
                </div>
              </div>

              {/* Employee ID & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Employee ID' : 'কর্মকর্তা আইডি'}
                  </label>
                  <input
                    type="text"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="e.g. EMP-RO-009"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Department (English)' : 'বিভাগ (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={deptEn}
                    onChange={(e) => setDeptEn(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="e.g. Legal & Compliance"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? 'Department (Bangla)' : 'বিভাগ (বাংলা)'}
                  </label>
                  <input
                    type="text"
                    value={deptBn}
                    onChange={(e) => setDeptBn(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="যেমন: লিগ্যাল ও কমপ্লায়েন্স"
                  />
                </div>
              </div>

              {/* Avatar Photo Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isEn ? 'Officer Avatar / Portrait' : 'কর্মকর্তার প্রোফাইল ছবি'}
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatar || AVATAR_PRESETS[0]}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 shadow-xs shrink-0"
                  />
                  {!isEditing && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {AVATAR_PRESETS.map((pUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(pUrl)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            avatar === pUrl ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-105' : 'border-slate-200 hover:border-slate-400 opacity-80'
                          }`}
                        >
                          <img src={pUrl} alt="Avatar Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER ID & PASSWORD SYSTEM (RBC AUTHENTICATION) */}
          {activeTab === 'auth' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {isEn ? 'Role-Based Control (RBC) Login Credential System' : 'ভূমিকাভিত্তিক নিয়ন্ত্রণ (RBC) ইউজার লগইন সিস্টেম'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {isEn
                      ? 'Set up the unique User ID and Password for this role. Officers assigned to this role can sign into the Officer User Login Portal immediately to access their permitted election tools.'
                      : 'এই ভূমিকার জন্য নির্দিষ্ট ইউজার আইডি (ইউজারনেম) ও পাসওয়ার্ড নির্ধারণ করুন। কর্মকর্তা এই তথ্য দিয়ে সরাসরি অফিসার লগইন পোর্টাল ব্যবহার করতে পারবেন।'}
                  </p>
                </div>
              </div>

              {/* User ID Field */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    {isEn ? 'Officer User ID (Username for Login)' : 'কর্মকর্তা ইউজার আইডি (লগইন ইউজারনেম)'} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestUsername}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isEn ? 'Auto-suggest User ID' : 'স্বয়ংক্রিয় ইউজার আইডি'}</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-role-user-id"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
                    placeholder="e.g. officer_election, ro_chittagong"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{isEn ? 'Unique identifier used at the Officer Login Portal' : 'অফিসার লগইন পোর্টালে এই আইডি ব্যবহার করতে হবে'}</span>
                  <span className="font-mono text-indigo-600">@{username || 'userid'}</span>
                </div>
              </div>

              {/* Password & Confirm Password Fields */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    {isEn ? 'Role Password' : 'লগইন পাসওয়ার্ড'} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{isEn ? 'Generate Strong Password' : 'নিরাপদ পাসওয়ার্ড তৈরি করুন'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {isEn ? 'Password' : 'পাসওয়ার্ড'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        id="input-role-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="Min 4 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {isEn ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত করুন'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        id="input-role-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-xs font-mono border rounded-xl bg-white focus:outline-hidden focus:ring-2 ${
                          confirmPassword && password !== confirmPassword
                            ? 'border-rose-400 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-indigo-500'
                        }`}
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Match Status */}
                {confirmPassword && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {password === confirmPassword ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {isEn ? 'Passwords match successfully' : 'পাসওয়ার্ড সফলভাবে মিলেছে'}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {isEn ? 'Passwords do not match' : 'পাসওয়ার্ড মিলছে না'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Handover Credentials Card */}
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold tracking-wider uppercase text-indigo-200">
                      {isEn ? 'Officer Login Handover Card' : 'অফিসার লগইন হ্যান্ডওভার কার্ড'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer border border-white/15"
                  >
                    {copiedCredentials ? (
                      <>
                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">{isEn ? 'Copied!' : 'কপি হয়েছে!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{isEn ? 'Copy Credentials' : 'তথ্য কপি করুন'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                      {isEn ? 'Assigned Role' : 'নির্ধারিত ভূমিকা'}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs block mt-0.5 truncate">
                      {badgeEn || (isEn ? 'New Role' : 'নতুন ভূমিকা')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-indigo-300 block uppercase tracking-wider font-semibold">
                      {isEn ? 'User ID (Login)' : 'ইউজার আইডি (লগইন)'}
                    </span>
                    <span className="font-mono font-bold text-white text-xs block mt-0.5 truncate">
                      {username || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-amber-300 block uppercase tracking-wider font-semibold">
                      {isEn ? 'Password' : 'পাসওয়ার্ড'}
                    </span>
                    <span className="font-mono font-bold text-amber-200 text-xs block mt-0.5 truncate">
                      {showPassword ? password || '—' : '••••••••'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MENUS & GRANULAR PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Authorized Menus */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isEn ? 'Authorized Navigation Menus' : 'অনুমোদিত নেভিগেশন মেনু'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {allowedTabs.length}/4 {isEn ? 'active' : 'সক্রিয়'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isEn
                    ? 'Check which primary application views users in this role can see and access in the header.'
                    : 'এই ভূমিকার ব্যবহারকারীরা হেডারে কোন কোন মেনু দেখতে ও ব্যবহার করতে পারবে তা নির্বাচন করুন।'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'ballot' as NavigationTab, labelEn: 'EC Ballot', labelBn: 'সাধারণ ব্যালট', desc: 'Worker voting' },
                    { id: 'vp_ballot' as NavigationTab, labelEn: 'VP Ballot', labelBn: 'সহ-সভাপতি ব্যালট', desc: 'Elected college' },
                    { id: 'dashboard' as NavigationTab, labelEn: 'Dashboard', labelBn: 'ড্যাশবোর্ড', desc: 'Live analytics' },
                    { id: 'admin' as NavigationTab, labelEn: 'Admin Panel', labelBn: 'অ্যাডমিন প্যানেল', desc: 'Operations' }
                  ].map((tab) => {
                    const isSelected = allowedTabs.includes(tab.id);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleToggleTab(tab.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{isEn ? tab.labelEn : tab.labelBn}</span>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{tab.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions Toggles */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isEn ? 'Granular System Privileges' : 'গ্র্যানুলার সিস্টেম পারমিশন'}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {Object.values(permissions).filter(Boolean).length}/10 {isEn ? 'granted' : 'অনুমোদিত'}
                  </span>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden">
                  {[
                    {
                      key: 'canVote' as keyof RolePermissions,
                      titleEn: 'General Worker Secret Ballot',
                      titleBn: 'সাধারণ কর্মী গোপন ব্যালট',
                      desc: isEn ? 'Vote in EC general electorate' : 'সাধারণ নির্বাচনে ভোটদান'
                    },
                    {
                      key: 'canConductVpBallot' as keyof RolePermissions,
                      titleEn: 'Vice President Secret Ballot',
                      titleBn: 'সহ-সভাপতি গোপন ব্যালট',
                      desc: isEn ? 'Cast ballot in Electoral College VP election' : 'ইলেকটোরাল কলেজ সহ-সভাপতি ব্যালট'
                    },
                    {
                      key: 'canViewDashboard' as keyof RolePermissions,
                      titleEn: 'Live Results Dashboard',
                      titleBn: 'লাইভ ফলাফল ও ড্যাশবোর্ড',
                      desc: isEn ? 'View real-time turnout, analytics and audit logs' : 'সরাসরি টার্নআউট ও ফলাফল পর্যবেক্ষণ'
                    },
                    {
                      key: 'canViewAdminPanel' as keyof RolePermissions,
                      titleEn: 'Admin Panel & Operations Booth',
                      titleBn: 'অ্যাডমিন প্যানেল ও বুথ',
                      desc: isEn ? 'Access administrative console and booths' : 'প্রশাসনিক কনসোল ও বুথে প্রবেশ'
                    },
                    {
                      key: 'canManageCandidates' as keyof RolePermissions,
                      titleEn: 'Nominate & Manage Candidates',
                      titleBn: 'প্রার্থী মনোনয়ন ও পরিচালনা',
                      desc: isEn ? 'Add, edit, or remove VP and EC candidates' : 'প্রার্থী মনোনয়ন ও প্রত্যাহার'
                    },
                    {
                      key: 'canManageVoterRegistry' as keyof RolePermissions,
                      titleEn: 'Voter Registry & Bulk Import',
                      titleBn: 'ভোটার তালিকা ও বাল্ক আপলোড',
                      desc: isEn ? 'Manage voters and upload Excel rosters' : 'ভোটার তালিকা তৈরি ও এক্সেল ফাইল আপলোড'
                    },
                    {
                      key: 'canManageElectionStatus' as keyof RolePermissions,
                      titleEn: 'Control Polling Status',
                      titleBn: 'ভোটগ্রহণের অবস্থা নিয়ন্ত্রণ',
                      desc: isEn ? 'Activate, pause or close general polling' : 'ভোটগ্রহণ শুরু, স্থগিত বা সমাপ্ত ঘোষণা'
                    },
                    {
                      key: 'canManageCommittee' as keyof RolePermissions,
                      titleEn: 'Manage Organizing Committee',
                      titleBn: 'নির্বাচন পরিচালনা কমিটি ব্যবস্থাপনা',
                      desc: isEn ? 'Assign presiding officers & members' : 'প্রিজাইডিং অফিসার ও কমিটি পরিচালনা'
                    },
                    {
                      key: 'canDownloadReports' as keyof RolePermissions,
                      titleEn: 'Certified Election Reports',
                      titleBn: 'অফিসিয়াল সার্টিফিকেট ও রিপোর্ট',
                      desc: isEn ? 'Generate Gazette Declaration and Voter Reports' : 'ফলাফল সার্টিফিকেট ও ভোটার রিপোর্ট প্রিন্ট'
                    },
                    {
                      key: 'canResetDatabase' as keyof RolePermissions,
                      titleEn: 'Purge & Reset Election Database',
                      titleBn: 'ডেটাবেস পার্জ ও রিসেট',
                      desc: isEn ? 'Wipe all cast ballots and reset tallies (Dangerous)' : 'সকল ভোট মুছে ফেলে সিস্টেম রিসেট'
                    }
                  ].map((perm) => {
                    const isChecked = permissions[perm.key];
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                      >
                        <div className="pr-4">
                          <p className="font-semibold text-slate-800">
                            {isEn ? perm.titleEn : perm.titleBn}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{perm.desc}</p>
                        </div>
                        <button
                          type="button"
                          className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                            isChecked ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                              isChecked ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            {isEn ? 'Cancel' : 'বাতিল'}
          </button>

          <button
            type="submit"
            form="form-edit-role"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEn ? 'Save Role & Credentials' : 'ভূমিকা ও পাসওয়ার্ড সংরক্ষণ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
