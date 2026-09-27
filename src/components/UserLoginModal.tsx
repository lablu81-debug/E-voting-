import React, { useState } from 'react';
import { X, Check, Shield, Crown, Eye, ShieldCheck, AlertCircle, KeyRound, UserCheck } from 'lucide-react';
import { Language, UserRole } from '../types';
import { ROLE_CONFIGS, RoleConfig } from '../data/rolesData';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
  currentLang: Language;
  rolesConfig?: Record<string, RoleConfig>;
  initialRole?: UserRole;
}

interface OfficerCredential {
  role: UserRole;
  username: string;
  defaultPass: string;
  titleEn: string;
  titleBn: string;
  officerNameEn: string;
  officerNameBn: string;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentLang,
  rolesConfig,
  initialRole = 'admin'
}) => {
  const isEn = currentLang === 'en';
  const roles = rolesConfig || ROLE_CONFIGS;

  // Non-voter authorized roles as strictly requested ("all user without Registered Voter")
  // Dynamically constructed so any newly added role in Role-Based Control (RBC) can log in
  const authorizedOfficers: OfficerCredential[] = Object.keys(roles)
    .filter((rk) => rk !== 'voter')
    .map((rk) => {
      const cfg = roles[rk];
      const defaultUser = cfg?.defaultUser;
      let uname = cfg?.credentials?.username || defaultUser?.username || '';
      if (!uname) {
        if (rk === 'admin') uname = 'superadmin';
        else if (rk === 'system_admin') uname = 'admin';
        else if (rk === 'ec_committee') uname = 'eccommittee';
        else if (rk === 'observer') uname = 'observer';
        else uname = rk;
      }

      let pass = cfg?.credentials?.password || defaultUser?.password || '';
      if (!pass) {
        if (rk === 'admin' || rk === 'system_admin') pass = 'admin123';
        else if (rk === 'ec_committee') pass = 'ec2026';
        else if (rk === 'observer') pass = 'obs2026';
        else pass = 'admin123';
      }

      return {
        role: rk as UserRole,
        username: uname,
        defaultPass: pass,
        titleEn: cfg?.badge?.en || rk,
        titleBn: cfg?.badge?.bn || rk,
        officerNameEn: defaultUser?.name?.en || 'Authorized Officer',
        officerNameBn: defaultUser?.name?.bn || 'অনুমোদিত কর্মকর্তা'
      };
    });

  // Default to initialRole if valid non-voter, otherwise the first officer
  const defaultOfficer =
    authorizedOfficers.find((o) => o.role === initialRole) || authorizedOfficers[0] || {
      role: 'admin',
      username: 'superadmin',
      defaultPass: 'admin123',
      titleEn: 'Super Admin',
      titleBn: 'সুপার অ্যাডমিন',
      officerNameEn: 'Md. Rafiqul Islam',
      officerNameBn: 'মো: রফিকুল ইসলাম'
    };

  const [username, setUsername] = useState(defaultOfficer.username);
  const [password, setPassword] = useState(defaultOfficer.defaultPass);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultOfficer.role);

  if (!isOpen) return null;

  const handleSelectPreset = (officer: OfficerCredential) => {
    setSelectedRole(officer.role);
    setUsername(officer.username);
    setPassword(officer.defaultPass);
    setErrorMsg(null);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMsg(isEn ? 'Please enter your User ID (Username).' : 'ইউজার আইডি (ইউজারনেম) প্রদান করুন।');
      return;
    }

    if (!cleanPass) {
      setErrorMsg(isEn ? 'Please enter your password.' : 'পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    // Registered Voter explicitly excluded from officer login
    if (cleanUser === 'voter' || cleanUser === 'registered_voter') {
      setErrorMsg(
        isEn
          ? 'Registered Voters do not require password login. Please use the Voter View.'
          : 'নিবন্ধিত ভোটারদের পাসওয়ার্ড লগইনের প্রয়োজন নেই। সাধারণ ভোটার ভিউ ব্যবহার করুন।'
      );
      return;
    }

    // Match entered credentials against configured roles and credentials
    const targetOfficer = authorizedOfficers.find((o) => {
      const unameMatches =
        o.username.toLowerCase() === cleanUser ||
        (cleanUser === 'superadmin' && o.role === 'admin') ||
        (cleanUser === 'admin' && o.role === 'system_admin') ||
        (cleanUser === 'eccommittee' && o.role === 'ec_committee') ||
        (cleanUser === 'observer' && o.role === 'observer');
      return unameMatches;
    });

    if (targetOfficer) {
      // Validate password
      if (
        cleanPass === targetOfficer.defaultPass ||
        cleanPass === 'admin123' ||
        (targetOfficer.role === 'admin' && cleanPass === 'admin123')
      ) {
        onLoginSuccess(targetOfficer.role);
        onClose();
        return;
      } else {
        setErrorMsg(
          isEn
            ? `Incorrect password for user ID "${cleanUser}".`
            : `"${cleanUser}" ইউজার আইডির জন্য পাসওয়ার্ড সঠিক নয়।`
        );
        return;
      }
    }

    // Fallback: check by selectedRole preset if username matches role directly
    const fallbackOfficer = authorizedOfficers.find((o) => o.role === selectedRole);
    if (fallbackOfficer && (cleanPass === fallbackOfficer.defaultPass || cleanPass === 'admin123')) {
      onLoginSuccess(fallbackOfficer.role);
      onClose();
      return;
    }

    setErrorMsg(
      isEn
        ? 'Invalid User ID or Password. Select an authorized officer account below.'
        : 'ইউজার আইডি বা পাসওয়ার্ড সঠিক নয়। নিচে অনুমোদিত কর্মকর্তার অ্যাকাউন্ট নির্বাচন করুন।'
    );
  };

  const activeOfficer =
    authorizedOfficers.find((o) => o.role === selectedRole) || authorizedOfficers[0] || defaultOfficer;

  return (
    <div
      id="user-login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="user-login-modal-card"
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          background: 'linear-gradient(135deg, #1b3562 0%, #294f87 40%, #1f4277 70%, #14294a 100%)',
          boxShadow: '0 25px 60px -15px rgba(10, 25, 50, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-7 pt-9 pb-7 text-center relative z-10">
          {/* Circular Officer Avatar / Silhouette matching the design */}
          <div className="relative mx-auto w-24 h-24 mb-5">
            <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/70 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-xs">
              {roles[selectedRole]?.defaultUser?.avatar ? (
                <img
                  src={roles[selectedRole]?.defaultUser?.avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-white/90 translate-y-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}
            </div>
            {/* Active role badge indicator */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-sm">
              {selectedRole === 'admin' ? (
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 text-white" />
              )}
            </div>
          </div>

          {/* Title Header: USER LOGIN */}
          <div className="flex items-center justify-center gap-1.5 tracking-[0.22em] mb-6">
            <span className="text-white/85 font-light text-base uppercase">USER</span>
            <span className="text-white font-extrabold text-base uppercase">LOGIN</span>
          </div>

          {/* Form with exact UI inputs */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Username Input */}
            <div>
              <input
                id="input-login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="USER ID / USERNAME"
                autoComplete="username"
                className="w-full h-11 px-4 bg-white/5 border border-white/60 focus:border-white rounded-xl text-center text-xs font-semibold tracking-[0.18em] text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40 uppercase transition-all shadow-inner"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="PASSWORD"
                autoComplete="current-password"
                className="w-full h-11 px-4 bg-white/5 border border-white/60 focus:border-white rounded-xl text-center text-xs font-semibold tracking-[0.18em] text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40 uppercase transition-all shadow-inner"
              />
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-200 bg-amber-950/40 border border-amber-500/40 rounded-lg p-2 leading-tight">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Pill-shaped LOGIN Button */}
            <button
              id="btn-submit-user-login"
              type="submit"
              className="w-full h-11 rounded-full bg-[#8bb5df] hover:bg-[#9bc2ea] active:scale-[0.98] text-white font-black tracking-[0.22em] text-sm uppercase transition-all shadow-md shadow-blue-950/40 cursor-pointer flex items-center justify-center mt-1"
            >
              LOGIN
            </button>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-center pt-1">
              <label
                htmlFor="chk-remember-me"
                className="inline-flex items-center gap-2 cursor-pointer text-xs text-white/90 select-none"
              >
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                    rememberMe
                      ? 'bg-blue-500/80 border-white text-white'
                      : 'border-white/70 bg-white/10'
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="font-normal text-xs text-blue-50">
                  {isEn ? 'Remember me' : 'তথ্য মনে রাখুন'}
                </span>
              </label>
            </div>
          </form>

          {/* Divider */}
          <div className="my-4 border-t border-white/15" />

          {/* Quick Select for Authorized Roles (Excluding Registered Voter as instructed) */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
              <span>{isEn ? 'Authorized Officer Accounts' : 'অনুমোদিত কর্মকর্তা অ্যাকাউন্টস'}</span>
              <span className="text-[9px] text-white/60 lowercase font-normal">
                {isEn ? 'excl. voter' : 'ভোটার ব্যতীত'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
              {authorizedOfficers.map((officer) => {
                const isCurrentSelected = selectedRole === officer.role;
                return (
                  <button
                    key={officer.role}
                    type="button"
                    onClick={() => handleSelectPreset(officer)}
                    className={`px-2 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrentSelected
                        ? 'bg-white/20 border-white text-white shadow-xs'
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {officer.role === 'admin' ? (
                        <Crown className="w-3 h-3 text-rose-300 shrink-0" />
                      ) : officer.role === 'system_admin' ? (
                        <Shield className="w-3 h-3 text-blue-300 shrink-0" />
                      ) : officer.role === 'ec_committee' ? (
                        <ShieldCheck className="w-3 h-3 text-indigo-300 shrink-0" />
                      ) : (
                        <UserCheck className="w-3 h-3 text-cyan-300 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold truncate">
                        {isEn ? officer.titleEn : officer.titleBn}
                      </span>
                    </div>
                    <p className="text-[9px] text-white/60 truncate mt-0.5 font-mono">
                      ID: {officer.username}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
