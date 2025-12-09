import React, { useState } from 'react';
import { analyzeRequirement } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { SparklesIcon, CheckCircleIcon, SearchIcon, TagIcon, XMarkIcon, PlayCircleIcon, BanknotesIcon } from './Icons';

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
  'Samsung': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
  'LG': 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg',
  'Sony': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
  'Voltas': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Voltas_Limited_Logo.svg',
  'Daikin': 'https://upload.wikimedia.org/wikipedia/commons/0/02/Daikin_logo.svg',
  'Hitachi': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Hitachi_logo.svg',
  'Whirlpool': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Whirlpool_Corporation_Logo.svg',
  'Haier': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Haier_logo.svg',
  'Panasonic': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Panasonic_logo_%28Blue%29.svg',
  'Bosch': 'https://upload.wikimedia.org/wikipedia/commons/1/16/Bosch-Logo.svg',
  'Xiaomi': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg',
  'OnePlus': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/OnePlus_logo.svg',
  'Vivo': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Vivo_mobile_logo.png',
  'Oppo': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo.svg',
  'Realme': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Realme_logo.svg',
  'Motorola': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Motorola_Consumer_Electronics_logo.svg',
  'MRF': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/MRF_Logo.svg',
  'CEAT': 'https://upload.wikimedia.org/wikipedia/commons/1/13/CEAT_logo.svg',
  'Michelin': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Michelin_logo.svg',
  'Bridgestone': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bridgestone_logo.svg',
  'Carrier': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Carrier_Corporation_logo.svg',
  'Blue Star': 'https://upload.wikimedia.org/wikipedia/en/5/52/Blue_Star_logo.svg',
  'Godrej': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Godrej_Logo.svg',
  'Apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'Google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'Apollo': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Apollo_Tyres_Logo.svg',
  'JK Tyre': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/JK_Tyre_Logo.svg',
  'Goodyear': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Goodyear_logo.svg',
  'Continental': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Continental_logo.svg',
  'Yokohama': 'https://upload.wikimedia.org/wikipedia/commons/5/58/Yokohama_Rubber_Company_logo.svg',
  'O General': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Fujitsu_General_logo.svg',
  'Lloyd': 'https://upload.wikimedia.org/wikipedia/en/e/e9/Lloyd_Logo.svg',
  'Hisense': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Hisense_logo.svg',
  'Liebherr': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Liebherr_logo.svg',
  'TCL': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/TCL_Technology_logo.svg',
  'Vu': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Vu_Televisions_Logo.png',
  'Acer': 'https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg',
  'Toshiba': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Toshiba_logo.svg',
  'Nothing': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Nothing_Technology_logo.svg',
  'IFB': 'https://upload.wikimedia.org/wikipedia/en/7/73/IFB_Industries_Logo.svg',
  'Siemens': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Siemens_AG_logo.svg'
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
  const [description, setDescription] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
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
    setInput(`${brand} `);
  };

  const handleConfirm = () => {
    if (analysis) {
      onSubmit({ 
        ...analysis, 
        description: description || `Looking for best price for ${analysis.title}` 
      });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ring-1 ring-slate-900/5">
       <div className="h-2 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 w-full" />
       
      <div className="p-8 md:p-10">
        
        {/* Header - Only show in search mode */}
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
          
          {/* Category Tabs */}
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

          {/* Manufacturers Grid */}
          <div className="mb-10 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <TagIcon className="w-4 h-4" />
                </div>
                <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">Select Brand</p>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {MANUFACTURERS[selectedCategory]?.map((brand) => {
                  const domain = BRAND_DOMAINS[brand];
                  const logoUrl = BRAND_LOGO_OVERRIDES[brand] || (domain ? `https://logo.clearbit.com/${domain}?size=120&format=png` : null);
                  const isSelected = selectedBrand === brand || input.startsWith(brand);
                  
                  return (
                    <button
                        key={brand}
                        onClick={() => handleBrandClick(brand)}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 h-32 ${
                            isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-105 ring-2 ring-indigo-200 z-10'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-1'
                        }`}
                    >
                        <div className={`w-full flex-1 flex items-center justify-center p-2 rounded-xl transition-colors bg-white ${isSelected ? 'opacity-100' : ''}`}>
                           {logoUrl ? (
                             <img 
                                src={logoUrl} 
                                alt={brand} 
                                className="max-w-full max-h-16 object-contain filter transition-all duration-300 group-hover:scale-110" 
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} 
                             />
                           ) : null}
                           <span className={`${logoUrl ? 'hidden' : ''} text-2xl font-black text-slate-300`}>{brand.charAt(0)}</span>
                        </div>
                        
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse shadow-sm" />
                        )}
                        <span className={`text-xs font-black uppercase tracking-wide mt-3 ${isSelected ? 'text-white' : 'text-slate-700'}`}>{brand}</span>
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

          {/* Dynamic Models Grid */}
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
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">{isAnalyzing ? 'Analyzing...' : 'Find Specs'}</span>
              {!isAnalyzing && <SparklesIcon className="w-5 h-5 relative z-10 text-indigo-300 group-hover:text-white" />}
            </button>
          </div>
        </div>

        {/* Step 2: Analysis Result */}
        {analysis && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  <CheckCircleIcon className="w-8 h-8" />
               </div>
               <h2 className="text-2xl font-black text-slate-900">Is this what you're looking for?</h2>
               <p className="text-slate-500">We found the specifications for your product.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6">
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                     <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full mb-3 shadow-md shadow-slate-900/10">
                        {analysis.category}
                     </span>
                     <h3 className="text-xl font-bold text-slate-900 leading-tight mb-4">
                        {analysis.title}
                     </h3>
                     
                     <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {Object.entries(analysis.specs).map(([key, value]) => (
                           <div key={key}>
                              <p className="text-[10px] uppercase font-bold text-slate-400">{key.replace(/_/g, ' ')}</p>
                              <p className="text-sm font-semibold text-slate-700">{String(value)}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="md:w-72 flex flex-col gap-4">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <BanknotesIcon className="w-4 h-4 text-rose-500" />
                           <p className="text-xs font-bold text-slate-500 uppercase">Est. Market Price</p>
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                           ₹{analysis.estimatedMarketPrice.min.toLocaleString()} - ₹{analysis.estimatedMarketPrice.max.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Online Average</p>
                     </div>

                     <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(analysis.youtubeSearchQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 transition-colors group"
                     >
                        <PlayCircleIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <div>
                           <p className="font-bold text-sm">Watch Reviews</p>
                           <p className="text-xs opacity-70">On YouTube</p>
                        </div>
                     </a>
                  </div>
               </div>
            </div>

            <div className="mb-8">
               <label className="block text-sm font-bold text-slate-700 mb-2">Add Specific Requirements (Optional)</label>
               <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., I need installation included, old exchange available, delivery within 24 hours..."
                  className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-700 min-h-[100px]"
               />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
               <button
                  onClick={() => setAnalysis(null)}
                  className="text-slate-400 font-bold hover:text-slate-600 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
               >
                  Back to Search
               </button>
               <button
                  onClick={handleConfirm}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
               >
                  <CheckCircleIcon className="w-5 h-5" />
                  Post Requirement
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForm;