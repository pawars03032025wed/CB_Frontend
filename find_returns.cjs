const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

const lines = content.split('\r\n');
console.log('Total lines:', lines.length);

// Find ALL occurrences of "  return (" (exactly 2 spaces, to get component-level returns)
const returnLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '  return (') {
    returnLines.push({ idx: i, lineNum: i + 1 });
  }
}
console.log('Component-level return lines:', returnLines);

// Also look for "    return (" (4 spaces, e.g. inside if blocks)
const return4Lines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '    return (') {
    return4Lines.push({ idx: i, lineNum: i + 1 });
  }
}
console.log('Indented return lines (4 spaces):', return4Lines);
