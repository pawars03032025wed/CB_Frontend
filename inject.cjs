const fs = require('fs');
const cp = fs.readFileSync('src/components/panels/ClinicPanel.tsx', 'utf8');
let hp = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');

const getBlock = (start, end) => cp.slice(cp.indexOf(start), cp.indexOf(end, cp.indexOf(start)));
const getBlockInclusive = (start, end) => cp.slice(cp.indexOf(start), cp.indexOf(end, cp.indexOf(start)) + end.length);

// 1. State Variables
const stateStart = '  const [filterLocation, setFilterLocation] = useState("all");';
const stateEnd = '  const [isReferralSubmitting, setIsReferralSubmitting] = useState(false);';
const states = getBlock(stateStart, stateEnd) + '  const [hospitals, setHospitals] = useState<any[]>([]);\n  const [hospitalDetails, setHospitalDetails] = useState<any[]>([]);\n  const [isReferralSubmitting, setIsReferralSubmitting] = useState(false);\n';

// 2. Computed logic
const computedStart = '  const filteredHospitals = useMemo(() => {';
const computedEnd = '  const fetchOnDemandDataRef = useRef<() => Promise<void>>(async () => {});';
const computed = getBlock(computedStart, computedEnd);

// 3. Tab block
const tabStart = '{activeTab === "find" && (';
const tabEnd = '{activeTab === "referrals" && (';
const tab = getBlock(tabStart, tabEnd);

// 4. Modals
const modalsStart = '      {/* =========================================================================\n        * HOSPITAL PROFILE MODAL\n        * ========================================================================= */}';
const modalsEnd = '      {/* Success Modal */}';
const modals = getBlock(modalsStart, modalsEnd);

// Inject into HospitalPanel
// Inject State
hp = hp.replace('  const [referrals, setReferrals] = useState<any[]>([]);', states + '  const [referrals, setReferrals] = useState<any[]>([]);');

// Inject Computed
hp = hp.replace('  const filteredReferrals = useMemo(() => {', computed + '\n  const filteredReferrals = useMemo(() => {');

// Inject Tab
hp = hp.replace('{activeTab === "referrals" && (', tab + '\n            {activeTab === "referrals" && (');

// Inject Modals
hp = hp.replace('      {/* Add New Referral Modal */}', modals + '\n      {/* Add New Referral Modal */}');

// Sidebar link
const sidebarLink = `              <button
                type="button"
                onClick={() => {
                  setActiveTab("find");
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={\`w-full flex items-center gap-3 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 \${
                  activeTab === "find"
                    ? darkMode
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400"
                      : "bg-emerald-50 text-emerald-600 shadow-sm"
                    : darkMode
                      ? "text-gray-400 hover:bg-white/5 hover:text-white"
                      : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                }\`}
              >
                <div className={\`p-1.5 rounded-xl \${activeTab === "find" ? "bg-emerald-500 text-white shadow-md" : ""}\`}>
                  <Search size={15} />
                </div>
                <span>Search Hospital</span>
              </button>\n`;
hp = hp.replace('{/* MAIN NAVIGATION MODULES */}', '{/* MAIN NAVIGATION MODULES */}\n' + sidebarLink);

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', hp);
console.log('Done injecting');
