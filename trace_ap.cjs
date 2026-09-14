const fs = require('fs');
const content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');
const lines = content.split('\r\n');

let depth = 0;
const log = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('<AnimatePresence>')) {
    depth++;
    if (i > 7960) log.push(`  OPEN  L${i+1} [depth=${depth}] ${line.trim()}`);
  }
  if (line.includes('</AnimatePresence>')) {
    depth--;
    if (i > 7960) log.push(`  CLOSE L${i+1} [depth=${depth}] ${line.trim()}`);
    if (depth < 0) {
      log.push(`  *** EXTRA CLOSE at L${i+1}! ***`);
      depth = 0;
    }
  }
}
console.log('Final depth:', depth);
console.log('\nModals section AnimatePresence trace:');
log.forEach(l => console.log(l));
