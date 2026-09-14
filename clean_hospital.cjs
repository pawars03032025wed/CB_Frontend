const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

const lines = content.split('\r\n');
console.log('Total lines:', lines.length);

// injectedStart (0-indexed): 2152 = "    return (" — start of Clinic Panel JSX
// realReturn (0-indexed): 16964 = "  return (" — start of real Hospital Panel JSX

const injectedStart = 2152;
const realReturn = 16964;

console.log('Line at injectedStart [' + (injectedStart+1) + ']:', lines[injectedStart]);
console.log('Line at realReturn    [' + (realReturn+1) + ']:', lines[realReturn]);

const cleanLines = [
  ...lines.slice(0, injectedStart),   // Everything before the Clinic Panel injection
  ...lines.slice(realReturn)           // Real Hospital Panel return onwards
];

console.log('Clean file will have', cleanLines.length, 'lines (was', lines.length, ')');

const output = cleanLines.join('\r\n');
fs.writeFileSync('src/components/panels/HospitalPanel.tsx', output);
console.log('Done!');
