const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');
const lines = content.split('\r\n');
console.log('Total lines before:', lines.length);

// Remove the extra </AnimatePresence> at line 9464 (0-indexed: 9463)
// Verify it's what we expect
console.log('Line 9463 (0-idx):', lines[9463]);
console.log('Line 9464 (0-idx):', lines[9464]);
console.log('Line 9465 (0-idx):', lines[9465]);

// Remove line 9464 (0-indexed: 9463)
if (lines[9463].trim() === '</AnimatePresence>') {
  lines.splice(9463, 1);
  console.log('Removed extra </AnimatePresence> at line 9464');
} else {
  console.error('Expected </AnimatePresence> at line 9464 but got:', lines[9463]);
}

const result = lines.join('\r\n');

// Verify balance
const opens = (result.match(/<AnimatePresence>/g) || []).length;
const closes = (result.match(/<\/AnimatePresence>/g) || []).length;
console.log(`Final balance: ${opens} opens, ${closes} closes`);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', result);
console.log('Total lines after:', lines.length);
