import React, { useState } from 'react';
import { X, QrCode, CreditCard, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentModalProps {
  user: any;
  accountType: 'clinic' | 'hospital';
  darkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ user, accountType, darkMode, onClose, onSuccess }: PaymentModalProps) {
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const navigate = useNavigate();

  const prices = {
    clinic: { monthly: 329, yearly: 3399 },
    hospital: { monthly: 3299, yearly: 33399 }
  };

  const amount = prices[accountType][selectedCycle];
  const planType = accountType.toUpperCase();

  const handlePayment = async () => {
    setProcessing(true);
    
    // Fake processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transactionId = "TXN_" + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          accountType,
          planType,
          billingCycle: selectedCycle,
          amount,
          paymentMethod: 'UPI',
          transactionId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setPaymentDetails({
          ...data,
          amount,
          transactionId
        });
        setPaymentSuccess(true);
      } else {
        alert(data.message || 'Payment Failed');
        setProcessing(false);
      }
    } catch (error) {
      console.error(error);
      alert('Network Error during payment');
      setProcessing(false);
    }
  };

  const handleContinue = () => {
    onSuccess();
    if (accountType === 'clinic') {
      navigate('/clinic-dashboard');
    } else {
      navigate('/hospital-dashboard');
    }
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl relative ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-black mb-2 text-green-600 dark:text-green-400">PAYMENT SUCCESSFUL</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Your subscription is now active.</p>

            <div className={`text-left rounded-xl p-4 mb-8 space-y-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Amount Paid</span>
                 <span className="font-bold">₹{paymentDetails?.amount}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Transaction ID</span>
                 <span className="font-bold">{paymentDetails?.transactionId}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Payment ID</span>
                 <span className="font-bold">{paymentDetails?.paymentId}</span>
               </div>
            </div>

            <button 
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-95"
            >
              CONTINUE TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-500 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Plan Info */}
        <div className={`p-8 md:w-1/2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
           <h2 className="text-2xl font-black mb-1">Select Plan</h2>
           <p className="text-sm text-slate-500 mb-6">Choose a billing cycle for {accountType === 'clinic' ? 'Clinic' : 'Hospital'} Premium</p>

           <div className="space-y-4">
             <div 
               onClick={() => setSelectedCycle('monthly')}
               className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedCycle === 'monthly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-white dark:bg-slate-700 hover:border-blue-200'}`}
             >
               <div className="flex justify-between items-center mb-1">
                 <div className="font-bold">Monthly</div>
                 <div className="font-black text-xl">₹{prices[accountType].monthly}</div>
               </div>
               <div className="text-xs text-slate-500">Billed every month</div>
             </div>

             <div 
               onClick={() => setSelectedCycle('yearly')}
               className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedCycle === 'yearly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-white dark:bg-slate-700 hover:border-blue-200'}`}
             >
               <div className="flex justify-between items-center mb-1">
                 <div className="font-bold flex items-center gap-2">
                   Yearly 
                   <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">SAVE ~15%</span>
                 </div>
                 <div className="font-black text-xl">₹{prices[accountType].yearly}</div>
               </div>
               <div className="text-xs text-slate-500">Billed annually</div>
             </div>
           </div>
        </div>

        {/* Right Side: Payment */}
        <div className="p-8 md:w-1/2 flex flex-col justify-between relative">
          
          {processing && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
               <div className="font-bold text-lg">Processing Payment...</div>
               <div className="text-sm text-slate-500 mt-2 text-center px-6">Please do not close this window or press back.</div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure Payment
            </h3>

            <div className="flex flex-col items-center justify-center py-6 mb-4 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-700">
               <QrCode className="w-32 h-32 text-slate-300 dark:text-slate-600 mb-4" />
               <div className="text-sm font-bold text-slate-500">SCAN & PAY WITH UPI</div>
               <div className="text-xs text-slate-400 mt-1">Google Pay, PhonePe, Paytm accepted</div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
              <CreditCard className="w-4 h-4" /> Cards, Netbanking, & Wallets also supported
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            PAY ₹{amount} NOW
          </button>
        </div>

      </div>
    </div>
  );
}
