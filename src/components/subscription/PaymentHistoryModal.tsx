import React, { useState, useEffect } from 'react';
import { X, Clock, ExternalLink, Loader2 } from 'lucide-react';

interface PaymentHistoryModalProps {
  user: any;
  darkMode: boolean;
  onClose: () => void;
}

export default function PaymentHistoryModal({ user, darkMode, onClose }: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/user/payments/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPayments(data.data);
        }
      })
      .catch(err => console.error("Error fetching payments:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col h-[80vh] ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black">Payment History</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Clock className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-bold">No payments found</p>
              <p className="text-sm">You haven't made any premium payments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, i) => (
                <div key={payment.id || i} className={`p-4 rounded-xl border ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-lg mb-1 flex items-center gap-2">
                        ₹{payment.amount}
                        <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{payment.payment_status}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(payment.paid_at).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold uppercase tracking-wider">{payment.plan_type} • {payment.billing_cycle}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-1">
                        {payment.payment_method} <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-500 mb-0.5">Transaction ID</div>
                      <div className="font-mono">{payment.transaction_id}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-0.5">Payment ID</div>
                      <div className="font-mono">{payment.payment_id}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
