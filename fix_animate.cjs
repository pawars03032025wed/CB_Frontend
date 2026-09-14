const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// The modals block starts at line 7963 (the comment)
// Each modal is missing its outer <AnimatePresence> wrapper because the slice started one line too late.
// We need to wrap each {showX && (...)} block with <AnimatePresence>

// ─── Fix Referral Type Modal ───
// Currently: {showReferralTypeModal && (
// Needs: <AnimatePresence>\n{showReferralTypeModal && (
// and before the next modal: )}\n</AnimatePresence>

// The block ends right before: {/* New OPD Patient Referral Modal */}
// which already has its own <AnimatePresence>

// Add <AnimatePresence> wrapper around showReferralTypeModal block
const before = '{/* ===== SEARCH HOSPITAL MODALS ===== */}\n            {showReferralTypeModal && (';
const after = '{/* ===== SEARCH HOSPITAL MODALS ===== */}\n      <AnimatePresence>\n            {showReferralTypeModal && (';
content = content.replace(before, after);

// Close it before the OPD modal AnimatePresence
// The OPD Referral block starts with:
//   {/* New OPD Patient Referral Modal */}
//   <AnimatePresence>
content = content.replace(
  '\r\n\r\n          {/* New OPD Patient Referral Modal */}\r\n          <AnimatePresence>',
  '\r\n      </AnimatePresence>\r\n\r\n      <AnimatePresence>'
);

// Fix the IPD Referral block the same way
content = content.replace(
  '\r\n\r\n          {/* New Patient Referral Modal */}\r\n          <AnimatePresence>',
  '\r\n      </AnimatePresence>\r\n\r\n      <AnimatePresence>'
);

// Fix the Hospital Profile Modal block
content = content.replace(
  '\r\n\r\n          {/* Hospital Profile Modal */}\r\n          <AnimatePresence>',
  '\r\n      </AnimatePresence>\r\n\r\n      <AnimatePresence>'
);

// Verify
const idx = content.indexOf('SEARCH HOSPITAL MODALS');
console.log('Context around SEARCH HOSPITAL MODALS:');
console.log(content.slice(idx - 20, idx + 400));

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', content);
console.log('\nTotal lines:', content.split('\n').length);
