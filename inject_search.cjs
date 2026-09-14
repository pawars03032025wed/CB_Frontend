const fs = require('fs');

const cp = fs.readFileSync('src/components/panels/ClinicPanel.tsx', 'utf8');
const cpLines = cp.split('\r\n');

let hp = fs.readFileSync('src/components/panels/HospitalPanel.tsx', 'utf8');
const hpLines = hp.split('\r\n');
console.log('ClinicPanel lines:', cpLines.length);
console.log('HospitalPanel lines:', hpLines.length);

// ─── 1. EXTRACT "find" TAB BLOCK from ClinicPanel (lines 7809-8078, 0-indexed: 7808-8077) ───
const findTabStart = cpLines.indexOf('            {activeTab === "find" && (');
const findTabEnd = cpLines.indexOf('            {activeTab === "referrals" && (');
console.log('Find tab start line:', findTabStart + 1, '| end line:', findTabEnd + 1);

const findTabBlock = cpLines.slice(findTabStart, findTabEnd).join('\r\n');

// ─── 2. EXTRACT HOSPITAL PROFILE MODAL from ClinicPanel (lines 15890+) ───
// Find modal start/end
const profileModalStart = cpLines.indexOf('          {/* Hospital Profile Modal */}');
// End at the next major modal (Referral Type Modal)
const referralTypeModalStart = cpLines.indexOf('          {/* Referral Type Modal */}');
console.log('Profile modal start:', profileModalStart + 1, '| Referral Type modal start:', referralTypeModalStart + 1);

const profileModalBlock = cpLines.slice(profileModalStart, referralTypeModalStart).join('\r\n');

// ─── 3. EXTRACT REFERRAL TYPE MODAL ───
const opdReferralModalStart = cpLines.indexOf('          {/* OPD Referral Modal */}');
const referralTypeModalBlock = cpLines.slice(referralTypeModalStart, opdReferralModalStart).join('\r\n');

// ─── 4. EXTRACT OPD REFERRAL MODAL ───
const ipdReferralModalStart = cpLines.indexOf('          {/* IPD Referral Modal */}');
const opdReferralModalBlock = cpLines.slice(opdReferralModalStart, ipdReferralModalStart).join('\r\n');

// ─── 5. EXTRACT IPD REFERRAL MODAL ───
const referralSuccessModalStart = cpLines.indexOf('          {/* Referral Success Modal */}');
const ipdReferralModalBlock = cpLines.slice(ipdReferralModalStart, referralSuccessModalStart).join('\r\n');

// ─── 6. ADD MISSING STATE VARIABLES to HospitalPanel ───
const stateInsertPoint = '  const [showReferralTypeModal, setShowReferralTypeModal] = useState(false);';
const newStates = `  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedHospitalDoctors, setSelectedHospitalDoctors] = useState<any[]>([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralPatientSearch, setReferralPatientSearch] = useState("");
  const [lastReferralData, setLastReferralData] = useState<any>(null);
  const [showReferralSuccessModal, setShowReferralSuccessModal] = useState(false);
  const [isReferralSubmitting, setIsReferralSubmitting] = useState(false);
  const [referralForm, setReferralForm] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientGender: "M",
    patientAddress: "",
    patientCondition: "Stable",
    department: "",
    doctorId: "",
    doctorName: "",
    diagnosis: "",
    note: "",
    economicalCondition: "",
    applicableScheme: "",
  });
  const [opdForm, setOpdForm] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientGender: "M",
    weight: "",
    bp: "",
    sugar: "",
    temp: "",
    complaint: "",
    patientArea: "",
    diagnosis: "",
  });
  const [opdDoctorSearch, setOpdDoctorSearch] = useState("");
  const [showOpdDoctorDropdown, setShowOpdDoctorDropdown] = useState(false);
  const [opdReferralForm, setOpdReferralForm] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientGender: "M",
    patientAddress: "",
    department: "",
    doctorId: "",
    doctorName: "",
    diagnosis: "",
    note: "",
  });
  const [opdReferralPatientSearch, setOpdReferralPatientSearch] = useState("");
`;

hp = hp.replace(stateInsertPoint, newStates + stateInsertPoint);
console.log('Injected missing states');

// ─── 7. INJECT FIND TAB BLOCK before referrals tab ───
const referralsAnchor = '              {activeTab === "referrals" && (';
hp = hp.replace(referralsAnchor, findTabBlock + '\r\n' + referralsAnchor);
console.log('Injected find tab block');

// ─── 8. INJECT MODALS before closing tags of the panel ───
// Find a good injection point — before the last </> or </div> that closes the return
const modalAnchor = '      {/* ============== MODALS ============== */}';
if (hp.includes(modalAnchor)) {
  hp = hp.replace(
    modalAnchor,
    profileModalBlock + '\r\n' +
    referralTypeModalBlock + '\r\n' +
    opdReferralModalBlock + '\r\n' +
    ipdReferralModalBlock + '\r\n' +
    modalAnchor
  );
  console.log('Injected modals at MODALS marker');
} else {
  // Fallback: inject before the closing </> of the return's root div
  const closingAnchor = '    </div>\r\n  );\r\n}';
  const lastIdx = hp.lastIndexOf(closingAnchor);
  if (lastIdx !== -1) {
    hp = hp.slice(0, lastIdx) +
      profileModalBlock + '\r\n' +
      referralTypeModalBlock + '\r\n' +
      opdReferralModalBlock + '\r\n' +
      ipdReferralModalBlock + '\r\n' +
      hp.slice(lastIdx);
    console.log('Injected modals at closing div (fallback)');
  } else {
    console.log('Could not find modal injection point!');
  }
}

fs.writeFileSync('src/components/panels/HospitalPanel.tsx', hp);
console.log('Done! Final line count:', hp.split('\r\n').length);
