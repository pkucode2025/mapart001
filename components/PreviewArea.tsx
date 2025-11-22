import React, { useState, useRef, useEffect } from 'react';
import { AppState, FrameColor, FrameSize, MapStyle } from '../types';
import { FRAME_COLORS, SIZES } from '../constants';
import { ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';

interface PreviewAreaProps {
  state: AppState;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ state }) => {
  const sizeConfig = SIZES[state.selectedSize];
  const frameColorConfig = FRAME_COLORS[state.selectedFrameColor];
  
  // Zoom and Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when size changes slightly, or just keep it for continuity.
  // We'll just keep it, but provide a reset button.

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale(s => Math.min(Math.max(s + delta, 0.5), 4));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate aspect ratio style
  const aspectRatio = sizeConfig.widthCm / sizeConfig.heightCm;
  
  // Dynamic styles for the frame
  const frameStyle: React.CSSProperties = {
    backgroundColor: state.selectedFrameColor === FrameColor.WOOD ? '#5D4037' : frameColorConfig.hex,
    boxShadow: state.selectedFrameColor !== FrameColor.NONE 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      : 'none',
  };

  // Border logic (Wood needs texture, others solid)
  const borderClasses = state.selectedFrameColor === FrameColor.NONE 
    ? '' 
    : 'p-4 sm:p-6 md:p-8'; // The padding acts as the frame thickness

  return (
    <div className="w-full h-full min-h-[500px] bg-gray-100 flex flex-col relative overflow-hidden">
      
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-200">
        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-md text-gray-700" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-md text-gray-700" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={handleReset} className="p-2 hover:bg-gray-100 rounded-md text-gray-700" title="Reset View">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Background Decor (Static) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-zinc-900 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-500 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Interactive Canvas Area */}
      <div 
        ref={containerRef}
        className={`flex-1 flex items-center justify-center overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* The Frame Container */}
          <div 
            className={`relative transition-all duration-500 ease-in-out ${borderClasses} shadow-2xl`}
            style={frameStyle}
          >
            {/* The Matting (Background Color) */}
            <div 
              className="relative overflow-hidden transition-colors duration-300"
              style={{ 
                backgroundColor: state.selectedBgColor,
                width: state.selectedFrameColor === FrameColor.NONE ? '300px' : 'min(60vw, 400px)',
                height: state.selectedFrameColor === FrameColor.NONE ? '300px' : `calc(min(60vw, 400px) / ${aspectRatio})`,
                padding: state.selectedFrameColor === FrameColor.NONE ? '0' : '8%', // Matting padding
                boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.1)'
              }}
            >
              {/* The Map Core */}
              <div className="w-full h-full relative bg-white shadow-sm overflow-hidden group">
                 {state.isGenerating ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Creating Map Art...</span>
                      </div>
                    </div>
                 ) : (
                   <img 
                      src={state.generatedImage || "https://picsum.photos/800/800"} 
                      alt="Map Art" 
                      className={`w-full h-full object-cover transition-opacity duration-500 ${state.generatedImage ? 'opacity-100' : 'opacity-50'}`}
                      style={{
                        filter: state.selectedMapStyle === MapStyle.WHITE_LINES ? 'invert(1)' : 'none'
                      }}
                   />
                 )}
                 
                 {/* Overlay Text */}
                 {!state.isGenerating && (
                   <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                      <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${state.selectedMapStyle === MapStyle.WHITE_LINES ? 'text-white' : 'text-zinc-900'} bg-white/10 backdrop-blur-sm px-2 py-1`}>
                        {state.location.split(',')[0]}
                      </span>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Dimensions Display - Scales with the frame */}
          <div className="mt-8 text-center select-none pointer-events-none">
            <p className="font-serif text-lg text-gray-900">{sizeConfig.label}</p>
            <p className="text-sm text-gray-500 font-mono mt-1">
              {sizeConfig.widthCm}cm × {sizeConfig.heightCm}cm
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs text-gray-400 pointer-events-none bg-white/80 px-2 py-1 rounded">
        Scroll or Drag to Navigate
      </div>
    </div>
  );
};