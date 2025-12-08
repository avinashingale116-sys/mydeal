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

const CATEGORIES = ['All', 'AC', 'Fridge', 'TV', 'Mobile', 'Washing Machine', 'Tyres'];

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
                The smartest way to buy Home Appliances & Tyres.
              </h2>
              <p className="text-lg text-slate-600 font-medium mb-10 text-center max-w-2xl leading-relaxed">
                Stop overpaying for appliances. Post your requirement and let local sellers compete to give you the best price within 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom-8 duration-1000 delay-150">
              <button 
                onClick={() => openAuth(UserRole.BUYER)}
                className="group relative px-8 py-4 bg-slate-900 text-white font-bold rounded-full text-lg shadow-xl shadow-rose-900/20 overflow-hidden hover:scale-105 transition-transform"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
                <span className="relative flex items-center gap-2">
                  Start Saving Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
              <button onClick={() => openAuth(UserRole.SELLER)} className="text-sm font-bold text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4">
                Are you a Seller? Join here
              </button>
              </div>
            </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {user?.role === UserRole.SELLER ? (
               <SellerDashboard sellerName={user.vendorName!} requests={requests} />
            ) : (
               // Buyer & Public Dashboard Logic
               <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-900">
                        {user ? 'Your Requests' : 'Live Deals'}
                      </h2>
                      <p className="text-slate-500">
                        {user ? 'Manage your product requirements and check bids.' : `Browse active requests in ${currentCity}.`}
                      </p>
                    </div>
                    
                    {/* Only show Create Request if user is logged in as Buyer */}
                    {user && (
                        <button 
                          onClick={() => setView('create_request')}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-300 transition-all hover:scale-105"
                        >
                          <PlusIcon className="w-5 h-5" />
                          New Request
                        </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCurrentCategory(cat)}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${
                          currentCategory === cat 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Empty State */}
                  {filteredRequests.length === 0 && (
                     <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SearchIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">No requests found</h3>
                        <p className="text-slate-500 mb-6">Try changing filters or location</p>
                        {user && (
                          <button 
                            onClick={() => setView('create_request')}
                            className="text-rose-600 font-bold hover:underline"
                          >
                            Post a new requirement
                          </button>
                        )}
                     </div>
                  )}

                  {/* Request Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map(req => {
                      const lowestBid = req.bids.length > 0 ? Math.min(...req.bids.map(b => b.amount)) : null;
                      
                      return (
                        <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full group">
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                               <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 group-hover:bg-slate-200 transition-colors">
                                 {req.category}
                               </span>
                               <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${req.status === RequestStatus.OPEN ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                 {req.status}
                               </span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors">
                              {req.title}
                            </h3>
                            
                            {/* Specs Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                               {Object.entries(req.specs).slice(0, 3).map(([k, v]) => (
                                 <span key={k} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-semibold text-slate-500 truncate max-w-[120px]">
                                   {String(v)}
                                 </span>
                               ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100">
                               <div className="flex justify-between items-end">
                                  <div>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Market Estimate</p>
                                     <p className="text-sm font-bold text-slate-500 line-through decoration-rose-500/50">₹{req.estimatedMarketPrice.max.toLocaleString('en-IN')}</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Best Offer</p>
                                     {lowestBid ? (
                                        <p className="text-xl font-extrabold text-emerald-600">₹{lowestBid.toLocaleString('en-IN')}</p>
                                     ) : (
                                        <p className="text-sm font-bold text-slate-400 italic">No bids yet</p>
                                     )}
                                  </div>
                               </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                             <div className="flex items-center gap-1.5 text-slate-400">
                                <ClockIcon className="w-4 h-4" />
                                <span className="text-xs font-bold">24h left</span>
                             </div>
                             
                             {user?.role === UserRole.BUYER ? (
                               <button 
                                 className="text-sm font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                                 onClick={() => {
                                    // For simplicity in this demo, just expand to show bids could go here
                                    // But we will use the same BidModal/PaymentModal structure if we had a detailed view.
                                    // For now, let's just show a simple text if it's their request
                                    if(req.bids.length > 0) {
                                      // Auto select first bid to demonstrate acceptance flow in this simple view
                                      handleAcceptBid(req, req.bids[0]); 
                                    }
                                 }}
                               >
                                 {req.bids.length} Bids <ChevronDownIcon className="w-3 h-3" />
                               </button>
                             ) : (
                               <button 
                                 onClick={() => {
                                   if (!user) {
                                     openAuth(UserRole.SELLER);
                                   } else {
                                     setSelectedRequest(req);
                                     setIsBidding(true);
                                   }
                                 }}
                                 disabled={req.status !== RequestStatus.OPEN}
                                 className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
                               >
                                 {req.status === RequestStatus.OPEN ? (user ? 'Place Bid' : 'Login to Bid') : 'Closed'}
                               </button>
                             )}
                          </div>
                          
                          {/* Expanded Bids Section for Owner (Simplified for Demo) */}
                          {user?.id === req.userId && req.bids.length > 0 && (
                            <div className="bg-slate-100/50 p-4 border-t border-slate-200 space-y-3">
                               <p className="text-[10px] uppercase font-bold text-slate-400">Received Bids</p>
                               {req.bids.map(bid => (
                                 <div key={bid.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                    <div>
                                       <p className="font-bold text-slate-900 text-sm">{bid.sellerName}</p>
                                       <p className="text-xs text-slate-500">{bid.deliveryDays} Day Delivery</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="font-bold text-emerald-600">₹{bid.amount}</span>
                                       {req.status === RequestStatus.OPEN && (
                                         <button 
                                           onClick={() => handleAcceptBid(req, bid)}
                                           className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors"
                                           title="Accept Offer"
                                         >
                                            <CheckCircleIcon className="w-4 h-4" />
                                         </button>
                                       )}
                                    </div>
                                 </div>
                               ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
               </div>
            )}
          </div>
        )}

        {/* CREATE REQUEST VIEW */}
        {view === 'create_request' && (
          <RequestForm 
            onSubmit={handlePostRequest} 
            onCancel={() => setView('dashboard')} 
          />
        )}
      </main>

      {/* MODALS */}
      {showAuthModal && (
        <AuthModal 
          initialRole={authInitialRole}
          cityVendors={CITY_VENDORS}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {selectedRequest && isBidding && (
        <BidModal 
          request={selectedRequest}
          sellerName={user?.vendorName || 'Unknown Seller'}
          onClose={() => { setIsBidding(false); setSelectedRequest(null); }}
          onSubmit={handlePlaceBid}
        />
      )}

      {selectedRequest && activeBidToPay && (
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