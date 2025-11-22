export enum FrameSize {
  LARGE = 'LARGE',   // 45cm x 70cm
  MEDIUM = 'MEDIUM', // 30cm x 45cm
  SMALL = 'SMALL',   // 15cm x 22cm
  SQUARE = 'SQUARE'  // 30cm (Map Core)
}

export enum FrameColor {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  WOOD = 'WOOD',
  NONE = 'NONE' // For Map Core
}

export enum MapStyle {
  BLACK_LINES = 'BLACK_LINES', // Black lines on transparent/white
  WHITE_LINES = 'WHITE_LINES', // White lines on transparent/dark
}

export interface SizeConfig {
  id: FrameSize;
  label: string;
  widthCm: number;
  heightCm: number;
  price: number;
  aspectRatio: string; // Tailwind class or style
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface AppState {
  location: string;
  selectedSize: FrameSize;
  selectedFrameColor: FrameColor;
  selectedBgColor: string; // Hex
  selectedMapStyle: MapStyle;
  generatedImage: string | null;
  isGenerating: boolean;
  error: string | null;
}
