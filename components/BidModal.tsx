import React, { useState } from 'react';
import { ProductRequirement, BidSuggestion } from '../types';
import { TagIcon, ClockIcon, SparklesIcon, StoreIcon } from './Icons';
import { getBidSuggestion } from '../services/geminiService';

interface BidModalProps {
  request: ProductRequirement;
  sellerName: string;
  onClose: () => void;
  onSubmit: (amount: number, days: number, notes: string) => void;
}

const BidModal: React.FC<BidModalProps> = ({ request, sellerName, onClose, onSubmit }) => {
  const [amount, setAmount] = useState<number | string>('');
  const [days, setDays] = useState<number | string>(3);
  const [notes, setNotes] = useState('');
  
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<BidSuggestion | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > 0 && Number(days) > 0) {
      onSubmit(Number(amount), Number(days), notes);
    }
  };

  const handleGetSuggestion = async () => {
    setIsGettingSuggestion(true);
    const currentBidAmounts = request.bids.map(b => b.amount);
    const result = await getBidSuggestion(request.title, request.estimatedMarketPrice, currentBidAmounts);
    if (result) {
      setSuggestion(result);
    }
    setIsGettingSuggestion(false);
  };

  const applySuggestion = () => {
    if (suggestion) {
      setAmount(suggestion.suggestedPrice);
    }
  };

  const bestBid = request.bids.length > 0 ? Math.min(...request.bids.map(b => b.amount)) : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-red-900 text-white p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="font-bold text-xl leading-tight opacity-90">Place a Bid</h3>
              <p className="text-rose-200 text-sm mt-1 line-clamp-1">{request.title}</p>
            </div>
            <button onClick={onClose} className="text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="bg-rose-50 p-4 rounded-2xl text-sm border border-rose-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-rose-500 uppercase font-bold tracking-wide">Client Budget</p>
              <p className="font-bold text-slate-900 text-lg">${request.estimatedMarketPrice.max}</p>
            </div>
            <div className="text-right border-l border-rose-200 pl-4">
              <p className="text-xs text-rose-500 uppercase font-bold tracking-wide">Current Lowest</p>
              <p className={`font-bold text-lg ${bestBid ? 'text-green-600' : 'text-slate-400'}`}>
                {bestBid ? `$${bestBid}` : 'None'}
              </p>
            </div>
          </div>

          {/* AI Suggestion Box */}
          {suggestion && (
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-indigo-900 text-sm">AI Price Strategy</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${suggestion.winProbability === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {suggestion.winProbability} Chance
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 mt-1 leading-relaxed">{suggestion.reasoning}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-indigo-900 text-lg">${suggestion.suggestedPrice}</span>
                    <button 
                      type="button"
                      onClick={applySuggestion}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                    >
                      Apply Price
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Bidding As (You)</label>
            <div className="relative flex items-center">
              <div className="w-full pl-3 p-3 border-2 border-emerald-100 bg-emerald-50 rounded-xl font-bold text-emerald-800 flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-emerald-600" />
                {sellerName}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pl-1">*To change identity, switch vendors in the main dashboard.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                {!suggestion && (
                  <button 
                    type="button"
                    onClick={handleGetSuggestion}
                    disabled={isGettingSuggestion}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    {isGettingSuggestion ? <span className="animate-spin">⌛</span> : <SparklesIcon className="w-3 h-3" />}
                    Get Suggestion
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none font-bold text-lg text-slate-900 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Delivery (Days)</label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  required
                  min="1"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full pl-9 p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none font-bold text-lg text-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Notes / Offer Details</label>
            <textarea
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none h-28 resize-none text-slate-700 transition-all"
              placeholder="e.g. Brand new unit, includes 2 year warranty and free shipping..."
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl font-bold shadow-xl shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <TagIcon className="w-5 h-5" />
              Submit Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal;