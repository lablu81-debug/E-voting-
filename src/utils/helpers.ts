import * as XLSX from 'xlsx';
import { Candidate, Language, Voter } from '../types';

export function toBanglaNum(num: number | string, lang: Language): string {
  if (lang === 'en') return String(num);
  const banglaDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).replace(/\d/g, (d) => banglaDigits[d] || d);
}

export function exportResultsCSV(
  vpCandidates: Candidate[],
  ecCandidates: Candidate[],
  totalVoters: number,
  totalVotesCast: number
) {
  let csvContent = "\uFEFF";
  csvContent += "Participation Committee Election Results 2026\n";
  csvContent += `Generated On,${new Date().toLocaleString()}\n`;
  csvContent += `Total Eligible Voters,${totalVoters}\n`;
  csvContent += `Total Votes Cast,${totalVotesCast}\n`;
  const turnoutPct = totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(1) : '0';
  csvContent += `Turnout Rate,${turnoutPct}%\n\n`;

  csvContent += "--- Vice President Tally ---\n";
  csvContent += "Rank,Status,Candidate ID,Name,Department,Votes,Percentage\n";
  
  const sortedVp = [...vpCandidates].sort((a, b) => b.votes - a.votes);
  sortedVp.forEach((c, idx) => {
    const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';
    const status = idx === 0 ? "Elected" : "Runner Up";
    csvContent += `${idx + 1},${status},${c.id},"${c.nameEn}","${c.deptEn}",${c.votes},${pct}%\n`;
  });

  csvContent += "\n--- Executive Committee Member Tally ---\n";
  csvContent += "Rank,Status,Candidate ID,Name,Department,Votes,Percentage\n";
  const sortedEc = [...ecCandidates].sort((a, b) => b.votes - a.votes);
  sortedEc.forEach((c, idx) => {
    const pct = totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0';
    const status = idx === 0 ? "Elected" : "Runner Up";
    csvContent += `${idx + 1},${status},${c.id},"${c.nameEn}","${c.deptEn}",${c.votes},${pct}%\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `PC_Election_Results_2026_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportVoterRegistryCSV(voters: Voter[]) {
  let csvContent = "\uFEFF";
  csvContent += "Eligible Voter Registry & Status 2026\n";
  csvContent += "SL,Voter ID,Employee ID,Employee Name,Designation,DOJ,Gender Info,Employee Category,Department,Section,Subsection,Line info,Status\n";
  voters.forEach((v, idx) => {
    csvContent += `${idx + 1},"${v.id}","${v.empId || ''}","${v.name}","${v.desig}","${v.doj || ''}","${v.gender || ''}","${v.empCategory || ''}","${v.dept}","${v.section || ''}","${v.subSection || ''}","${v.lineInfo || ''}","${v.status}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Voter_Registry_2026_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSampleExcelTemplate() {
  const sampleData = [
    ["Voter ID", "Employee ID", "Employee Name", "Designation", "DOJ", "Gender Info", "Employee Category", "Department", "Section", "Subsection", "Line info", "Photo URL"],
    ["EPZ-201", "EMP-5001", "Tanvir Ahmed", "Senior Operator", "2021-03-15", "Male", "Permanent", "Sewing", "Line 01", "Stitching", "Line-A", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"],
    ["EPZ-202", "EMP-5002", "Salma Khatun", "Quality Inspector", "2020-07-10", "Female", "Permanent", "Quality", "Final QC", "Audit Line", "QC-2", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"],
    ["EPZ-203", "EMP-5003", "Kamrul Hasan", "Cutting Supervisor", "2019-11-01", "Male", "Staff", "Cutting", "Main Cutting", "Spreading", "Cut-1", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80"],
    ["EPZ-204", "EMP-5004", "Morshed Alam", "Packer", "2022-01-20", "Male", "Contract", "Finishing", "Packing", "Carton Box", "Pack-4", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"]
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Voters_Template");
  XLSX.writeFile(wb, "Eligible_Voters_Template.xlsx");
}

export function parseExcelVoters(file: File): Promise<Voter[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, { header: 1 });

        if (jsonData.length <= 1) {
          resolve([]);
          return;
        }

        const headers = (jsonData[0] || []).map((h) => String(h || '').toLowerCase().trim());
        const hasExtended = headers.includes('doj') || headers.includes('gender info') || headers.includes('line info');

        const newVoters: Voter[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || !row[0]) continue;

          if (hasExtended) {
            // Extended 12-column format: Voter ID, Employee ID, Employee Name, Designation, DOJ, Gender Info, Employee Category, Department, Section, Subsection, Line info, Photo URL
            newVoters.push({
              id: String(row[0] || '').trim(),
              empId: String(row[1] || `EMP-${1000 + i}`).trim(),
              name: String(row[2] || 'Unknown').trim(),
              desig: String(row[3] || 'Worker').trim(),
              doj: row[4] ? String(row[4]).trim() : undefined,
              gender: row[5] ? String(row[5]).trim() : undefined,
              empCategory: row[6] ? String(row[6]).trim() : undefined,
              dept: String(row[7] || 'General').trim(),
              section: String(row[8] || 'General Section').trim(),
              subSection: String(row[9] || 'Sub-1').trim(),
              lineInfo: row[10] ? String(row[10]).trim() : undefined,
              linkSent: true,
              status: "Pending",
              photo: String(row[11] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80").trim()
            });
          } else {
            // Standard format: Voter ID, Employee ID, Name, Designation, Department, Section, Subsection, Photo URL
            newVoters.push({
              id: String(row[0] || '').trim(),
              empId: String(row[1] || `EMP-${1000 + i}`).trim(),
              name: String(row[2] || 'Unknown').trim(),
              desig: String(row[3] || 'Worker').trim(),
              dept: String(row[4] || 'General').trim(),
              section: String(row[5] || 'General Section').trim(),
              subSection: String(row[6] || 'Sub-1').trim(),
              linkSent: true,
              status: "Pending",
              photo: String(row[7] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80").trim()
            });
          }
        }
        resolve(newVoters);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
