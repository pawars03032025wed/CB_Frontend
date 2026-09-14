const fs = require('fs');
const content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');
const opens = (content.match(/<AnimatePresence>/g) || []).length;
const closes = (content.match(/<\/AnimatePresence>/g) || []).length;
console.log(`AnimatePresence: ${opens} opens, ${closes} closes, diff: ${opens-closes}`);

// Now run a proper global trace from top
const lines = content.split('\r\n');
let depth = 0;
const extras = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('<AnimatePresence>')) depth++;
  if (line.includes('</AnimatePresence>')) {
    depth--;
    if (depth < 0) {
      extras.push(`L${i+1}: ${line.trim()}`);
      depth = 0;
    }
  }
}
console.log('Final global depth:', depth);
console.log('Extra closes:', extras.length, extras);
