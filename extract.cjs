const fs = require('fs');
const content = fs.readFileSync('src/components/panels/ClinicPanel.tsx', 'utf8');
const startIndex = content.indexOf('activeTab === "find"');
const slice = content.slice(startIndex, startIndex + 25000);
const endIndex = slice.indexOf('activeTab === "referrals"');
fs.writeFileSync('find_tab.txt', slice.substring(0, endIndex));
