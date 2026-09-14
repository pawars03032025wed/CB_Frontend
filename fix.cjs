const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'components', 'panels', 'HospitalPanel.tsx');
let c = fs.readFileSync(p, 'utf8');

const startStr = "style={{ boxShadow: `0 6px 20px rgba(0,0,0,0.25)` }}\r\n                            >\r\n";
const startStrLF = "style={{ boxShadow: `0 6px 20px rgba(0,0,0,0.25)` }}\n                            >\n";

const isCRLF = c.includes(startStr);
const actualStart = isCRLF ? startStr : startStrLF;

const endStr1 = "<ArrowRight size={14} />\r\n                          </div>\r\n                        </motion.div>";
const endStr1LF = "<ArrowRight size={14} />\n                          </div>\n                        </motion.div>";
const actualEnd1 = isCRLF ? endStr1 : endStr1LF;

const startIndex = c.indexOf(actualStart);
const endIndex = c.indexOf(actualEnd1, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const validBlock = `                              <srv.icon size={21} />
                            </div>

                            <div className="text-left font-sans">
                              <h4
                                className="text-[11px] font-black uppercase tracking-wider"
                                style={{ color: darkMode ? "#e2e8f0" : "#0f172a" }}
                              >
                                {srv.label}
                              </h4>
                              <p
                                className="text-[10px] font-medium leading-relaxed mt-1 line-clamp-2"
                                style={{ color: darkMode ? "rgba(148,163,184,0.75)" : "rgba(71,85,105,0.75)" }}
                              >
                                {srv.description}
                              </p>
                              {srv.badge && (
                                <span
                                  className="inline-block mt-2 text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                                  style={{
                                    background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                    color: darkMode ? "rgba(148,163,184,0.85)" : "rgba(71,85,105,0.85)",
                                    border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
                                  }}
                                >
                                  {srv.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${srv.arrowBg} text-white opacity-80 group-hover:opacity-100 transition-opacity\`}>
                            <ArrowRight size={14} />
                          </div>
                        </motion.div>`;
                        
    const newBlock = isCRLF ? validBlock.replace(/\n/g, '\r\n') : validBlock;
    
    const pre = c.substring(0, startIndex + actualStart.length);
    const post = c.substring(endIndex + actualEnd1.length);
    
    fs.writeFileSync(p, pre + newBlock + post, 'utf8');
    console.log("Successfully patched HospitalPanel.tsx");
} else {
    console.log("Could not find start or end index.");
    console.log("Start:", startIndex);
    console.log("End:", endIndex);
}
