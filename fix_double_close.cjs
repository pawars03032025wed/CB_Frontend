const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// Each original modal block from ClinicPanel had:
//   <AnimatePresence>  <- we replaced these with: </AnimatePresence>\n<AnimatePresence>
//     {showX && (...)}
//   </AnimatePresence>  <- this INNER one remains from the original block
//
// So we now have: outer </AnimatePresence> close + inner </AnimatePresence> close = DOUBLE close
// We need to remove the INNER ones (the ones indented with 10 spaces: '          </AnimatePresence>')

// The pattern for the double-close is:
// '          </AnimatePresence>\r\n      </AnimatePresence>'
// We want to keep only the outer one (6 spaces)

let fixed = content;

// Count occurrences before
const doublePattern = '          </AnimatePresence>\r\n      </AnimatePresence>';
const count = (content.match(/          <\/AnimatePresence>\r\n      <\/AnimatePresence>/g) || []).length;
console.log('Double close occurrences:', count);

// Remove the inner (10-space) closing tags that are followed immediately by the outer (6-space) one
fixed = fixed.replace(/          <\/AnimatePresence>\r\n      <\/AnimatePresence>/g, '      </AnimatePresence>');

const newCount = (fixed.match(/          <\/AnimatePresence>\r\n      <\/AnimatePresence>/g) || []).length;
console.log('After fix double close occurrences:', newCount);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', fixed);
console.log('Total lines:', fixed.split('\n').length);
console.log('Done!');
