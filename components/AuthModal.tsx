import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserIcon, StoreIcon, XMarkIcon } from './Icons';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  initialRole: UserRole;
  cityVendors: Record<string, string[]>;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, initialRole, cityVendors }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(initialRole);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState(Object.keys(cityVendors)[0]);
  const [vendorName, setVendorName] = useState('');

  // Handle City Change to reset vendor name
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    if (cityVendors[newCity] && cityVendors[newCity].length > 0) {
      setVendorName(cityVendors[newCity][0]);
    } else {
      setVendorName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate Login/Signup
    const mockUser: User = {
      id: `u-${Date.now()}`,
      name: isLogin ? (role === UserRole.SELLER ? 'Demo Vendor' : 'Demo User') : name,
      email: email,
      role: role,
      city: role === UserRole.SELLER ? city : undefined,
      vendorName: role === UserRole.SELLER ? (isLogin ? cityVendors[city]?.[0] : vendorName) : undefined
    };

    onLogin(mockUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-8 pb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Enter your details to access your account' : 'Join the best marketplace for local deals'}
          </p>
        </div>

        {/* Role Toggles */}
        <div className="px-8 flex gap-3 mb-6">
          <button 
            type="button"
            onClick={() => setRole(UserRole.BUYER)}
            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === UserRole.BUYER ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
          >
            <UserIcon className="w-4 h-4" /> Buyer
          </button>
          <button 
             type="button"
             onClick={() => setRole(UserRole.SELLER)}
             className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === UserRole.SELLER ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
          >
            <StoreIcon className="w-4 h-4" /> Dealer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {!isLogin && (
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
               <input 
                 type="text" 
                 required 
                 value={name} 
                 onChange={e => setName(e.target.value)}
                 className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 outline-none font-medium"
                 placeholder="John Doe"
               />
             </div>
          )}

          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
             <input 
               type="email" 
               required 
               value={email} 
               onChange={e => setEmail(e.target.value)}
               className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 outline-none font-medium"
               placeholder="name@example.com"
             />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Password</label>
             <input 
               type="password" 
               required 
               value={password} 
               onChange={e => setPassword(e.target.value)}
               className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 outline-none font-medium"
               placeholder="••••••••"
             />
          </div>

          {/* Seller Specific Fields */}
          {role === UserRole.SELLER && (
             <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100 animate-in slide-in-from-top-2">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">City</label>
                   <select 
                     value={city} 
                     onChange={handleCityChange}
                     className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none font-medium"
                   >
                     {Object.keys(cityVendors).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Dealer Identity</label>
                   {isLogin ? (
                     <p className="text-xs text-slate-400 italic">Will be auto-detected for demo login.</p>
                   ) : (
                      <select 
                        value={vendorName} 
                        onChange={e => setVendorName(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none font-medium"
                      >
                         <option value="" disabled>Select Vendor</option>
                         {cityVendors[city]?.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                   )}
                </div>
             </div>
          )}

          <button 
             type="submit"
             className={`w-full py-4 rounded-xl font-bold text-white shadow-lg mt-4 transition-all hover:scale-[1.02] active:scale-95 ${role === UserRole.BUYER ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700' : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'}`}
          >
             {isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center pt-2">
             <button 
               type="button" 
               onClick={() => setIsLogin(!isLogin)}
               className="text-sm font-semibold text-slate-400 hover:text-slate-600"
             >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
