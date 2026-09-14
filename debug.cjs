const fs = require('fs');
const c = fs.readFileSync('c:/Users/payal/Desktop/CB/carebridge/frontend/src/components/panels/HospitalPanel.tsx', 'utf8');
const searchStr = 'style={{ boxShadow: `0 6px 20px rgba(0,0,0,0.25)` }}';
const start = c.indexOf(searchStr);
console.log('START FOUND AT:', start);
if(start !== -1) {
    console.log(c.substring(start, start + 1500));
}
