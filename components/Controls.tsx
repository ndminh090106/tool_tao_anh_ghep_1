import React from 'react';
import { ASPECT_RATIOS, AspectRatioName, OutputQuality } from '../types';

interface Props {
  aspectRatio: number;
  quality: number;
  setAspectRatio: (val: number) => void;
  setQuality: (val: number) => void;
  canGenerate: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Controls: React.FC<Props> = ({ 
  aspectRatio, 
  setAspectRatio, 
  quality, 
  setQuality, 
  canGenerate, 
  onGenerate,
  isGenerating
}) => {
  return (
    <div className="space-y-6">
       <h3 className="text-lg font-medium text-gray-200">3. Configure & Generate</h3>
       
       <div className="space-y-6 p-6 bg-gray-900 rounded-xl border border-gray-800">
          
          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Aspect Ratio</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(Object.entries(ASPECT_RATIOS) as [AspectRatioName, number][]).map(([name, value]) => (
                <button
                  key={name}
                  onClick={() => setAspectRatio(value)}
                  className={`px-2 py-2 text-xs font-medium rounded-md border transition-all ${
                    Math.abs(aspectRatio - value) < 0.001
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Output Resolution</label>
             <div className="flex gap-2">
                <button
                  onClick={() => setQuality(OutputQuality.K1)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-all ${
                    quality === OutputQuality.K1
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  1K
                </button>
                <button
                  onClick={() => setQuality(OutputQuality.K2)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-all ${
                    quality === OutputQuality.K2
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  2K
                </button>
                <button
                  onClick={() => setQuality(OutputQuality.K4)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-all ${
                    quality === OutputQuality.K4
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  4K
                </button>
            </div>
          </div>
       </div>

       <button
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
          !canGenerate || isGenerating
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
        }`}
       >
         {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
         ) : (
           'Generate 20 Composites'
         )}
       </button>
    </div>
  );
};

export default Controls;