import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, ProductRequirement, RequestStatus, Bid, User, AIAnalysisResult, AppNotification } from './types';
import RequestForm from './components/RequestForm';
import BidModal from './components/BidModal';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import SellerDashboard from './components/SellerDashboard';
import NotificationPanel from './components/NotificationPanel';
import { UserIcon, StoreIcon, PlusIcon, TagIcon, ClockIcon, CheckCircleIcon, SearchIcon, MapPinIcon, XMarkIcon, SparklesIcon, LayoutDashboardIcon, BellIcon, ChevronDownIcon, HomeIcon, TrendingDownIcon, BanknotesIcon } from './components/Icons';

// --- Constants ---
const CITY_VENDORS: Record<string, string[]> = {
  'Satara': ['RAJDHANI HOME APPLIANCES', 'Shisa Appliances', 'E STORE', 'Speedy Wheels'],
  'Pune': ['REAL HOME APPLIANCES', 'JYOTI HOME APPLIANCES', 'Car Care Hub'],
  'Kolhapur': ['ORANGE HOME APPLIANCES', 'NOVE APPLIANCES', 'Wheel World']
};

const CATEGORIES = ['All', 'AC', 'Fridge', 'TV', 'Mobile', 'Washing Machine'];

// --- Mock Data ---
const MOCK_REQUESTS: ProductRequirement[] = [
  {
    id: 'req-mock-1',
    userId: 'u-buyer-1',
    title: 'LG 1.5 Ton 5 Star AI DUAL Inverter Split AC',
    category: 'AC',
    description: 'Looking for the latest LG model with copper condenser, 5 star rating. Need installation included.',
    specs: {
      brand: 'LG',
      type: 'Split AC',
      capacity: '1.5 Ton',
      rating: '5 Star',
      condenser: 'Copper'
    },
    estimatedMarketPrice: { min: 42000, max: 48000 },
    bids: [
      {
        id: 'bid-m-1',
        sellerName: 'Shisa Appliances',
        amount: 43500,
        deliveryDays: 2,
        notes: 'Includes standard installation and stabilizer.',
        timestamp: Date.now() - 100000
      }
    ],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 200000,
    location: 'Satara'
  },
  {
    id: 'req-mock-2',
    userId: 'u-buyer-2',
    title: 'Samsung 253L 3 Star Inverter Double Door Refrigerator',
    category: 'Fridge',
    description: 'Need a double door fridge, silver color preferred. Samsung or Whirlpool.',
    specs: {
      brand: 'Samsung',
      capacity: '253L',
      type: 'Double Door',
      rating: '3 Star'
    },
    estimatedMarketPrice: { min: 24000, max: 29000 },
    bids: [],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 800000,
    location: 'Satara'
  },
  {
    id: 'req-mock-4',
    userId: 'u-buyer-4',
    title: 'Sony Bravia 55 inch 4K Ultra HD Smart LED TV',
    category: 'TV',
    description: 'Looking for a Sony 55 inch TV for my living room. Smart features required.',
    specs: {
        brand: 'Sony',
        size: '55 inch',
        resolution: '4K',
        type: 'LED'
    },
    estimatedMarketPrice: { min: 65000, max: 75000 },
    bids: [
        {
            id: 'bid-m-2',
            sellerName: 'ORANGE HOME APPLIANCES',
            amount: 68000,
            deliveryDays: 1,
            notes: 'Wall mount included free of cost.',
            timestamp: Date.now() - 50000
        }
    ],
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 300000,
    location: 'Kolhapur'
  }
];

type ViewState = 'landing' | 'dashboard' | 'create_request';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ProductRequirement[]>(MOCK_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentCity, setCurrentCity] = useState('Satara');
  const [currentCategory, setCurrentCategory] = useState('All');
  
  // View State - Default to Landing
  const [view, setView] = useState<ViewState>('landing');
  
  // Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState(UserRole.BUYER);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Selection States
  const [selectedRequest, setSelectedRequest] = useState<ProductRequirement | null>(null);
  const [isBidding, setIsBidding] = useState(false);
  const [activeBidToPay, setActiveBidToPay] = useState<Bid | null>(null);

  // Derived State
  const filteredRequests = useMemo(() => {
    let result = requests;

    // Filter by Category
    if (currentCategory !== 'All') {
      result = result.filter(r => {
        const cat = r.category.toLowerCase();
        const filter = currentCategory.toLowerCase();
        
        // Smart matching for common terms
        if (filter === 'fridge') return cat.includes('refrigerator') || cat.includes('fridge');
        if (filter === 'ac') return cat.includes('air condition') || cat.includes('ac');
        if (filter === 'tv') return cat.includes('television') || cat.includes('tv');
        if (filter === 'mobile') return cat.includes('phone') || cat.includes('mobile');
        
        return cat.includes(filter);
      });
    }

    if (!user) {
        // Public view: show open requests, filter by current city selected in landing
        // Sort by Newest First
        return result.filter(r => r.status === RequestStatus.OPEN && r.location === currentCity).sort((a, b) => b.createdAt - a.createdAt);
    }
    
    if (user.role === UserRole.BUYER) {
      // Buyers ONLY see their own requests
      // Sort by Newest First
      return result
        .filter(req => req.userId === user.id)
        .sort((a, b) => b.createdAt - a.createdAt);
    } else {
      // Sellers see OPEN requests in THEIR city, or CLOSED requests they won
      // Sort by Newest First
      return result
        .filter(r => 
            (r.status === RequestStatus.OPEN && (!user.city || r.location === user.city)) || 
            (r.status === RequestStatus.CLOSED && r.winningBidId && r.bids.some(b => b.sellerName === user.vendorName))
        )
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [user, requests, currentCategory, currentCity]);

  // Notifications Logic
  const myNotifications = useMemo(() => {
    if (!user) return [];
    // Identify recipient: Vendor Name for sellers, User ID for buyers
    const recipientId = user.role === UserRole.SELLER ? user.vendorName : user.id;
    return notifications
      .filter(n => n.recipient === recipientId)
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by Newest First
  }, [user, notifications]);

  const unreadCount = myNotifications.filter(n => !n.read).length;

  // Actions
  const addNotification = (recipient: string, message: string, type: AppNotification['type'], relatedRequestId?: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      recipient,
      message,
      type,
      timestamp: Date.now(),
      read: false,
      relatedRequestId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    if (!user) return;
    const recipientId = user.role === UserRole.SELLER ? user.vendorName : user.id;
    setNotifications(prev => prev.filter(n => n.recipient !== recipientId));
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    // If logging in as a seller, update the current city to the seller's city
    if (newUser.role === UserRole.SELLER && newUser.city) {
      setCurrentCity(newUser.city);
    }
    setShowAuthModal(false);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setSelectedRequest(null);
    setShowNotifications(false);
    setCurrentCategory('All');
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
      location: currentCity // Use selected city
    };
    
    setRequests([newRequest, ...requests]);
    setView('dashboard');
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
    
    // Notify other sellers who have bid on this request
    const competingSellers = new Set<string>(selectedRequest.bids.map(b => b.sellerName));
    competingSellers.delete(user.vendorName); // Don't notify self
    
    competingSellers.forEach(competitor => {
      addNotification(
        competitor,
        `New competitive bid of ₹${amount} placed on "${selectedRequest.title}". Check if you've been outbid!`,
        'warning',
        selectedRequest.id
      );
    });

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

    // Notify the winning seller
    addNotification(
      activeBidToPay.sellerName,
      `Congratulations! Your bid of ₹${activeBidToPay.amount} for "${selectedRequest.title}" was accepted by the buyer.`,
      'success',
      selectedRequest.id
    );

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
    <div className="flex flex-col min-h-screen relative" onClick={() => showNotifications && setShowNotifications(false)}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-rose-900/20 group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="hidden sm:flex flex-col justify-center">
                <span className="text-xl font-extrabold text-white tracking-tight leading-none">
                  My Deal <span className="text-rose-500">24</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase mt-0.5 bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent group-hover:from-rose-300 group-hover:to-orange-300 transition-all">Negotiate freely, Buy smartly</span>
              </div>
            </div>
            
            {/* Home Tab - Visible when not on landing page */}
            {view !== 'landing' && (
              <button 
                onClick={() => setView('landing')}
                className="relative group flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full font-bold text-sm text-slate-200 transition-all duration-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <HomeIcon className="w-4 h-4 group-hover:text-rose-400 transition-colors duration-300 relative z-10" />
                <span className="relative z-10">Home</span>
              </button>
            )}
            
            {/* Dashboard Link - Visible when not on dashboard */}
            {view !== 'dashboard' && user && (
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-200 hover:text-white rounded-full font-bold text-sm border border-transparent hover:border-slate-700 transition-all"
              >
                <LayoutDashboardIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div 
                  className="hidden md:flex flex-col items-end cursor-pointer group"
                  onClick={() => setView('dashboard')}
                  title="Go to Dashboard"
                >
                  <span className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors">{user.name}</span>
                  <span className="text-sm font-bold text-slate-400">|</span>
                  <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 group-hover:border-rose-500/50 transition-colors">
                    {user.role}
                  </span>
                </div>
                
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                    className="p-2 text-slate-400 hover:text-white transition-colors relative"
                  >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                    )}
                  </button>
                </div>

                <button 
                  onClick={handleLogout}
                  className="text-sm font-semibold text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openAuth(UserRole.BUYER)}
                  className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transform hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Notification Panel */}
      {showNotifications && (
        <div onClick={(e) => e.stopPropagation()}>
          <NotificationPanel 
            notifications={myNotifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={markAsRead}
            onClearAll={clearNotifications}
          />
        </div>
      )}

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {/* LANDING PAGE VIEW */}
        {view === 'landing' && (
            <div className="flex flex-col items-center justify-center relative z-10 px-4 animate-in fade-in duration-700 py-10">
              
              {/* Decorative background blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-3xl -z-10 animate-blob" />
              
              {/* Location Selector Display */}
              <div className="bg-white/80 backdrop-blur rounded-full pl-5 pr-2 py-1.5 mb-8 border border-slate-200 shadow-sm flex items-center gap-2 animate-in slide-in-from-top-4 duration-700 relative z-20">
                 <MapPinIcon className="w-4 h-4 text-rose-500" />
                 <span className="font-bold text-slate-600 text-sm hidden sm:inline">Location:</span>
                 
                 <div className="relative group">
                    <select 
                        value={currentCity}
                        onChange={(e) => setCurrentCity(e.target.value)}
                        className="appearance-none bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm pl-3 pr-8 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 cursor-pointer outline-none transition-all focus:ring-2 focus:ring-rose-100 shadow-sm"
                    >
                        {Object.keys(CITY_VENDORS).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <ChevronDownIcon className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-600" />
                 </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 tracking-tight text-center leading-none">
                Don't <span className="text-rose-600">overpay.</span>
              </h1>
              <h2 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 mb-6 text-center leading-tight max-w-3xl">
                The smartest way to buy Home Appliances.
              </h2>
              <p className="text-lg text-slate-600 font-medium mb-10 text-center max-w-2xl leading-relaxed">
                Local verified sellers compete to give you the lowest and best price.
              </p>

              {/* CTA Section */}
              <div className="flex flex-col items-center gap-4 mb-16 w-full max-w-md">
                <button
                  onClick={() => setView('dashboard')}
                  className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xl font-bold py-5 rounded-2xl shadow-xl shadow-rose-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  Start Saving Now
                  <span className="bg-white/20 rounded-full p-1"><ChevronDownIcon className="w-4 h-4 -rotate-90" /></span>
                </button>
                
                <div className="flex items-center gap-4 text-sm font-bold text-slate-500 bg-white/50 px-4 py-2 rounded-xl border border-white/50">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    100+ Verified Sellers
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <TrendingDownIcon className="w-4 h-4 text-rose-500" />
                    30% Avg Saving
                  </span>
                </div>
              </div>

              {/* Product List Section */}
              <div className="flex flex-col items-center w-full max-w-5xl mb-20">
                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-8">Our Product List</h3>
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-6 opacity-90 hover:opacity-100 transition-opacity">
                  {[
                    { id: 'AC', label: 'AC', icon: '❄️' },
                    { id: 'Fridge', label: 'Fridge', icon: '🧊' },
                    { id: 'TV', label: 'TV', icon: '📺' },
                    { id: 'Mobile', label: 'Mobile', icon: '📱' },
                    { id: 'Washing Machine', label: 'Washing Machine', icon: '🧺' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className={`group relative flex flex-col items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-white/60 hover:bg-white backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-rose-100 transition-all duration-300 transform hover:-translate-y-1 border ${currentCategory === cat.id ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-100'}`}
                    >
                      <span className="text-3xl md:text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                        {cat.icon}
                      </span>
                      <span className={`font-bold text-[10px] md:text-xs transition-colors uppercase tracking-wide ${currentCategory === cat.id ? 'text-rose-600' : 'text-slate-600 group-hover:text-rose-600'}`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* How it Works Section */}
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
                 <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-inner">1</div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Post Requirement</h3>
                    <p className="text-slate-500 text-sm">Tell us what you need. AI helps you define the exact model specs.</p>
                 </div>
                 <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-inner">2</div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Sellers Compete</h3>
                    <p className="text-slate-500 text-sm">Local verified dealers place competitive bids for your business.</p>
                 </div>
                 <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-inner">3</div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Get Best Price</h3>
                    <p className="text-slate-500 text-sm">Choose the best offer and close the deal securely.</p>
                 </div>
              </div>
            </div>
        )}

        {/* DASHBOARD / MARKETPLACE VIEW */}
        {view !== 'landing' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {view === 'create_request' ? 'New Request' : (user?.role === UserRole.SELLER ? 'Marketplace' : 'Live Requests')}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  {view === 'create_request' ? (
                     <span>Let AI help you define what you need</span>
                  ) : (
                    <>
                       <span className="hidden sm:inline">Showing deals in</span>
                       <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg border border-slate-200">
                          <MapPinIcon className="w-3 h-3 text-rose-500" />
                          <select 
                              value={currentCity}
                              onChange={(e) => setCurrentCity(e.target.value)}
                              disabled={user?.role === UserRole.SELLER}
                              className="bg-transparent border-none text-slate-900 font-bold cursor-pointer outline-none text-sm disabled:cursor-not-allowed"
                          >
                                {Object.keys(CITY_VENDORS).map(city => (
                                  <option key={city} value={city}>{city}</option>
                              ))}
                          </select>
                       </div>
                    </>
                  )}
                </div>
              </div>

              {view === 'dashboard' && (user?.role === UserRole.BUYER || !user) && (
                <button 
                  onClick={() => user ? setView('create_request') : openAuth(UserRole.BUYER)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  New Request
                </button>
              )}
            </div>

            {/* Content Switcher */}
            {view === 'create_request' ? (
              <div>
                <button 
                  onClick={() => setView('dashboard')}
                  className="mb-4 text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  ← Back to Dashboard
                </button>
                <RequestForm 
                  onSubmit={handlePostRequest} 
                  onCancel={() => setView('dashboard')} 
                />
              </div>
            ) : (
               <>
                 {/* Seller Stats if Seller */}
                 {user?.role === UserRole.SELLER && (
                    <SellerDashboard sellerName={user.vendorName!} requests={requests} />
                 )}

                 {/* Filters */}
                 <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
                   {CATEGORIES.map(cat => (
                     <button
                       key={cat}
                       onClick={() => setCurrentCategory(cat)}
                       className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                         currentCategory === cat 
                           ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                           : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                 </div>

                 {/* Request Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredRequests.length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                           <SearchIcon className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">No requests found</p>
                        <p className="text-slate-400 text-sm">Try changing filters or location</p>
                      </div>
                   ) : (
                     filteredRequests.map(req => (
                       <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                         {req.status === RequestStatus.CLOSED && (
                           <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                             DEAL CLOSED
                           </div>
                         )}
                         
                         <div className="flex justify-between items-start mb-4">
                           <span className="inline-block px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200">
                             {req.category}
                           </span>
                           <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                             <ClockIcon className="w-3 h-3" />
                             {Math.floor((Date.now() - req.createdAt) / 60000)}m ago
                           </span>
                         </div>

                         <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-2 min-h-[3.5rem]" title={req.title}>
                           {req.title}
                         </h3>

                         <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(req.specs).slice(0, 3).map(([k, v]) => (
                              <span key={k} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100 font-medium">
                                {String(v)}
                              </span>
                            ))}
                            {Object.keys(req.specs).length > 3 && (
                              <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-1 rounded border border-slate-100 font-bold">
                                +{Object.keys(req.specs).length - 3}
                              </span>
                            )}
                         </div>

                         <div className="bg-slate-50 rounded-xl p-3 mb-4 flex justify-between items-center border border-slate-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Market Price</p>
                              <p className="text-sm font-bold text-slate-700">₹{req.estimatedMarketPrice.min.toLocaleString()} - {req.estimatedMarketPrice.max.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Bids</p>
                              <p className="text-lg font-extrabold text-rose-600">{req.bids.length}</p>
                            </div>
                         </div>
                         
                         {/* Action Buttons based on Role */}
                         {user?.role === UserRole.SELLER ? (
                            <button 
                              onClick={() => { setSelectedRequest(req); setIsBidding(true); }}
                              disabled={req.status !== RequestStatus.OPEN || req.bids.some(b => b.sellerName === user.vendorName)}
                              className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                              {req.bids.some(b => b.sellerName === user.vendorName) ? (
                                <>
                                  <CheckCircleIcon className="w-4 h-4" /> Bid Placed
                                </>
                              ) : req.status === RequestStatus.CLOSED ? (
                                'Offer Closed'
                              ) : (
                                'Place Bid'
                              )}
                            </button>
                         ) : (
                            <div className="space-y-2">
                               {req.bids.length > 0 ? (
                                 <div className="space-y-2">
                                   <p className="text-xs font-bold text-slate-500 uppercase">Offers ({req.bids.length})</p>
                                   {req.bids.sort((a,b) => a.amount - b.amount).map((bid, idx) => (
                                     <div key={bid.id} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 bg-white hover:border-rose-200 transition-colors">
                                        <div className="flex-1 min-w-0 mr-2">
                                          <p className="font-bold text-slate-900 text-sm truncate">{bid.sellerName}</p>
                                          <p className="text-[10px] text-slate-500">{bid.deliveryDays} Day Delivery</p>
                                        </div>
                                        <div className="text-right">
                                           <p className="font-bold text-slate-900 text-sm">₹{bid.amount}</p>
                                           {user?.role === UserRole.BUYER && req.status === RequestStatus.OPEN && (
                                              <button 
                                                onClick={() => handleAcceptBid(req, bid)}
                                                className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded mt-1 font-bold hover:bg-emerald-600 transition-colors"
                                              >
                                                Accept
                                              </button>
                                           )}
                                        </div>
                                     </div>
                                   ))}
                                 </div>
                               ) : (
                                 <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-bold">Waiting for sellers...</p>
                                 </div>
                               )}
                               
                               {req.status === RequestStatus.CLOSED && req.winningBidId && (
                                  <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <CheckCircleIcon className="w-4 h-4" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-emerald-800 uppercase">Deal Closed</p>
                                        <p className="text-xs text-emerald-600">Won by {req.bids.find(b => b.id === req.winningBidId)?.sellerName}</p>
                                     </div>
                                  </div>
                               )}
                            </div>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               </>
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">M</div>
              <span className="font-bold text-lg">My Deal 24</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Empowering buyers with the best local prices through competitive reverse bidding.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-rose-400 transition-colors text-left">How it Works</button></li>
              <li><button className="hover:text-rose-400 transition-colors text-left">Browse Deals</button></li>
              <li><button className="hover:text-rose-400 transition-colors text-left">For Sellers</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-rose-400 transition-colors text-left">Help Center</button></li>
              <li><button className="hover:text-rose-400 transition-colors text-left">Safety Guidelines</button></li>
              <li><button className="hover:text-rose-400 transition-colors text-left">Contact Us</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-rose-400 transition-colors text-left">Terms of Service</button></li>
              <li><button className="hover:text-rose-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button className="hover:text-rose-400 transition-colors text-left">Cookie Policy</button></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} My Deal 24. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin}
          initialRole={authInitialRole}
          cityVendors={CITY_VENDORS}
        />
      )}

      {selectedRequest && isBidding && user?.role === UserRole.SELLER && (
        <BidModal 
          request={selectedRequest}
          sellerName={user.vendorName!}
          onClose={() => { setSelectedRequest(null); setIsBidding(false); }}
          onSubmit={handlePlaceBid}
        />
      )}

      {selectedRequest && activeBidToPay && user?.role === UserRole.BUYER && (
        <PaymentModal
          request={selectedRequest}
          bid={activeBidToPay}
          onClose={() => { setSelectedRequest(null); setActiveBidToPay(null); }}
          onConfirm={handlePaymentComplete}
        />
      )}
    </div>
  );
}

export default App;
