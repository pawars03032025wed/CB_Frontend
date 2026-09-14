const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');
const lines = content.split('\r\n');

// Track AnimatePresence balance and report mismatches
let depth = 0;
const issues = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('<AnimatePresence>')) depth++;
  if (line.includes('</AnimatePresence>')) {
    depth--;
    if (depth < 0) {
      issues.push(`Line ${i+1}: Unexpected close, depth went to ${depth}: ${line.trim()}`);
      depth = 0; // reset to avoid cascading
    }
  }
}
console.log('Final depth (should be 0):', depth);
console.log('Issues found:', issues.length);
issues.forEach(i => console.log(i));

// Also show all AnimatePresence lines in the modals section (after line 7960)
const apLines = [];
for (let i = 7960; i < lines.length; i++) {
  if (lines[i].includes('AnimatePresence')) {
    apLines.push(`Line ${i+1}: ${lines[i].trim()}`);
  }
}
console.log('\nAll AnimatePresence in modals section:');
apLines.forEach(l => console.log(l));
