import React, { useState, useMemo } from 'react';
import { Template, UploadedImage, AspectRatioName, ASPECT_RATIOS, OutputQuality, CompositionJob } from './types';
import { TEMPLATES } from './constants';
import { analyzeImageWithGemini } from './services/geminiService';
import { generateVariations } from './services/imageProcessing';
import TemplateSelector from './components/TemplateSelector';
import ImageUploader from './components/ImageUploader';
import Controls from './components/Controls';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  // State
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  
  // New State structure: 1 Fixed Image + Array of Variable Images
  const [fixedImage, setFixedImage] = useState<UploadedImage | null>(null);
  const [variableImages, setVariableImages] = useState<UploadedImage[]>([]);

  const [aspectRatio, setAspectRatio] = useState<number>(ASPECT_RATIOS[AspectRatioName.SQUARE]);
  const [quality, setQuality] = useState<number>(OutputQuality.K1);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [generatedJobs, setGeneratedJobs] = useState<CompositionJob[]>([]);

  // Computed: Combined list for Gallery rendering
  const allImages = useMemo(() => {
    return fixedImage ? [fixedImage, ...variableImages] : variableImages;
  }, [fixedImage, variableImages]);

  // Computed: Can we generate? (Need Fixed + Variable count >= Slots count, OR just enough variables if no fixed)
  // Simplified: We generally want at least 3 images total for good results
  const canGenerate = useMemo(() => {
     return (allImages.length >= 3) && !isAnalyzing;
  }, [allImages.length, isAnalyzing]);

  // Handler: Process Fixed Image (WITH AI)
  const processFixedFile = async (file: File): Promise<UploadedImage> => {
    const url = URL.createObjectURL(file);
    const dims = await new Promise<{w: number, h: number}>(resolve => {
        const img = new Image();
        img.onload = () => resolve({ w: img.width, h: img.height });
        img.src = url;
    });

    // Use Gemini for Fixed image to get perfect hero crop
    const analysis = await analyzeImageWithGemini(file);

    return {
        id: `fixed-${Date.now()}`,
        file,
        url,
        width: dims.w,
        height: dims.h,
        aspectRatio: dims.w / dims.h,
        focalPoint: analysis.focalPoint,
        category: analysis.category,
        description: analysis.description
    };
  };

  // Handler: Process Variable Files (WITHOUT AI - FASTER)
  const processVariableFiles = async (fileList: FileList): Promise<UploadedImage[]> => {
    const processed: UploadedImage[] = [];
    
    // We convert FileList to array to use map/Promise.all
    const files = Array.from(fileList);
    
    const promises = files.map(async (file, i) => {
        const url = URL.createObjectURL(file);
        const dims = await new Promise<{w: number, h: number}>(resolve => {
            const img = new Image();
            img.onload = () => resolve({ w: img.width, h: img.height });
            img.src = url;
        });

        // Default analysis for variable images
        return {
            id: `var-${Date.now()}-${i}-${Math.random()}`,
            file,
            url,
            width: dims.w,
            height: dims.h,
            aspectRatio: dims.w / dims.h,
            focalPoint: { x: 0.5, y: 0.5 }, // Default center crop
            category: 'other',
            description: 'Gallery Image'
        } as UploadedImage;
    });

    return Promise.all(promises);
  };

  const handleUploadFixed = async (fileList: FileList) => {
    if (fileList.length === 0) return;
    setIsAnalyzing(true);
    // Only take the first file for fixed slot
    try {
        const result = await processFixedFile(fileList[0]);
        // Revoke old fixed image URL if exists
        if (fixedImage) URL.revokeObjectURL(fixedImage.url);
        setFixedImage(result);
    } catch (e) {
        console.error("Fixed upload failed", e);
    }
    setIsAnalyzing(false);
  };

  const handleUploadVariable = async (fileList: FileList) => {
    if (fileList.length === 0) return;
    
    // No "IsAnalyzing" spinner needed for bulk upload since it's instant without AI
    // But we might want a small indicator if 100+ files
    
    const processed = await processVariableFiles(fileList);
    
    setVariableImages(prev => {
        const combined = [...prev, ...processed];
        // Enforce max 20 logic
        if (combined.length > 20) {
            alert("Max 20 variable images allowed. First 20 kept.");
            return combined.slice(0, 20);
        }
        return combined;
    });
  };
  
  const handleClearVariable = () => {
    if (window.confirm("Remove all variable images?")) {
        variableImages.forEach(img => URL.revokeObjectURL(img.url));
        setVariableImages([]);
    }
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    setIsGenerating(true);

    setTimeout(() => {
        // Pass split images to generator
        const jobs = generateVariations(fixedImage, variableImages, selectedTemplate, aspectRatio, 20);
        setGeneratedJobs(jobs);
        setIsGenerating(false);
    }, 100);
  };

  const handleReset = () => {
    const confirmed = window.confirm("Are you sure you want to delete all images and results?");
    if (confirmed) {
      allImages.forEach(img => URL.revokeObjectURL(img.url));

      setFixedImage(null);
      setVariableImages([]);
      setGeneratedJobs([]);
      setSelectedTemplate(TEMPLATES[0]);
      setAspectRatio(ASPECT_RATIOS[AspectRatioName.SQUARE]);
      setQuality(OutputQuality.K1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">CompAI <span className="font-normal text-gray-500 text-sm ml-2">Intelligent Compositor</span></h1>
          </div>
          
          {(allImages.length > 0 || generatedJobs.length > 0) && (
             <button 
               onClick={handleReset}
               className="text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Reset Project
             </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-2 space-y-12">
            
            <section>
                <TemplateSelector 
                  selectedId={selectedTemplate.id} 
                  onSelect={setSelectedTemplate} 
                />
            </section>

            <section>
                <ImageUploader 
                  fixedImage={fixedImage}
                  variableImages={variableImages}
                  onUploadFixed={handleUploadFixed}
                  onUploadVariable={handleUploadVariable}
                  onClearVariable={handleClearVariable}
                  isAnalyzing={isAnalyzing}
                />
            </section>

          </div>

          {/* Right Column: Controls & Actions */}
          <div className="lg:col-span-1">
             <div className="sticky top-24">
               <Controls 
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  quality={quality}
                  setQuality={setQuality}
                  canGenerate={canGenerate}
                  isGenerating={isGenerating}
                  onGenerate={handleGenerate}
               />
               
               {/* Quick Tips */}
               <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-sm text-gray-400">
                  <h4 className="font-semibold text-gray-300 mb-2">How it works</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong className="text-indigo-400">Fixed Image:</strong> Always in main slot (AI Smart Cropped).</li>
                    <li><strong className="text-green-400">Variable Pool:</strong> Folder upload supported. Center cropped.</li>
                    <li>No duplicate images per collage.</li>
                  </ul>
               </div>
             </div>
          </div>
        </div>

        {/* Results Area - Pass allImages so Gallery can find them by ID */}
        <section>
          <Gallery 
            jobs={generatedJobs} 
            template={selectedTemplate} 
            images={allImages}
            quality={quality}
          />
        </section>

      </main>
    </div>
  );
};

export default App;