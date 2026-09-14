const fs = require('fs');
const c = fs.readFileSync('c:/Users/payal/Desktop/CB/carebridge/frontend/src/components/panels/HospitalPanel.tsx', 'utf8');

const lines = c.split(/\r?\n/);

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Clinical Command & Operations Deck')) {
        startIndex = i;
    }
    if (lines[i].includes('activeTab === "admit" && (')) {
        endIndex = i;
    }
}

console.log('Start line:', startIndex);
console.log('End line:', endIndex);
