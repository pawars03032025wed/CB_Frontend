const fs = require('fs');
const c = fs.readFileSync('c:/Users/payal/Desktop/CB/carebridge/frontend/src/components/panels/HospitalPanel.tsx', 'utf8');

const startTarget = 'Incoming Triage & Admit';
const firstIndex = c.indexOf(startTarget);
const lastIndex = c.lastIndexOf(startTarget);

console.log('First index:', firstIndex);
console.log('Last index:', lastIndex);

if(firstIndex !== lastIndex) {
    console.log('Multiple matches found!');
} else {
    console.log('Only one match found!');
}
