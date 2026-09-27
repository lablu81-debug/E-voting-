import React, { useState } from 'react';
import { Vote, ShieldCheck, ChevronDown, User, Crown, Shield, Eye, Menu, LogIn } from 'lucide-react';
import { Language, UserRole, NavigationTab } from '../types';
import { i18n } from '../data/initialData';
import { ROLE_CONFIGS, RoleConfig } from '../data/rolesData';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenRoleModal?: () => void;
  rolesConfig?: Record<string, RoleConfig>;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenLoginModal?: (targetRole?: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  currentRole,
  onRoleChange,
  rolesConfig,
  onToggleSidebar,
  isSidebarOpen = false,
  onOpenLoginModal
}) => {
  const t = i18n[currentLang];
  const isEn = currentLang === 'en';
  const roles = rolesConfig || ROLE_CONFIGS;
  const roleConfig = roles[currentRole] || roles.admin || ROLE_CONFIGS.admin;
  const activeUser = roleConfig.defaultUser;

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 no-print sticky top-0 z-40">
      {/* Main Brand & User Utilities Bar */}
      <div className="w-full px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Identity & Sidebar Menu Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                id="btn-sidebar-toggle"
                type="button"
                onClick={onToggleSidebar}
                className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                  isSidebarOpen
                    ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 shadow-blue-500/25'
                    : 'bg-slate-800 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600'
                }`}
                title={isSidebarOpen ? (isEn ? 'Collapse Sidebar Navigation' : 'সাইডবার লুকান') : (isEn ? 'Open Full Sidebar Menu (All Modules)' : 'সম্পূর্ণ সাইডবার মেনু খুলুন')}
              >
                <Menu className="w-4 h-4 text-white" />
                <span className="hidden sm:inline font-bold tracking-wide">
                  {isEn ? 'Menu' : 'মেনু'}
                </span>
              </button>
            )}

            <div className="h-6 w-px bg-slate-800 hidden sm:block shrink-0" />

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <Vote className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 id="hdr-title" className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight truncate">
                  {t.hdrTitle}
                </h1>
                <span className="hidden md:inline-block text-[10px] bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-700 shrink-0">
                  {t.hdrBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight truncate">
                {isEn ? 'Worker Representation Portal' : 'শ্রমিক প্রতিনিধিত্ব পোর্টাল'}
              </p>
            </div>
          </div>

          {/* Right Controls: Language Switcher and Active Role Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800" role="group">
              <button
                id="btn-lang-en"
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                id="btn-lang-bn"
                type="button"
                onClick={() => onLanguageChange('bn')}
                className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  currentLang === 'bn'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* User Login Option (Non-voter Officer Authentication) */}
            {onOpenLoginModal && (
              <button
                id="btn-header-user-login"
                type="button"
                onClick={() => onOpenLoginModal()}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-blue-500/30 border border-blue-400/40 transition-all cursor-pointer"
                title={isEn ? 'Officer User Login (Super Admin, Admin, EC, Observer)' : 'কর্মকর্তা ইউজার লগইন'}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-bold">
                  {isEn ? 'User Login' : 'ইউজার লগইন'}
                </span>
              </button>
            )}

            {/* Active Role & User Profile Switcher */}
            <div className="relative">
              <button
                id="btn-active-role-trigger"
                type="button"
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-xs text-left transition-all cursor-pointer group"
                title={isEn ? 'Click to switch user role & menu permissions' : 'ভূমিকা ও পারমিশন পরিবর্তন করতে ক্লিক করুন'}
              >
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name.en}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600 shrink-0"
                />
                <div className="hidden sm:block leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200 text-xs truncate max-w-[120px] md:max-w-[150px]">
                      {isEn ? activeUser.name.en : activeUser.name.bn}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${roleConfig.badge.bg} ${roleConfig.badge.color}`}>
                      {isEn ? roleConfig.badge.en : roleConfig.badge.bn}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {currentRole === 'admin'
                      ? (isEn ? 'Super Admin' : 'সুপার অ্যাডমিন')
                      : currentRole === 'system_admin'
                      ? (isEn ? 'Admin Access' : 'অ্যাডমিন পারমিশন')
                      : currentRole === 'observer'
                      ? (isEn ? 'Observer View' : 'পর্যবেক্ষক ভিউ')
                      : currentRole === 'ec_committee'
                      ? (isEn ? 'EC Access' : 'কমিটি পারমিশন')
                      : (isEn ? 'Voter View' : 'ভোটার ভিউ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
              </button>

              {/* Quick Role Dropdown */}
              {isRoleMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleMenuOpen(false)}
                  />
                  <div
                    id="dropdown-role-menu"
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                      <span>{isEn ? 'Switch Active Role' : 'ভূমিকা পরিবর্তন করুন'}</span>
                    </div>

                    {(Object.keys(roles) as UserRole[])
                      .filter((r) => {
                        // Admin (system_admin) cannot see Super Admin (admin)'s menu or role option
                        if (currentRole === 'system_admin' && r === 'admin') return false;
                        return true;
                      })
                      .map((r) => {
                      const cfg = roles[r] || ROLE_CONFIGS.admin;
                      const isCurrent = currentRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            onRoleChange(r);
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {r === 'admin' ? (
                              <Crown className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : r === 'system_admin' ? (
                              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                            ) : r === 'observer' ? (
                              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                            ) : r === 'ec_committee' ? (
                              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                            ) : (
                              <User className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-200">
                                {isEn ? cfg.badge.en : cfg.badge.bn}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {r === 'voter'
                                  ? (isEn ? 'Ballot & Dashboard' : 'ব্যালট ও লাইভ ড্যাশবোর্ড')
                                  : r === 'observer'
                                  ? (isEn ? 'Audit & Observation' : 'নিরীক্ষা ও পর্যবেক্ষণ')
                                  : r === 'ec_committee'
                                  ? (isEn ? 'Ballot, Dash & Committee' : 'ব্যালট, ড্যাশ ও পর্যবেক্ষণ')
                                  : r === 'system_admin'
                                  ? (isEn ? 'Admin & Roster Controls' : 'প্রশাসনিক ও তালিকা নিয়ন্ত্রণ')
                                  : cfg.permissions.canViewAdminPanel
                                  ? (isEn ? 'Full Admin Controls' : 'পূর্ণ প্রশাসনিক নিয়ন্ত্রণ')
                                  : (isEn ? 'Restricted Access' : 'সীমাবদ্ধ অ্যাক্সেস')}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {onOpenLoginModal && (
                      <div className="p-2 border-t border-slate-800 bg-slate-950/60 mt-1">
                        <button
                          id="btn-dropdown-open-login"
                          type="button"
                          onClick={() => {
                            setIsRoleMenuOpen(false);
                            onOpenLoginModal();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Officer Login Portal' : 'কর্মকর্তা লগইন পোর্টাল'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

