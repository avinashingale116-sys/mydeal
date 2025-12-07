import React, { useState } from 'react';
import { Bid, ProductRequirement } from '../types';
import { BanknotesIcon, CreditCardIcon, CheckCircleIcon, XMarkIcon } from './Icons';

interface PaymentModalProps {
  request: ProductRequirement;
  bid: Bid;
  onClose: () => void;
  onConfirm: (method: 'COD' | 'ONLINE') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ request, bid, onClose, onConfirm }) => {
  const [method, setMethod] = useState<'COD' | 'ONLINE'>('COD');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 text-white p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Confirm Order</h2>
          <p className="text-slate-400 text-sm mt-1">Completing deal for {request.title}</p>
        </div>

        <div className="p-6">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6 flex justify-between items-center">
             <div>
               <p className="text-xs font-bold text-emerald-600 uppercase">Total Amount</p>
               <p className="text-2xl font-extrabold text-emerald-800">${bid.amount}</p>
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 uppercase">Seller</p>
                <p className="font-bold text-emerald-800">{bid.sellerName}</p>
             </div>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Select Payment Method</p>
          <div className="space-y-3 mb-8">
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'COD' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}>
              <input 
                type="radio" 
                name="payment" 
                value="COD" 
                checked={method === 'COD'} 
                onChange={() => setMethod('COD')}
                className="hidden"
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'COD' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                <BanknotesIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`font-bold ${method === 'COD' ? 'text-emerald-900' : 'text-slate-900'}`}>Cash on Delivery</p>
                <p className="text-xs text-slate-500">Pay directly to dealer upon receipt</p>
              </div>
              {method === 'COD' && <CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
            </label>
            
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all opacity-60`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-400`}>
                <CreditCardIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">Online Payment</p>
                <p className="text-xs text-slate-500">Coming soon</p>
              </div>
            </label>
          </div>

          <button 
             onClick={() => onConfirm(method)}
             className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
             <CheckCircleIcon className="w-5 h-5" />
             Confirm & Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
