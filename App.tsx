import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, ProductRequirement, RequestStatus, Bid, User } from './types';
import RequestForm from './components/RequestForm';
import BidModal from './components/BidModal';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import SellerDashboard from './components/SellerDashboard';
import { UserIcon, StoreIcon, PlusIcon, TagIcon, ClockIcon, TrendingDownIcon, CheckCircleIcon, SearchIcon, MapPinIcon, LayoutDashboardIcon } from './components/Icons';
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
    description: 'Dual Inverter Split AC, Copper Condenser, 5 Star rating for bedroom.',
    specs: { brand: 'LG', capacity: '1.5 Ton', type: 'Split', energyRating: '5 Star' },
    estimatedMarketPrice: { min: 42000, max: 48000 },
    bids: [
       { id: 'bid-4', sellerName: 'ORANGE HOME APPLIANCES', amount: 43500, deliveryDays: 1, notes: 'Free stabilizer included', timestamp: Date.now() - 20000 },
    ],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 10000,
    location: 'Kolhapur'
  },
  {
    id: 'req-4',
    userId: 'user-3',
    title: 'Sony Bravia 55 inch 4K Google TV',
    category: 'TV',
    description: 'Latest model with XR processor and PS5 gaming features.',
    specs: { brand: 'Sony', size: '55 inch', resolution: '4K', type: 'LED' },
    estimatedMarketPrice: { min: 75000, max: 85000 },
    bids: [],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 800000,
    location: 'Satara'
  },
  {
    id: 'req-5',
    userId: 'user-4',
    title: 'Apple iPhone 15 Pro Max (256GB)',
    category: 'Mobile',
    description: 'Natural Titanium color, brand new sealed box required. Urgent requirement.',
    specs: { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '256GB', color: 'Natural Titanium' },
    estimatedMarketPrice: { min: 140000, max: 155000 },
    bids: [],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 5000,
    location: 'Pune'
  },
  {
    id: 'req-6',
    userId: 'user-5',
    title: 'Samsung Galaxy S24 Ultra',
    category: 'Mobile',
    description: 'Looking for the AI phone, 512GB variant in Titanium Gray.',
    specs: { brand: 'Samsung', model: 'S24 Ultra', storage: '512GB', color: 'Titanium Gray' },
    estimatedMarketPrice: { min: 115000, max: 130000 },
    bids: [
       { id: 'bid-5', sellerName: 'REAL HOME APPLIANCES', amount: 118000, deliveryDays: 1, notes: 'Includes Galaxy Watch offer', timestamp: Date.now() - 1000 },
    ],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 60000,
    location: 'Pune'
  }
];

// Helper for category colors
const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    'Fridge': 'bg-sky-100 text-sky-700 border-sky-200',
    'AC': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'TV': 'bg-violet-100 text-violet-700 border-violet-200',
    'Tyres': 'bg-stone-100 text-stone-700 border-stone-200',
    'Automotive': 'bg-orange-100 text-orange-700 border-orange-200',
    'Home Appliances': 'bg-blue-100 text-blue-700 border-blue-200',
    'Mobile': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  };
  return map[category] || 'bg-slate-100 text-slate-700 border-slate-200';
};

// Helper for category images
const getCategoryImage = (category: string) => {
  const map: Record<string, string> = {
    'Fridge': 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?auto=format&fit=crop&w=400&q=80',
    'AC': 'https://images.unsplash.com/photo-1612151855475-877969f4a6cc?auto=format&fit=crop&w=400&q=80',
    'TV': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
    'Tyres': 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=400&q=80',
    'Mobile': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
  };
  return map[category] || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80';
};

const CATEGORIES = ['All', 'Fridge', 'AC', 'TV', 'Tyres', 'Mobile'];

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.BUYER);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [requests, setRequests] = useState<ProductRequirement[]>(MOCK_REQUESTS);
  
  // Navigation State
  const [viewState, setViewState] = useState<'LIST' | 'CREATE' | 'DETAILS' | 'DASHBOARD'>('LIST');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBidForPayment, setSelectedBidForPayment] = useState<Bid | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentCity, setCurrentCity] = useState(CITIES[0]);
  const [currentVendor, setCurrentVendor] = useState(CITY_VENDORS[CITIES[0]][0]);

  // Update vendor when city changes or user logs in
  useEffect(() => {
    if (currentUser?.role === UserRole.SELLER && currentUser.vendorName && currentUser.city) {
      setCurrentCity(currentUser.city);
      setCurrentVendor(currentUser.vendorName);
    } else {
      const vendors = CITY_VENDORS[currentCity];
      if (vendors && vendors.length > 0) {
        setCurrentVendor(vendors[0]);
      }
    }
  }, [currentCity, currentUser]);

  // Derived State
  const selectedRequest = useMemo(() => 
    requests.find(r => r.id === selectedRequestId) || null
  , [requests, selectedRequestId]);

  const filteredRequests = useMemo(() => {
    // Filter out CLOSED deals from the marketplace list if looking at standard list
    let filtered = requests.filter(r => r.location === currentCity);
    
    // In marketplace, we only show OPEN requests usually, but for demo let's show all except maybe fulfilled ones unless searching
    if (viewState === 'LIST') {
       filtered = filtered.filter(r => r.status === RequestStatus.OPEN);
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    return filtered;
  }, [requests, selectedCategory, currentCity, viewState]);

  const toggleRole = () => {
    setActiveRole(prev => prev === UserRole.BUYER ? UserRole.SELLER : UserRole.BUYER);
    setViewState('LIST');
    setSelectedRequestId(null);
  };

  const handleCreateRequest = (data: any) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newRequest: ProductRequirement = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      title: data.title,
      category: data.category,
      description: data.description,
      specs: data.specs,
      estimatedMarketPrice: data.estimatedMarketPrice,
      bids: [],
      status: RequestStatus.OPEN,
      createdAt: Date.now(),
      location: currentCity 
    };
    setRequests([newRequest, ...requests]);
    setViewState('LIST');
  };

  const initiateBid = (reqId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedRequestId(reqId);
    setIsBidModalOpen(true);
  };

  const handlePlaceBid = (amount: number, deliveryDays: number, notes: string) => {
    if (!selectedRequest) return;
    
    // Use logged in vendor name if available, else selected dropdown
    const bidderName = currentUser?.role === UserRole.SELLER && currentUser.vendorName 
      ? currentUser.vendorName 
      : currentVendor;

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      sellerName: bidderName, 
      amount,
      deliveryDays,
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
    setIsBidModalOpen(false);
  };

  const initiatePayment = (bid: Bid) => {
    setSelectedBidForPayment(bid);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (method: 'COD' | 'ONLINE') => {
    if (!selectedRequest || !selectedBidForPayment) return;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return { 
          ...req, 
          status: RequestStatus.CLOSED, 
          winningBidId: selectedBidForPayment.id,
          paymentMethod: method
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setIsPaymentModalOpen(false);
    setSelectedBidForPayment(null);
    setViewState('LIST'); // Return to list after closing deal
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    if (user.role === UserRole.SELLER && user.city) {
      setCurrentCity(user.city);
    }
  };

  // --- Render Helpers ---

  const getLowestBid = (bids: Bid[]) => {
    if (bids.length === 0) return null;
    return Math.min(...bids.map(b => b.amount));
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 group cursor-pointer flex-shrink-0" onClick={() => {setViewState('LIST'); setSelectedRequestId(null);}}>
            <div className="bg-gradient-to-tr from-rose-600 to-red-600 text-white p-2 rounded-xl shadow-lg shadow-rose-200 group-hover:shadow-rose-300 transition-all group-hover:scale-105">
              <TrendingDownIcon className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-red-600 tracking-tight hidden md:block">
              My Deal
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            
            {/* Home Tab */}
            <button 
              onClick={() => {setViewState('LIST'); setSelectedRequestId(null);}}
              className={`px-4 py-2 rounded-lg text-sm font-extrabold transition-all hidden md:block ${viewState === 'LIST' && !selectedRequestId ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:text-slate-900'}`}
            >
              HOME
            </button>

            {/* City Selector */}
            <div className="relative group flex-shrink-0">
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-rose-100 transition-colors">
                <MapPinIcon className="w-4 h-4 text-rose-600" />
                <select 
                  value={currentCity}
                  onChange={(e) => { setCurrentCity(e.target.value); setViewState('LIST'); setSelectedRequestId(null); }}
                  disabled={currentUser?.role === UserRole.SELLER}
                  className="bg-transparent font-extrabold text-sm outline-none cursor-pointer appearance-none pr-4 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <span className="absolute right-3 pointer-events-none text-rose-400 text-xs">▼</span>
              </div>
            </div>

            {/* Vendor Identity Selector (Only for Seller & Not Logged In) */}
            {activeRole === UserRole.SELLER && !currentUser && (
               <div className="relative group flex-shrink-0 animate-in fade-in slide-in-from-right-4">
               <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors">
                 <StoreIcon className="w-4 h-4 text-emerald-600" />
                 <select 
                   value={currentVendor}
                   onChange={(e) => setCurrentVendor(e.target.value)}
                   className="bg-transparent font-extrabold text-sm outline-none cursor-pointer appearance-none pr-4 max-w-[150px] md:max-w-[200px] truncate uppercase tracking-wide"
                 >
                   {CITY_VENDORS[currentCity]?.map(vendor => (
                     <option key={vendor} value={vendor}>{vendor}</option>
                   ))}
                 </select>
                 <span className="absolute right-3 pointer-events-none text-emerald-400 text-xs">▼</span>
               </div>
             </div>
            )}

            {/* User Auth Section */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">{currentUser.role}</p>
                </div>
                <button 
                  onClick={() => setCurrentUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500 transition-colors"
                  title="Logout"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
               <button 
                 onClick={() => setIsAuthModalOpen(true)}
                 className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-colors flex-shrink-0"
               >
                 Log In
               </button>
            )}

            {/* Role Toggles - Hide if logged in to avoid confusion, or keep for quick switching in demo */}
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 flex-shrink-0">
              <button 
                onClick={() => setActiveRole(UserRole.BUYER)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeRole === UserRole.BUYER 
                    ? 'bg-white text-rose-600 shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">Buyer</span>
              </button>
              <button 
                onClick={() => { setActiveRole(UserRole.SELLER); setViewState('LIST'); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeRole === UserRole.SELLER 
                    ? 'bg-white text-emerald-600 shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <StoreIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">Seller</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 flex-grow w-full">
        
        {/* Category Filter */}
        {viewState === 'LIST' && (
          <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-extrabold tracking-wide transition-all border ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* --- BUYER VIEW --- */}
        {activeRole === UserRole.BUYER && (
          <div className="animate-in fade-in duration-500">
            {viewState === 'LIST' && (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div className="relative">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">My Requests in {currentCity}</h1>
                    <p className="text-slate-500 text-lg max-w-xl">
                      Find the best deal for your Fridge, AC, TV, Mobile or Tyres. AI does the hard work.
                    </p>
                  </div>
                  <button 
                    onClick={() => currentUser ? setViewState('CREATE') : setIsAuthModalOpen(true)}
                    className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-xl shadow-rose-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusIcon className="w-5 h-5" />
                    New Request
                  </button>
                </div>

                <div className="grid gap-6">
                  {filteredRequests.filter(r => r.userId.startsWith('user-')).map(req => {
                    const lowest = getLowestBid(req.bids);
                    return (
                      <div 
                        key={req.id} 
                        onClick={() => { setSelectedRequestId(req.id); setViewState('DETAILS'); }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-rose-100 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                      >
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Image Side */}
                          <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                            <img 
                              src={getCategoryImage(req.category)} 
                              alt={req.category} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                            <div className="absolute top-0 right-0 p-1">
                               <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border shadow-sm ${getCategoryColor(req.category)} bg-white/90`}>
                                {req.category}
                              </span>
                            </div>
                          </div>
                          
                          {/* Content Side */}
                          <div className="flex-1 flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors mb-2">{req.title}</h3>
                              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-3">{req.description}</p>
                              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                                <MapPinIcon className="w-3 h-3"/> {req.location}
                              </div>
                            </div>
                            <div className="md:text-right min-w-[120px] pt-1">
                              <div className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Lowest Bid</div>
                              <div className={`text-3xl font-extrabold ${lowest && lowest < req.estimatedMarketPrice.min ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600' : 'text-slate-900'}`}>
                                {lowest ? `₹${lowest}` : '-'}
                              </div>
                              {lowest && (
                                <div className="text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-md mt-1">
                                  Save ₹{req.estimatedMarketPrice.max - lowest}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                           <div className="flex gap-4 text-sm text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4 text-slate-400"/> {formatDate(req.createdAt)}</span>
                              <span className="flex items-center gap-1.5"><TagIcon className="w-4 h-4 text-slate-400"/> {req.bids.length} Bids</span>
                           </div>
                           <div className="text-sm font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                             View Details 
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredRequests.filter(r => r.userId.startsWith('user-')).length === 0 && (
                     <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlusIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Requests Found</h3>
                        <p className="text-slate-500 mb-6">Create your first request to get started finding deals.</p>
                        <button 
                          onClick={() => setViewState('CREATE')}
                          className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-100"
                        >
                          Create Request
                        </button>
                     </div>
                  )}
                </div>
              </>
            )}

            {viewState === 'CREATE' && (
              <div className="animate-in slide-in-from-bottom-8">
                <RequestForm 
                  onSubmit={handleCreateRequest} 
                  onCancel={() => setViewState('LIST')} 
                />
              </div>
            )}

            {viewState === 'DETAILS' && selectedRequest && (
               <div className="animate-in slide-in-from-right-8">
                 <button onClick={() => setViewState('LIST')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back to List
                 </button>
                 
                 <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100">
                       <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase mb-3 inline-block ${getCategoryColor(selectedRequest.category)}`}>{selectedRequest.category}</span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{selectedRequest.title}</h2>
                            <p className="text-slate-500 text-lg">{selectedRequest.description}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Market Estimate</p>
                             <p className="text-2xl font-extrabold text-slate-700">₹{selectedRequest.estimatedMarketPrice.min} - ₹{selectedRequest.estimatedMarketPrice.max}</p>
                          </div>
                       </div>
                       
                       <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(selectedRequest.specs).map(([key, value]) => (
                             <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                                <p className="font-bold text-slate-800 text-sm">{String(value)}</p>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-8 bg-slate-50/50">
                       <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                         <TagIcon className="w-5 h-5 text-rose-500"/> Seller Bids ({selectedRequest.bids.length})
                       </h3>
                       
                       <div className="space-y-4">
                          {selectedRequest.bids.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                               <p className="text-slate-400 font-medium">No bids yet. Sellers will start bidding soon.</p>
                            </div>
                          ) : (
                            selectedRequest.bids.sort((a,b) => a.amount - b.amount).map((bid, idx) => (
                               <div key={bid.id} className={`bg-white p-5 rounded-2xl border transition-all ${idx === 0 ? 'border-green-200 shadow-md shadow-green-50 ring-1 ring-green-100' : 'border-slate-100'}`}>
                                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                     <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                           {idx + 1}
                                        </div>
                                        <div>
                                           <p className="font-bold text-slate-900">{bid.sellerName}</p>
                                           <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                              <span>{bid.deliveryDays} Days Delivery</span>
                                              <span>•</span>
                                              <span>{formatDate(bid.timestamp)}</span>
                                           </div>
                                        </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                           <p className="text-3xl font-extrabold text-slate-900">₹{bid.amount}</p>
                                           {idx === 0 && <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1">Best Price</p>}
                                        </div>
                                        {selectedRequest.status === RequestStatus.OPEN && (
                                            <button 
                                              onClick={() => initiatePayment(bid)}
                                              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 transition-all active:scale-95"
                                            >
                                              Accept
                                            </button>
                                        )}
                                        {selectedRequest.status === RequestStatus.CLOSED && selectedRequest.winningBidId === bid.id && (
                                           <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                                              <CheckCircleIcon className="w-4 h-4"/> Accepted
                                           </div>
                                        )}
                                     </div>
                                  </div>
                                  {bid.notes && (
                                     <div className="mt-4 pt-4 border-t border-slate-50 text-sm text-slate-500 bg-slate-50/50 p-3 rounded-lg">
                                        <span className="font-bold text-slate-700">Note:</span> {bid.notes}
                                     </div>
                                  )}
                               </div>
                            ))
                          )}
                       </div>
                    </div>
                 </div>
               </div>
            )}
          </div>
        )}

        {/* --- SELLER VIEW --- */}
        {activeRole === UserRole.SELLER && (
           <div className="animate-in fade-in duration-500">
             {viewState === 'LIST' && (
                <>
                  <div className="flex items-end justify-between mb-8">
                     <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Marketplace Requests</h1>
                        <p className="text-slate-500">Active leads in <span className="font-bold text-rose-600">{currentCity}</span></p>
                     </div>
                     <button 
                        onClick={() => currentUser ? setViewState('DASHBOARD') : setIsAuthModalOpen(true)}
                        className="bg-white text-slate-700 border border-slate-200 hover:border-slate-300 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
                     >
                        <LayoutDashboardIcon className="w-5 h-5"/> Dashboard
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredRequests.map(req => {
                        const myBid = req.bids.find(b => b.sellerName === (currentUser?.vendorName || currentVendor));
                        const lowest = getLowestBid(req.bids);
                        
                        return (
                           <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all group flex flex-col h-full">
                              <div className="flex items-start justify-between mb-4">
                                 <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${getCategoryColor(req.category)}`}>
                                    {req.category}
                                 </span>
                                 <span className="text-xs font-bold text-slate-400">{formatDate(req.createdAt)}</span>
                              </div>
                              
                              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">{req.title}</h3>
                              <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">{req.description}</p>
                              
                              <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold uppercase">Budget</span>
                                    <span className="font-bold text-slate-700">₹{req.estimatedMarketPrice.max}</span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold uppercase">Lowest Bid</span>
                                    <span className={`font-bold ${lowest ? 'text-emerald-600' : 'text-slate-400'}`}>{lowest ? `₹${lowest}` : '-'}</span>
                                 </div>
                              </div>

                              {myBid ? (
                                 <div className="mt-auto bg-emerald-50 text-emerald-800 p-3 rounded-xl font-bold text-sm text-center border border-emerald-100">
                                    You Bid ₹{myBid.amount}
                                 </div>
                              ) : (
                                 <button 
                                    onClick={() => initiateBid(req.id)}
                                    className="mt-auto w-full bg-slate-900 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all active:scale-95"
                                 >
                                    Place Bid
                                 </button>
                              )}
                           </div>
                        );
                     })}
                  </div>
                </>
             )}

             {viewState === 'DASHBOARD' && currentUser && (
                <SellerDashboard sellerName={currentUser.vendorName!} requests={requests} />
             )}
           </div>
        )}
      </main>

      {/* Modals */}
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={(user) => { handleLogin(user); setIsAuthModalOpen(false); }}
          initialRole={activeRole}
          cityVendors={CITY_VENDORS}
        />
      )}

      {isBidModalOpen && selectedRequest && (
        <BidModal 
          request={selectedRequest}
          sellerName={currentUser?.vendorName || currentVendor}
          onClose={() => setIsBidModalOpen(false)}
          onSubmit={handlePlaceBid}
        />
      )}

      {isPaymentModalOpen && selectedRequest && selectedBidForPayment && (
         <PaymentModal 
            request={selectedRequest}
            bid={selectedBidForPayment}
            onClose={() => setIsPaymentModalOpen(false)}
            onConfirm={handleConfirmPayment}
         />
      )}

    </div>
  );
}