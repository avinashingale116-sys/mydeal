import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, ProductRequirement, RequestStatus, Bid, User, AIAnalysisResult } from './types';
import RequestForm from './components/RequestForm';
import BidModal from './components/BidModal';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import SellerDashboard from './components/SellerDashboard';
import { UserIcon, StoreIcon, PlusIcon, TagIcon, ClockIcon, CheckCircleIcon, SearchIcon, MapPinIcon, XMarkIcon, SparklesIcon, LayoutDashboardIcon } from './components/Icons';

// --- Constants ---
const CITY_VENDORS: Record<string, string[]> = {
  'Satara': ['RAJDHANI HOME APPLIANCES', 'Shisa Appliances', 'E STORE'],
  'Pune': ['REAL HOME APPLIANCES', 'JYOTI HOME APPLIANCES'],
  'Kolhapur': ['ORANGE HOME APPLIANCES', 'NOVE APPLIANCES']
};

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
    specs: { brand: 'LG', capacity: '1.5 Ton', type: 'Split', energyRating: '5 Star' },
    estimatedMarketPrice: { min: 42000, max: 48000 },
    bids: [],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 10000,
    location: 'Pune'
  }
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ProductRequirement[]>(MOCK_REQUESTS);
  
  // Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState(UserRole.BUYER);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // Selection States
  const [selectedRequest, setSelectedRequest] = useState<ProductRequirement | null>(null);
  const [isBidding, setIsBidding] = useState(false);
  const [activeBidToPay, setActiveBidToPay] = useState<Bid | null>(null);

  // Derived State
  const filteredRequests = useMemo(() => {
    if (!user) return requests.filter(r => r.status === RequestStatus.OPEN);
    
    if (user.role === UserRole.BUYER) {
      // Buyers see their own requests primarily, or a feed of public ones?
      // For this app, let's show "My Requests" at top, then others.
      return requests.sort((a, b) => {
        if (a.userId === user.id && b.userId !== user.id) return -1;
        if (a.userId !== user.id && b.userId === user.id) return 1;
        return b.createdAt - a.createdAt;
      });
    } else {
      // Sellers see requests in their city or all open requests
      return requests
        .filter(r => r.status === RequestStatus.OPEN || (r.status === RequestStatus.CLOSED && r.winningBidId && r.bids.some(b => b.sellerName === user.vendorName)))
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [user, requests]);

  // Actions
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowRequestForm(false);
    setSelectedRequest(null);
  };

  const handlePostRequest = (data: AIAnalysisResult & { description: string }) => {
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
      location: 'Satara' // Default for demo
    };
    
    setRequests([newRequest, ...requests]);
    setShowRequestForm(false);
  };

  const handlePlaceBid = (amount: number, days: number, notes: string) => {
    if (!user || !user.vendorName || !selectedRequest) return;
    
    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      sellerName: user.vendorName,
      amount,
      deliveryDays: days,
      notes,
      timestamp: Date.now()
    };
    
    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return { ...req, bids: [...req.bids, newBid] };
      }
      return req;
    });
    
    setRequests(updatedRequests);
    setIsBidding(false);
    setSelectedRequest(null);
  };

  const handleAcceptBid = (req: ProductRequirement, bid: Bid) => {
    setSelectedRequest(req);
    setActiveBidToPay(bid);
  };

  const handlePaymentComplete = (method: 'COD' | 'ONLINE') => {
    if (!selectedRequest || !activeBidToPay) return;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return { 
          ...req, 
          status: RequestStatus.CLOSED, 
          winningBidId: activeBidToPay.id,
          paymentMethod: method
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setActiveBidToPay(null);
    setSelectedRequest(null);
  };

  // View Helpers
  const openAuth = (role: UserRole) => {
    setAuthInitialRole(role);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedRequest(null)}>
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              My Deal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-800">{user.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openAuth(UserRole.SELLER)}
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2"
                >
                  For Sellers
                </button>
                <button 
                  onClick={() => openAuth(UserRole.BUYER)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-slate-200"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Buyer View - Post Request / My Requests */}
        {user?.role === UserRole.BUYER && !showRequestForm && (
           <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">My Requests</h2>
                <p className="text-slate-500">Manage your active requirements</p>
              </div>
              <button 
                onClick={() => setShowRequestForm(true)}
                className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-200 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                New Request
              </button>
           </div>
        )}

        {/* Seller Dashboard View */}
        {user?.role === UserRole.SELLER && (
           <SellerDashboard sellerName={user.vendorName!} requests={requests} />
        )}

        {/* Request Form */}
        {showRequestForm ? (
          <RequestForm onSubmit={handlePostRequest} onCancel={() => setShowRequestForm(false)} />
        ) : (
          /* Feed of Requests */
          <div className="space-y-6">
            {!user && (
              <div className="text-center py-24 mb-12 relative overflow-visible">
                {/* Decorative background blob for hero */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-200/40 to-orange-200/40 blur-3xl rounded-full -z-10 animate-blob" />
                
                <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
                  Don't <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">Overpay.</span>
                </h1>
                
                <p className="text-2xl md:text-3xl font-bold text-slate-700 mb-8 max-w-3xl mx-auto leading-tight">
                  The smartest way to buy Home appliances and more
                </p>
                
                <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto font-medium">
                  Submit your requirement. Local verified sellers compete to give you the lowest price.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => openAuth(UserRole.BUYER)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl shadow-slate-300 hover:scale-105 hover:shadow-rose-200 transition-all flex items-center gap-3"
                  >
                    Start Saving Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl font-black text-slate-900">100+</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified Sellers</span>
                   </div>
                   <div className="w-px h-12 bg-slate-200 hidden sm:block"></div>
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl font-black text-slate-900">30%</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Savings</span>
                   </div>
                </div>
              </div>
            )}
            
            {(user?.role !== UserRole.SELLER) && (
               <div className="grid grid-cols-1 gap-6">
                 {filteredRequests.map(req => {
                   const isOwner = user?.id === req.userId;
                   const lowestBid = req.bids.length > 0 ? Math.min(...req.bids.map(b => b.amount)) : 0;
                   const myWinningBid = user?.role === UserRole.SELLER ? req.bids.find(b => b.sellerName === user?.vendorName) : null;

                   return (
                     <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6">
                           <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                  {req.category}
                                </span>
                                <div className="flex items-center text-slate-400 text-xs font-semibold gap-1">
                                   <MapPinIcon className="w-3 h-3" />
                                   {req.location}
                                </div>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{req.title}</h3>
                              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{req.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(req.specs).slice(0,3).map(([k,v]) => (
                                   <span key={k} className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium">
                                      {k}: {String(v)}
                                   </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                                 <span className="flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {new Date(req.createdAt).toLocaleDateString()}
                                 </span>
                                 <span>•</span>
                                 <span>{req.bids.length} Bids</span>
                                 {req.status === RequestStatus.CLOSED && (
                                   <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Fulfilled</span>
                                 )}
                              </div>
                           </div>
                           
                           <div className="w-full md:w-72 bg-slate-50 rounded-2xl p-5 flex flex-col justify-between border border-slate-100">
                              <div>
                                 <p className="text-xs text-slate-400 uppercase font-bold">Estimated Market Price</p>
                                 <p className="text-slate-700 font-bold mb-4">₹{req.estimatedMarketPrice.min} - ₹{req.estimatedMarketPrice.max}</p>
                                 
                                 {req.bids.length > 0 && (
                                   <div className="mb-4">
                                      <p className="text-xs text-green-600 uppercase font-bold">Best Offer</p>
                                      <p className="text-2xl font-black text-green-700">₹{lowestBid}</p>
                                   </div>
                                 )}
                              </div>

                              {user?.role === UserRole.BUYER && isOwner && req.status === RequestStatus.OPEN && (
                                 <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Offers Received</p>
                                    {req.bids.length === 0 ? (
                                      <p className="text-sm text-slate-400 italic">Waiting for sellers...</p>
                                    ) : (
                                      req.bids.map(bid => (
                                        <div key={bid.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group">
                                           <div>
                                             <p className="font-bold text-slate-900">₹{bid.amount}</p>
                                             <p className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[100px]">{bid.sellerName}</p>
                                           </div>
                                           <button 
                                             onClick={() => handleAcceptBid(req, bid)}
                                             className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                                           >
                                             Accept
                                           </button>
                                        </div>
                                      ))
                                    )}
                                 </div>
                              )}
                              
                              {user?.role === UserRole.SELLER && req.status === RequestStatus.OPEN && (
                                <button 
                                  onClick={() => { setSelectedRequest(req); setIsBidding(true); }}
                                  className="w-full bg-slate-900 hover:bg-rose-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95"
                                >
                                  Place Bid
                                </button>
                              )}

                              {!user && (
                                <button disabled className="w-full bg-slate-200 text-slate-400 py-3 rounded-xl font-bold cursor-not-allowed text-sm">
                                  Login to Interact
                                </button>
                              )}
                           </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal 
          initialRole={authInitialRole} 
          cityVendors={CITY_VENDORS} 
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {isBidding && selectedRequest && user?.vendorName && (
        <BidModal 
          request={selectedRequest}
          sellerName={user.vendorName}
          onClose={() => { setIsBidding(false); setSelectedRequest(null); }}
          onSubmit={handlePlaceBid}
        />
      )}

      {activeBidToPay && selectedRequest && (
        <PaymentModal
          request={selectedRequest}
          bid={activeBidToPay}
          onClose={() => { setActiveBidToPay(null); setSelectedRequest(null); }}
          onConfirm={handlePaymentComplete}
        />
      )}
    </div>
  );
}

export default App;