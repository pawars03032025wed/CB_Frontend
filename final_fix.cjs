const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// Remove only the extra outer </AnimatePresence> at the very end (line 9466)
// Pattern: the inner close (10 spaces) followed by our extra outer close (6 spaces) then </>
content = content.replace(
  '          </AnimatePresence>\r\n      </AnimatePresence>\r\n    </>\r\n  );\r\n}',
  '          </AnimatePresence>\r\n    </>\r\n  );\r\n}'
);

// Also remove the outer <AnimatePresence> we added for profile modal at line 9033
// Pattern: the IPD modal close then our added outer open
content = content.replace(
  '      </AnimatePresence>\r\n\r\n      <AnimatePresence>\r\n            {showProfileModal',
  '      </AnimatePresence>\r\n\r\n            {showProfileModal'
);

// Verify balance
const opens = (content.match(/<AnimatePresence>/g) || []).length;
const closes = (content.match(/<\/AnimatePresence>/g) || []).length;
console.log(`Balance: ${opens} opens, ${closes} closes`);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', content);
console.log('Lines:', content.split('\r\n').length);
