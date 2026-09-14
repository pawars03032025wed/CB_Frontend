import React, { useState, useMemo } from "react";
import { Users, Filter, Search, Activity, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AudienceManagerProps {
  allPatients: any[];
  selectedPatients: string[];
  setSelectedPatients?: (phones: string[]) => void;
  darkMode: boolean;
  setActiveTab: (tab: string) => void;
}

export default function AudienceManager({ allPatients, selectedPatients, setSelectedPatients, darkMode, setActiveTab }: AudienceManagerProps) {
  const [filters, setFilters] = useState({
    searchQuery: "",
    minAge: "",
    maxAge: "",
    gender: "all",
    area: "",
    bp: "all",
    sugar: "all",
    department: "",
    lastVisitDays: ""
  });

  const filteredPatients = useMemo(() => {
    return allPatients.filter(p => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = (p.name || "").toLowerCase().includes(query);
        const matchesPhone = (p.phone || "").includes(query);
        if (!matchesName && !matchesPhone) return false;
      }
      
      if (filters.minAge && p.age) {
        const age = parseInt(p.age.replace(/\D/g, ""));
        if (!isNaN(age) && age < parseInt(filters.minAge)) return false;
      }
      if (filters.maxAge && p.age) {
        const age = parseInt(p.age.replace(/\D/g, ""));
        if (!isNaN(age) && age > parseInt(filters.maxAge)) return false;
      }

      if (filters.gender !== "all" && p.gender) {
        if (p.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
      }

      if (filters.area && p.area) {
        if (!p.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      }

      return true;
    });
  }, [allPatients, filters]);

  const handleSelectAll = () => {
    if (setSelectedPatients) {
      if (selectedPatients.length === filteredPatients.length) {
        setSelectedPatients([]);
      } else {
        setSelectedPatients(filteredPatients.map(p => p.phone).filter(Boolean));
      }
    }
  };

  const togglePatientSelection = (phone: string) => {
    if (!setSelectedPatients) return;
    if (selectedPatients.includes(phone)) {
      setSelectedPatients(selectedPatients.filter(p => p !== phone));
    } else {
      setSelectedPatients([...selectedPatients, phone]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Filter className="text-teal-600" /> Audience Filter Builder
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Search Name/Phone</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({...prev, searchQuery: e.target.value}))}
                placeholder="Search..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl border outline-none ${darkMode ? "bg-slate-900 border-slate-700 focus:border-teal-500" : "bg-slate-50 border-slate-200 focus:border-teal-500"}`}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Age Range</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.minAge}
                onChange={(e) => setFilters(prev => ({...prev, minAge: e.target.value}))}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.maxAge}
                onChange={(e) => setFilters(prev => ({...prev, maxAge: e.target.value}))}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Gender</label>
            <select 
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({...prev, gender: e.target.value}))}
              className={`w-full px-4 py-2 rounded-xl border outline-none ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
            >
              <option value="all">All Genders</option>
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Address/Area</label>
            <input 
              type="text" 
              placeholder="E.g. Pune"
              value={filters.area}
              onChange={(e) => setFilters(prev => ({...prev, area: e.target.value}))}
              className={`w-full px-4 py-2 rounded-xl border outline-none ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Activity className="text-teal-600" size={20} />
            <span className="font-bold">{filteredPatients.length} Patients found</span>
          </div>
          <button 
            onClick={() => setFilters({
              minAge: "", maxAge: "", gender: "all", lastVisitDays: "", area: "", bp: "all", sugar: "all", department: "", searchQuery: ""
            })}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"}`}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Patient Audience List</h3>
          <div className="flex gap-4">
            <button 
              onClick={handleSelectAll}
              className={`px-4 py-2 text-sm font-bold rounded-xl border transition-colors ${
                selectedPatients.length === filteredPatients.length && filteredPatients.length > 0
                  ? "bg-teal-600 text-white border-teal-600 shadow-md"
                  : darkMode ? "border-slate-600 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              Select All ({filteredPatients.length})
            </button>
            <button 
              onClick={() => setActiveTab("campaign")}
              disabled={selectedPatients.length === 0}
              className={`px-6 py-2 text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all ${
                selectedPatients.length > 0 
                  ? "bg-teal-600 hover:bg-teal-700 text-white" 
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              Add to Campaign <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"} text-xs uppercase tracking-wider text-slate-500`}>
                <th className="p-4 w-10"></th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Age/Gender</th>
                <th className="p-4">Area</th>
                <th className="p-4">Permission</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-500">
                    No patients found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPatients.slice(0, 50).map((patient, idx) => (
                  <tr key={idx} className={`border-b last:border-0 transition-colors ${darkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50"}`}>
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={patient.phone ? selectedPatients.includes(patient.phone) : false}
                        onChange={() => patient.phone && togglePatientSelection(patient.phone)}
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                      />
                    </td>
                    <td className="p-4 font-bold">{patient.name}</td>
                    <td className="p-4 text-sm font-mono text-slate-500">{patient.phone}</td>
                    <td className="p-4 text-sm">{patient.age} {patient.gender}</td>
                    <td className="p-4 text-sm text-slate-500">{patient.area || "N/A"}</td>
                    <td className="p-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md w-fit font-semibold text-xs">
                        <CheckCircle size={12} /> Opted-in
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}
