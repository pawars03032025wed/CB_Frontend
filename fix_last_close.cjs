const fs = require('fs');
let content = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

// After the last AnimatePresence close (the inner profile modal one at line 9465)
// we need to add the outer </AnimatePresence> before the </>

// The file ends with:
//           </AnimatePresence>
//     </>
//   );
// }

content = content.replace(
  '          </AnimatePresence>\r\n    </>\r\n  );\r\n}',
  '          </AnimatePresence>\r\n      </AnimatePresence>\r\n    </>\r\n  );\r\n}'
);

console.log('Total lines:', content.split('\n').length);
fs.writeFileSync('src/components/panels/HospitalPanel.tsx', content);
console.log('Done!');
