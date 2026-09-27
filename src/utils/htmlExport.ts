import { Candidate, CommitteeMember, Language, Voter } from '../types';
import { toBanglaNum } from './helpers';

/**
 * Downloads a string content as an HTML file with specified filename.
 */
export function saveHtmlFile(htmlContent: string, filename: string): boolean {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);
    return true;
  } catch (err) {
    console.error('Failed to download HTML file:', err);
    return false;
  }
}

/**
 * Generates and downloads a complete standalone, beautifully styled HTML document
 * for the Official Declaration of Election Results.
 */
export function exportResultsHTML(
  vpCandidates: Candidate[],
  ecCandidates: Candidate[],
  committeeMembers: CommitteeMember[],
  totalVoters: number,
  totalVotesCast: number,
  lang: Language = 'en'
): boolean {
  const isEn = lang === 'en';
  const sortedVp = [...vpCandidates].sort((a, b) => b.votes - a.votes);
  const sortedEc = [...ecCandidates].sort((a, b) => b.votes - a.votes);
  const turnoutPct = totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(1) : '0';

  const todayStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timestamp = new Date().toLocaleString(isEn ? 'en-US' : 'bn-BD');

  const vpRows = sortedVp
    .map((c, idx) => {
      const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';
      const isElected = idx === 0;
      return `
        <tr class="${isElected ? 'elected-row' : ''}">
          <td class="text-center font-bold">${toBanglaNum(idx + 1, lang)}</td>
          <td class="font-mono">${c.id}</td>
          <td class="font-semibold">${isEn ? c.nameEn : c.nameBn}</td>
          <td>${isEn ? c.deptEn : c.deptBn}</td>
          <td class="text-right font-bold">${toBanglaNum(c.votes, lang)}</td>
          <td class="text-right">${toBanglaNum(pct, lang)}%</td>
          <td class="text-center">
            <span class="badge ${isElected ? 'badge-success' : 'badge-slate'}">
              ${isElected ? (isEn ? 'ELECTED (VP)' : 'নির্বাচিত (সহ-সভাপতি)') : (isEn ? 'Contestant' : 'প্রতিদ্বন্দ্বী')}
            </span>
          </td>
        </tr>`;
    })
    .join('');

  const ecRows = sortedEc
    .map((c, idx) => {
      const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';
      const isElected = idx < 8; // Top 8 seats
      return `
        <tr class="${isElected ? 'elected-row' : ''}">
          <td class="text-center font-bold">${toBanglaNum(idx + 1, lang)}</td>
          <td class="font-mono">${c.id}</td>
          <td class="font-semibold">${isEn ? c.nameEn : c.nameBn}</td>
          <td>${isEn ? c.deptEn : c.deptBn}</td>
          <td class="text-right font-bold">${toBanglaNum(c.votes, lang)}</td>
          <td class="text-right">${toBanglaNum(pct, lang)}%</td>
          <td class="text-center">
            <span class="badge ${isElected ? 'badge-success' : 'badge-slate'}">
              ${isElected ? (isEn ? 'ELECTED (Seat ' + (idx + 1) + ')' : 'নির্বাচিত (আসন ' + toBanglaNum(idx + 1, lang) + ')') : (isEn ? 'Runner Up' : 'রানার-আপ')}
            </span>
          </td>
        </tr>`;
    })
    .join('');

  const memberSignatures = committeeMembers
    .map(
      (m) => {
        const role = isEn ? (m.roleDescription?.en || m.badge?.en) : (m.roleDescription?.bn || m.badge?.bn);
        const dept = isEn ? m.dept?.en : m.dept?.bn;
        const name = isEn ? m.name?.en : m.name?.bn;
        return `
      <div class="sig-card">
        <div class="sig-line"></div>
        <div class="sig-name">${name}</div>
        <div class="sig-role">${role}</div>
        <div class="sig-badge">${dept}</div>
      </div>
    `;
      }
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Official Election Results Declaration 2026' : 'নির্বাচনী ফলাফল আনুষ্ঠানিক ঘোষণা পত্র ২০২৬'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-dark: #172554;
      --accent: #2563eb;
      --emerald: #059669;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-900: #0f172a;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f1f5f9;
      color: var(--slate-900);
      line-height: 1.5;
      padding: 24px;
    }

    .toolbar {
      max-width: 900px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid var(--slate-200);
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn:hover {
      background: var(--accent);
    }

    .btn-secondary {
      background: var(--slate-100);
      color: var(--slate-700);
      border: 1px solid var(--slate-300);
    }

    .btn-secondary:hover {
      background: var(--slate-200);
    }

    .document-card {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 16px;
      border: 1px solid var(--slate-200);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
    }

    .header-seal {
      text-align: center;
      border-bottom: 2px solid var(--slate-900);
      padding-bottom: 16px;
      margin-bottom: 20px;
      position: relative;
    }

    .header-seal .ref-badge {
      position: absolute;
      right: 0;
      top: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      background: var(--slate-100);
      border: 1px solid var(--slate-300);
      padding: 2px 8px;
      border-radius: 4px;
      color: var(--slate-600);
    }

    .main-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .sub-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      margin-top: 2px;
    }

    .caption {
      font-size: 12px;
      color: var(--slate-600);
      margin-top: 4px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
    }

    .stat-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--slate-600);
      display: block;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--slate-900);
    }

    .section-title-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 4px solid var(--primary);
      padding-left: 10px;
      margin: 24px 0 12px 0;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--slate-900);
    }

    .section-sub {
      font-size: 11px;
      color: var(--slate-600);
      font-style: italic;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 16px;
    }

    th, td {
      border: 1px solid var(--slate-300);
      padding: 8px 10px;
    }

    th {
      background-color: var(--slate-100);
      color: var(--slate-900);
      font-weight: 700;
      text-align: left;
    }

    tr:nth-child(even) {
      background-color: #fafbfc;
    }

    .elected-row {
      background-color: #f0fdf4 !important;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
    }

    .badge-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }

    .badge-slate {
      background: var(--slate-100);
      color: var(--slate-600);
      border: 1px solid var(--slate-300);
    }

    .signatures-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--slate-200);
    }

    .sig-card {
      text-align: center;
    }

    .sig-line {
      height: 1px;
      background: var(--slate-300);
      margin-bottom: 8px;
    }

    .sig-name {
      font-size: 11px;
      font-weight: 700;
      color: var(--slate-900);
    }

    .sig-role {
      font-size: 10px;
      color: var(--slate-600);
    }

    .sig-badge {
      font-size: 9px;
      color: var(--primary);
      font-weight: 600;
      margin-top: 2px;
    }

    .footer-note {
      text-align: center;
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px dashed var(--slate-300);
      font-size: 11px;
      color: var(--slate-600);
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .toolbar {
        display: none !important;
      }
      .document-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }

    @media (max-width: 640px) {
      body { padding: 12px; }
      .document-card { padding: 20px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .signatures-grid { grid-template-columns: repeat(2, 1fr); }
      .header-seal .ref-badge { position: static; display: inline-block; margin-top: 8px; }
    }
  </style>
</head>
<body>

  <!-- Top Tool Bar for Direct User Actions -->
  <div class="toolbar">
    <div style="font-size: 12px; color: var(--slate-600);">
      <strong>${isEn ? 'Export Document' : 'নথি রফতানি'}:</strong> HTML Standalone Edition
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn" onclick="window.print()">
        🖨️ ${isEn ? 'Print / Save as PDF' : 'প্রিন্ট / পিডিএফ হিসেবে সংরক্ষণ'}
      </button>
    </div>
  </div>

  <main class="document-card">
    <!-- Official Top Seal & Header -->
    <header class="header-seal">
      <div class="ref-badge">REF: PC-ELEC-2026/CERT-01</div>
      <h1 class="main-title">
        ${isEn ? 'Worker Representation & Participation Committee Election' : 'শ্রমিক প্রতিনিধিত্ব ও অংশগ্রহণ কমিটি নির্বাচন'}
      </h1>
      <h2 class="sub-title">
        ${isEn ? 'Official Declaration of Certified Results - 2026' : 'সার্টিফাইড ফলাফলের আনুষ্ঠানিক ঘোষণা পত্র - ২০২৬'}
      </h2>
      <p class="caption">
        ${isEn ? 'Certified election audit under the Bangladesh EPZ Labor Act & Factory Compliance Guidelines' : 'বাংলাদেশ ইপিজেড শ্রম আইন ও ফ্যাক্টরি কমপ্লায়েন্স নীতিমালার অধীনে প্রত্যয়িত নিরীক্ষা'}
      </p>
    </header>

    <!-- Meta Information Grid -->
    <section class="stats-grid">
      <div>
        <span class="stat-label">${isEn ? 'Certification Date' : 'সনদ প্রদানের তারিখ'}</span>
        <span class="stat-value">${todayStr}</span>
      </div>
      <div>
        <span class="stat-label">${isEn ? 'Total Eligible Electors' : 'মোট যোগ্য ভোটার'}</span>
        <span class="stat-value">${toBanglaNum(totalVoters, lang)} ${isEn ? 'Persons' : 'জন'}</span>
      </div>
      <div>
        <span class="stat-label">${isEn ? 'Total Ballots Cast' : 'মোট প্রদত্ত ভোট'}</span>
        <span class="stat-value">${toBanglaNum(totalVotesCast, lang)} (${toBanglaNum(turnoutPct, lang)}%)</span>
      </div>
      <div>
        <span class="stat-label">${isEn ? 'Audit Status' : 'অডিট স্ট্যাটাস'}</span>
        <span class="stat-value" style="color: var(--emerald);">✓ ${isEn ? 'Official Certified' : 'অফিসিয়াল সার্টিফাইড'}</span>
      </div>
    </section>

    <!-- Position 1: Vice President Table -->
    <section>
      <div class="section-title-wrap">
        <h3 class="section-title">
          ${isEn ? 'Position 1: Vice President Election Results' : 'পদ ১: সহ-সভাপতি পদের ফলাফল'}
        </h3>
        <span class="section-sub">
          ${isEn ? 'Elected by Executive Committee Members (1 Seat)' : 'কার্যনির্বাহী সদস্য কর্তৃক নির্বাচিত (১টি আসন)'}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 50px;">${isEn ? 'Rank' : 'ক্রম'}</th>
            <th style="width: 90px;">${isEn ? 'ID' : 'আইডি'}</th>
            <th>${isEn ? 'Candidate Name' : 'প্রার্থীর নাম'}</th>
            <th>${isEn ? 'Department' : 'বিভাগ'}</th>
            <th class="text-right" style="width: 80px;">${isEn ? 'Votes' : 'ভোট'}</th>
            <th class="text-right" style="width: 80px;">${isEn ? 'Share' : 'হার'}</th>
            <th class="text-center" style="width: 140px;">${isEn ? 'Status' : 'অবস্থা'}</th>
          </tr>
        </thead>
        <tbody>
          ${vpRows}
        </tbody>
      </table>
    </section>

    <!-- Position 2: Executive Committee (08 Certified Seats) -->
    <section>
      <div class="section-title-wrap">
        <h3 class="section-title">
          ${isEn ? 'Position 2: Executive Committee Members (Top 08 Elected)' : 'পদ ২: কার্যনির্বাহী পরিষদ সদস্য (শীর্ষ ০৮ জন নির্বাচিত)'}
        </h3>
        <span class="section-sub">
          ${isEn ? 'Direct General Electorate Balloting (08 Seats)' : 'সাধারণ ভোটারদের প্রত্যক্ষ ব্যালট ভোটে নির্বাচিত (০৮টি আসন)'}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 50px;">${isEn ? 'Rank' : 'ক্রম'}</th>
            <th style="width: 90px;">${isEn ? 'ID' : 'আইডি'}</th>
            <th>${isEn ? 'Candidate Name' : 'প্রার্থীর নাম'}</th>
            <th>${isEn ? 'Department' : 'বিভাগ'}</th>
            <th class="text-right" style="width: 80px;">${isEn ? 'Votes' : 'ভোট'}</th>
            <th class="text-right" style="width: 80px;">${isEn ? 'Share' : 'হার'}</th>
            <th class="text-center" style="width: 140px;">${isEn ? 'Status' : 'অবস্থা'}</th>
          </tr>
        </thead>
        <tbody>
          ${ecRows}
        </tbody>
      </table>
    </section>

    <!-- Official Certification & Signatures -->
    <section>
      <div class="signatures-grid">
        ${memberSignatures}
      </div>
    </section>

    <footer class="footer-note">
      <p>${isEn ? 'Official certified election document generated on' : 'অফিসিয়াল সার্টিফাইড নির্বাচনী ফলাফল নথি প্রস্তুতের সময়'}: ${timestamp}</p>
      <p style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
        Participation Committee Governance Portal • Confidential & Tamper-Evident Election Archive
      </p>
    </footer>
  </main>
</body>
</html>`;

  const filename = `PC_Election_Results_2026_${new Date().toISOString().slice(0, 10)}.html`;
  return saveHtmlFile(html, filename);
}

/**
 * Generates and downloads a complete standalone, beautifully styled HTML document
 * for the Eligible Voter Registry & Voter Roll.
 */
export function exportVoterRegistryHTML(
  voters: Voter[],
  lang: Language = 'en',
  totalVotesCast?: number,
  committeeMembers?: CommitteeMember[]
): boolean {
  const isEn = lang === 'en';
  const total = voters.length;
  const votedCount = totalVotesCast !== undefined
    ? totalVotesCast
    : voters.filter((v) => v.status === 'Voted').length;
  const pendingCount = total - votedCount;
  const turnoutPct = total > 0 ? ((votedCount / total) * 100).toFixed(1) : '0';

  const todayStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timestamp = new Date().toLocaleString(isEn ? 'en-US' : 'bn-BD');

  const voterRows = voters
    .map((v, idx) => {
      const isVoted = v.status === 'Voted';
      return `
        <tr>
          <td class="text-center font-bold">${toBanglaNum(idx + 1, lang)}</td>
          <td class="font-mono">${v.id}</td>
          <td class="font-mono">${v.empId || '-'}</td>
          <td class="font-semibold">${v.name}</td>
          <td>${v.desig}</td>
          <td>${v.dept}</td>
          <td>${v.section || '-'}</td>
          <td>${v.subSection || '-'}</td>
          <td>${v.lineInfo || '-'}</td>
          <td class="text-center">
            <span class="badge ${isVoted ? 'badge-voted' : 'badge-pending'}">
              ${isVoted ? (isEn ? '✓ VOTED' : '✓ ভোট প্রদত্ত') : (isEn ? 'PENDING' : 'অপেক্ষমান')}
            </span>
          </td>
        </tr>`;
    })
    .join('');

  const sigBlock = committeeMembers && committeeMembers.length > 0
    ? `
      <div class="signatures-grid">
        ${committeeMembers
          .slice(0, 4)
          .map(
            (m) => {
              const role = isEn ? (m.roleDescription?.en || m.badge?.en) : (m.roleDescription?.bn || m.badge?.bn);
              const dept = isEn ? m.dept?.en : m.dept?.bn;
              const name = isEn ? m.name?.en : m.name?.bn;
              return `
          <div class="sig-card">
            <div class="sig-line"></div>
            <div class="sig-name">${name}</div>
            <div class="sig-role">${role}</div>
            <div class="sig-badge">${dept}</div>
          </div>
        `;
            }
          )
          .join('')}
      </div>
    `
    : '';

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Official Voter Registry & Elector Roll 2026' : 'অফিসিয়াল ভোটার তালিকা ও রোল ২০২৬'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-900: #0f172a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Hind Siliguri', 'Inter', -apple-system, sans-serif;
      background: #f1f5f9;
      color: var(--slate-900);
      padding: 24px;
    }
    .toolbar {
      max-width: 1100px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid var(--slate-200);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
    }
    .document-card {
      max-width: 1100px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      border-radius: 16px;
      border: 1px solid var(--slate-200);
    }
    .header-seal {
      text-align: center;
      border-bottom: 2px solid var(--slate-900);
      padding-bottom: 16px;
      margin-bottom: 20px;
      position: relative;
    }
    .header-seal .ref-badge {
      position: absolute;
      right: 0;
      top: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      background: var(--slate-100);
      border: 1px solid var(--slate-300);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .stat-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: var(--slate-600); display: block; }
    .stat-value { font-size: 14px; font-weight: 700; color: var(--slate-900); }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid var(--slate-300);
      padding: 6px 8px;
    }
    th {
      background: var(--slate-100);
      font-weight: 700;
      text-align: left;
    }
    tr:nth-child(even) { background: #fafbfc; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 700;
    }
    .badge-voted {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .badge-pending {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--slate-200);
    }
    .sig-card { text-align: center; }
    .sig-line { height: 1px; background: var(--slate-300); margin-bottom: 8px; }
    .sig-name { font-size: 11px; font-weight: 700; }
    .sig-role { font-size: 10px; color: var(--slate-600); }
    .sig-badge { font-size: 9px; color: var(--primary); font-weight: 600; }
    .footer-note {
      text-align: center;
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px dashed var(--slate-300);
      font-size: 11px;
      color: var(--slate-600);
    }
    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none !important; }
      .document-card { border: none !important; box-shadow: none !important; padding: 0 !important; max-width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div style="font-size: 12px; color: var(--slate-600);">
      <strong>${isEn ? 'Voter Roll Document' : 'ভোটার তালিকা নথি'}:</strong> Standalone HTML Report
    </div>
    <button class="btn" onclick="window.print()">
      🖨️ ${isEn ? 'Print / Save as PDF' : 'প্রিন্ট / পিডিএফ হিসেবে সংরক্ষণ'}
    </button>
  </div>

  <main class="document-card">
    <header class="header-seal">
      <div class="ref-badge">REF: PC-VR-2026/AUDIT</div>
      <h1 style="font-size: 18px; font-weight: 800; text-transform: uppercase;">
        ${isEn ? 'Worker Representation Participation Committee Election - 2026' : 'শ্রমিক প্রতিনিধিত্ব ও অংশগ্রহণ কমিটি নির্বাচন - ২০২৬'}
      </h1>
      <h2 style="font-size: 14px; font-weight: 600; color: var(--primary); margin-top: 2px;">
        ${isEn ? 'Official Certified Voter Registry & Elector Roll' : 'অফিসিয়াল সার্টিফাইড ভোটার তালিকা ও নির্বাচক রোল'}
      </h2>
      <p style="font-size: 11px; color: var(--slate-600); margin-top: 4px;">
        ${isEn ? 'Factory Election Audit Register under Bangladesh EPZ Labor Guidelines' : 'বাংলাদেশ ইপিজেড শ্রম নীতিমালার অধীনে ফ্যাক্টরি নির্বাচন অডিট রেজিস্টার'}
      </p>
    </header>

    <section class="stats-grid">
      <div>
        <span class="stat-label">${isEn ? 'Generation Date' : 'প্রস্তুতের তারিখ'}</span>
        <span class="stat-value">${todayStr}</span>
      </div>
      <div>
        <span class="stat-label">${isEn ? 'Total Registered Electors' : 'মোট নিবন্ধিত ভোটার'}</span>
        <span class="stat-value">${toBanglaNum(total, lang)} ${isEn ? 'Persons' : 'জন'}</span>
      </div>
      <div>
        <span class="stat-label">${isEn ? 'Voted (Turnout)' : 'ভোট দিয়েছেন (টার্নআউট)'}</span>
        <span class="stat-value" style="color: #166534;">${toBanglaNum(votedCount, lang)} (${toBanglaNum(turnoutPct, lang)}%)</span>
      </div>
      <div>
        <span class="stat-label">${isEn ? 'Pending Ballots' : 'অপেক্ষমান ভোটার'}</span>
        <span class="stat-value" style="color: #92400e;">${toBanglaNum(pendingCount, lang)}</span>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th class="text-center" style="width: 40px;">${isEn ? 'SL' : 'ক্র.'}</th>
          <th style="width: 80px;">${isEn ? 'Voter ID' : 'ভোটার আইডি'}</th>
          <th style="width: 80px;">${isEn ? 'Emp ID' : 'কর্মকর্তা আইডি'}</th>
          <th>${isEn ? 'Name' : 'নাম'}</th>
          <th>${isEn ? 'Designation' : 'পদবি'}</th>
          <th>${isEn ? 'Department' : 'বিভাগ'}</th>
          <th>${isEn ? 'Section' : 'সেকশন'}</th>
          <th>${isEn ? 'Subsection' : 'সাব-সেকশন'}</th>
          <th>${isEn ? 'Line' : 'লাইন'}</th>
          <th class="text-center" style="width: 90px;">${isEn ? 'Status' : 'অবস্থা'}</th>
        </tr>
      </thead>
      <tbody>
        ${voterRows}
      </tbody>
    </table>

    ${sigBlock}

    <footer class="footer-note">
      <p>${isEn ? 'Official certified voter roll archive generated on' : 'অফিসিয়াল সার্টিফাইড ভোটার রোল নথি প্রস্তুতের সময়'}: ${timestamp}</p>
    </footer>
  </main>
</body>
</html>`;

  const filename = `Voter_Registry_2026_${new Date().toISOString().slice(0, 10)}.html`;
  return saveHtmlFile(html, filename);
}
