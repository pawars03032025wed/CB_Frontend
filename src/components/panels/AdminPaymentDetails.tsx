import React, { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, Loader2, Calendar, Mail, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminPaymentDetails({ darkMode }: { darkMode: boolean }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentTab, setPaymentTab] = useState<'CLINIC' | 'HOSPITAL' | 'PATIENT'>('CLINIC');

  // Fetch Payments from Backend API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/admin/payments');
        const data = await res.json();
        if (data.success) {
          setPayments(data.data);
        }
      } catch (err) {
        console.error("Error fetching admin payments:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
    // Refresh every 30 seconds to simulate real-time
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredPayments = payments.filter(p => p.accountType?.toUpperCase() === paymentTab);

  return (
    <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className="flex items-center gap-3 mb-6 border-b pb-4 border-slate-200 dark:border-slate-800">
        <CreditCard className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-black">Payment Details</h2>
          <p className="text-sm text-slate-500">Real-time subscription and payment logs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {['CLINIC', 'HOSPITAL', 'PATIENT'].map(tab => (
          <button
            key={tab}
            onClick={() => setPaymentTab(tab as any)}
            className={`px-4 py-2 font-bold rounded-xl transition-all ${
              paymentTab === tab
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab} PAYMENTS
          </button>
        ))}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
          <p className="font-bold">Loading payment records...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <FileText className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-bold text-lg">No {paymentTab.toLowerCase()} payment records available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Date & Time</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Account</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Plan Details</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Amount</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Txn / Payment ID</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Email Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredPayments.map((p, i) => (
                <tr key={p.id || i} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800`}>
                  <td className="p-4">
                    <div className="font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(p.paidAt || p.paid_at).toLocaleDateString('en-IN')}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(p.paidAt || p.paid_at).toLocaleTimeString('en-IN')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{p.user_name || `User #${p.userId || p.user_id}`}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">{p.accountType || p.account_type}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{p.planType || p.plan_type}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">{p.billingCycle || p.billing_cycle}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {p.amount}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    <div className="text-slate-600 dark:text-slate-300">TXN: {p.transactionId || p.transaction_id}</div>
                    <div className="text-slate-500">PAY: {p.paymentId || p.payment_id}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{p.paymentMethod || p.payment_method}</div>
                  </td>
                  <td className="p-4">
                    {p.emailStatus === 'SENT' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
                        <Mail className="w-3 h-3" /> SENT
                      </span>
                    ) : p.emailStatus === 'FAILED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold uppercase">
                        <XCircle className="w-3 h-3" /> FAILED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
