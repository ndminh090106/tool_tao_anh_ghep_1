export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Slot extends Rect {
  id: string;
  radius: number;
  zIndex: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  slots: Slot[]; // Defined in normalized coordinates (0-1)
}

export type ImageCategory = 'house' | 'living_room' | 'kitchen' | 'bedroom' | 'alley' | 'rooftop' | 'bathroom' | 'other';

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  focalPoint: Point; // From AI (0-1)
  category: ImageCategory; // From AI
  description?: string; // From AI
}

export interface CompositionJob {
  id: string;
  templateId: string;
  aspectRatio: number; // width / height
  quality: number; // Pixel width scale
  slotAssignments: {
    slotId: string;
    imageId: string;
    crop: Rect; // Source rect in the image
  }[];
}

export enum AspectRatioName {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  STORY = "9:16",
  CINEMA = "16:9",
  FB_ADS = "1200x628",
  FB_STORY = "900x1600"
}

export const ASPECT_RATIOS: Record<AspectRatioName, number> = {
  [AspectRatioName.SQUARE]: 1,
  [AspectRatioName.PORTRAIT]: 3 / 4,
  [AspectRatioName.LANDSCAPE]: 4 / 3,
  [AspectRatioName.STORY]: 9 / 16,
  [AspectRatioName.CINEMA]: 16 / 9,
  [AspectRatioName.FB_ADS]: 1200 / 628,
  [AspectRatioName.FB_STORY]: 900 / 1600,
};

// Values represent the target width in pixels
export enum OutputQuality {
  K1 = 1080,
  K2 = 2160,
  K4 = 3840,
}