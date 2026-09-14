const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// The modals were injected at line 7842, inside the bottom nav area.
// We need to move them to AFTER the LegalFooter (line 9348 approx), before the closing </> of root.

const lines = content.split('\n');
console.log('Total lines:', lines.length);

// Find the SEARCH HOSPITAL MODALS comment
const modalsStartIdx = lines.findIndex(l => l.includes('===== SEARCH HOSPITAL MODALS ====='));
console.log('Modals start at line:', modalsStartIdx + 1);

// Find where the modals end - look for the last </AnimatePresence> before LegalFooter
const legalFooterIdx = lines.findIndex(l => l.includes('<LegalFooter'));
console.log('LegalFooter at line:', legalFooterIdx + 1);

if (modalsStartIdx === -1 || legalFooterIdx === -1) {
  console.error('Could not find markers!');
  process.exit(1);
}

// Find the end of the modals block - it's before LegalFooter but we need to scan for it
// The modals should end with the profile modal's </AnimatePresence>
// Find the LAST </AnimatePresence> before LegalFooter
let modalsEndIdx = modalsStartIdx;
for (let i = legalFooterIdx - 1; i > modalsStartIdx; i--) {
  if (lines[i].trim() === '</AnimatePresence>') {
    modalsEndIdx = i;
    break;
  }
}
console.log('Modals end at line:', modalsEndIdx + 1);

// Extract the modals block
const modalsBlock = lines.slice(modalsStartIdx, modalsEndIdx + 1);
console.log('Modals block size:', modalsBlock.length, 'lines');

// Remove the modals from their current position
const withoutModals = [
  ...lines.slice(0, modalsStartIdx),
  ...lines.slice(modalsEndIdx + 1)
];

// Find the new LegalFooter position (after removing modals)
const newLegalFooterIdx = withoutModals.findIndex(l => l.includes('<LegalFooter'));
console.log('LegalFooter now at line:', newLegalFooterIdx + 1);

// Find the closing </> of the root fragment (should be shortly after LegalFooter)
let closingFragmentIdx = -1;
for (let i = newLegalFooterIdx + 1; i < withoutModals.length; i++) {
  if (withoutModals[i].trim() === '</>') {
    closingFragmentIdx = i;
    break;
  }
}
console.log('Closing </> at line:', closingFragmentIdx + 1);

if (closingFragmentIdx === -1) {
  console.error('Could not find closing fragment!');
  process.exit(1);
}

// Insert modals BEFORE the closing </>
const cleanLines = [
  ...withoutModals.slice(0, closingFragmentIdx),
  '',
  '      {/* ===== SEARCH HOSPITAL MODALS ===== */}',
  ...modalsBlock.slice(1), // skip the comment line since we're re-adding it
  ...withoutModals.slice(closingFragmentIdx)
];

console.log('Final line count:', cleanLines.length);
fs.writeFileSync('src/components/panels/HospitalPanel.tsx', cleanLines.join('\n'));
console.log('Done!');
