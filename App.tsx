import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, ProductRequirement, RequestStatus, Bid, User } from './types';
import RequestForm from './components/RequestForm';
import BidModal from './components/BidModal';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import SellerDashboard from './components/SellerDashboard';
import { UserIcon, StoreIcon, PlusIcon, TagIcon, ClockIcon, TrendingDownIcon, CheckCircleIcon, SearchIcon, MapPinIcon, LayoutDashboardIcon, XMarkIcon } from './components/Icons';
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- Constants ---
const CITY_VENDORS: Record<string, string[]> = {
  'Satara': ['RAJDHANI HOME APPLIANCES', 'Shisa Appliances', 'E STORE'],
  'Pune': ['REAL HOME APPLIANCES', 'JYOTI HOME APPLIANCES'],
  'Kolhapur': ['ORANGE HOME APPLIANCES', 'NOVE APPLIANCES']
};

const CITIES = Object.keys(CITY_VENDORS);

// --- Mock Data ---
const MOCK_REQUESTS: ProductRequirement[] = [
  {
    id: 'req-1',
    userId: 'user-1',
    title: 'Samsung 500L Double Door Refrigerator',
    category: 'Fridge',
    description: 'Looking for a silver finish, convertable 5-in-1 model. Must be energy efficient.',
    specs: { brand: 'Samsung', capacity: '500L', type: 'Double Door', energyRating: '3 Star' },
    estimatedMarketPrice: { min: 38000, max: 45000 },
    bids: [
      { id: 'bid-1', sellerName: 'RAJDHANI HOME APPLIANCES', amount: 39500, deliveryDays: 2, notes: 'Includes free installation', timestamp: Date.now() - 100000 },
      { id: 'bid-2', sellerName: 'Shisa Appliances', amount: 38900, deliveryDays: 5, notes: 'Cardboard slightly damaged, product new', timestamp: Date.now() - 80000 },
    ],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 200000,
    location: 'Satara'
  },
  {
    id: 'req-2',
    userId: 'user-2',
    title: 'Michelin Primacy 4 ST Tyres (Set of 4)',
    category: 'Tyres',
    description: 'For my Honda City. Size 195/65 R15.',
    specs: { brand: 'Michelin', size: '195/65 R15', quantity: 4, type: 'Tubeless' },
    estimatedMarketPrice: { min: 24000, max: 28000 },
    bids: [],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 50000,
    location: 'Pune'
  },
  {
    id: 'req-3',
    userId: 'user-1',
    title: 'LG 1.5 Ton 5 Star Split AC',
    category: 'AC',
    description: 'Dual Inverter Compressor, AI Convertible 6-in-1, HD Filter with Anti-Virus Protection. Looking for 2024 model.',
    specs: { brand: 'LG', capacity: '1.5 Ton', energyRating: '5 Star', type: 'Split' },
    estimatedMarketPrice: { min: 42000, max: 48000 },
    bids: [],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 20000,
    location: 'Satara'
  }
];

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ProductRequirement[]>(MOCK_REQUESTS);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [activeBidRequest, setActiveBidRequest] = useState<ProductRequirement | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{req: ProductRequirement, bid: Bid} | null>(null);

  // Footer Modal States
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Derived state
  const myRequests = useMemo(() => {
    return user?.role === UserRole.BUYER 
      ? requests.filter(r => r.userId === user.id)
      : [];
  }, [requests, user]);

  const marketFeed = useMemo(() => {
    return user?.role === UserRole.SELLER
      ? requests.filter(r => r.location === user.city && r.status === RequestStatus.OPEN)
      : [];
  }, [requests, user]);

  const handlePostRequest = (data: any) => {
    if (!user) return;
    const newRequest: ProductRequirement = {
      id: `req-${Date.now()}`,
      userId: user.id,
      title: data.title,
      category: data.category,
      description: data.description,
      specs: data.specs,
      estimatedMarketPrice: data.estimatedMarketPrice,
      bids: [],
      status: RequestStatus.OPEN,
      createdAt: Date.now(),
      location: 'Satara' // Defaulting to Satara for demo, in real app would be user location
    };
    setRequests([newRequest, ...requests]);
    setIsRequestFormOpen(false);
  };

  const handleBidSubmit = (amount: number, deliveryDays: number, notes: string) => {
    if (!user || !activeBidRequest) return;
    
    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      sellerName: user.vendorName || 'Unknown Vendor',
      amount,
      deliveryDays,
      notes,
      timestamp: Date.now()
    };

    const updatedRequests = requests.map(req => {
      if (req.id === activeBidRequest.id) {
        return { ...req, bids: [...req.bids, newBid] };
      }
      return req;
    });

    setRequests(updatedRequests);
    setActiveBidRequest(null);
  };

  const handleAcceptBid = (req: ProductRequirement, bid: Bid) => {
     setShowPaymentModal({ req, bid });
  };

  const handlePaymentConfirm = (method: 'COD' | 'ONLINE') => {
    if (!showPaymentModal) return;
    const { req, bid } = showPaymentModal;
    
    const updatedRequests = requests.map(r => {
      if (r.id === req.id) {
        return { ...r, status: RequestStatus.CLOSED, winningBidId: bid.id, paymentMethod: method };
      }
      return r;
    });
    setRequests(updatedRequests);
    setShowPaymentModal(null);
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-rose-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl shadow-lg shadow-rose-200 flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              My Deal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{user.role === UserRole.SELLER ? user.city : 'Member'}</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
                   {user.role === UserRole.SELLER ? <StoreIcon className="w-5 h-5"/> : <UserIcon className="w-5 h-5"/>}
                </div>
                <button 
                  onClick={() => setUser(null)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {!user ? (
          // Landing Hero
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full text-orange-700 font-bold text-xs uppercase tracking-wider mb-6">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Reverse Auction Marketplace
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Don't Overpay.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">
                   Get the Best Price.
                </span>
             </h1>
             <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Post your requirements for Electronics, Tyres, or Appliances. 
                Local dealers compete to give you the lowest quote.
             </p>
             <button 
               onClick={() => setShowAuthModal(true)}
               className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-300"
             >
                Start Saving Now
             </button>
          </div>
        ) : (
          <>
            {/* Buyer View */}
            {user.role === UserRole.BUYER && (
              <div className="space-y-8">
                {!isRequestFormOpen ? (
                   <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setIsRequestFormOpen(true)}>
                      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                      <div className="relative z-10 max-w-2xl">
                         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                            <PlusIcon className="w-4 h-4" /> New Request
                         </div>
                         <h2 className="text-3xl md:text-4xl font-bold mb-4">What do you need today?</h2>
                         <p className="text-indigo-100 text-lg mb-8">
                            Describe your requirement (e.g., "Sony 55 inch TV 4K"). Our AI will help you specify it perfectly.
                         </p>
                         <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                            Create Request
                         </button>
                      </div>
                   </div>
                ) : (
                   <RequestForm 
                     onSubmit={handlePostRequest} 
                     onCancel={() => setIsRequestFormOpen(false)} 
                   />
                )}

                <div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                     <ClockIcon className="w-6 h-6 text-slate-400" />
                     Your Requests
                   </h3>
                   <div className="grid gap-6">
                      {myRequests.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                              <SearchIcon className="w-8 h-8" />
                           </div>
                           <p className="text-slate-500 font-medium">No requests yet. Create one to start getting bids!</p>
                        </div>
                      ) : (
                        myRequests.map(req => (
                           <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                                 <div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{req.category}</span>
                                       <span className="text-xs text-slate-400 font-medium">• {getTimeAgo(req.createdAt)}</span>
                                       {req.status === RequestStatus.CLOSED && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Fulfilled</span>}
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">{req.title}</h4>
                                    <p className="text-slate-500 text-sm mt-1">{req.description}</p>
                                    
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                       {Object.entries(req.specs).slice(0, 3).map(([k, v]) => (
                                          <span key={k} className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">
                                             <span className="font-bold opacity-70">{k}:</span> {String(v)}
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Est. Market Price</p>
                                    <p className="text-lg font-bold text-slate-700">₹{req.estimatedMarketPrice.min} - ₹{req.estimatedMarketPrice.max}</p>
                                 </div>
                              </div>

                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                 <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                                       <TagIcon className="w-4 h-4 text-rose-500" />
                                       Seller Bids ({req.bids.length})
                                    </h5>
                                    {req.bids.length > 0 && req.status === RequestStatus.OPEN && (
                                       <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                          Lowest: ₹{Math.min(...req.bids.map(b => b.amount))}
                                       </span>
                                    )}
                                 </div>
                                 
                                 {req.bids.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-2">Waiting for sellers to bid...</p>
                                 ) : (
                                    <div className="space-y-3">
                                       {req.bids.sort((a,b) => a.amount - b.amount).map((bid, index) => (
                                          <div key={bid.id} className={`flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-xl bg-white border ${req.winningBidId === bid.id ? 'border-green-400 ring-1 ring-green-100' : 'border-slate-200'} transition-all`}>
                                             <div className="mb-2 sm:mb-0">
                                                <div className="flex items-center gap-2">
                                                   <span className="font-bold text-slate-800 text-sm">{bid.sellerName}</span>
                                                   {index === 0 && req.status === RequestStatus.OPEN && <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold">Best Price</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{bid.notes}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><ClockIcon className="w-3 h-3"/> Delivers in {bid.deliveryDays} days</p>
                                             </div>
                                             <div className="flex items-center gap-3">
                                                <span className="font-bold text-lg text-slate-900">₹{bid.amount}</span>
                                                {req.status === RequestStatus.OPEN ? (
                                                   <button 
                                                      onClick={() => handleAcceptBid(req, bid)}
                                                      className="bg-slate-900 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                   >
                                                      Accept
                                                   </button>
                                                ) : req.winningBidId === bid.id ? (
                                                   <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                                      <CheckCircleIcon className="w-4 h-4" /> Accepted
                                                   </span>
                                                ) : null}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}

            {/* Seller View */}
            {user.role === UserRole.SELLER && (
               <div className="space-y-8">
                  <SellerDashboard sellerName={user.vendorName!} requests={requests} />
                  
                  <div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <MapPinIcon className="w-6 h-6 text-rose-500" />
                        Live Opportunities in {user.city}
                     </h3>
                     <div className="grid gap-6">
                        {marketFeed.length === 0 ? (
                           <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
                              <p className="text-slate-400 font-medium">No open requests in your area right now.</p>
                           </div>
                        ) : (
                           marketFeed.map(req => {
                              const myBid = req.bids.find(b => b.sellerName === user.vendorName);
                              return (
                                 <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                       <div>
                                          <div className="flex items-center gap-2 mb-1">
                                             <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{req.category}</span>
                                             <span className="text-xs text-slate-400">• {getTimeAgo(req.createdAt)}</span>
                                          </div>
                                          <h4 className="text-xl font-bold text-slate-900">{req.title}</h4>
                                       </div>
                                       <div className="text-right">
                                          <p className="text-xs text-slate-400 uppercase font-bold">Target Price</p>
                                          <p className="text-lg font-bold text-slate-700">₹{req.estimatedMarketPrice.min} - {req.estimatedMarketPrice.max}</p>
                                       </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl mb-4 text-sm text-slate-600">
                                       <p><span className="font-bold">Requirements:</span> {req.description}</p>
                                       <div className="flex flex-wrap gap-2 mt-2">
                                          {Object.entries(req.specs).map(([k, v]) => (
                                             <span key={k} className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                                {k}: {String(v)}
                                             </span>
                                          ))}
                                       </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                       <div className="text-xs font-bold text-slate-500">
                                          {req.bids.length} Bids so far • Lowest: ₹{req.bids.length > 0 ? Math.min(...req.bids.map(b => b.amount)) : '-'}
                                       </div>
                                       {myBid ? (
                                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                             <CheckCircleIcon className="w-4 h-4" /> Bid Placed: ₹{myBid.amount}
                                          </div>
                                       ) : (
                                          <button 
                                             onClick={() => setActiveBidRequest(req)}
                                             className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-rose-100 transition-all active:scale-95"
                                          >
                                             Place Bid
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  </div>
               </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
               <div className="flex items-center gap-2 mb-4 text-white font-bold text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg"></div>
                  My Deal
               </div>
               <p className="max-w-xs leading-relaxed">
                  The smartest way to buy electronics and auto parts. We get you the best market price through reverse auction.
               </p>
            </div>
            
            <div>
               <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
               <ul className="space-y-2">
                  <li>
                     <button onClick={() => setShowAboutModal(true)} className="hover:text-white transition-colors">About Us</button>
                  </li>
                  <li>
                     <button onClick={() => setShowContactModal(true)} className="hover:text-white transition-colors">Contact Us</button>
                  </li>
               </ul>
            </div>
            
            <div>
               <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h4>
               <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
               </ul>
            </div>
         </div>
         <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} My Deal Platform. All rights reserved.
         </div>
      </footer>

      {/* Footer Modals */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAboutModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAboutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">About My Deal</h2>
            <p className="text-slate-600 leading-relaxed mb-4 text-lg">
              Many people don't know the best price for items like <span className="font-bold text-slate-800">Fridges, ACs, or Car Tyres</span>.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We created this platform where buyers can submit their requirements, and sellers bid to provide the best price. This reverse auction model ensures you save money while sellers get genuine leads.
            </p>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Contact Us</h2>
            <p className="text-slate-500 mb-8">
              Need help or have a query? Chat with our support team directly.
            </p>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-95 group"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLogin={(user) => {
            setUser(user);
            setShowAuthModal(false);
          }}
          initialRole={UserRole.BUYER}
          cityVendors={CITY_VENDORS}
        />
      )}

      {activeBidRequest && (
        <BidModal 
          request={activeBidRequest}
          sellerName={user?.vendorName || ''}
          onClose={() => setActiveBidRequest(null)}
          onSubmit={handleBidSubmit}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          request={showPaymentModal.req}
          bid={showPaymentModal.bid}
          onClose={() => setShowPaymentModal(null)}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </div>
  );
};

export default App;