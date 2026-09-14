const fs = require('fs');
let hp = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// The file uses CRLF line endings - search for line 17530 pattern
// We look for a simpler unique string
const target = '{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },\r\n                {\r\n                  id: "referrals",';
const replacement = '{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },\r\n                { id: "find", icon: Search, label: "Search Hospital" },\r\n                {\r\n                  id: "referrals",';

if (hp.includes(target)) {
  // Replace only the FIRST occurrence (real Hospital sidebar, not the injected clinic copy)
  const idx = hp.indexOf(target);
  hp = hp.slice(0, idx) + replacement + hp.slice(idx + target.length);
  console.log('Injected Search Hospital nav item at index', idx);
} else {
  // Try with just \n
  const target2 = '{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },\n                {\n                  id: "referrals",';
  const replacement2 = '{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },\n                { id: "find", icon: Search, label: "Search Hospital" },\n                {\n                  id: "referrals",';
  if (hp.includes(target2)) {
    hp = hp.replace(target2, replacement2);
    console.log('Injected (LF version)');
  } else {
    console.log('Target not found with either LF or CRLF!');
    // Debug: find what's around dashboard
    const dashIdx = hp.indexOf('"dashboard", icon: LayoutDashboard');
    console.log('dashboard context:', JSON.stringify(hp.slice(dashIdx, dashIdx + 200)));
  }
}

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', hp);
console.log('Done');
