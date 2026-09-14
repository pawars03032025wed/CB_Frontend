const fs = require('fs');

const cp = fs.readFileSync('src/components/panels/ClinicPanel.tsx', 'utf8');
const cpLines = cp.split('\r\n');

let hp = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// ─── Extract blocks using line numbers (0-indexed) ───
// Referral Type Modal: starts at line 14820, ends before OPD Referral Modal at 14940
const referralTypeModal = cpLines.slice(14819, 14939).join('\r\n');

// OPD Referral Modal: starts at 14940, ends before IPD/Referral Modal at 15406
const opdReferralModal = cpLines.slice(14939, 15405).join('\r\n');

// IPD Referral (showReferralModal): starts at 15406, ends before Hospital Profile Modal at 15890
const ipdReferralModal = cpLines.slice(15405, 15889).join('\r\n');

// Hospital Profile Modal: starts at 15890, find where it ends
// Ends at the last }); near line 16000+
const profileModalStartIdx = 15889;
// Find end: the line after the AnimatePresence closing
let profileModalEndIdx = profileModalStartIdx;
for (let i = profileModalStartIdx + 1; i < Math.min(profileModalStartIdx + 2000, cpLines.length); i++) {
  if (cpLines[i].trim() === '</AnimatePresence>') {
    profileModalEndIdx = i + 1;
    // Check next non-empty line to confirm this is the right one
    if (i > 16200) break;
  }
}
console.log('Profile modal end detected at line:', profileModalEndIdx + 1);
const profileModal = cpLines.slice(profileModalStartIdx, profileModalEndIdx).join('\r\n');

console.log('referralTypeModal lines:', referralTypeModal.split('\r\n').length);
console.log('opdReferralModal lines:', opdReferralModal.split('\r\n').length);
console.log('ipdReferralModal lines:', ipdReferralModal.split('\r\n').length);
console.log('profileModal lines:', profileModal.split('\r\n').length);

// ─── Inject modals into HospitalPanel before the closing of the main content area ───
// Find a good anchor: the LegalFooter or end of return
const modalInjectionAnchor = '      <LegalFooter';
if (hp.includes(modalInjectionAnchor)) {
  const modalBlock = [
    '\r\n      {/* ===== SEARCH HOSPITAL MODALS ===== */}',
    referralTypeModal,
    opdReferralModal,
    ipdReferralModal,
    profileModal,
    '\r\n'
  ].join('\r\n');
  hp = hp.replace(modalInjectionAnchor, modalBlock + modalInjectionAnchor);
  console.log('Injected modals before LegalFooter');
} else {
  console.log('LegalFooter anchor not found, trying alternative...');
  // Try closing </div> of main content
  const altAnchor = '\n    </div>\n  );\n}';
  if (hp.includes(altAnchor)) {
    const modalBlock = [
      '\n      {/* ===== SEARCH HOSPITAL MODALS ===== */}',
      referralTypeModal,
      opdReferralModal,
      ipdReferralModal,
      profileModal,
    ].join('\n');
    hp = hp.replace(altAnchor, modalBlock + altAnchor);
    console.log('Injected modals before closing div');
  } else {
    console.log('No anchor found!');
  }
}

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', hp);
console.log('Done! Final line count:', hp.split('\r\n').length);
