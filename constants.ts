import { FrameSize, FrameColor, MapStyle, SizeConfig, ColorOption } from './types';

export const SIZES: Record<FrameSize, SizeConfig> = {
  [FrameSize.LARGE]: {
    id: FrameSize.LARGE,
    label: 'Large Frame (大画框)',
    widthCm: 45,
    heightCm: 70,
    price: 980,
    aspectRatio: '45/70'
  },
  [FrameSize.MEDIUM]: {
    id: FrameSize.MEDIUM,
    label: 'Medium Frame (中画框)',
    widthCm: 30,
    heightCm: 45,
    price: 400,
    aspectRatio: '30/45'
  },
  [FrameSize.SMALL]: {
    id: FrameSize.SMALL,
    label: 'Small Frame (小画框)',
    widthCm: 15,
    heightCm: 22,
    price: 228,
    aspectRatio: '15/22'
  },
  [FrameSize.SQUARE]: {
    id: FrameSize.SQUARE,
    label: 'Map Core (地图画芯)',
    widthCm: 30,
    heightCm: 30,
    price: 228,
    aspectRatio: '1/1'
  }
};

export const FRAME_COLORS: Record<FrameColor, { label: string; hex: string; tailwind: string }> = {
  [FrameColor.BLACK]: { label: 'Matte Black', hex: '#1a1a1a', tailwind: 'bg-zinc-900' },
  [FrameColor.WHITE]: { label: 'Pure White', hex: '#f5f5f5', tailwind: 'bg-white border-gray-200' },
  [FrameColor.WOOD]: { label: 'Walnut Wood', hex: '#5D4037', tailwind: 'bg-[#5D4037]' },
  [FrameColor.NONE]: { label: 'No Frame', hex: 'transparent', tailwind: 'bg-transparent' },
};

// 12 Background Colors (Matting colors)
export const BACKGROUND_COLORS: ColorOption[] = [
  { id: 'classic-white', name: 'Classic White', hex: '#FFFFFF' },
  { id: 'paper', name: 'Rice Paper', hex: '#F0EAD6' },
  { id: 'concrete', name: 'Concrete', hex: '#9CA3AF' },
  { id: 'charcoal', name: 'Charcoal', hex: '#374151' },
  { id: 'midnight', name: 'Midnight Blue', hex: '#1e3a8a' },
  { id: 'forest', name: 'Forest Green', hex: '#14532d' },
  { id: 'terracotta', name: 'Terracotta', hex: '#9a3412' },
  { id: 'sage', name: 'Sage', hex: '#D1FAE5' },
  { id: 'blush', name: 'Blush Pink', hex: '#FCE7F3' },
  { id: 'navy', name: 'Deep Navy', hex: '#172554' },
  { id: 'ochre', name: 'Ochre', hex: '#B45309' },
  { id: 'black', name: 'Deep Black', hex: '#000000' },
];

export const DEFAULT_LOCATION = "Paris, France";
export const INITIAL_MAP_IMAGE = "https://picsum.photos/800/800?grayscale"; // Placeholder until generation
