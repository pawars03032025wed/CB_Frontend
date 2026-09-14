const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// Remove the duplicate injected states block (lines 163-232 injected duplicates)
// The duplicate block starts right after showReferralModal on line 162
// and ends after hospitalDetails state. We need to remove lines 163-232 (0-indexed: 162-231)

const lines = content.split('\n'); // Use \n since file has mixed endings now

// Find and remove duplicate declarations
const seen = new Set();
const cleanLines = [];
let skipUntilLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Detect duplicate useState declarations
  const stateMatch = trimmed.match(/^const \[(\w+),/);
  if (stateMatch) {
    const varName = stateMatch[1];
    if (seen.has(varName)) {
      // This is a duplicate. Skip this line and the object/array body if multi-line
      if (trimmed.endsWith('useState({') || trimmed.endsWith('useState<any>({') || 
          trimmed.endsWith('useState<any[]>([') || trimmed.endsWith('useState<string[]>([')) {
        // Skip until closing });
        let depth = 1;
        i++;
        while (i < lines.length && depth > 0) {
          const l = lines[i].trim();
          if (l.includes('{') || l.includes('[')) depth++;
          if (l.includes('}') || l.includes(']')) depth--;
          if (depth <= 0) break;
          i++;
        }
        // Skip the final });  line
        continue;
      }
      console.log('Removing duplicate:', varName, 'at line', i + 1);
      continue; // skip duplicate single-line state
    }
    seen.add(varName);
  }
  
  cleanLines.push(line);
}

console.log('Original lines:', lines.length, '→ Clean lines:', cleanLines.length);
fs.writeFileSync('src/components/panels/HospitalPanel.tsx', cleanLines.join('\n'));
console.log('Done!');
