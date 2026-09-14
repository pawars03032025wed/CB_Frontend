const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');
const lines = content.split('\r\n');
console.log('Total lines:', lines.length);

// Line 9033 (0-indexed: 9032) starts {showProfileModal && which needs <AnimatePresence> before it
// Line 9463 (0-indexed: 9462) is "              })()}" - end of profile modal
// We need to insert <AnimatePresence> before 9033 and </AnimatePresence> after 9463

// Add <AnimatePresence> before line 9033 (idx 9032)
// and </AnimatePresence> after line 9463 (idx 9462) -> becomes idx 9464 after insert

// Step 1: Find the profile modal start (the {showProfileModal && line)
let profileModalLineIdx = -1;
for (let i = 9000; i < lines.length; i++) {
  if (lines[i].trim().startsWith('{showProfileModal &&')) {
    profileModalLineIdx = i;
    break;
  }
}
console.log('Profile modal starts at line', profileModalLineIdx + 1, ':', lines[profileModalLineIdx]);

// Step 2: Find the end of profile modal - the })()}  line
let profileModalEndIdx = -1;
for (let i = lines.length - 1; i > profileModalLineIdx; i--) {
  if (lines[i].trim() === '})()}') {
    profileModalEndIdx = i;
    break;
  }
}
console.log('Profile modal ends at line', profileModalEndIdx + 1, ':', lines[profileModalEndIdx]);

if (profileModalLineIdx === -1 || profileModalEndIdx === -1) {
  console.error('Could not find profile modal boundaries!');
  process.exit(1);
}

// Insert </AnimatePresence> after the end line
lines.splice(profileModalEndIdx + 1, 0, '      </AnimatePresence>');
// Insert <AnimatePresence> before the start line
lines.splice(profileModalLineIdx, 0, '      <AnimatePresence>');

const result = lines.join('\r\n');
const opens = (result.match(/<AnimatePresence>/g) || []).length;
const closes = (result.match(/<\/AnimatePresence>/g) || []).length;
console.log(`AnimatePresence balance: ${opens} opens, ${closes} closes`);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', result);
console.log('Final lines:', lines.length);
