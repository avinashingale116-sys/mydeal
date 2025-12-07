import React from 'react';
import { ProductRequirement, Bid, RequestStatus } from '../types';
import { TagIcon, CheckCircleIcon, TrendingDownIcon, BanknotesIcon } from './Icons';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';

interface SellerDashboardProps {
  sellerName: string;
  requests: ProductRequirement[];
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerName, requests }) => {
  // Logic to find relevant requests
  const myBids = requests.flatMap(r => r.bids.filter(b => b.sellerName === sellerName).map(b => ({ ...b, request: r })));
  
  const activeBids = myBids.filter(b => b.request.status === RequestStatus.OPEN);
  const wonDeals = myBids.filter(b => b.request.status === RequestStatus.CLOSED && b.request.winningBidId === b.id);
  const totalRevenue = wonDeals.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Dealer Dashboard</h1>
        <p className="text-slate-500">Overview of your performance as <span className="font-bold text-emerald-600">{sellerName}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
             <TagIcon className="w-7 h-7" />
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Bids</p>
             <p className="text-3xl font-extrabold text-slate-900">{activeBids.length}</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <CheckCircleIcon className="w-7 h-7" />
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Deals Won</p>
             <p className="text-3xl font-extrabold text-slate-900">{wonDeals.length}</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
             <BanknotesIcon className="w-7 h-7" />
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Revenue</p>
             <p className="text-3xl font-extrabold text-slate-900">${totalRevenue}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Won Deals List */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
               <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> Recent Sales
            </h3>
            <div className="space-y-4">
               {wonDeals.length === 0 ? (
                 <p className="text-slate-400 text-center py-8 italic">No completed deals yet.</p>
               ) : (
                 wonDeals.map(bid => (
                   <div key={bid.id} className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-emerald-900 text-sm line-clamp-1">{bid.request.title}</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          {bid.request.paymentMethod === 'COD' && <BanknotesIcon className="w-3 h-3"/>}
                          Paid via {bid.request.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-emerald-800">${bid.amount}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Sold</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         {/* Active Bids List */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
               <TrendingDownIcon className="w-5 h-5 text-blue-500" /> Active Bids
            </h3>
            <div className="space-y-4">
               {activeBids.length === 0 ? (
                 <p className="text-slate-400 text-center py-8 italic">You haven't placed any bids recently.</p>
               ) : (
                 activeBids.map(bid => {
                    const lowest = Math.min(...bid.request.bids.map(b => b.amount));
                    const isWinning = bid.amount === lowest;
                    return (
                       <div key={bid.id} className={`p-4 rounded-xl border flex justify-between items-center ${isWinning ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'}`}>
                          <div className="flex-1 mr-4">
                            <p className="font-bold text-slate-900 text-sm line-clamp-1">{bid.request.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                               {isWinning ? (
                                 <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Winning</span>
                               ) : (
                                 <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Losing by ${bid.amount - lowest}</span>
                               )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">${bid.amount}</p>
                            <p className="text-xs text-slate-400">Your Bid</p>
                          </div>
                       </div>
                    );
                 })
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
