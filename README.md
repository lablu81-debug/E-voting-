# Participation Committee E-Voting & Multi-Role Governance System
> **দ্বিভাষিক অংশগ্রহণমূলক কমিটি নির্বাচন ও ভূমিকা-ভিত্তিক প্রশাসন পোর্টাল**  
> *Bilingual (English & Bengali) Digital Ballot, Electoral College, Voter Turnout Analytics, Role-Based Access Control (RBAC), and Certified Workplace Audit Reporting.*

---

## 📌 1. Project Goal & Objectives

The primary goal of the **Participation Committee E-Voting Portal** is to provide a transparent, tamper-evident, compliant, and auditable election management platform for workplace Participation Committees (PC) in accordance with national labor regulations (such as Bangladesh Labour Act / Rules) and global ethical workplace compliance standards (ILO, Sedex/SMETA, BSCI, Fair Wear).

### Key Objectives
1. **Democratic Integrity & Ballot Secrecy**: Guarantee secret voting for general workers electing Executive Committee (EC) worker representatives, alongside a secure indirect Electoral College for electing the Vice President (VP).
2. **Elimination of Vote Duplication**: Enforce real-time voter verification via Employment ID / Badge scanning, preventing duplicate voting and ensuring only verified workforce electors can cast ballots.
3. **Role-Based Access Control (RBAC) & Multi-Role Governance**: Provide dedicated permission profiles and individual User ID & Password credential systems for System Admins, Election Commission Officers, Presiding Officers, Impartial Observers, and Electors.
4. **Auditability & Legal Compliance**: Auto-generate certified, print-ready A4 documentation (Official Declaration of Results with winner certificates and Full Tabulated Voter Rolls with timestamps) exportable to PDF and CSV.
5. **Real-time Operational Analytics**: Display turnout velocity, gender distribution, departmental participation benchmarks, and instant live tallies.
6. **Bilingual Accessibility**: Full English and Bengali (বাংলা) interface and reports for inclusive shop-floor adoption.

---

## 📖 2. Project Description

The platform digitizes the end-to-end election lifecycle across three distinct tiers:
1. **Tier 1: General Worker Direct Election (EC Candidates)**: All active employees cast secret ballots for 8 Executive Committee worker representative seats across factory departments.
2. **Tier 2: Indirect Electoral College (Vice President Election)**: Elected or appointed Executive Committee members convene as an Electoral College to elect the Vice President of the Participation Committee.
3. **Tier 3: Electoral Governance & Supervisory Control**: Election commission presiding officers oversee the election state (Active, Paused, Closed), verify voters, manage candidate nominations, adjust quota benchmarks, upload voter registries in bulk via Excel/CSV, and issue signed audit certificates.

---

## 🚀 3. How to Use It (Step-by-Step Guide)

### A. General Voter Workflow (Executive Committee Ballot)
1. **Access Ballot**: Navigate to the **"EC Ballot"** (`/` or ballot tab).
2. **Voter Verification**: Enter your **Employment ID** (e.g., `EMP-1001` or `1001`) in the verification box and click **"Verify Voter ID"**.
3. **Inspect Candidates**: Review nominated candidates showing photo, candidate name (Bilingual), employee badge, and department.
4. **Cast Vote**: Click on your preferred candidate's card. Confirm your choice in the modal dialog.
5. **Ballot Receipt**: Once submitted, a digital cryptographic vote receipt token is displayed with timestamp and department details, and the voter's status in the registry is permanently recorded as **"Voted"**.

### B. Electoral College Delegate Workflow (Vice President Ballot)
1. **Access VP Ballot**: Select **"VP Ballot"** tab from the top navigation or sidebar.
2. **Select EC Delegate Identity**: Choose the verified Executive Committee member voting on behalf of workers.
3. **Cast Elector Ballot**: Select the Vice Presidential candidate and submit. The vote is logged to the electoral college ledger.

### C. Returning Officer & Admin Panel Operations
1. **Sign In / Switch Role**: Click **"Role: Admin"** in the top-right header. Use User ID & Password login or role switcher to enter as **System Admin** or **Election Commission Officer**.
2. **Election Lifecycle Control**: Switch election status between **Active** (accepting votes), **Paused** (temporary break), or **Closed** (voting concluded).
3. **Bulk Voter Roll Upload**:
   - In the Admin Panel, navigate to **Voter Registry**.
   - Download the Excel/CSV sample template (`.xlsx` / `.csv`).
   - Drag and drop your company's employee roster. The system automatically parses names, employee IDs, departments, sections, and designations.
4. **Candidate Management**: Add, edit, or remove candidate nominations, upload portraits, and assign department categories.
5. **Role-Based Control (RBC) & Credential Management**:
   - Open **"Role-Based Control (RBC) & Multi-Role Governance"**.
   - Click **"Add New Role"** or edit existing roles.
   - Configure custom badges, department affiliations, permitted navigation tabs, granular permissions (e.g., `canManageCandidates`, `canResetDatabase`, etc.).
   - Set or update **User ID (Username)** and **Password** credentials with copy-to-clipboard functionality.

### D. Audit Reports & Certificate Generation
1. Click **"Official Certificate & Print"** in the header or **"Preview & Print Declaration"** in the Admin Panel.
2. **Declaration of Results**: Displays the top 8 elected EC members, elected Vice President, total turnout metrics, and formal signature blocks for Presiding Officers, Employer Representatives, and Labor Union/Worker Representatives.
3. **Print or Export**:
   - Click **"Print Declaration of Results"** / **"Print Voter List"** for clean A4 browser print styling.
   - Click **"Download PDF (.pdf)"** for a vector PDF document generated client-side.
   - Click **"Results CSV"** / **"Voter List CSV"** for spreadsheet audit exports.

---

## 🗄️ 4. Backend & Data Schema

The application follows a strictly-typed domain model. In the current production release, persistence is managed through an optimized, reactive LocalStorage layer with event broadcast, structured for drop-in migration to relational SQL (PostgreSQL / Cloud SQL via Drizzle ORM) or Document DB (Firebase Firestore).

### 4.1 TypeScript Entity Definitions

#### Candidate Entity (`Candidate`)
Represents nominated candidates running for Executive Committee or Vice President seats.
```typescript
export type PositionCategory = 'vp' | 'ec';

export interface Candidate {
  id: string;              // Unique identifier (e.g., 'ec-1', 'vp-1')
  nameEn: string;          // English display name
  nameBn: string;          // Bengali display name (বাংলা)
  deptEn: string;          // Department in English (e.g., 'Sewing', 'Quality')
  deptBn: string;          // Department in Bengali (e.g., 'সুইং', 'কোয়ালিটি')
  votes: number;           // Total tallied ballot count
  img: string;             // Avatar / portrait image URL
  category: PositionCategory; // 'ec' = Executive Committee, 'vp' = Vice President
  empId?: string;          // Associated employee badge ID
}
```

#### Voter Entity (`Voter`)
Represents registered employees eligible to vote in the election.
```typescript
export type VoterStatus = 'Voted' | 'Pending';

export interface Voter {
  id: string;              // System internal ID (e.g., 'v-101')
  empId: string;           // Company Employee ID (e.g., 'EMP-1001')
  name: string;            // Full employee name
  desig: string;           // Designation / Job title (e.g., 'Senior Operator')
  dept: string;            // Department (e.g., 'Sewing', 'Finishing', 'Cutting')
  section: string;         // Factory section / production line
  subSection: string;      // Floor or sub-section details
  linkSent: boolean;       // SMS/QR digital voting link dispatched indicator
  status: VoterStatus;     // 'Pending' (not yet voted) | 'Voted' (ballot submitted)
  photo: string;           // Employee profile photo URL
  doj?: string;            // Date of joining (YYYY-MM-DD)
  gender?: string;         // 'Male' | 'Female' | 'Other'
  empCategory?: string;    // 'Worker' | 'Staff' | 'Technician'
  lineInfo?: string;       // Specific production line number
  assignedRole?: UserRole; // Optional RBAC role mapped to this voter
  isRoleLocked?: boolean;  // Guard against unauthorized privilege changes
  roleAssignedBy?: string; // Auditor ID who granted the role
  roleAssignedAt?: string; // ISO-8601 timestamp of role grant
}
```

#### Committee Member Entity (`CommitteeMember`)
Represents certified members of the factory's Participation Committee.
```typescript
export interface CommitteeMember {
  id: string;              // Member ID
  badge: {
    en: string;            // e.g., 'Vice President (Workers)'
    bn: string;            // e.g., 'সহ-সভাপতি (শ্রমিক)'
  };
  name: {
    en: string;            // Member name in English
    bn: string;            // Member name in Bengali
  };
  dept: {
    en: string;            // Department in English
    bn: string;            // Department in Bengali
  };
  img: string;             // Official photograph URL
  roleDescription?: {
    en: string;
    bn: string;
  };
}
```

#### Role Configuration & RBAC Schema (`RoleConfig`)
Represents custom or system roles with granular governance and credential sets.
```typescript
export type UserRole = 'admin' | 'system_admin' | 'observer' | 'ec_committee' | 'voter' | string;

export interface RolePermissions {
  canVote: boolean;                 // Permission to access voting booth & cast ballot
  canViewDashboard: boolean;        // Access to live tally charts & turnout trends
  canViewAdminPanel: boolean;       // Access to administration management view
  canManageCandidates: boolean;     // Add, edit, remove nominated candidates
  canManageVoterRegistry: boolean;  // Add, upload Excel roster, edit voter records
  canManageElectionStatus: boolean; // Pause, activate, or terminate election
  canResetDatabase: boolean;        // Hard reset of votes and audit database
}

export interface UserCredentials {
  username: string;                 // User login ID (e.g., 'admin_officer')
  password?: string;                // Password hash or secret key
  lastLogin?: string;               // ISO timestamp of last successful authentication
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

export interface RoleConfig {
  key: string;                      // Unique machine key (e.g., 'presiding_officer')
  badge: { en: string; bn: string };// Display badge label
  desc: { en: string; bn: string }; // Role description for auditors
  theme: 'blue' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'purple' | 'slate';
  user: UserProfile;                // Assigned default profile & login credentials
  allowedTabs: NavigationTab[];     // ['ballot', 'vp_ballot', 'dashboard', 'admin']
  permissions: RolePermissions;     // Granular boolean security flags
  isSystemRole?: boolean;           // Protected flag for default root roles
}
```

#### Electoral College Vote Ledger (`VpElectorVote`)
Tamper-evident audit log of ballots cast by Executive Committee delegates for Vice President.
```typescript
export interface VpElectorVote {
  ecMemberId: string;       // ID of the voting EC committee delegate
  ecMemberNameEn: string;   // Delegate English Name
  ecMemberNameBn: string;   // Delegate Bengali Name
  ecMemberDeptEn: string;   // Delegate Department
  ecMemberDeptBn: string;   // Delegate Department
  vpCandidateId: string;    // Selected Vice President Candidate ID
  vpCandidateNameEn: string;// VP Candidate English Name
  vpCandidateNameBn: string;// VP Candidate Bengali Name
  timestamp: string;        // ISO-8601 ballot casting timestamp
}
```

#### Audit Log Entity (`AuditLog`)
Continuous chronological audit trail tracking governance actions.
```typescript
export interface AuditLog {
  id: string;              // Unique audit event ID
  timestamp: string;       // Timestamp (YYYY-MM-DD HH:mm:ss)
  message: string;         // Human-readable audit narrative (Bilingual)
}
```

---

## 🗃️ 5. Relational Database Schema (SQL / PostgreSQL Equivalent)

For deployments integrating PostgreSQL (e.g., Google Cloud SQL / Supabase / Neon), the above domain model maps to the following normalized SQL schema:

```sql
-- Enums
CREATE TYPE position_category AS ENUM ('vp', 'ec');
CREATE TYPE election_status AS ENUM ('active', 'paused', 'closed');
CREATE TYPE voter_status AS ENUM ('Pending', 'Voted');

-- 1. Candidates Table
CREATE TABLE candidates (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    dept_en VARCHAR(128) NOT NULL,
    dept_bn VARCHAR(128) NOT NULL,
    votes INTEGER DEFAULT 0 NOT NULL,
    img TEXT NOT NULL,
    category position_category NOT NULL,
    emp_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Voter Registry Table
CREATE TABLE voters (
    id VARCHAR(64) PRIMARY KEY,
    emp_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    desig VARCHAR(128) NOT NULL,
    dept VARCHAR(128) NOT NULL,
    section VARCHAR(128) NOT NULL,
    sub_section VARCHAR(128),
    link_sent BOOLEAN DEFAULT false,
    status voter_status DEFAULT 'Pending' NOT NULL,
    photo TEXT,
    doj DATE,
    gender VARCHAR(32),
    emp_category VARCHAR(64),
    line_info VARCHAR(64),
    assigned_role VARCHAR(64),
    voted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Roles and Credentials Table
CREATE TABLE roles_config (
    key VARCHAR(64) PRIMARY KEY,
    badge_en VARCHAR(128) NOT NULL,
    badge_bn VARCHAR(128) NOT NULL,
    desc_en TEXT,
    desc_bn TEXT,
    theme VARCHAR(32) DEFAULT 'blue',
    username VARCHAR(128) UNIQUE,
    password_hash VARCHAR(255),
    allowed_tabs JSONB NOT NULL DEFAULT '["ballot", "dashboard"]',
    permissions JSONB NOT NULL,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vice President Electoral College Ledger
CREATE TABLE vp_elector_votes (
    id SERIAL PRIMARY KEY,
    ec_member_id VARCHAR(64) NOT NULL,
    ec_member_name_en VARCHAR(255) NOT NULL,
    ec_member_name_bn VARCHAR(255) NOT NULL,
    ec_member_dept_en VARCHAR(128),
    ec_member_dept_bn VARCHAR(128),
    vp_candidate_id VARCHAR(64) REFERENCES candidates(id),
    vp_candidate_name_en VARCHAR(255) NOT NULL,
    vp_candidate_name_bn VARCHAR(255) NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Audit Trail Logs
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message TEXT NOT NULL
);
```

---

## 🛠️ 6. Technology Stack

- **Framework**: React 18 + Vite (SPA)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS (PostCSS)
- **Icons**: Lucide React
- **Document Exporting & Print**:
  - `html2canvas` & `jspdf` for high-fidelity client-side PDF certificate compilation
  - CSS print media queries (`@media print`) optimized for standard A4 landscape and portrait output
- **Spreadsheet Processing**: `xlsx` (SheetJS) for parsing `.xlsx`, `.xls`, and `.csv` voter manifests
- **Visual Feedback**: `canvas-confetti` celebration triggers upon vote completion

---

## 💻 7. Installation & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm or bun

### Commands
```bash
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd <REPO_DIRECTORY>

# Install all dependencies
npm install

# Run the local development server (starts on http://localhost:3000)
npm run dev

# Run TypeScript linter check
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📤 8. Pushing to Your GitHub Repository

To push this codebase into your remote GitHub repository, follow these quick terminal steps:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files including README.md
git add .

# 3. Create initial commit
git commit -m "feat: complete Participation Committee E-Voting & RBC governance platform with documentation"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 6. Push code to your GitHub repo
git push -u origin main
```

---

## ⚖️ 9. Compliance & Ethical Standards Note
This application complies with:
- **Bangladesh Labour Rules, 2015 (Rule 186 - Participation Committee)**
- **ILO Convention No. 135 (Workers' Representatives)**
- **SMETA / BSCI Workplace Democratic Dialogue & Worker Participation Audits**
