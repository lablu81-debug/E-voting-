import { useState, useEffect } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BallotView } from './components/BallotView';
import { VicePresidentBallotView } from './components/VicePresidentBallotView';
import { DashboardView } from './components/DashboardView';
import { AdminPanelView } from './components/AdminPanelView';
import { EditCandidateModal } from './components/EditCandidateModal';
import { PrintCertificate } from './components/PrintCertificate';
import { VoterListPrintReport } from './components/VoterListPrintReport';
import { CertificateModal } from './components/CertificateModal';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { UserLoginModal } from './components/UserLoginModal';
import { downloadCertificatePDF, printCertificateElement } from './utils/pdfExport';
import {
  initialVpCandidates,
  initialEcCandidates,
  initialVoterRegistry,
  committeeMembers,
  i18n
} from './data/initialData';
import {
  ROLE_CONFIGS,
  RoleConfig,
  loadStoredRolesConfig,
  saveStoredRolesConfig,
  resetStoredRolesConfig,
  isTabPermittedForRole,
  getPermittedTabsForRole
} from './data/rolesData';
import {
  AuditLog,
  Candidate,
  CommitteeMember,
  ElectionStatus,
  Language,
  PositionCategory,
  Voter,
  VpElectorVote,
  UserRole,
  NavigationTab
} from './types';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('pc_election_lang');
    return (saved as Language) || 'en';
  });

  const [rolesConfig, setRolesConfig] = useState<Record<string, RoleConfig>>(() => {
    return loadStoredRolesConfig();
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('pc_election_user_role');
    if (saved) {
      return saved;
    }
    return 'admin';
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('admin');

  const handleOpenLoginModal = (targetRole?: UserRole) => {
    if (targetRole && targetRole !== 'voter') {
      setLoginInitialRole(targetRole);
    }
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (role: UserRole) => {
    handleRoleChange(role);
    setIsLoginModalOpen(false);
  };

  const [activeTab, setActiveTab] = useState<NavigationTab>('ballot');
  const [activeBallotType, setActiveBallotType] = useState<'ec' | 'vp'>('ec');

  const activeRoleConfig = rolesConfig[currentRole] || ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.admin;

  const isTabPermitted = (tab: NavigationTab) => {
    return isTabPermittedForRole(activeRoleConfig, tab);
  };

  const permittedTabs = getPermittedTabsForRole(activeRoleConfig);

  // If the active tab is not permitted for current role, automatically redirect to first permitted tab
  useEffect(() => {
    if (permittedTabs.length > 0 && !isTabPermitted(activeTab)) {
      setActiveTab(permittedTabs[0]);
    }
  }, [currentRole, rolesConfig, activeTab, permittedTabs]);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('pc_election_user_role', newRole);
    const cfg = rolesConfig[newRole] || ROLE_CONFIGS[newRole] || ROLE_CONFIGS.admin;
    const permitted = getPermittedTabsForRole(cfg);
    if (permitted.length > 0 && !permitted.includes(activeTab)) {
      setActiveTab(permitted[0]);
    }
  };


  const [vpCandidates, setVpCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('pc_election_vp');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialVpCandidates;
  });

  const [ecCandidates, setEcCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('pc_election_ec');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialEcCandidates;
  });

  const [vpElectorVotes, setVpElectorVotes] = useState<VpElectorVote[]>(() => {
    const saved = localStorage.getItem('pc_election_vp_elector_votes');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const [committeeMembersList, setCommitteeMembersList] = useState<CommitteeMember[]>(() => {
    const saved = localStorage.getItem('pc_election_committee_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* ignore */ }
    }
    return committeeMembers;
  });

  const [voterRegistry, setVoterRegistry] = useState<Voter[]>(() => {
    const saved = localStorage.getItem('pc_election_voters');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialVoterRegistry;
  });

  const [totalVotesCast, setTotalVotesCast] = useState<number>(() => {
    const saved = localStorage.getItem('pc_election_cast');
    return saved ? parseInt(saved, 10) : 380;
  });

  const [electionStatus, setElectionStatus] = useState<ElectionStatus>(() => {
    const saved = localStorage.getItem('pc_election_status');
    return (saved as ElectionStatus) || 'active';
  });

  const [isGeneralElectionComplete, setIsGeneralElectionComplete] = useState<boolean>(() => {
    const saved = localStorage.getItem('pc_general_election_complete');
    return saved !== null ? saved === 'true' : true;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('pc_election_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'log-1',
        timestamp: new Date().toLocaleTimeString(),
        message: 'Election Portal initialized with 25 candidate nominees and verified voter registry.'
      }
    ];
  });

  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  // Total eligible voters (scaled for workplace)
  const totalVoters = Math.max(voterRegistry.length, 450);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('pc_election_lang', currentLang);
  }, [currentLang]);

  useEffect(() => {
    localStorage.setItem('pc_election_vp', JSON.stringify(vpCandidates));
  }, [vpCandidates]);

  useEffect(() => {
    localStorage.setItem('pc_election_ec', JSON.stringify(ecCandidates));
  }, [ecCandidates]);

  useEffect(() => {
    localStorage.setItem('pc_election_voters', JSON.stringify(voterRegistry));
  }, [voterRegistry]);

  useEffect(() => {
    localStorage.setItem('pc_election_cast', totalVotesCast.toString());
  }, [totalVotesCast]);

  useEffect(() => {
    localStorage.setItem('pc_election_status', electionStatus);
  }, [electionStatus]);

  useEffect(() => {
    localStorage.setItem('pc_election_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('pc_election_committee_members', JSON.stringify(committeeMembersList));
  }, [committeeMembersList]);

  useEffect(() => {
    localStorage.setItem('pc_election_vp_elector_votes', JSON.stringify(vpElectorVotes));
  }, [vpElectorVotes]);

  useEffect(() => {
    localStorage.setItem('pc_general_election_complete', String(isGeneralElectionComplete));
  }, [isGeneralElectionComplete]);

  // Log Audit Action Helper
  const addLog = (message: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Committee Management Handlers
  const handleAddCommitteeMember = (member: CommitteeMember) => {
    setCommitteeMembersList((prev) => [...prev, member]);
    addLog(`Added new Election Committee member: ${member.name.en} (${member.badge.en}).`);
  };

  const handleUpdateCommitteeMember = (member: CommitteeMember) => {
    setCommitteeMembersList((prev) =>
      prev.map((m) => (m.id === member.id ? member : m))
    );
    addLog(`Updated Election Committee member: ${member.name.en} (${member.badge.en}).`);
  };

  const handleDeleteCommitteeMember = (id: string) => {
    const target = committeeMembersList.find((m) => m.id === id);
    setCommitteeMembersList((prev) => prev.filter((m) => m.id !== id));
    addLog(`Removed Election Committee member: ${target?.name.en || id}.`);
  };

  const handleResetCommitteeMembers = () => {
    setCommitteeMembersList(committeeMembers);
    addLog('Reset Election Organizing Committee to official default members.');
  };

  // RBAC Role Management Handlers
  const handleUpdateRole = (updatedRole: RoleConfig) => {
    setRolesConfig((prev) => {
      const existing = prev[updatedRole.role];
      if (existing?.isRoleLocked) {
        // Enforce lock: user-to-role assignment cannot be altered
        const securedRole: RoleConfig = {
          ...updatedRole,
          role: existing.role,
          defaultUser: {
            ...existing.defaultUser,
            role: existing.role
          },
          isRoleLocked: true,
          assignedBy: existing.assignedBy || 'Super Admin (admin)',
          assignedAt: existing.assignedAt || new Date().toISOString(),
          lockReason: existing.lockReason
        };
        const next = { ...prev, [securedRole.role]: securedRole };
        saveStoredRolesConfig(next);
        addLog(`Security Policy Enforced: User ${securedRole.defaultUser.name.en} is permanently assigned to role "${securedRole.badge.en}". Role assignment cannot be altered after Super Admin save.`);
        return next;
      }

      // If newly saved by Super Admin, lock it permanently
      const savedRole: RoleConfig = {
        ...updatedRole,
        isRoleLocked: true,
        assignedBy: 'Super Admin (admin)',
        assignedAt: new Date().toISOString()
      };
      const next = { ...prev, [savedRole.role]: savedRole };
      saveStoredRolesConfig(next);
      addLog(`Role assigned and saved by Super Admin: ${savedRole.badge.en} (${savedRole.defaultUser.name.en}). Assignment is now permanently locked.`);
      return next;
    });
  };

  const handleAddRole = (newRole: RoleConfig) => {
    // When a new role is assigned and saved by Super Admin, it is locked permanently
    const lockedNewRole: RoleConfig = {
      ...newRole,
      isRoleLocked: true,
      assignedBy: 'Super Admin (admin)',
      assignedAt: new Date().toISOString(),
      lockReason: {
        en: "Role assigned and saved by Super Admin (admin). Policy prohibits altering this user's assigned role.",
        bn: "সুপার অ্যাডমিন (admin) কর্তৃক ভূমিকা নির্ধারিত ও সংরক্ষিত। ব্যবহারকারীর নির্ধারিত ভূমিকা পরিবর্তন নিষিদ্ধ।"
      }
    };
    setRolesConfig((prev) => {
      const next = { ...prev, [lockedNewRole.role]: lockedNewRole };
      saveStoredRolesConfig(next);
      return next;
    });
    addLog(`Super Admin assigned and saved new role: ${lockedNewRole.badge.en} (${lockedNewRole.defaultUser.name.en}). Role assignment is locked.`);
  };

  const handleDeleteRole = (roleKey: string) => {
    const target = rolesConfig[roleKey];
    if (target?.isRoleLocked) {
      addLog(`Security Alert: Blocked attempt to delete locked role "${target?.badge?.en || roleKey}". Role was assigned and saved by Super Admin (admin).`);
      return;
    }
    setRolesConfig((prev) => {
      const next = { ...prev };
      delete next[roleKey];
      saveStoredRolesConfig(next);
      return next;
    });
    if (currentRole === roleKey) {
      setCurrentRole('admin');
      localStorage.setItem('pc_election_user_role', 'admin');
    }
    addLog(`Deleted RBAC role: ${target?.badge?.en || roleKey}.`);
  };

  const handleResetRoles = () => {
    const defaults = resetStoredRolesConfig();
    setRolesConfig(defaults);
    if (!defaults[currentRole]) {
      setCurrentRole('admin');
      localStorage.setItem('pc_election_user_role', 'admin');
    }
    addLog('Reset all RBAC roles and permissions to factory defaults.');
  };

  // Vote Casting Action
  const handleCastVote = (ecId: string, voterId?: string) => {
    setEcCandidates((prev) =>
      prev.map((c) => (c.id === ecId ? { ...c, votes: c.votes + 1 } : c))
    );

    setTotalVotesCast((prev) => prev + 1);

    if (voterId) {
      setVoterRegistry((prev) =>
        prev.map((v) => (v.id === voterId ? { ...v, status: 'Voted' } : v))
      );
      const targetVoter = voterRegistry.find((v) => v.id === voterId);
      const voterNameStr = targetVoter
        ? `${targetVoter.name} (${targetVoter.empId || targetVoter.id})`
        : voterId;
      addLog(
        `Presiding Officer Booth: Official ballot cast for ${voterNameStr} [EC Member: ${ecId}].`
      );
    } else {
      // If there is an unvoted voter in registry, mark first pending as voted
      setVoterRegistry((prev) => {
        let foundPending = false;
        return prev.map((v) => {
          if (!foundPending && v.status === 'Pending') {
            foundPending = true;
            return { ...v, status: 'Voted' };
          }
          return v;
        });
      });

      addLog(
        `Anonymous encrypted ballot cast for EC Member Candidate (${ecId}).`
      );
    }
  };

  // Vice President Vote Casting by Elected Executive Committee Member
  const handleCastVpVote = (vpCandidateId: string, ecMemberId: string) => {
    setVpCandidates((prev) =>
      prev.map((c) => (c.id === vpCandidateId ? { ...c, votes: c.votes + 1 } : c))
    );

    const ecMember = ecCandidates.find((c) => c.id === ecMemberId);
    const vpCand = vpCandidates.find((c) => c.id === vpCandidateId);

    const newVote: VpElectorVote = {
      ecMemberId,
      ecMemberNameEn: ecMember?.nameEn || ecMemberId,
      ecMemberNameBn: ecMember?.nameBn || ecMemberId,
      ecMemberDeptEn: ecMember?.deptEn || '',
      ecMemberDeptBn: ecMember?.deptBn || '',
      vpCandidateId,
      vpCandidateNameEn: vpCand?.nameEn || vpCandidateId,
      vpCandidateNameBn: vpCand?.nameBn || vpCandidateId,
      timestamp: new Date().toLocaleTimeString()
    };

    setVpElectorVotes((prev) => [newVote, ...prev.filter((v) => v.ecMemberId !== ecMemberId)]);

    addLog(
      `Vice President Ballot (1 Seat): Elected EC Member ${newVote.ecMemberNameEn} (${newVote.ecMemberDeptEn}) cast official vote for ${newVote.vpCandidateNameEn}.`
    );
  };

  // Add Candidate
  const handleAddCandidate = (cand: Candidate) => {
    if (cand.category === 'vp') {
      setVpCandidates((prev) => [...prev, cand]);
      addLog(`Nominated new Vice President candidate: ${cand.nameEn} (ID: ${cand.id}).`);
    } else {
      setEcCandidates((prev) => [...prev, cand]);
      addLog(`Nominated new Executive Committee candidate: ${cand.nameEn} (ID: ${cand.id}).`);
    }
  };

  // Save Edited Candidate
  const handleSaveEditedCandidate = (
    updated: Candidate,
    originalCategory: PositionCategory,
    originalId: string
  ) => {
    // Remove from original list
    if (originalCategory === 'vp') {
      setVpCandidates((prev) => prev.filter((c) => c.id !== originalId));
    } else {
      setEcCandidates((prev) => prev.filter((c) => c.id !== originalId));
    }

    // Add to new category list
    if (updated.category === 'vp') {
      setVpCandidates((prev) => [...prev, updated]);
    } else {
      setEcCandidates((prev) => [...prev, updated]);
    }

    setEditingCandidate(null);
    addLog(`Updated profile and nomination details for Candidate ID: ${updated.id} (${updated.nameEn}).`);
  };

  // Delete Candidate
  const handleDeleteCandidate = (category: PositionCategory, id: string) => {
    if (category === 'vp') {
      const target = vpCandidates.find((c) => c.id === id);
      setVpCandidates((prev) => prev.filter((c) => c.id !== id));
      addLog(`Removed Vice President candidate: ${target?.nameEn || id} (ID: ${id}).`);
    } else {
      const target = ecCandidates.find((c) => c.id === id);
      setEcCandidates((prev) => prev.filter((c) => c.id !== id));
      addLog(`Removed Executive Committee candidate: ${target?.nameEn || id} (ID: ${id}).`);
    }
  };

  // Delete Single Voter
  const handleDeleteVoter = (id: string) => {
    const target = voterRegistry.find((v) => v.id === id);
    setVoterRegistry((prev) => prev.filter((v) => v.id !== id));
    addLog(`Removed voter: ${target?.name || id} (Token: ${id}, Emp ID: ${target?.empId || '-'}).`);
  };

  // Add Single Voter
  const handleAddVoter = (voter: Voter) => {
    setVoterRegistry((prev) => [voter, ...prev]);
    addLog(`Registered eligible voter ID: ${voter.id}, Emp ID: ${voter.empId} (${voter.name}).`);
  };

  // Bulk Import Voters
  const handleBulkImportVoters = (newVoters: Voter[]) => {
    setVoterRegistry(newVoters);
    addLog(`Bulk Excel Import: Loaded ${newVoters.length} eligible voters into verified registry.`);
  };

  // Update Election Status
  const handleUpdateElectionStatus = (status: ElectionStatus) => {
    setElectionStatus(status);
    addLog(`Election administrative status switched to: ${status.toUpperCase()}.`);
  };

  // Broadcast Links
  const handleBroadcastLinks = () => {
    let sentCount = 0;
    setVoterRegistry((prev) =>
      prev.map((v) => {
        if (v.status === 'Pending') {
          sentCount++;
          return { ...v, linkSent: true };
        }
        return v;
      })
    );
    addLog(`Broadcasted secure one-time digital voting invitations to ${sentCount || voterRegistry.length} voters.`);
  };

  // Reset Election Data
  const handleResetElectionData = () => {
    setTotalVotesCast(0);
    setVpCandidates((prev) => prev.map((c) => ({ ...c, votes: 0 })));
    setEcCandidates((prev) => prev.map((c) => ({ ...c, votes: 0 })));
    setVoterRegistry((prev) => prev.map((v) => ({ ...v, status: 'Pending' })));
    setVpElectorVotes([]);
    addLog('Database reset: all ballots cleared, turnout set to 0%, voters reset to Pending.');
  };

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'declaration' | 'voters'>('declaration');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloadSuccess, setPdfDownloadSuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Direct sidebar navigation to any feature or section without user role barrier
  const handleNavigateFromSidebar = (tab: NavigationTab, targetSectionId?: string) => {
    // If active role does not permit this tab, ensure access is granted seamlessly
    if (!isTabPermittedForRole(activeRoleConfig, tab)) {
      setCurrentRole('admin');
    }
    setActiveTab(tab);
    if (targetSectionId) {
      setTimeout(() => {
        const el = document.getElementById(targetSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('ring-4', 'ring-blue-400/50', 'transition-all', 'duration-500');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-blue-400/50');
          }, 2000);
        }
      }, 150);
    }
  };

  // Direct PDF Download
  const handleDirectPdfDownload = async () => {
    setIsDownloadingPdf(true);
    setPdfDownloadSuccess(false);
    try {
      const fileName = `PC_Election_Official_Results_2026_${new Date().toISOString().slice(0, 10)}.pdf`;
      const success = await downloadCertificatePDF('pc-official-certificate', fileName, {
        currentLang,
        vpCandidates,
        ecCandidates,
        committeeMembers: committeeMembersList,
        totalVoters,
        totalVotesCast
      });
      if (success) {
        setPdfDownloadSuccess(true);
        setTimeout(() => setPdfDownloadSuccess(false), 3500);
        addLog('Successfully generated and downloaded official PC Election Results PDF.');
      }
    } catch (error) {
      console.error('PDF download error:', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Print PDF Certificate
  const handlePrint = () => {
    printCertificateElement('pc-official-certificate');
  };

  const t = i18n[currentLang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800">
      {/* Top Application Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        rolesConfig={rolesConfig}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenLoginModal={handleOpenLoginModal}
      />

      {/* Main Workspace Layout with Docked / Slide-out Sidebar */}
      <div className="flex-1 flex w-full relative">
        {/* Role-Based Application Sidebar Navigation Menu (Filtered strictly by User Role permissions) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentLang={currentLang}
          activeTab={activeTab}
          onNavigateTab={handleNavigateFromSidebar}
          onOpenReportModal={(type) => {
            setReportModalType(type === 'voter_list' ? 'voters' : 'declaration');
            setIsCertModalOpen(true);
          }}
          electionStatus={electionStatus}
          totalVotesCast={totalVotesCast}
          totalVoters={totalVoters}
          currentRole={currentRole}
          rolesConfig={rolesConfig}
          onOpenLoginModal={handleOpenLoginModal}
        />

        {/* Content Workspace and Footer */}
        <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {permittedTabs.length === 0 ? (
          <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {currentLang === 'en' ? 'No Menus Permitted' : 'কোনো মেনু দেখার অনুমতি নেই'}
            </h3>
            <p className="text-sm text-slate-600">
              {currentLang === 'en'
                ? 'Your active user account does not have permission to view any election menus or menu bars. Please switch to an authorized role or contact the Super Admin.'
                : 'আপনার বর্তমান অ্যাকাউন্টের কোনো নির্বাচনী মেনু বা মেনু বার দেখার অনুমতি নেই। অনুগ্রহ করে অনুমোদিত ভূমিকায় পরিবর্তন করুন অথবা সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।'}
            </p>
            <button
              id="btn-empty-state-officer-login"
              type="button"
              onClick={() => handleOpenLoginModal()}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{currentLang === 'en' ? 'Officer User Login' : 'কর্মকর্তা ইউজার লগইন'}</span>
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'ballot' && isTabPermitted('ballot') && (
              <BallotView
                currentLang={currentLang}
                vpCandidates={vpCandidates}
                ecCandidates={ecCandidates}
                voterRegistry={voterRegistry}
                electionStatus={electionStatus}
                vpElectorVotes={vpElectorVotes}
                currentRole={currentRole}
                onOpenRoleModal={() => setIsRoleModalOpen(true)}
                onCastVote={handleCastVote}
                onCastVpVote={handleCastVpVote}
                initialBallotType={activeBallotType}
                onNavigateToDashboard={isTabPermitted('dashboard') ? () => setActiveTab('dashboard') : undefined}
                onNavigateToVpBallot={isTabPermitted('vp_ballot') ? () => setActiveTab('vp_ballot') : undefined}
              />
            )}

            {activeTab === 'vp_ballot' && isTabPermitted('vp_ballot') && (
              <VicePresidentBallotView
                currentLang={currentLang}
                vpCandidates={vpCandidates}
                ecCandidates={ecCandidates}
                electionStatus={electionStatus}
                vpElectorVotes={vpElectorVotes}
                voterRegistry={voterRegistry}
                isGeneralVoteCompleted={isGeneralElectionComplete}
                onToggleGeneralVoteCompleted={setIsGeneralElectionComplete}
                onCastVpVote={handleCastVpVote}
                onNavigateToDashboard={isTabPermitted('dashboard') ? () => setActiveTab('dashboard') : undefined}
                onNavigateToEcBallot={isTabPermitted('ballot') ? () => setActiveTab('ballot') : undefined}
              />
            )}

            {activeTab === 'dashboard' && isTabPermitted('dashboard') && (
              <DashboardView
                currentLang={currentLang}
                vpCandidates={vpCandidates}
                ecCandidates={ecCandidates}
                committeeMembers={committeeMembersList}
                voterRegistry={voterRegistry}
                totalVoters={totalVoters}
                totalVotesCast={totalVotesCast}
                electionStatus={electionStatus}
                vpElectorVotes={vpElectorVotes}
                onOpenVpBallot={isTabPermitted('vp_ballot') ? () => setActiveTab('vp_ballot') : undefined}
                onPrint={handlePrint}
                onDownloadPdf={handleDirectPdfDownload}
                isDownloadingPdf={isDownloadingPdf}
                pdfDownloadSuccess={pdfDownloadSuccess}
                onOpenCertificateModal={(reportType) => {
                  setReportModalType(reportType || 'declaration');
                  setIsCertModalOpen(true);
                }}
                onAddCommitteeMember={handleAddCommitteeMember}
                onUpdateCommitteeMember={handleUpdateCommitteeMember}
                onDeleteCommitteeMember={handleDeleteCommitteeMember}
                onResetCommitteeMembers={handleResetCommitteeMembers}
              />
            )}

            {activeTab === 'admin' && isTabPermitted('admin') && (
              <AdminPanelView
                currentLang={currentLang}
                vpCandidates={vpCandidates}
                ecCandidates={ecCandidates}
                committeeMembers={committeeMembersList}
                voterRegistry={voterRegistry}
                electionStatus={electionStatus}
                auditLogs={auditLogs}
                currentRole={currentRole}
                rolesConfig={rolesConfig}
                onUpdateRole={handleUpdateRole}
                onAddRole={handleAddRole}
                onDeleteRole={handleDeleteRole}
                onResetRoles={handleResetRoles}
                onOpenRoleModal={() => setIsRoleModalOpen(true)}
                onSelectRole={handleRoleChange}
                onNavigateTab={setActiveTab}
                onOpenVpBallot={isTabPermitted('vp_ballot') ? () => setActiveTab('vp_ballot') : undefined}
                onAddCandidate={handleAddCandidate}
                onEditCandidateClick={(cand) => setEditingCandidate(cand)}
                onDeleteCandidate={handleDeleteCandidate}
                onAddVoter={handleAddVoter}
                onDeleteVoter={handleDeleteVoter}
                onBulkImportVoters={handleBulkImportVoters}
                onUpdateElectionStatus={handleUpdateElectionStatus}
                onBroadcastLinks={handleBroadcastLinks}
                onResetElectionData={handleResetElectionData}
                onCastVote={handleCastVote}
                onAddCommitteeMember={handleAddCommitteeMember}
                onUpdateCommitteeMember={handleUpdateCommitteeMember}
                onDeleteCommitteeMember={handleDeleteCommitteeMember}
                onResetCommitteeMembers={handleResetCommitteeMembers}
                isGeneralElectionComplete={isGeneralElectionComplete}
                onToggleGeneralElectionComplete={setIsGeneralElectionComplete}
                onOpenReportModal={(type) => {
                  setReportModalType(type);
                  setIsCertModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 no-print mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>{t.footerText}</span>
              <span className="font-mono text-slate-400">Workplace Compliance Standards Verified</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Role & Permissions Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleRoleChange}
        currentLang={currentLang}
        rolesConfig={rolesConfig}
        onOpenLoginModal={handleOpenLoginModal}
      />


      {/* Official Certificate & Reports Preview & Print Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        currentLang={currentLang}
        vpCandidates={vpCandidates}
        ecCandidates={ecCandidates}
        committeeMembers={committeeMembersList}
        voterRegistry={voterRegistry}
        totalVoters={totalVoters}
        totalVotesCast={totalVotesCast}
        initialReportType={reportModalType}
      />

      {/* Printable Sheet for window.print() & PDF capture - Declaration of Results */}
      <PrintCertificate
        id="pc-official-certificate"
        className="printable-sheet hidden print:block bg-white text-slate-900 p-6 max-w-4xl mx-auto"
        currentLang={currentLang}
        vpCandidates={vpCandidates}
        ecCandidates={ecCandidates}
        committeeMembers={committeeMembersList}
        totalVoters={totalVoters}
        totalVotesCast={totalVotesCast}
      />

      {/* Printable Sheet for window.print() & PDF capture - Voter List Report */}
      <VoterListPrintReport
        id="pc-official-voter-report"
        className="printable-sheet hidden print:block bg-white text-slate-900 p-6 max-w-5xl mx-auto"
        currentLang={currentLang}
        voterRegistry={voterRegistry}
        committeeMembers={committeeMembersList}
        totalVoters={totalVoters}
        totalVotesCast={totalVotesCast}
      />

      {/* Edit Candidate Modal */}
      <EditCandidateModal
        isOpen={Boolean(editingCandidate)}
        candidate={editingCandidate}
        currentLang={currentLang}
        onClose={() => setEditingCandidate(null)}
        onSave={handleSaveEditedCandidate}
      />

      {/* User Login Modal matching design specification for non-voter roles */}
      <UserLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentLang={currentLang}
        rolesConfig={rolesConfig}
        initialRole={loginInitialRole}
      />
    </div>
  );
}
