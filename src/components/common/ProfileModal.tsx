import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, Award, Clock, FileText, User } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  role: 'hospital' | 'clinic';
  isDarkMode: boolean;
}

export default function ProfileModal({ isOpen, onClose, profileData, role, isDarkMode }: ProfileModalProps) {
  if (!profileData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="profile-modal-wrapper" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
          >
            {/* Header */}
            <div className={`p-6 flex justify-between items-center bg-gradient-to-r ${role === 'hospital' ? 'from-blue-600 to-indigo-600' : 'from-emerald-500 to-teal-500'}`}>
              <div className="flex items-center gap-4 text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 text-2xl font-black uppercase">
                  {profileData.name ? profileData.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-black">{profileData.name || 'Unknown Name'}</h2>
                  <p className="text-xs font-bold opacity-80 capitalize mt-0.5">{role} Profile</p>
                  {profileData.city && (
                    <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {profileData.city}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/25 rounded-xl transition-colors text-white">
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className={`p-6 max-h-[65vh] overflow-y-auto space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Contact Information */}
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                  <h3 className={`text-[10px] font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className={`mt-0.5 shrink-0 ${role === 'hospital' ? 'text-blue-500' : 'text-emerald-500'}`} size={15} />
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
                        <p className="font-bold text-sm mt-0.5">{profileData.helpline || profileData.clinic_contact || profileData.hospital_helpline || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className={`mt-0.5 shrink-0 ${role === 'hospital' ? 'text-blue-500' : 'text-emerald-500'}`} size={15} />
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email / System ID</p>
                        <p className="font-bold text-xs mt-0.5 break-all">{profileData.email || `${role === 'hospital' ? 'hosp' : 'clin'}-${profileData.id}@carebridge.com`}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                  <h3 className={`text-[10px] font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-red-500 mt-0.5 shrink-0" size={15} />
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>City</p>
                        <p className="font-bold text-sm mt-0.5">{profileData.city || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className={`mt-0.5 shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={15} />
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Full Address</p>
                        <p className="font-bold text-sm leading-relaxed mt-0.5">{profileData.address || profileData.clinic_address || profileData.hospital_address || 'Address not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className={`p-5 rounded-2xl border md:col-span-2 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                  <h3 className={`text-[10px] font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Professional Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {role === 'clinic' && (
                      <>
                        <div>
                          <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Doctor Name</p>
                          <p className="font-bold text-sm flex items-center gap-1 mt-1">
                            <User size={13} className="text-emerald-500 shrink-0" />
                            {profileData.doctor_name || `Dr. ${String(profileData.name || '').split(" ")[0]}` || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Qualification</p>
                          <p className="font-bold text-sm flex items-center gap-1 mt-1">
                            <Award size={13} className="text-amber-500 shrink-0" />
                            {profileData.degree || profileData.qualification || 'N/A'}
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Status</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${profileData.status === 'active' ? 'bg-green-100 text-green-700' : profileData.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {profileData.status || 'Unknown'}
                      </span>
                    </div>

                    {role === 'hospital' && profileData.tier && (
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Ranking Tier</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${profileData.tier === 'premium' ? 'bg-amber-100 text-amber-700' : profileData.tier === 'priority' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {profileData.tier}
                        </span>
                      </div>
                    )}

                    {role === 'clinic' && (
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Rating</p>
                        <p className="font-bold text-sm mt-1 text-amber-500">
                          {profileData.rating || 5} ⭐
                        </p>
                      </div>
                    )}

                    <div>
                      <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Registered On</p>
                      <p className="font-bold text-xs flex items-center gap-1 mt-1">
                        <Clock size={12} className={`shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        {profileData.createdAt
                          ? new Date(profileData.createdAt?.seconds ? profileData.createdAt.seconds * 1000 : profileData.createdAt).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'border-white/10 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
              <button
                onClick={onClose}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'}`}
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
