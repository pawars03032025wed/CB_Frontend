const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// The 4 modal blocks were injected without their outer <AnimatePresence> wrappers.
// We need to wrap each one.

// Fix 1: Wrap referralTypeModal block
content = content.replace(
  '\n      {/* ===== SEARCH HOSPITAL MODALS ===== */}\n            {showReferralTypeModal && (',
  '\n      {/* ===== SEARCH HOSPITAL MODALS ===== */}\n      <AnimatePresence>\n            {showReferralTypeModal && ('
);

// Find the end of referralTypeModal block and add closing AnimatePresence
// The referralTypeModal ends when showOPDReferralModal block begins
// Looking for the pattern right before {/* New OPD Patient Referral Modal */}
content = content.replace(
  '\r\n\r\n          {/* New OPD Patient Referral Modal */}\r\n          <AnimatePresence>\r\n            {showOPDReferralModal',
  '\r\n      </AnimatePresence>\r\n\r\n      <AnimatePresence>\r\n            {showOPDReferralModal'
);

// Fix OPD modal end / IPD modal start
content = content.replace(
  '\r\n\r\n          {/* New Patient Referral Modal */}\r\n          <AnimatePresence>\r\n            {showReferralModal',
  '\r\n      </AnimatePresence>\r\n\r\n      <AnimatePresence>\r\n            {showReferralModal'
);

// Fix IPD modal end / Profile modal start
content = content.replace(
  '\r\n\r\n          {/* Hospital Profile Modal */}\r\n          <AnimatePresence>',
  '\r\n      </AnimatePresence>\r\n\r\n      <AnimatePresence>'
);

// Fix Profile modal - it ends with </AnimatePresence> already inside the block
// So we need to check its last </AnimatePresence> before </>
// The profile modal block ALREADY has </AnimatePresence> at the end (from ClinicPanel)
// So we just need to verify and not double-wrap it.

console.log('Replacements done');

// Verify the changes
const lines = content.split('\n');
console.log('Total lines:', lines.length);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', content);
console.log('Saved');
