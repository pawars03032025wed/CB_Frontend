const fs = require('fs');
let hp = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// Add Search import only if not already present
if (hp.includes('  GraduationCap,\r\n} from "lucide-react"') && !hp.includes('\n  Search,\n')) {
  hp = hp.replace('  GraduationCap,\r\n} from "lucide-react"', '  GraduationCap,\r\n  Search,\r\n} from "lucide-react"');
  console.log('Added Search import (CRLF)');
} else if (hp.includes('  GraduationCap,\n} from "lucide-react"') && !hp.includes('\n  Search,\n')) {
  hp = hp.replace('  GraduationCap,\n} from "lucide-react"', '  GraduationCap,\n  Search,\n} from "lucide-react"');
  console.log('Added Search import (LF)');
} else {
  console.log('Search import already exists or pattern not found');
  const gIdx = hp.indexOf('GraduationCap,');
  console.log('Context:', JSON.stringify(hp.slice(gIdx, gIdx + 50)));
}

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', hp);
console.log('Done');
