import React from 'react';
import { ProductRequirement, RequestStatus } from '../types';
import { TagIcon, CheckCircleIcon, TrendingDownIcon, BanknotesIcon, StoreIcon, ClockIcon, XMarkIcon } from './Icons';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, Tooltip } from 'recharts';

interface SellerDashboardProps {
  sellerName: string;
  sellerCity: string;
  requests: ProductRequirement[];
  onBidClick: (request: ProductRequirement) => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerName, sellerCity, requests, onBidClick }) => {
  // Logic to find relevant requests
  
  // 1. Requests relevant to me (I have bid on them)
  const myBids = requests.flatMap(r => r.bids.filter(b => b.sellerName === sellerName).map(b => ({ ...b, request: r })));
  
  const activeBids = myBids.filter(b => b.request.status === RequestStatus.OPEN);
  const wonDeals = myBids.filter(b => b.request.status === RequestStatus.CLOSED && b.request.winningBidId === b.id);
  const lostDeals = myBids.filter(b => b.request.status === RequestStatus.CLOSED && b.request.winningBidId && b.request.winningBidId !== b.id);
  
  const totalRevenue = wonDeals.reduce((sum, b) => sum + b.amount, 0);

  // 2. New Opportunities (Open requests in my city where I haven't bid yet)
  const newOpportunities = requests.filter(r => 
    r.status === RequestStatus.OPEN && 
    (r.location === sellerCity) && // Match location
    !r.bids.some(b => b.sellerName === sellerName) // I haven't bid yet
  );

  // Prepare data for the chart
  const chartData = [
    { name: 'Active Bids', value: activeBids.length, color: '#3b82f6' }, // blue-500
    { name: 'Won Deals', value: wonDeals.length, color: '#10b981' },   // emerald-500
    { name: 'Lost Deals', value: lostDeals.length, color: '#ef4444' }  // red-500
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
          <p className="font-bold text-slate-900 text-sm">{label}</p>
          <p className="text-emerald-600 font-bold text-sm">
            {payload[0].value} {payload[0].value === 1 ? 'Item' : 'Items'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Dealer Dashboard</h1>
          <p className="text-slate-500">
            Overview of your performance as <span className="font-bold text-emerald-600">{sellerName}</span> in <span className="font-bold text-slate-700">{sellerCity}</span>
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Verified Seller Account</span>
            <CheckCircleIcon className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
               <TagIcon className="w-5 h-5" />
             </div>
             <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Live</span>
           </div>
           <div>
             <p className="text-3xl font-extrabold text-slate-900">{activeBids.length}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Active Bids</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <CheckCircleIcon className="w-5 h-5" />
             </div>
             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
           </div>
           <div>
             <p className="text-3xl font-extrabold text-slate-900">{wonDeals.length}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Deals Won</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
               <BanknotesIcon className="w-5 h-5" />
             </div>
           </div>
           <div>
             <p className="text-3xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Total Revenue</p>
           </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-32 relative overflow-hidden">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 absolute top-4 left-4 z-10">Bid Performance</p>
            <div className="absolute inset-0 top-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* SECTION: NEW OPPORTUNITIES (Active Buyer Offers) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              New Market Opportunities <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-bold">{newOpportunities.length}</span>
            </h3>
            <p className="text-sm font-bold text-slate-400 hidden sm:block">Active Buyer Requests in {sellerCity}</p>
        </div>

        {newOpportunities.length === 0 ? (
           <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-slate-300" />
               </div>
               <h4 className="text-lg font-bold text-slate-900">No new requests</h4>
               <p className="text-slate-500">Great job! You've bid on all active requests in your area.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newOpportunities.map(req => {
                const lowestBid = req.bids.length > 0 ? Math.min(...req.bids.map(b => b.amount)) : null;

                return (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100 overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                   <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                         <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                           {req.category}
                         </span>
                         <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ClockIcon className="w-3 h-3" />
                            <span>Active</span>
                         </div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 leading-tight h-14">{req.title}</h4>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {Object.entries(req.specs).slice(0, 2).map(([k, v]) => (
                            <span key={k} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-semibold text-slate-500 truncate max-w-[100px]">
                            {String(v)}
                            </span>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Max Budget</p>
                            <p className="text-lg font-black text-slate-900">₹{req.estimatedMarketPrice.max.toLocaleString('en-IN')}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Best Bid</p>
                             {lowestBid ? (
                                <p className="text-lg font-black text-emerald-600">₹{lowestBid.toLocaleString('en-IN')}</p>
                             ) : (
                                <p className="text-sm font-bold text-slate-400 italic mt-1">No bids yet</p>
                             )}
                         </div>
                      </div>
                      
                      {/* Recent Bids Visualization */}
                      {req.bids.length > 0 && (
                        <div className="mt-3 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Recent Competitor Bids</p>
                                <span className="text-[10px] font-bold text-slate-400">{req.bids.length} Total</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {req.bids.sort((a,b) => a.amount - b.amount).slice(0, 3).map(b => (
                                    <span key={b.id} className="text-[11px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                        ₹{b.amount.toLocaleString('en-IN')}
                                    </span>
                                ))}
                            </div>
                        </div>
                      )}

                   </div>
                   <button 
                      onClick={() => onBidClick(req)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 text-sm flex items-center justify-center gap-2 transition-colors border-t border-slate-800"
                   >
                      <BanknotesIcon className="w-4 h-4" /> Place Competitive Bid
                   </button>
                </div>
              );
             })}
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Won Deals List */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> Recent Sales
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{wonDeals.length} Completed</span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
               {wonDeals.length === 0 ? (
                 <div className="text-center py-10">
                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300">
                         <BanknotesIcon className="w-6 h-6" />
                     </div>
                     <p className="text-slate-400 text-sm italic">No completed deals yet.</p>
                 </div>
               ) : (
                 wonDeals.map(bid => (
                   <div key={bid.id} className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between items-center group hover:shadow-sm transition-all">
                      <div>
                        <p className="font-bold text-emerald-900 text-sm line-clamp-1">{bid.request.title}</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          {bid.request.paymentMethod === 'COD' && <BanknotesIcon className="w-3 h-3"/>}
                          Paid via {bid.request.paymentMethod || 'COD'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-emerald-800">₹{bid.amount.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Sold</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         {/* Active Bids List */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <TrendingDownIcon className="w-5 h-5 text-blue-500" /> Active Bids
                </h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{activeBids.length} Pending</span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
               {activeBids.length === 0 ? (
                 <div className="text-center py-10">
                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300">
                         <ClockIcon className="w-6 h-6" />
                     </div>
                     <p className="text-slate-400 text-sm italic">No active bids.</p>
                 </div>
               ) : (
                 activeBids.map(bid => {
                   // Check if I am the lowest bidder
                   const lowest = Math.min(...bid.request.bids.map(b => b.amount));
                   const isLowest = bid.amount === lowest;
                   
                   return (
                    <div key={bid.id} className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-3 group hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start">
                            <div className="max-w-[70%]">
                                <p className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{bid.request.title}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-extrabold text-slate-800">₹{bid.amount.toLocaleString('en-IN')}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">My Bid</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                             <div className="flex items-center gap-2">
                                {isLowest ? (
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                        <CheckCircleIcon className="w-3 h-3"/> You are Lowest
                                    </span>
                                ) : (
                                    <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                        <TrendingDownIcon className="w-3 h-3"/> Outbid by ₹{(bid.amount - lowest).toLocaleString()}
                                    </span>
                                )}
                             </div>
                             {!isLowest && (
                                 <div className="text-right">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">Current Low</p>
                                     <p className="text-xs font-bold text-emerald-600">₹{lowest.toLocaleString()}</p>
                                 </div>
                             )}
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