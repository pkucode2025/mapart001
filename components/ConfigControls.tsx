import React, { useState, useRef } from 'react';
import { AppState, FrameColor, FrameSize, MapStyle } from '../types';
import { BACKGROUND_COLORS, FRAME_COLORS, SIZES } from '../constants';
import { Search, MapPin, Check, Wand2, Download, Upload, Image as ImageIcon, X } from 'lucide-react';

interface ConfigControlsProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onGenerate: (location: string) => void;
  onGenerateFromImage: (base64: string) => void;
}

type InputMode = 'search' | 'upload';

export const ConfigControls: React.FC<ConfigControlsProps> = ({ state, onUpdate, onGenerate, onGenerateFromImage }) => {
  const [locationInput, setLocationInput] = useState(state.location);
  const [mode, setMode] = useState<InputMode>('search');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode === 'search') {
      if (locationInput.trim()) {
        onGenerate(locationInput);
      }
    } else {
      if (uploadedImage) {
        onGenerateFromImage(uploadedImage);
      }
    }
  };

  const handleDownload = () => {
    if (!state.generatedImage) return;
    
    const link = document.createElement('a');
    link.href = state.generatedImage;
    link.download = `CityMemory_${state.location.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* 1. Source Selection */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            1. Select Map Source
          </label>
          
          {/* Mode Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button 
              onClick={() => setMode('search')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'search' ? 'bg-white text-zinc-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Search size={14} /> Search City
            </button>
            <button 
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'upload' ? 'bg-white text-zinc-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Upload size={14} /> Upload Map
            </button>
          </div>

          {/* Search Mode */}
          {mode === 'search' && (
            <>
              <form onSubmit={handleGenerate} className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter city, neighborhood..."
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <button 
                  type="submit"
                  disabled={state.isGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  {state.isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Wand2 size={16} />}
                </button>
              </form>
              <div className="mt-3 flex gap-2 flex-wrap">
                  <button onClick={() => { setLocationInput("New York"); onGenerate("New York"); }} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-200">New York</button>
                  <button onClick={() => { setLocationInput("Tokyo"); onGenerate("Tokyo"); }} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-200">Tokyo</button>
                  <button onClick={() => { setLocationInput("London"); onGenerate("London"); }} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-200">London</button>
              </div>
            </>
          )}

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="space-y-3">
              {!uploadedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-900 hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <ImageIcon size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload map screenshot</p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={uploadedImage} alt="Upload preview" className="w-full h-40 object-cover" />
                  <button 
                    onClick={clearUpload}
                    className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-white text-gray-600"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm p-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-center truncate">Ready to generate</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              <button
                onClick={handleGenerate}
                disabled={!uploadedImage || state.isGenerating}
                className="w-full py-3 bg-zinc-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state.isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Generate Art from Image
                  </>
                )}
              </button>
              <p className="text-[10px] text-gray-400 leading-tight text-center">
                AI will replicate the geography and lines from your image but apply the selected artistic style.
              </p>
            </div>
          )}
        </div>

        {/* 2. Map Style */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            2. Map Style
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onUpdate({ selectedMapStyle: MapStyle.BLACK_LINES })}
              className={`flex flex-col items-center p-3 border rounded-xl transition-all ${state.selectedMapStyle === MapStyle.BLACK_LINES ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="w-full h-16 bg-white border border-gray-200 mb-2 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                 <div className="absolute w-full h-[1px] bg-black top-1/2 rotate-45"></div>
                 <div className="absolute w-full h-[1px] bg-black top-1/3 -rotate-12"></div>
              </div>
              <span className="text-xs font-medium">Standard (Black)</span>
            </button>

             <button
              onClick={() => onUpdate({ selectedMapStyle: MapStyle.WHITE_LINES })}
              className={`flex flex-col items-center p-3 border rounded-xl transition-all ${state.selectedMapStyle === MapStyle.WHITE_LINES ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="w-full h-16 bg-zinc-800 border border-zinc-700 mb-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <div className="absolute w-full h-[1px] bg-white top-1/2 rotate-45"></div>
                  <div className="absolute w-full h-[1px] bg-white top-1/3 -rotate-12"></div>
              </div>
              <span className="text-xs font-medium">Inverted (White)</span>
            </button>
          </div>
        </div>

        {/* 3. Size Selection */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            3. Size & Format
          </label>
          <div className="space-y-3">
            {(Object.values(SIZES) as any[]).map((size) => (
              <div 
                key={size.id}
                onClick={() => onUpdate({ selectedSize: size.id })}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${state.selectedSize === size.id ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${state.selectedSize === size.id ? 'border-zinc-900' : 'border-gray-300'}`}>
                    {state.selectedSize === size.id && <div className="w-2 h-2 bg-zinc-900 rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{size.label}</p>
                    <p className="text-xs text-gray-500">{size.widthCm}cm × {size.heightCm}cm</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">¥{size.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Frame Color */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            4. Frame Material
          </label>
          <div className="flex gap-4">
            {(Object.keys(FRAME_COLORS) as FrameColor[]).map((colorKey) => {
              const color = FRAME_COLORS[colorKey];
              if (state.selectedSize === FrameSize.SQUARE && colorKey !== FrameColor.NONE) return null; // Only allow none for Square
              if (state.selectedSize !== FrameSize.SQUARE && colorKey === FrameColor.NONE) return null; // Don't allow none for Frames

              return (
                <button
                  key={colorKey}
                  onClick={() => onUpdate({ selectedFrameColor: colorKey })}
                  className="group relative flex flex-col items-center gap-2"
                >
                  <div 
                    className={`w-12 h-12 rounded-full border shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 ${color.tailwind}`}
                    style={colorKey === FrameColor.WOOD ? { backgroundColor: color.hex } : {}}
                  >
                     {state.selectedFrameColor === colorKey && (
                       <Check size={16} className={colorKey === FrameColor.WHITE ? 'text-black' : 'text-white'} />
                     )}
                  </div>
                  <span className="text-xs text-gray-600">{color.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Background Color */}
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            5. Matting Color
          </label>
          <div className="grid grid-cols-4 gap-4">
            {BACKGROUND_COLORS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => onUpdate({ selectedBgColor: bg.hex })}
                className="group flex flex-col items-center gap-2"
                title={bg.name}
              >
                <div 
                  className="w-10 h-10 rounded-full shadow-inner border border-black/10 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: bg.hex }}
                >
                   {state.selectedBgColor === bg.hex && (
                     <div className={`w-2 h-2 rounded-full ${bg.id === 'white' || bg.id === 'paper' || bg.id === 'blush' || bg.id === 'sage' ? 'bg-zinc-900' : 'bg-white'}`} />
                   )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Footer / Buy Action - Now flex item, not absolute */}
      <div className="shrink-0 p-6 bg-white border-t border-gray-200 z-20 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleDownload}
          className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-900 font-medium uppercase tracking-wider text-xs hover:bg-gray-50 transition-colors rounded-lg flex items-center justify-center gap-2"
          disabled={!state.generatedImage}
        >
          <Download size={16} />
          Export Map
        </button>
        <button className="flex-[2] py-3 bg-zinc-900 text-white font-bold uppercase tracking-wider text-xs hover:bg-zinc-800 transition-colors rounded-lg shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2">
           Add to Cart — ¥{SIZES[state.selectedSize].price}
        </button>
      </div>
    </div>
  );
};