const fs = require('fs');
const content = fs.readFileSync('src/components/panels/ClinicPanel.tsx', 'utf8');

function extractBlock(startMarker, endMarker) {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return '';
    const slice = content.slice(startIndex);
    const endIndex = slice.indexOf(endMarker);
    return slice.substring(0, endIndex);
}

let out = '';
out += extractBlock('const filteredHospitals = useMemo(() => {', 'const fetchOnDemandDataRef');
out += extractBlock('  // Hospital Profile Modal\n', '  // End of Modals\n'); // Hopefully there is a marker or just search for specific modals

fs.writeFileSync('extracted_funcs.txt', out);
