const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// Normalize all line endings to CRLF
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');

// Count AnimatePresence tags
const opens = (content.match(/<AnimatePresence>/g) || []).length;
const closes = (content.match(/<\/AnimatePresence>/g) || []).length;
console.log(`<AnimatePresence> opens: ${opens}, closes: ${closes}`);

if (opens !== closes) {
  console.log('IMBALANCED! Difference:', opens - closes);
}

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', content);
console.log('Total lines:', content.split('\r\n').length);
