import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'warning'
}: ConfirmationModalProps) {
  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-200',
    warning: 'bg-orange-500 hover:bg-orange-600 shadow-orange-200',
    info: 'bg-[#005f73] hover:bg-[#005f73]/90 shadow-[#005f73]/20'
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-50',
    warning: 'text-orange-500 bg-orange-50',
    info: 'text-[#005f73] bg-[#005f73]/10'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="confirmation-modal-wrapper" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${iconColors[type]}`}>
                  <AlertTriangle size={24} />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                {message}
              </p>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all ${colors[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
