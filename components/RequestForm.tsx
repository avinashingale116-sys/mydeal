import React, { useState } from 'react';
import { analyzeRequirement } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { SparklesIcon, CheckCircleIcon } from './Icons';

interface RequestFormProps {
  onSubmit: (data: AIAnalysisResult & { description: string }) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { id: 'AC', label: 'AC', icon: '❄️' },
  { id: 'Fridge', label: 'Fridge', icon: '🧊' },
  { id: 'TV', label: 'TV', icon: '📺' },
  { id: 'Washing Machine', label: 'Washing Machine', icon: '🧺' }
];

const PLACEHOLDERS: Record<string, string> = {
  'AC': 'e.g., 1.5 Ton Split AC, 5 Star rating, Copper condenser, Voltas or LG...',
  'Fridge': 'e.g., Double door 260L, Frost free, Convertible, Samsung or Whirlpool...',
  'TV': 'e.g., 55 inch 4K Smart TV, Sony or LG, QLED display...',
  'Washing Machine': 'e.g., Front load 7kg, Fully automatic, Inverter motor, LG or Bosch...'
};

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState('AC');
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    // Prepend category to help AI context
    const enrichedInput = `Category: ${selectedCategory}. Details: ${input}`;
    const result = await analyzeRequirement(enrichedInput);
    setAnalysis(result);
    setIsAnalyzing(false);
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
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">What are you looking for?</h2>
            <p className="text-slate-500">Select a category to get the best price estimates.</p>
          </div>
        )}

        {/* Step 1: Category Selection & Input */}
        <div className={`transition-all duration-500 ${analysis ? 'hidden' : 'block'}`}>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setInput(''); }}
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

          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide ml-1">
            Requirements for {selectedCategory}
          </label>
          <div className="relative group mb-6">
            <textarea
              className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none resize-none h-40 text-lg transition-all text-slate-700 placeholder:text-slate-300"
              placeholder={PLACEHOLDERS[selectedCategory]}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" /> AI Assistant
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={onCancel}
              className="text-slate-400 font-bold hover:text-slate-600 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-rose-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Find Best Price</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
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
                <h3 className="text-xl font-bold text-slate-900">Confirm Request</h3>
                <p className="text-sm text-slate-500">Our AI has structured your requirements</p>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                {selectedCategory}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Product Title</p>
                <p className="font-bold text-slate-900 text-lg">{analysis.title}</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 col-span-1 md:col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Specifications</p>
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
                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">Est. Market Price</p>
                <p className="font-extrabold text-emerald-700 text-xl">
                  ₹{analysis.estimatedMarketPrice.min} - ₹{analysis.estimatedMarketPrice.max}
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider mb-1">Max Budget</p>
                <p className="font-extrabold text-blue-700 text-xl">₹{analysis.suggestedMaxBudget}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-between items-center">
              <button
                onClick={() => setAnalysis(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors px-4"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirm}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-slate-200 hover:scale-105"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Post Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForm;