import { CompositionJob, UploadedImage, Template, Slot, Rect, ImageCategory } from '../types';

// Helper: Shuffle array
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Helper: Calculate Crop based on Focal Point
function calculateSmartCrop(
  image: UploadedImage,
  targetRatio: number // width / height
): Rect {
  const imgW = image.width;
  const imgH = image.height;
  const imgRatio = image.aspectRatio;

  let cropW: number;
  let cropH: number;
  let cropX: number;
  let cropY: number;

  if (imgRatio > targetRatio) {
    // Image is wider than slot: Crop sides
    cropH = imgH;
    cropW = cropH * targetRatio;
    
    // Determine X based on focal point X
    const centerX = image.focalPoint.x * imgW;
    cropX = centerX - (cropW / 2);

    // Clamp
    cropX = Math.max(0, Math.min(cropX, imgW - cropW));
    cropY = 0;
  } else {
    // Image is taller than slot: Crop top/bottom
    cropW = imgW;
    cropH = cropW / targetRatio;

    const centerY = image.focalPoint.y * imgH;
    cropY = centerY - (cropH / 2);

    // Clamp
    cropY = Math.max(0, Math.min(cropY, imgH - cropH));
    cropX = 0;
  }

  return { x: cropX, y: cropY, w: cropW, h: cropH };
}

// Configuration for specific templates
const TEMPLATE_RULES: Record<string, { heroSlotId: string, preferredCategory: ImageCategory }> = {
  'hero-left': { heroSlotId: 'hero', preferredCategory: 'house' },
  'editorial-right': { heroSlotId: 'hero', preferredCategory: 'house' },
  'product-showcase': { heroSlotId: 'top', preferredCategory: 'living_room' },
  'quad-gallery': { heroSlotId: 'top', preferredCategory: 'living_room' },
  'bottom-focus': { heroSlotId: 'bot', preferredCategory: 'living_room' },
  'center-hero': { heroSlotId: 'center', preferredCategory: 'house' },
};

export const generateVariations = (
  fixedImage: UploadedImage | null,
  variableImages: UploadedImage[],
  template: Template,
  overallAspectRatio: number,
  count: number = 20
): CompositionJob[] => {
  const jobs: CompositionJob[] = [];
  
  const rules = TEMPLATE_RULES[template.id];

  for (let i = 0; i < count; i++) {
    const assignments: CompositionJob['slotAssignments'] = [];
    
    // Determine the pool for THIS specific job.
    // We clone it to mutate (remove used items) without affecting other jobs.
    let currentPool = [...variableImages];

    // --- STEP 1: ASSIGN HERO IMAGE ---
    let heroSlotId: string | undefined = rules?.heroSlotId;
    if (!heroSlotId && template.slots.length > 0) {
        heroSlotId = template.slots[0].id;
    }

    // A. Use Fixed Image (does not consume from variable pool)
    if (fixedImage && heroSlotId) {
        const heroSlot = template.slots.find(s => s.id === heroSlotId);
        if (heroSlot) {
            const slotPhysicalRatio = (heroSlot.w / heroSlot.h) * overallAspectRatio;
            assignments.push({
              slotId: heroSlotId,
              imageId: fixedImage.id,
              crop: calculateSmartCrop(fixedImage, slotPhysicalRatio)
            });
            // Fixed image is not in currentPool, so no need to filter
        }
    } 
    // B. No Fixed Image -> Pick from pool (and remove it)
    else if (!fixedImage && heroSlotId) {
       // Try to pick smart category if possible, otherwise random
       const { preferredCategory } = rules || {};
       let selectedHero: UploadedImage | undefined;

       if (preferredCategory) {
           const candidates = currentPool.filter(img => img.category === preferredCategory);
           if (candidates.length > 0) selectedHero = candidates[i % candidates.length];
       }

       if (!selectedHero && currentPool.length > 0) {
           selectedHero = currentPool[i % currentPool.length];
       }

       if (selectedHero) {
          const heroSlot = template.slots.find(s => s.id === heroSlotId);
          if (heroSlot) {
            const slotPhysicalRatio = (heroSlot.w / heroSlot.h) * overallAspectRatio;
            assignments.push({
              slotId: heroSlotId,
              imageId: selectedHero.id,
              crop: calculateSmartCrop(selectedHero, slotPhysicalRatio)
            });
            // STRICT UNIQUE: Remove from pool
            currentPool = currentPool.filter(img => img.id !== selectedHero!.id);
          }
       }
    }


    // --- STEP 2: FILL REMAINING SLOTS ---
    // Shuffle pool to ensure randomness
    currentPool = shuffle(currentPool);
    
    const remainingSlots = template.slots.filter(s => 
      !assignments.find(a => a.slotId === s.id)
    );

    for (const slot of remainingSlots) {
      if (currentPool.length === 0) {
          // Ran out of images. We cannot fill this slot. 
          // The canvas will show white/background for this slot.
          // This ensures no duplicates.
          continue; 
      }

      // Just pick the first one since it's shuffled
      const selectedImage = currentPool[0];

      const slotPhysicalRatio = (slot.w / slot.h) * overallAspectRatio;
      assignments.push({
        slotId: slot.id,
        imageId: selectedImage.id,
        crop: calculateSmartCrop(selectedImage, slotPhysicalRatio)
      });

      // STRICT UNIQUE: Remove from pool
      currentPool = currentPool.slice(1);
    }

    jobs.push({
      id: `job-${Date.now()}-${i}`,
      templateId: template.id,
      aspectRatio: overallAspectRatio,
      quality: 1, 
      slotAssignments: assignments
    });
  }

  return jobs;
};

// Render logic using HTML5 Canvas
export const renderToCanvas = async (
  job: CompositionJob,
  template: Template,
  images: Map<string, HTMLImageElement>,
  qualityMultiplier: number // Multiplier of base 1200
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  
  // Base 1200 logic
  const BASE_WIDTH = 1200 * qualityMultiplier; 
  const width = BASE_WIDTH;
  const height = BASE_WIDTH / job.aspectRatio;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error("Canvas context failed");

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const sortedSlots = [...template.slots].sort((a, b) => a.zIndex - b.zIndex);

  for (const slot of sortedSlots) {
    const assignment = job.slotAssignments.find(a => a.slotId === slot.id);
    if (!assignment) continue;

    const imgElement = images.get(assignment.imageId);
    if (!imgElement) continue;

    const dx = slot.x * width;
    const dy = slot.y * height;
    const dw = slot.w * width;
    const dh = slot.h * height;
    const rad = slot.radius * width; 

    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(dx, dy, dw, dh, rad);
    } else {
        ctx.rect(dx, dy, dw, dh);
    }
    ctx.clip();

    ctx.drawImage(
      imgElement,
      assignment.crop.x,
      assignment.crop.y,
      assignment.crop.w,
      assignment.crop.h,
      dx,
      dy,
      dw,
      dh
    );

    ctx.restore();
  }

  return canvas;
};