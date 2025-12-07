import React, { useState } from 'react';
import { analyzeRequirement } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { SparklesIcon, CheckCircleIcon } from './Icons';

interface RequestFormProps {
  onSubmit: (data: AIAnalysisResult & { description: string }) => void;
  onCancel: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onCancel }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeRequirement(input);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleConfirm = () => {
    if (analysis) {
      onSubmit({ ...analysis, description: input });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-200 overflow-hidden max-w-2xl mx-auto transform transition-all">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <SparklesIcon className="w-7 h-7 text-yellow-300 animate-pulse" />
            Smart Request Builder
          </h2>
          <p className="text-violet-100 mt-2 text-lg leading-relaxed">
            Describe what you need in plain English. Our AI will build a professional RFQ for you.
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Step 1: Input */}
        <div className={`transition-all duration-500 ease-in-out ${analysis ? 'opacity-40 grayscale pointer-events-none scale-95 origin-top' : 'opacity-100'}`}>
          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
            What are you looking for?
          </label>
          <div className="relative group">
            <textarea
              className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none resize-none h-40 text-lg transition-all"
              placeholder="e.g., I need a good fridge for a family of 4, energy saving, silver color..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
              Powered by Gemini AI
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Analyzing Market...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Analyze & Build</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Review */}
        {analysis && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 border-t-2 border-slate-100 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Review Request</h3>
              <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide border border-green-200 shadow-sm">
                AI Generated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mb-1">Title</p>
                <p className="font-bold text-indigo-900 text-lg leading-tight">{analysis.title}</p>
              </div>
              <div className="bg-fuchsia-50 p-5 rounded-2xl border border-fuchsia-100">
                <p className="text-[10px] text-fuchsia-400 uppercase font-bold tracking-wider mb-1">Category</p>
                <p className="font-bold text-fuchsia-900 text-lg">{analysis.category}</p>
              </div>
              <div className="col-span-1 md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Specifications</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.specs).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm">
                      <span className="text-slate-400 mr-1.5 uppercase text-[9px] font-bold">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      {String(value)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">Est. Market Price</p>
                <p className="font-extrabold text-emerald-700 text-xl">
                  ${analysis.estimatedMarketPrice.min} - ${analysis.estimatedMarketPrice.max}
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider mb-1">Suggested Max Budget</p>
                <p className="font-extrabold text-blue-700 text-xl">${analysis.suggestedMaxBudget}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setAnalysis(null)}
                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-emerald-200 hover:scale-105"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Post Request
              </button>
            </div>
          </div>
        )}
        
        {!analysis && (
            <button onClick={onCancel} className="w-full text-center text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors py-2">Cancel and return</button>
        )}
      </div>
    </div>
  );
};

export default RequestForm;