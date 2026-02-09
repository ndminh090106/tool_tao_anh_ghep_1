import React, { useEffect, useState } from 'react';
import { CompositionJob, Template, UploadedImage } from '../types';
import { renderToCanvas } from '../services/imageProcessing';

interface Props {
  jobs: CompositionJob[];
  template: Template;
  images: UploadedImage[];
  quality: number;
}

const Gallery: React.FC<Props> = ({ jobs, template, images, quality }) => {
  // Key is job ID, value is dataURL
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomedJob, setZoomedJob] = useState<CompositionJob | null>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement> | null>(null);

  // Load images into HTMLImageElements for Canvas use
  useEffect(() => {
    const loadAll = async () => {
      const map = new Map<string, HTMLImageElement>();
      const promises = images.map(img => {
        return new Promise<void>((resolve) => {
          const el = new Image();
          el.onload = () => {
            map.set(img.id, el);
            resolve();
          };
          el.src = img.url;
        });
      });
      await Promise.all(promises);
      setLoadedImages(map);
    };
    loadAll();
  }, [images]);

  // Generate thumbnails
  useEffect(() => {
    if (!loadedImages || jobs.length === 0) return;

    let active = true;

    const generatePreviews = async () => {
      const newPreviews: Record<string, string> = {};
      
      for (const job of jobs) {
        if (!active) break;
        // Preview scale (approx 400px width)
        const previewScale = 400 / 1200; 
        const canvas = await renderToCanvas(job, template, loadedImages, previewScale);
        newPreviews[job.id] = canvas.toDataURL('image/jpeg', 0.85);
      }
      
      if (active) setPreviews(newPreviews);
    };

    generatePreviews();

    return () => { active = false; };
  }, [jobs, loadedImages, template]);

  // --- ACTIONS ---

  // 1. Download All Composites only (ZIP)
  const downloadAllComposites = async () => {
    if (!loadedImages) return;
    setIsProcessing(true);

    try {
      // @ts-ignore
      const zip = new JSZip();
      const multiplier = quality / 1200;

      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const canvas = await renderToCanvas(job, template, loadedImages, multiplier);
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
        if (blob) {
            zip.file(`composite_${i + 1}.jpg`, blob);
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      // @ts-ignore
      saveAs(content, "all_composites.zip");

    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to generate ZIP.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Download Single Package (Composite + Source Images)
  const downloadJobPackage = async (job: CompositionJob) => {
    if (!loadedImages) return;
    
    try {
        // @ts-ignore
        const zip = new JSZip();
        
        // A. Generate Composite
        const multiplier = quality / 1200;
        const canvas = await renderToCanvas(job, template, loadedImages, multiplier);
        const compositeBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
        
        if (compositeBlob) {
            zip.file(`composite_result.jpg`, compositeBlob);
        }

        // B. Add Source Images
        const sourcesFolder = zip.folder("source_images");
        
        // Find used images in this job
        job.slotAssignments.forEach((slot, index) => {
            const originalImg = images.find(img => img.id === slot.imageId);
            if (originalImg) {
                // We use the original file object
                // Rename file to prevent collisions and make it clear which slot it was
                const ext = originalImg.file.name.split('.').pop() || 'jpg';
                sourcesFolder.file(`slot_${index + 1}_${slot.slotId}.${ext}`, originalImg.file);
            }
        });

        const content = await zip.generateAsync({ type: "blob" });
        // @ts-ignore
        saveAs(content, `package_${job.id}.zip`);

    } catch (e) {
        console.error("Package download failed", e);
        alert("Could not download package.");
    }
  };

  if (jobs.length === 0) return null;

  return (
    <div className="space-y-4 mt-12 border-t border-gray-800 pt-8">
      <div className="flex justify-between items-center sticky top-0 bg-gray-950/90 backdrop-blur-md z-10 py-4 border-b border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-white">Generated Results</h2>
          <p className="text-gray-400 text-sm">{jobs.length} unique variations created</p>
        </div>
        <button
          onClick={downloadAllComposites}
          disabled={isProcessing}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-gray-700"
        >
          {isProcessing ? 'Processing...' : 'Download All Composites (.ZIP)'}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="group relative rounded-lg overflow-hidden border border-gray-800 bg-gray-900 aspect-[job.aspectRatio] shadow-lg">
            {previews[job.id] ? (
              <img 
                src={previews[job.id]} 
                alt="Composite Preview" 
                className="w-full h-full object-contain bg-white"
              />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                 Rendering...
               </div>
            )}
            
            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
               
               {/* Zoom Button */}
               <button 
                 onClick={() => setZoomedJob(job)}
                 className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors shadow-lg font-medium text-xs border border-gray-500"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                 </svg>
                 Zoom
               </button>

               {/* Download Package Button */}
               <button 
                onClick={() => downloadJobPackage(job)}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors shadow-lg font-medium text-xs" 
                title="Download Composite + Source Images"
               >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Package
               </button>
            </div>
            
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm opacity-50">
                #{job.id.split('-').pop()}
            </div>
          </div>
        ))}
      </div>

      {/* --- ZOOM MODAL --- */}
      {zoomedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setZoomedJob(null)}>
            <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                
                {/* Close Button */}
                <button 
                    onClick={() => setZoomedJob(null)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Large Image */}
                <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-800 bg-white">
                    {previews[zoomedJob.id] && (
                        <img 
                            src={previews[zoomedJob.id]} 
                            alt="Zoomed Composite" 
                            className="max-h-[80vh] w-auto object-contain"
                        />
                    )}
                </div>

                {/* Modal Actions */}
                <div className="mt-6 flex gap-4">
                     <button 
                        onClick={() => downloadJobPackage(zoomedJob)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Package (ZIP)
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;