import React from 'react';
import { ProductRequirement, Bid, RequestStatus } from '../types';
import { TagIcon, CheckCircleIcon, TrendingDownIcon, BanknotesIcon, StoreIcon } from './Icons';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SellerDashboardProps {
  sellerName: string;
  requests: ProductRequirement[];
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerName, requests }) => {
  // Logic to find relevant requests
  const myBids = requests.flatMap(r => r.bids.filter(b => b.sellerName === sellerName).map(b => ({ ...b, request: r })));
  
  const activeBids = myBids.filter(b => b.request.status === RequestStatus.OPEN);
  const wonDeals = myBids.filter(b => b.request.status === RequestStatus.CLOSED && b.request.winningBidId === b.id);
  const lostDeals = myBids.filter(b => b.request.status === RequestStatus.CLOSED && b.request.winningBidId && b.request.winningBidId !== b.id);
  
  const totalRevenue = wonDeals.reduce((sum, b) => sum + b.amount, 0);

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
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Dealer Dashboard</h1>
          <p className="text-slate-500">Overview of your performance as <span className="font-bold text-emerald-600">{sellerName}</span></p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Verified Seller Account</span>
            <CheckCircleIcon className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
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
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{activeBids.length} Live</span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
               {activeBids.length === 0 ? (
                 <div className="text-center py-10">
                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300">
                         <TagIcon className="w-6 h-6" />
                     </div>
                     <p className="text-slate-400 text-sm italic">You haven't placed any bids recently.</p>
                 </div>
               ) : (
                 activeBids.map(bid => {
                    const lowest = Math.min(...bid.request.bids.map(b => b.amount));
                    const isWinning = bid.amount === lowest;
                    const diff = bid.amount - lowest;
                    
                    return (
                       <div key={bid.id} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${isWinning ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                          <div className="flex-1 mr-4">
                            <p className="font-bold text-slate-900 text-sm line-clamp-1">{bid.request.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                               {isWinning ? (
                                 <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <CheckCircleIcon className="w-3 h-3" /> Winning
                                 </span>
                               ) : (
                                 <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <TrendingDownIcon className="w-3 h-3" /> Losing by ₹{diff.toLocaleString('en-IN')}
                                 </span>
                               )}
                               <span className="text-[10px] text-slate-400 font-medium">{bid.request.bids.length} competitors</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">₹{bid.amount.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-slate-400 font-semibold">Your Bid</p>
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