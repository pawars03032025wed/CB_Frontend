const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// Add <AnimatePresence> before the profile modal block and </AnimatePresence> at the end
content = content.replace(
  '      </AnimatePresence>\r\n\r\n            {showProfileModal &&',
  '      </AnimatePresence>\r\n\r\n      <AnimatePresence>\r\n            {showProfileModal &&'
);

// Add the closing </AnimatePresence> after the last inner one, before </>
content = content.replace(
  '          </AnimatePresence>\r\n    </>\r\n  );\r\n}',
  '          </AnimatePresence>\r\n      </AnimatePresence>\r\n    </>\r\n  );\r\n}'
);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', content);
console.log('Lines:', content.split('\n').length);
