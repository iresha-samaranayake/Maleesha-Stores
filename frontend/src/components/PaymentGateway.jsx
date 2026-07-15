import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { CreditCard, ShieldCheck, Lock, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const order = location.state?.order;

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Visual states
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: Idle, 1: Connecting, 2: Verifying, 3: Authorizing, 4: Success
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!order) {
      showToast('No active checkout session found', 'error');
      navigate('/customer/cart');
    }
  }, [order, navigate, showToast]);

  if (!order) return null;

  // Card detection helper
  const getCardType = (num) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'generic';
  };

  const cardType = getCardType(cardNumber);

  // Formatting helpers
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Split into chunks of 4
    const matches = value.match(/.{1,4}/g);
    setCardNumber(matches ? matches.join(' ') : value);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      showToast('Please enter a valid 16-digit card number', 'error');
      return;
    }
    if (expiry.length !== 5) {
      showToast('Please enter a valid expiry date (MM/YY)', 'error');
      return;
    }
    if (cvv.length !== 3) {
      showToast('Please enter a valid 3-digit CVV code', 'error');
      return;
    }
    if (!cardName.trim()) {
      showToast('Please enter the cardholder\'s name', 'error');
      return;
    }

    setIsProcessing(true);
    
    // Simulate secure authorization pipeline
    try {
      setPaymentStep(1); // Connecting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentStep(2); // Verifying
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentStep(3); // Authorizing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call backend to update order payment status to Paid
      const { data } = await axios.put(`/api/orders/${order._id}/pay`);
      
      setPaymentStep(4); // Success
      await new Promise(resolve => setTimeout(resolve, 1500));

      showToast('Online payment authorized successfully!', 'success');
      
      // Redirect back to checkout screen with success state
      navigate('/customer/checkout', { state: { orderSuccess: data } });
    } catch (err) {
      console.error('Payment authorization failed:', err);
      showToast('Card declined or transaction authorization failed. Try again', 'error');
      setIsProcessing(false);
      setPaymentStep(0);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans bg-slate-50 relative overflow-hidden">
      
      {/* Background blobs for rich aesthetics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -z-10" />

      <div className="max-w-lg w-full bg-white border border-slate-100 rounded-[36px] shadow-2xl p-6 md:p-8 space-y-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <button
            onClick={() => navigate('/customer/checkout')}
            disabled={isProcessing}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel Payment
          </button>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure 256-bit SSL
          </div>
        </div>

        {/* Pricing Summary Widget */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center text-xs">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Order Reference</p>
            <p className="text-slate-800 font-extrabold font-mono mt-0.5 uppercase">{order._id.slice(-6)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Amount Payable</p>
            <p className="text-emerald-800 font-black text-base mt-0.5">Rs. {order.totalPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* ── Interactive 3D CSS Credit Card ── */}
        <div className="perspective-1000 w-full aspect-[1.586/1] max-w-sm mx-auto relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`w-full h-full duration-700 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front of Card */}
            <div className={`absolute inset-0 w-full h-full rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg select-none backface-hidden ${
              cardType === 'visa' 
                ? 'bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-800/40' 
                : cardType === 'mastercard'
                  ? 'bg-gradient-to-br from-amber-900 to-stone-900 border border-amber-900/40'
                  : cardType === 'amex'
                    ? 'bg-gradient-to-br from-teal-800 to-slate-900 border border-teal-800/40'
                    : 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-650/40'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="w-10 h-7 bg-amber-400/20 rounded-md border border-amber-400/30 flex items-center justify-center shrink-0">
                    <div className="w-6 h-4 bg-yellow-500/40 rounded-sm" />
                  </div>
                </div>
                <div className="text-right h-8 flex items-center">
                  {cardType === 'visa' && <span className="text-xl font-black italic tracking-wide">VISA</span>}
                  {cardType === 'mastercard' && <span className="text-xl font-black italic tracking-wide">Mastercard</span>}
                  {cardType === 'amex' && <span className="text-xl font-black italic tracking-wide">AMEX</span>}
                  {cardType === 'generic' && <span className="text-sm font-extrabold uppercase tracking-widest text-white/50">CARD</span>}
                </div>
              </div>

              <div className="space-y-4">
                {/* Number */}
                <div className="text-lg md:text-xl font-mono tracking-[0.18em] text-center text-white/90">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                {/* Info details */}
                <div className="flex justify-between items-end text-xs">
                  <div className="space-y-0.5 truncate max-w-[200px]">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-wider block">Cardholder Name</span>
                    <span className="font-bold tracking-wide truncate block">{cardName.toUpperCase() || 'YOUR FULL NAME'}</span>
                  </div>
                  <div className="space-y-0.5 shrink-0 text-right">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-wider block">Expires</span>
                    <span className="font-mono font-bold tracking-wide block">{expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-750/30 shadow-lg text-white flex flex-col justify-between py-6 select-none backface-hidden rotate-y-180">
              <div className="w-full h-10 bg-slate-900/90" />
              <div className="px-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-8 bg-white/10 rounded flex items-center justify-end px-3">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mr-2 select-none">Signature</span>
                    <div className="w-full h-0.5 bg-white/20" />
                  </div>
                  <div className="w-14 h-8 bg-amber-400 text-slate-900 font-mono font-black text-sm flex items-center justify-center rounded shadow-inner">
                    {cvv || '•••'}
                  </div>
                </div>
                <p className="text-[8px] text-white/30 text-center leading-relaxed">
                  This card is processed secure and mockup verified. Antigravity checkout framework enabled.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Processing State Modal Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white rounded-[36px] z-50 flex flex-col items-center justify-center p-6 space-y-6"
            >
              {paymentStep < 4 ? (
                <>
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                    <Lock className="w-6 h-6 text-emerald-700 absolute" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-black text-slate-800 animate-pulse">Processing Order Payment...</h3>
                    
                    <div className="text-xs text-slate-400 font-semibold space-y-1 mt-2">
                      <p className={paymentStep >= 1 ? "text-emerald-600 transition" : ""}>
                        {paymentStep >= 1 ? "✓ Connected to secure payment gateway" : "Connecting..."}
                      </p>
                      <p className={paymentStep >= 2 ? "text-emerald-600 transition" : ""}>
                        {paymentStep >= 2 ? "✓ Card validation successful" : "Validating card details..."}
                      </p>
                      <p className={paymentStep >= 3 ? "text-emerald-600 transition" : ""}>
                        {paymentStep >= 3 ? "✓ Requesting bank authorization..." : "Authorizing transaction..."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Transaction Authorized!</h3>
                  <p className="text-xs text-slate-400">Finalizing order placement metadata...</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Form */}
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cardholder Name</label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g. JOHN DOE"
              onFocus={() => setIsFlipped(false)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold tracking-wide"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Number</label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4000 1234 5678 9010"
              onFocus={() => setIsFlipped(false)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiration Date</label>
              <input
                type="text"
                required
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                onFocus={() => setIsFlipped(false)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CVV Code</label>
              <input
                type="password"
                required
                value={cvv}
                onChange={handleCvvChange}
                placeholder="•••"
                onFocus={() => setIsFlipped(true)}
                onBlur={() => setIsFlipped(false)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest font-bold text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-600/10 transition-all cursor-pointer mt-6"
          >
            Pay Rs. {order.totalPrice.toLocaleString()}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold select-none">
          <Lock className="w-3.5 h-3.5 text-slate-350" />
          Payments are fully mock encrypted and not saved.
        </div>

      </div>
      
      {/* Visual styles for perspective card flipping */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
