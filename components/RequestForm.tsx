import React, { useState } from 'react';
import { analyzeRequirement } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { SparklesIcon, CheckCircleIcon, SearchIcon, CloudArrowDownIcon, TagIcon, XMarkIcon } from './Icons';

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
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8">
        
        {/* Header */}
        {!analysis && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Fetch Product Specs</h2>
            <p className="text-slate-500">Select a category and brand to find your perfect product.</p>
          </div>
        )}

        {/* Step 1: Category Selection & Input */}
        <div className={`transition-all duration-500 ${analysis ? 'hidden' : 'block'}`}>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setInput(''); setSelectedBrand(null); }}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border-2 ${
                  selectedCategory === cat.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-105'
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Manufacturers List */}
          <div className="mb-6 animate-in slide-in-from-bottom-1 duration-500 key={selectedCategory + '-brands'}">
            <div className="flex items-center gap-2 mb-3 ml-1">
                <TagIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Top Brands</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {MANUFACTURERS[selectedCategory]?.map((brand) => (
                <button
                    key={brand}
                    onClick={() => handleBrandClick(brand)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                        selectedBrand === brand || input.startsWith(brand) 
                        ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm ring-2 ring-rose-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800'
                    }`}
                >
                    {brand}
                </button>
                ))}
            </div>
          </div>

          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide ml-1">
            Search Product
          </label>
          <div className="relative group mb-8">
            <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300 text-lg"
              placeholder={PLACEHOLDERS[selectedCategory]}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            {input && (
                <button 
                  onClick={() => { setInput(''); setSelectedBrand(null); }}
                  className="absolute top-1/2 -translate-y-1/2 right-12 text-slate-300 hover:text-slate-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
            )}
            <div className="absolute bottom-[-24px] right-2 text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-rose-500" /> Powered by AI Search
            </div>
          </div>

          {/* Dynamic Models Grid: Shows Brand Specific Models if selected, else Generic Popular Models */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {selectedBrand ? `${selectedBrand} Models` : `Popular in ${selectedCategory}`}
                  </h3>
               </div>
               {selectedBrand && (
                 <button 
                   onClick={() => setSelectedBrand(null)} 
                   className="text-xs font-bold text-slate-400 hover:text-rose-500"
                 >
                   Show All Brands
                 </button>
               )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* If Brand selected and we have models, show them. Else fallback to generic popular. */}
              {selectedBrand && BRAND_MODELS[selectedCategory]?.[selectedBrand] ? (
                 BRAND_MODELS[selectedCategory][selectedBrand].map((model, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(`${selectedBrand} ${model}`)}
                      disabled={isAnalyzing}
                      className="text-left p-4 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-white hover:border-rose-300 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors line-clamp-2">{model}</p>
                    </button>
                 ))
              ) : (
                POPULAR_MODELS[selectedCategory]?.map((model, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(model.name)}
                    disabled={isAnalyzing}
                    className="text-left p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-rose-200 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors line-clamp-1">{model.name}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{model.subtitle}</p>
                  </button>
                ))
              )}

              {selectedBrand && !BRAND_MODELS[selectedCategory]?.[selectedBrand] && (
                  <div className="col-span-2 text-center py-6 text-slate-400 text-sm font-medium italic border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    No specific models listed for {selectedBrand}. Please type the model name in the search bar.
                  </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50">
            <button
              onClick={onCancel}
              className="text-slate-400 font-bold hover:text-slate-600 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-slate-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Fetching Specs...</span>
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="w-5 h-5" />
                  <span>Fetch Specifications</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Review */}
        {analysis && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Specifications Found</h3>
                <p className="text-sm text-slate-500">We retrieved these details for your request</p>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                {selectedCategory}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Product Model</p>
                <p className="font-bold text-slate-900 text-lg">{analysis.title}</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 col-span-1 md:col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Key Specs</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.specs).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-700">
                      <span className="text-slate-400 mr-1.5 uppercase text-[9px] font-bold">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      {String(value)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">Market Price Est.</p>
                <p className="font-extrabold text-emerald-700 text-xl">
                  ₹{analysis.estimatedMarketPrice.min} - ₹{analysis.estimatedMarketPrice.max}
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider mb-1">Suggested Budget</p>
                <p className="font-extrabold text-blue-700 text-xl">₹{analysis.suggestedMaxBudget}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-between items-center">
              <button
                onClick={() => setAnalysis(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors px-4"
              >
                Search Different Model
              </button>
              <button
                onClick={handleConfirm}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-slate-200 hover:scale-105"
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