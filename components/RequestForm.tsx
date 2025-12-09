import React, { useState } from 'react';
import { analyzeRequirement } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { SparklesIcon, CheckCircleIcon, SearchIcon, CloudArrowDownIcon, TagIcon, XMarkIcon, PlayCircleIcon } from './Icons';

interface RequestFormProps {
  onSubmit: (data: AIAnalysisResult & { description: string }) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { id: 'AC', label: 'AC', icon: '❄️' },
  { id: 'Fridge', label: 'Fridge', icon: '🧊' },
  { id: 'TV', label: 'TV', icon: '📺' },
  { id: 'Mobile', label: 'Mobile', icon: '📱' },
  { id: 'Washing Machine', label: 'Washing Machine', icon: '🧺' },
  { id: 'Tyres', label: 'Car Tyres', icon: '🚗' }
];

const MANUFACTURERS: Record<string, string[]> = {
  'AC': ['LG', 'Voltas', 'Samsung', 'Daikin', 'Blue Star', 'Lloyd', 'Hitachi', 'Panasonic', 'Carrier', 'O General'],
  'Fridge': ['Samsung', 'LG', 'Whirlpool', 'Haier', 'Godrej', 'Bosch', 'Panasonic', 'Hisense', 'Liebherr'],
  'TV': ['Sony', 'Samsung', 'LG', 'Xiaomi', 'OnePlus', 'TCL', 'Vu', 'Acer', 'Toshiba', 'Hisense'],
  'Mobile': ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Nothing', 'Motorola'],
  'Washing Machine': ['LG', 'Samsung', 'Bosch', 'Whirlpool', 'IFB', 'Godrej', 'Panasonic', 'Haier', 'Siemens'],
  'Tyres': ['MRF', 'Apollo', 'Michelin', 'Bridgestone', 'CEAT', 'JK Tyre', 'Goodyear', 'Yokohama', 'Continental']
};

const BRAND_DOMAINS: Record<string, string> = {
  'LG': 'lg.com',
  'Voltas': 'voltas.com',
  'Samsung': 'samsung.com',
  'Daikin': 'daikin.com',
  'Blue Star': 'bluestarindia.com',
  'Lloyd': 'havells.com',
  'Hitachi': 'hitachi.com',
  'Panasonic': 'panasonic.com',
  'Carrier': 'carrier.com',
  'O General': 'fujitsu-general.com',
  'Whirlpool': 'whirlpool.com',
  'Haier': 'haier.com',
  'Godrej': 'godrej.com',
  'Bosch': 'bosch.com',
  'Hisense': 'hisense.com',
  'Liebherr': 'liebherr.com',
  'Sony': 'sony.com',
  'Xiaomi': 'mi.com',
  'OnePlus': 'oneplus.com',
  'TCL': 'tcl.com',
  'Vu': 'vutvs.com',
  'Acer': 'acer.com',
  'Toshiba': 'toshiba.com',
  'Apple': 'apple.com',
  'Google': 'store.google.com',
  'Vivo': 'vivo.com',
  'Oppo': 'oppo.com',
  'Realme': 'realme.com',
  'Nothing': 'nothing.tech',
  'Motorola': 'motorola.com',
  'IFB': 'ifbappliances.com',
  'Siemens': 'siemens.com',
  'MRF': 'mrftyres.com',
  'Apollo': 'apollotyres.com',
  'Michelin': 'michelin.com',
  'Bridgestone': 'bridgestone.com',
  'CEAT': 'ceat.com',
  'JK Tyre': 'jktyre.com',
  'Goodyear': 'goodyear.com',
  'Yokohama': 'y-yokohama.com',
  'Continental': 'continental.com'
};

const BRAND_LOGO_OVERRIDES: Record<string, string> = {
  'Samsung': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
  'LG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png',
  'Sony': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png',
  'Voltas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Voltas_Limited_Logo.svg/1200px-Voltas_Limited_Logo.svg.png',
  'Daikin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Daikin_logo.svg/2560px-Daikin_logo.svg.png',
  'Hitachi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Hitachi_logo.svg/2560px-Hitachi_logo.svg.png',
  'Whirlpool': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Whirlpool_Corporation_Logo.svg/2560px-Whirlpool_Corporation_Logo.svg.png',
  'Haier': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Haier_logo.svg/2560px-Haier_logo.svg.png',
  'Panasonic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Panasonic_logo_%28Blue%29.svg/2560px-Panasonic_logo_%28Blue%29.svg.png',
  'Bosch': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-Logo.svg/2560px-Bosch-Logo.svg.png',
  'Xiaomi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Xiaomi_logo.svg/1024px-Xiaomi_logo.svg.png',
  'OnePlus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/OnePlus_logo.svg/2560px-OnePlus_logo.svg.png',
  'Vivo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vivo_mobile_logo.png/2560px-Vivo_mobile_logo.png',
  'Oppo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/OPPO_Logo.svg/2560px-OPPO_Logo.svg.png',
  'Realme': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Realme_logo.svg/2560px-Realme_logo.svg.png',
  'Motorola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Motorola_Consumer_Electronics_logo.svg/2560px-Motorola_Consumer_Electronics_logo.svg.png',
  'MRF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/MRF_Logo.svg/2560px-MRF_Logo.svg.png',
  'CEAT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/CEAT_logo.svg/2560px-CEAT_logo.svg.png',
  'Michelin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Michelin_logo.svg/2560px-Michelin_logo.svg.png',
  'Bridgestone': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bridgestone_logo.svg/2560px-Bridgestone_logo.svg.png',
  'Carrier': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Carrier_Corporation_logo.svg/2560px-Carrier_Corporation_logo.svg.png',
  'Blue Star': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Blue_Star_logo.svg/1200px-Blue_Star_logo.svg.png',
  'Godrej': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Godrej_Logo.svg/2560px-Godrej_Logo.svg.png',
  'Apple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png',
  'Google': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
  'Apollo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Apollo_Tyres_Logo.svg/2560px-Apollo_Tyres_Logo.svg.png',
  'JK Tyre': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/JK_Tyre_Logo.svg/1200px-JK_Tyre_Logo.svg.png',
  'Goodyear': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Goodyear_logo.svg/2560px-Goodyear_logo.svg.png',
  'Continental': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Continental_logo.svg/2560px-Continental_logo.svg.png',
  'Yokohama': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Yokohama_Rubber_Company_logo.svg/2560px-Yokohama_Rubber_Company_logo.svg.png'
};

const BRAND_MODELS: Record<string, Record<string, string[]>> = {
  'AC': {
    'LG': ['1.5 Ton 5 Star AI DUAL Inverter Split AC', '1.5 Ton 3 Star DUAL Inverter Split AC', '1 Ton 5 Star AI DUAL Inverter Split AC', '2 Ton 3 Star AI DUAL Inverter Split AC'],
    'Voltas': ['1.5 Ton 3 Star Inverter Split AC', '1.5 Ton 5 Star Inverter Split AC', '1.4 Ton 3 Star Inverter Split AC', '1 Ton 3 Star Inverter Split AC'],
    'Samsung': ['1.5 Ton 5 Star WindFree Technology Split AC', '1.5 Ton 3 Star Inverter Split AC', '1 Ton 3 Star Inverter Split AC'],
    'Daikin': ['1.5 Ton 5 Star Inverter Split AC', '1.5 Ton 3 Star Inverter Split AC', '0.8 Ton 3 Star Fixed Speed Split AC'],
    'Blue Star': ['1.5 Ton 3 Star Inverter Split AC', '1.5 Ton 5 Star Inverter Split AC', '0.8 Ton 3 Star Inverter Split AC'],
    'Lloyd': ['1.5 Ton 3 Star Inverter Split AC', '1.5 Ton 5 Star Inverter Split AC'],
    'Panasonic': ['1.5 Ton 5 Star Wi-Fi Inverter Smart Split AC', '1.5 Ton 3 Star Inverter Split AC'],
    'Carrier': ['1.5 Ton 3 Star AI Flexicool Inverter Split AC', '1.5 Ton 5 Star AI Flexicool Inverter Split AC'],
    'Hitachi': ['1.5 Ton 5 Star Inverter Split AC', '1.5 Ton 3 Star Inverter Split AC']
  },
  'Fridge': {
    'Samsung': ['253L 3 Star Inverter Double Door', '192L 2 Star Direct Cool Single Door', '653L 3 Star Side-by-Side', '324L 3 Star Convertible 5-in-1'],
    'LG': ['260L 3 Star Smart Inverter Double Door', '190L 4 Star Smart Inverter Single Door', '688L Frost Free Side-by-Side', '242L 3 Star Smart Inverter'],
    'Whirlpool': ['265L 3 Star Inverter Double Door', '184L 2 Star Direct Cool Single Door', '240L Frost Free Triple Door'],
    'Haier': ['258L 3 Star Inverter Double Door', '190L 2 Star Direct Cool Single Door', '630L Side-by-Side'],
    'Godrej': ['236L 2 Star Inverter Frost Free Double Door', '180L 3 Star Direct Cool Single Door']
  },
  'TV': {
    'Sony': ['Bravia 55 inch 4K Ultra HD Smart LED Google TV', 'Bravia 43 inch 4K Ultra HD Smart LED Google TV', 'Bravia 65 inch XR Series 4K Ultra HD'],
    'Samsung': ['43 inch Crystal 4K Neo Series Ultra HD Smart LED', '55 inch QLED 4K Smart TV', '32 inch HD Ready Smart LED TV'],
    'LG': ['55 inch 4K Ultra HD Smart LED TV', '43 inch 4K Ultra HD Smart LED TV', '65 inch OLED Evo 4K Smart TV'],
    'Xiaomi': ['55 inch X Series 4K Ultra HD Smart Android TV', '43 inch X Series 4K Ultra HD Smart Android TV', '32 inch 5A Series HD Ready Smart Android TV'],
    'OnePlus': ['55 inch U Series 4K LED Smart Android TV', '43 inch Y Series 4K Ultra HD Smart Android TV']
  },
  'Mobile': {
    'Apple': ['iPhone 15 128GB', 'iPhone 15 Pro 128GB', 'iPhone 14 128GB', 'iPhone 13 128GB', 'iPhone 15 Plus 128GB'],
    'Samsung': ['Galaxy S24 Ultra 5G', 'Galaxy S24 5G', 'Galaxy A55 5G', 'Galaxy M34 5G', 'Galaxy Z Fold5'],
    'OnePlus': ['OnePlus 12 5G', 'OnePlus 12R 5G', 'OnePlus Nord CE 4 5G', 'OnePlus Nord 3 5G'],
    'Xiaomi': ['Redmi Note 13 Pro+ 5G', 'Redmi Note 13 5G', 'Xiaomi 14 Ultra', 'Xiaomi 14'],
    'Realme': ['Realme 12 Pro+ 5G', 'Realme 12x 5G', 'Realme Narzo 70 Pro 5G']
  },
  'Washing Machine': {
    'LG': ['7 Kg 5 Star Inverter Front Load', '7 Kg 5 Star Top Load', '8 Kg 5 Star Front Load', '6.5 Kg 5 Star Top Load'],
    'Samsung': ['7 Kg 5 Star Inverter Top Load', '8 Kg 5 Star AI Control Front Load', '6.5 Kg Top Load', '9 Kg 5 Star Front Load'],
    'Bosch': ['7 kg 5 Star Inverter Front Load', '8 kg 5 Star Inverter Front Load', '6 kg 5 Star Inverter Front Load'],
    'Whirlpool': ['7 Kg 5 Star Royal Plus Top Load', '7.5 Kg 5 Star Stainwash Pro Top Load', '6 Kg 5 Star Royal Top Load'],
    'IFB': ['6 Kg 5 Star Diva Aqua SX Front Load', '7 Kg 5 Star Front Load', '6.5 Kg Top Load']
  },
  'Tyres': {
    'MRF': ['ZVTV 185/65 R15', 'ZLX 145/80 R12', 'Wanderer 215/75 R15', 'ZVTS 165/80 R14'],
    'Apollo': ['Alnac 4G 195/55 R16', 'Amazer 4G Life 165/80 R14', 'Apterra AT2 235/65 R17', 'Amazer 3G Maxx 145/80 R12'],
    'Michelin': ['Primacy 4ST 195/65 R15', 'Pilot Sport 4 225/45 R17', 'LTX Force 235/70 R16', 'Energy XM2+ 185/65 R15'],
    'Bridgestone': ['Sturdo 195/65 R15', 'B290 155/80 R13', 'Ecopia EP150 185/60 R15'],
    'CEAT': ['Milaze X3 165/80 R14', 'SecuraDrive 195/55 R16', 'Czar HP 215/60 R16']
  }
};

const POPULAR_MODELS: Record<string, Array<{ name: string, subtitle: string }>> = {
  'AC': [
    { name: 'LG 1.5 Ton 5 Star AI DUAL Inverter', subtitle: 'Super Convertible 6-in-1, Copper, White' },
    { name: 'Voltas 1.5 Ton 3 Star Inverter', subtitle: 'Copper Condenser, Adjustable Cooling' },
    { name: 'Samsung 1.5 Ton WindFree', subtitle: '5 Star, Wi-Fi Enabled, Inverter Split AC' },
    { name: 'Daikin 1.5 Ton 5 Star Inverter', subtitle: 'PM 2.5 Filter, 3D Airflow, Copper' }
  ],
  'Fridge': [
    { name: 'Samsung 253L 3 Star Inverter', subtitle: 'Double Door, Convertible, Elegant Inox' },
    { name: 'LG 260L 3 Star Smart Inverter', subtitle: 'Frost-Free Double Door, Shiny Steel' },
    { name: 'Whirlpool 265L 3 Star Inverter', subtitle: 'Convertible 5-in-1, Double Door' },
    { name: 'Haier 258L 3 Star Inverter', subtitle: 'Double Door, Convertible, Black Steel' }
  ],
  'TV': [
    { name: 'Sony Bravia 55 inch 4K Ultra HD', subtitle: 'Smart LED Google TV, KD-55X74L' },
    { name: 'Samsung 43 inch Crystal 4K Neo', subtitle: 'Ultra HD Smart LED TV, UA43AUE65AKXXL' },
    { name: 'LG 55 inch 4K Ultra HD Smart LED', subtitle: 'WebOS, 4K Upscaler, AI Sound' },
    { name: 'Mi X Series 50 inch 4K Ultra HD', subtitle: 'Smart Android TV, Dolby Vision' }
  ],
  'Mobile': [
    { name: 'iPhone 15 (128 GB)', subtitle: 'Dynamic Island, 48MP Main Camera' },
    { name: 'Samsung Galaxy S24 Ultra 5G', subtitle: 'AI Features, 200MP Camera, S-Pen' },
    { name: 'OnePlus 12', subtitle: '16GB RAM, 512GB, Snapdragon 8 Gen 3' },
    { name: 'Google Pixel 8 Pro', subtitle: 'Advanced AI, Best-in-class Camera' }
  ],
  'Washing Machine': [
    { name: 'LG 7 Kg 5 Star Inverter', subtitle: 'Front Load, Touch Control, Hygiene Steam' },
    { name: 'Samsung 7 Kg 5 Star Inverter', subtitle: 'Top Load, Eco Bubble Technology' },
    { name: 'Bosch 7 kg 5 Star Inverter', subtitle: 'Front Load, Anti-Tangle, Heater' },
    { name: 'Whirlpool 7 Kg 5 Star Royal', subtitle: 'Top Load, Hard Water Wash' }
  ],
  'Tyres': [
    { name: 'MRF ZVTV 185/65 R15', subtitle: 'Tubeless, Optimized for Comfort' },
    { name: 'Apollo Alnac 4G 195/55 R16', subtitle: 'High Durability, Superior Grip' },
    { name: 'Michelin Primacy 4ST', subtitle: 'Premium Touring, Silence & Comfort' },
    { name: 'Bridgestone Sturdo', subtitle: 'Long Life, Durability' }
  ]
};

// Specific model examples to guide the user
const PLACEHOLDERS: Record<string, string> = {
  'AC': 'e.g., LG 1.5 Ton 5 Star AI Convertible 6-in-1 Split AC...',
  'Fridge': 'e.g., Samsung 236L 3 Star Digital Inverter Frost Free...',
  'TV': 'e.g., Sony Bravia 55 inch 4K Ultra HD Smart LED TV...',
  'Mobile': 'e.g., iPhone 15 Pro Max 256GB Natural Titanium...',
  'Washing Machine': 'e.g., Bosch 7 kg 5 Star Inverter Touch Control Front Loading...',
  'Tyres': 'e.g., MRF ZVTV 185/65 R15 Tubeless Car Tyre...'
};

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState('AC');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    // Explicitly ask for model specs
    const enrichedInput = `Category: ${selectedCategory}. Model/Product Name: ${input}. Fetch detailed specifications.`;
    const result = await analyzeRequirement(enrichedInput);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSuggestionClick = async (modelName: string) => {
    setInput(modelName);
    setIsAnalyzing(true);
    const enrichedInput = `Category: ${selectedCategory}. Model/Product Name: ${modelName}. Fetch detailed specifications.`;
    const result = await analyzeRequirement(enrichedInput);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleBrandClick = (brand: string) => {
    setSelectedBrand(brand);
    // Auto-focus or prepopulate input with brand to encourage user
    setInput(`${brand} `);
  };

  const handleConfirm = () => {
    if (analysis) {
      onSubmit({ ...analysis, description: input });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ring-1 ring-slate-900/5">
       {/* Decorative gradient header bar */}
       <div className="h-2 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 w-full" />
       
      <div className="p-8 md:p-10">
        
        {/* Header */}
        {!analysis && (
          <div className="mb-10 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-rose-500/10 rounded-full blur-2xl -z-10"></div>
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              What are you looking for?
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Select a category and let our AI find the best specs for you.
            </p>
          </div>
        )}

        {/* Step 1: Category Selection & Input */}
        <div className={`transition-all duration-500 ${analysis ? 'hidden' : 'block'}`}>
          
          {/* Category Tabs - Colorful & Modern */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setInput(''); setSelectedBrand(null); }}
                className={`group relative px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-xl shadow-indigo-500/20 scale-105 ring-2 ring-indigo-500/20'
                    : 'bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-100 hover:shadow-lg'
                }`}
              >
                {selectedCategory === cat.id && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600" />
                )}
                <span className="relative z-10 text-lg group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="relative z-10">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Manufacturers Grid with Real Logos */}
          <div className="mb-10 animate-in slide-in-from-bottom-2 duration-500 key={selectedCategory + '-brands'}">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <TagIcon className="w-4 h-4" />
                </div>
                <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">Select Brand</p>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {MANUFACTURERS[selectedCategory]?.map((brand) => {
                  const domain = BRAND_DOMAINS[brand];
                  // Use overrides for better wordmark logos, fallback to Clearbit, then fallback to text
                  const logoUrl = BRAND_LOGO_OVERRIDES[brand] || (domain ? `https://logo.clearbit.com/${domain}?size=120&format=png` : null);
                  const isSelected = selectedBrand === brand || input.startsWith(brand);
                  
                  return (
                    <button
                        key={brand}
                        onClick={() => handleBrandClick(brand)}
                        className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 ${
                            isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-105 ring-2 ring-indigo-200 z-10'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-1'
                        }`}
                    >
                        {/* Logo Container - Clean white background for transparency */}
                        <div className={`w-full h-16 flex items-center justify-center p-3 rounded-xl transition-colors bg-white ${isSelected ? 'opacity-95' : ''}`}>
                           {logoUrl ? (
                             <img 
                                src={logoUrl} 
                                alt={brand} 
                                className="w-full h-full object-contain filter transition-all duration-300 group-hover:brightness-110" 
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} 
                             />
                           ) : null}
                           {/* Fallback text if image fails loading or no domain */}
                           <span className={`${logoUrl ? 'hidden' : ''} text-lg font-bold text-slate-400`}>{brand.charAt(0)}</span>
                        </div>
                        
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse shadow-sm" />
                        )}
                        <span className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{brand}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <label className="block text-sm font-extrabold text-slate-700 mb-3 ml-1">
            Search Product Model
          </label>
          <div className="relative group mb-10">
            <div className="absolute top-1/2 -translate-y-1/2 left-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <SearchIcon className="w-6 h-6" />
            </div>
            <input
              type="text"
              className="w-full pl-14 pr-14 py-5 border-2 border-slate-200/80 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-400 text-lg shadow-inner"
              placeholder={PLACEHOLDERS[selectedCategory]}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            {input && (
                <button 
                  onClick={() => { setInput(''); setSelectedBrand(null); }}
                  className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
            )}
            <div className="absolute -bottom-6 right-2 text-[11px] font-bold flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              <SparklesIcon className="w-3.5 h-3.5 text-fuchsia-500" /> AI-Powered Specification Search
            </div>
          </div>

          {/* Dynamic Models Grid: Shows Brand Specific Models if selected, else Generic Popular Models */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-5">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
                    {selectedBrand ? `${selectedBrand} Models` : `Popular in ${selectedCategory}`}
                  </h3>
               </div>
               {selectedBrand && (
                 <button 
                   onClick={() => setSelectedBrand(null)} 
                   className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors"
                 >
                   Show All Brands
                 </button>
               )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* If Brand selected and we have models, show them. Else fallback to generic popular. */}
              {selectedBrand && BRAND_MODELS[selectedCategory]?.[selectedBrand] ? (
                 BRAND_MODELS[selectedCategory][selectedBrand].map((model, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(`${selectedBrand} ${model}`)}
                      disabled={isAnalyzing}
                      className="text-left p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2 leading-relaxed">{model}</p>
                    </button>
                 ))
              ) : (
                POPULAR_MODELS[selectedCategory]?.map((model, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(model.name)}
                    disabled={isAnalyzing}
                    className="text-left p-5 rounded-2xl border border-slate-100 bg-white hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors line-clamp-1">{model.name}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1 group-hover:text-slate-500">{model.subtitle}</p>
                  </button>
                ))
              )}

              {selectedBrand && !BRAND_MODELS[selectedCategory]?.[selectedBrand] && (
                  <div className="col-span-2 text-center py-8 text-slate-400 text-sm font-medium italic border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    No specific models listed for {selectedBrand}. Please type the model name in the search bar.
                  </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
            <button
              onClick={onCancel}
              className="text-slate-400 font-bold hover:text-slate-600 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="relative overflow-hidden bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_auto] animate-gradient" />
              <div className="relative flex items-center gap-2">
                {isAnalyzing ? (
                    <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Fetching Specs...</span>
                    </>
                ) : (
                    <>
                    <CloudArrowDownIcon className="w-6 h-6" />
                    <span>Fetch Specifications</span>
                    </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Review */}
        {analysis && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Specifications Found</h3>
                <p className="text-slate-500 font-medium mt-1">We retrieved these details for your request</p>
              </div>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wide rounded-full border border-indigo-100 shadow-sm">
                {selectedCategory}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 rounded-[1.5rem] border border-white shadow-lg shadow-slate-200/50 col-span-1 md:col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors"></div>
                <div className="relative z-10">
                    <p className="text-[11px] text-indigo-400 uppercase font-extrabold tracking-wider mb-2">Product Model</p>
                    <p className="font-black text-slate-900 text-xl md:text-2xl pr-8 leading-tight mb-4">{analysis.title}</p>
                    <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(analysis.youtubeSearchQuery)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#FF0000] hover:bg-[#CC0000] px-4 py-2 rounded-full transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5"
                    >
                        <PlayCircleIcon className="w-4 h-4 fill-current" />
                        Watch Video Review
                    </a>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 col-span-1 md:col-span-2">
                <p className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider mb-4 flex items-center gap-2">
                    <TagIcon className="w-3 h-3" /> Key Specifications
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(analysis.specs).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-4 py-2 rounded-xl border border-indigo-50 bg-indigo-50/50 text-sm font-bold text-slate-700 hover:bg-indigo-100 transition-colors">
                      <span className="text-indigo-400 mr-2 uppercase text-[10px] font-extrabold tracking-wide">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      {String(value)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[1.5rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-5 -mb-5"></div>
                <p className="text-[11px] text-emerald-100 uppercase font-extrabold tracking-wider mb-1 relative z-10">Market Price Est.</p>
                <p className="font-black text-2xl md:text-3xl relative z-10">
                  ₹{analysis.estimatedMarketPrice.min.toLocaleString()} - ₹{analysis.estimatedMarketPrice.max.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-[1.5rem] border-2 border-slate-100 flex flex-col justify-center shadow-sm">
                <p className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider mb-1">Suggested Budget</p>
                <p className="font-black text-2xl text-slate-900">₹{analysis.suggestedMaxBudget.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-between items-center pt-4 border-t border-slate-100">
              <button
                onClick={() => setAnalysis(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors px-4 py-2 hover:bg-slate-50 rounded-lg"
              >
                Search Different Model
              </button>
              <button
                onClick={handleConfirm}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Confirm & Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForm;