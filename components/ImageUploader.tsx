import React, { useCallback } from 'react';
import { UploadedImage } from '../types';

interface Props {
  fixedImage: UploadedImage | null;
  variableImages: UploadedImage[];
  onUploadFixed: (files: FileList) => void;
  onUploadVariable: (files: FileList) => void;
  isAnalyzing: boolean;
  onClearVariable?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  house: 'House',
  living_room: 'Living Room',
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  alley: 'Alley',
  rooftop: 'Rooftop',
  bathroom: 'Bathroom',
  other: 'Other'
};

const CATEGORY_COLORS: Record<string, string> = {
  house: 'bg-blue-500',
  living_room: 'bg-green-500',
  kitchen: 'bg-orange-500',
  bedroom: 'bg-indigo-500',
  alley: 'bg-gray-500',
  rooftop: 'bg-purple-500',
  bathroom: 'bg-cyan-500',
  other: 'bg-gray-600'
};

const ImageUploader: React.FC<Props> = ({ 
  fixedImage, 
  variableImages, 
  onUploadFixed, 
  onUploadVariable, 
  isAnalyzing,
  onClearVariable
}) => {
  
  // --- Drag & Drop Handlers ---
  const handleDropFixed = useCallback((e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) onUploadFixed(e.dataTransfer.files);
    }, [onUploadFixed]);

  const handleDropVariable = useCallback((e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) onUploadVariable(e.dataTransfer.files);
    }, [onUploadVariable]);

  const handleChangeFixed = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) onUploadFixed(e.target.files);
    e.target.value = '';
  };

  const handleChangeVariable = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) onUploadVariable(e.target.files);
    e.target.value = '';
  };

  const renderImageCard = (img: UploadedImage) => (
    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700 group bg-gray-900 shadow-sm">
      <img src={img.url} alt="Uploaded" className="w-full h-full object-cover" />
      
      {/* Category Label (only if detected) */}
      {img.category !== 'other' && (
        <div className={`absolute bottom-0 left-0 right-0 py-1 text-[10px] font-bold text-white text-center ${CATEGORY_COLORS[img.category] || 'bg-gray-600'} opacity-90`}>
            {CATEGORY_LABELS[img.category] || img.category}
        </div>
      )}
      
      {/* Focal Point Indicator */}
      <div 
        className="absolute w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `${img.focalPoint.x * 100}%`, top: `${img.focalPoint.y * 100}%` }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <div>
            <h3 className="text-lg font-medium text-gray-200">2. Upload Products</h3>
            <p className="text-xs text-gray-400 mt-1">Total Min 3 images required for best results.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- LEFT: FIXED IMAGE --- */}
        <div className="md:col-span-1 space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Fixed Hero
                </label>
            </div>
            
            <div
                onDrop={handleDropFixed}
                onDragOver={(e) => e.preventDefault()}
                className={`relative aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors p-4 group ${
                isAnalyzing
                    ? 'border-gray-700 bg-gray-900/50 cursor-wait'
                    : 'border-gray-700 hover:border-indigo-400 hover:bg-gray-800/50 cursor-pointer'
                }`}
            >
                {fixedImage ? (
                    <>
                        <img src={fixedImage.url} alt="Fixed" className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-40 transition-opacity" />
                        <div className="z-10 bg-black/60 px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm pointer-events-none border border-white/10">
                            {CATEGORY_LABELS[fixedImage.category]}
                        </div>
                        <div className="absolute bottom-4 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 font-medium drop-shadow-md">
                            Click to change
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                         <div className="p-3 bg-gray-800 rounded-full">
                            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                         </div>
                         <span className="text-xs text-gray-400">Drag fixed image here</span>
                         <span className="text-[10px] text-gray-600">(AI analyzed)</span>
                    </div>
                )}

                <input
                    type="file"
                    id="fixed-upload"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChangeFixed}
                    disabled={isAnalyzing}
                />
            </div>
        </div>

        {/* --- RIGHT: VARIABLE IMAGES --- */}
        <div className="md:col-span-2 space-y-3 flex flex-col h-full">
            <div className="flex justify-between items-center">
                 <label className="text-sm font-semibold text-green-400 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Variable Pool ({variableImages.length}/20)
                 </label>
                 {variableImages.length > 0 && onClearVariable && (
                     <button 
                        onClick={onClearVariable}
                        className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors"
                     >
                        Clear Pool
                     </button>
                 )}
            </div>

            <div className="flex-1 bg-gray-900/30 rounded-xl border border-gray-800 p-3 flex flex-col gap-3">
                {/* Scrollable Area if many images */}
                <div className="flex-1 min-h-[160px] max-h-[400px] overflow-y-auto custom-scrollbar">
                     {variableImages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 border-2 border-dashed border-gray-800 rounded-lg p-8">
                            <span className="text-sm">No images in pool yet</span>
                        </div>
                     ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                             {variableImages.map(img => renderImageCard(img))}
                        </div>
                     )}
                </div>

                {/* Drop Zone Area - Always visible at bottom */}
                <div
                    onDrop={handleDropVariable}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed rounded-lg p-3 text-center transition-colors border-gray-700 hover:border-green-400 hover:bg-gray-800/50 cursor-pointer relative shrink-0"
                >
                    <input
                        type="file"
                        id="variable-upload"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChangeVariable}
                    />
                    <div className="flex flex-row items-center justify-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm text-gray-300 font-medium">
                        Click to add multiple files (Max 20)
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;