const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// Remove the extra outer <AnimatePresence> we added for the profile modal
// Open: line 9033 "      <AnimatePresence>\r\n            {showProfileModal"
// Close: line 9466 "      </AnimatePresence>\r\n    </>"

// Remove the opening wrapper
content = content.replace(
  '      </AnimatePresence>\r\n\r\n      <AnimatePresence>\r\n            {showProfileModal',
  '      </AnimatePresence>\r\n\r\n            {showProfileModal'
);

// Remove the trailing outer close (it comes right before </>);
content = content.replace(
  '          </AnimatePresence>\r\n      </AnimatePresence>\r\n    </>\r\n  );\r\n}',
  '          </AnimatePresence>\r\n    </>\r\n  );\r\n}'
);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', content);
console.log('Total lines:', content.split('\n').length);
console.log('Done!');
