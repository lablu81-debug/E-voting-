import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Crown,
  CheckCircle2,
  X,
  Lock,
  Eye,
  Settings,
  Vote,
  BarChart3,
  Users2,
  FileCheck2,
  AlertTriangle,
  Trophy,
  Users,
  LogIn
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { ROLE_CONFIGS, RoleConfig, isTabPermittedForRole } from '../data/rolesData';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentLang: Language;
  rolesConfig?: Record<string, RoleConfig>;
  onOpenLoginModal?: (targetRole?: UserRole) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  currentLang,
  rolesConfig,
  onOpenLoginModal
}) => {
  if (!isOpen) return null;

  const isEn = currentLang === 'en';
  const roles = rolesConfig || ROLE_CONFIGS;
  const roleKeys: UserRole[] = Object.keys(roles) as UserRole[];

  return (
    <div
      id="modal-role-switcher-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-role-switcher-content"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isEn ? 'User Roles & Menu Access Control' : 'ব্যবহারকারী ভূমিকা ও মেনু পারমিশন কন্ট্রোল'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEn
                  ? 'Switch active user profile to experience role-based menu views and administrative permissions'
                  : 'ভূমিকাভিত্তিক মেনু ও পারমিশন পরখ করতে ব্যবহারকারী প্রোফাইল পরিবর্তন করুন'}
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

        {/* Roles List */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3.5">
            {roleKeys
              .filter((roleKey) => {
                // Admin (system_admin) cannot see Super Admin (admin)'s role or menu
                if (currentRole === 'system_admin' && roleKey === 'admin') return false;
                return true;
              })
              .map((roleKey) => {
              const config = roles[roleKey] || ROLE_CONFIGS.admin;
              const isSelected = currentRole === roleKey;
              const user = config.defaultUser;

              return (
                <div
                  key={roleKey}
                  id={`role-option-${roleKey}`}
                  onClick={() => {
                    onSelectRole(roleKey);
                    onClose();
                  }}
                  className={`relative border rounded-xl p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={user.avatar}
                        alt={isEn ? user.name.en : user.name.bn}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {isEn ? user.name.en : user.name.bn}
                          </h4>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.badge.bg} ${config.badge.color} ${config.badge.border}`}
                          >
                            {isEn ? config.badge.en : config.badge.bn}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {isEn ? 'ACTIVE' : 'সক্রিয়'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          {isEn ? user.roleTitle.en : user.roleTitle.bn}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {user.empId} • {isEn ? user.dept?.en : user.dept?.bn}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isSelected ? (isEn ? 'Current Role' : 'বর্তমান ভূমিকা') : (isEn ? 'Select Role' : 'নির্বাচন করুন')}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-200/70">
                    {isEn ? config.description.en : config.description.bn}
                  </p>

                  {/* Menu Permissions Badges: Only render menus permitted for this role */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      {isEn ? 'Accessible Menus:' : 'অনুমোদিত মেনু:'}
                    </span>

                    {isTabPermittedForRole(config, 'ballot') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                        <Users className="w-3.5 h-3.5" />
                        <span>{isEn ? 'EC Ballot (কার্যনির্বাহী)' : 'কার্যনির্বাহী ব্যালট'}</span>
                      </span>
                    )}

                    {isTabPermittedForRole(config, 'vp_ballot') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-100/70 text-amber-800 border border-amber-200">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{isEn ? 'VP Ballot (সহ-সভাপতি)' : 'সহ-সভাপতি ব্যালট'}</span>
                      </span>
                    )}

                    {isTabPermittedForRole(config, 'dashboard') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-100/70 text-blue-800 border border-blue-200">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Dashboard (লাইভ)' : 'ড্যাশবোর্ড'}</span>
                      </span>
                    )}

                    {isTabPermittedForRole(config, 'admin') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-100/70 text-purple-800 border border-purple-200">
                        <Settings className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}</span>
                      </span>
                    )}
                  </div>

                  {/* Permissions Feature Highlights */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className={config.permissions.canVote ? 'text-emerald-600' : 'text-slate-400'}>
                        {config.permissions.canVote ? '✓' : '✗'}
                      </span>
                      <span>{isEn ? 'Cast Vote' : 'ভোট প্রদান'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className={config.permissions.canManageVoterRegistry ? 'text-emerald-600' : 'text-slate-400'}>
                        {config.permissions.canManageVoterRegistry ? '✓' : '✗'}
                      </span>
                      <span>{isEn ? 'Voter Verification' : 'ভোটার যাচাই'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className={config.permissions.canManageCandidates ? 'text-emerald-600' : 'text-slate-400'}>
                        {config.permissions.canManageCandidates ? '✓' : '✗'}
                      </span>
                      <span>{isEn ? 'Nominate Cand.' : 'প্রার্থী মনোনয়ন'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className={config.permissions.canResetDatabase ? 'text-emerald-600' : 'text-rose-500 font-bold'}>
                        {config.permissions.canResetDatabase ? '✓' : '✗'}
                      </span>
                      <span className={!config.permissions.canResetDatabase ? 'text-slate-400' : 'text-rose-700 font-semibold'}>
                        {isEn ? 'DB Purge/Reset' : 'রিসেট ডেটাবেস'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {isEn
                ? 'Role selection controls tab visibility and authorized actions dynamically.'
                : 'ভূমিকা পরিবর্তনের মাধ্যমে মেনু ও অনুমতিসমূহ স্বয়ংক্রিয়ভাবে নিয়ন্ত্রিত হয়।'}
            </span>
          </span>
          <div className="flex items-center gap-3">
            {onOpenLoginModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? 'Officer Login' : 'কর্মকর্তা লগইন'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer text-xs"
            >
              {isEn ? 'Done' : 'সম্পন্ন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
