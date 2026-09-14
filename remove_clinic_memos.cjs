const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');
const lines = content.split('\r\n');

// Remove lines 1413-1541 (0-indexed: 1412-1540) — the Clinic-specific useMemo blocks
// groupedCreditRecords (1414-1460), groupedPaymentHistory (1462-1508), todayTransactions (1510-1541)
// Keep everything before line 1413 and from line 1543 onwards

const removeStart = 1412; // 0-indexed, line 1413 (blank line before groupedCreditRecords)
const removeEnd = 1541;   // 0-indexed, line 1542 (blank line after todayTransactions)

console.log('Removing lines', removeStart+1, 'to', removeEnd+1);
console.log('First line to remove:', lines[removeStart]);
console.log('Last line to remove:', lines[removeEnd]);
console.log('First line kept after removal:', lines[removeEnd+1]);

const cleaned = [
  ...lines.slice(0, removeStart),
  ...lines.slice(removeEnd + 1)
];

const result = cleaned.join('\r\n');
fs.writeFileSync('src/components/panels/HospitalPanel.tsx', result);
console.log('Lines:', cleaned.length);
