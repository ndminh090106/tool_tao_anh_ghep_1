import { Template } from './types';

// Templates use normalized coordinates (0.0 to 1.0) to be aspect-ratio independent
export const TEMPLATES: Template[] = [
  {
    id: 'grid-2x2',
    name: 'Classic Grid',
    description: 'Four equal sized images in a balanced grid.',
    slots: [
      { id: 's1', x: 0.02, y: 0.02, w: 0.47, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 's2', x: 0.51, y: 0.02, w: 0.47, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 's3', x: 0.02, y: 0.51, w: 0.47, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 's4', x: 0.51, y: 0.51, w: 0.47, h: 0.47, radius: 0.02, zIndex: 1 },
    ]
  },
  {
    id: 'hero-left',
    name: 'Hero Left',
    description: 'One large feature image on the left, three smaller details on the right.',
    slots: [
      { id: 'hero', x: 0.0, y: 0.0, w: 0.65, h: 1.0, radius: 0.0, zIndex: 1 },
      { id: 'd1', x: 0.67, y: 0.0, w: 0.33, h: 0.32, radius: 0.02, zIndex: 2 },
      { id: 'd2', x: 0.67, y: 0.34, w: 0.33, h: 0.32, radius: 0.02, zIndex: 2 },
      { id: 'd3', x: 0.67, y: 0.68, w: 0.33, h: 0.32, radius: 0.02, zIndex: 2 },
    ]
  },
  {
    id: 'editorial-right',
    name: 'Editorial Right',
    description: 'Two detail shots stacked on the left, one large hero image on the right.',
    slots: [
      { id: 'd1', x: 0.02, y: 0.02, w: 0.35, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'd2', x: 0.02, y: 0.51, w: 0.35, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'hero', x: 0.39, y: 0.02, w: 0.59, h: 0.96, radius: 0.02, zIndex: 1 },
    ]
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Top focus area with two supporting details below.',
    slots: [
      { id: 'top', x: 0.02, y: 0.02, w: 0.96, h: 0.60, radius: 0.02, zIndex: 1 },
      { id: 'bot-l', x: 0.02, y: 0.64, w: 0.47, h: 0.34, radius: 0.02, zIndex: 1 },
      { id: 'bot-r', x: 0.51, y: 0.64, w: 0.47, h: 0.34, radius: 0.02, zIndex: 1 },
    ]
  },
  {
    id: 'bottom-focus',
    name: 'Bottom Focus',
    description: 'Two details on top, one large hero image on the bottom.',
    slots: [
      { id: 'tl', x: 0.02, y: 0.02, w: 0.47, h: 0.40, radius: 0.02, zIndex: 1 },
      { id: 'tr', x: 0.51, y: 0.02, w: 0.47, h: 0.40, radius: 0.02, zIndex: 1 },
      { id: 'bot', x: 0.02, y: 0.44, w: 0.96, h: 0.54, radius: 0.02, zIndex: 1 },
    ]
  },
  {
    id: 'grid-six',
    name: 'Gallery Six',
    description: 'A 3x2 grid perfect for displaying multiple product variants.',
    slots: [
      { id: 'r1c1', x: 0.02, y: 0.02, w: 0.31, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'r1c2', x: 0.345, y: 0.02, w: 0.31, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'r1c3', x: 0.67, y: 0.02, w: 0.31, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'r2c1', x: 0.02, y: 0.51, w: 0.31, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'r2c2', x: 0.345, y: 0.51, w: 0.31, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'r2c3', x: 0.67, y: 0.51, w: 0.31, h: 0.47, radius: 0.02, zIndex: 1 },
    ]
  },
  {
    id: 'quad-gallery',
    name: 'Quad Gallery',
    description: 'One large top image with three smaller images below.',
    slots: [
      { id: 'top', x: 0.02, y: 0.02, w: 0.96, h: 0.60, radius: 0.02, zIndex: 1 },
      { id: 'b1', x: 0.02, y: 0.64, w: 0.31, h: 0.34, radius: 0.02, zIndex: 1 },
      { id: 'b2', x: 0.345, y: 0.64, w: 0.31, h: 0.34, radius: 0.02, zIndex: 1 },
      { id: 'b3', x: 0.67, y: 0.64, w: 0.31, h: 0.34, radius: 0.02, zIndex: 1 },
    ]
  },
  {
    id: 'center-hero',
    name: 'Center Hero',
    description: 'Large center image flanked by two columns of smaller images.',
    slots: [
      { id: 'l1', x: 0.02, y: 0.02, w: 0.25, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'l2', x: 0.02, y: 0.51, w: 0.25, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'center', x: 0.29, y: 0.02, w: 0.42, h: 0.96, radius: 0.02, zIndex: 1 },
      { id: 'r1', x: 0.73, y: 0.02, w: 0.25, h: 0.47, radius: 0.02, zIndex: 1 },
      { id: 'r2', x: 0.73, y: 0.51, w: 0.25, h: 0.47, radius: 0.02, zIndex: 1 },
    ]
  }
];

export const MOCK_ANALYSIS = false;