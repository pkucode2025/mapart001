import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PreviewArea } from './components/PreviewArea';
import { ConfigControls } from './components/ConfigControls';
import { AppState, FrameColor, FrameSize, MapStyle } from './types';
import { DEFAULT_LOCATION, INITIAL_MAP_IMAGE } from './constants';
import { generateMapTexture, generateMapFromImage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    location: DEFAULT_LOCATION,
    selectedSize: FrameSize.MEDIUM,
    selectedFrameColor: FrameColor.BLACK,
    selectedBgColor: '#FFFFFF',
    selectedMapStyle: MapStyle.BLACK_LINES,
    generatedImage: null, // Start null, will trigger fetch on mount
    isGenerating: false,
    error: null,
  });

  // Helper to update state partially
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
    
    // Auto-adjust logic for frame color when switching to Square (Core only)
    if (updates.selectedSize === FrameSize.SQUARE && state.selectedFrameColor !== FrameColor.NONE) {
      setState(prev => ({ ...prev, selectedFrameColor: FrameColor.NONE }));
    }
    // Auto-adjust logic for frame color when switching FROM Square
    if (updates.selectedSize && updates.selectedSize !== FrameSize.SQUARE && state.selectedSize === FrameSize.SQUARE) {
      setState(prev => ({ ...prev, selectedFrameColor: FrameColor.BLACK }));
    }
  };

  const handleGenerateMap = async (location: string) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null, location }));
    try {
      const imageData = await generateMapTexture(location, state.selectedMapStyle);
      setState(prev => ({ ...prev, generatedImage: imageData, isGenerating: false }));
    } catch (err: any) {
      console.error("Failed to generate map", err);
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: "Could not generate map. Please try a different location." 
      }));
    }
  };

  const handleGenerateMapFromImage = async (imageBase64: string) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null, location: "Custom Map" }));
    try {
      const imageData = await generateMapFromImage(imageBase64, state.selectedMapStyle);
      setState(prev => ({ ...prev, generatedImage: imageData, isGenerating: false }));
    } catch (err: any) {
       console.error("Failed to generate map from image", err);
       setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: "Could not replicate map. Please try a clearer image." 
      }));
    }
  };

  // Initial Generation on Mount (Simulate)
  useEffect(() => {
    // Check if we have an API Key first. If not, maybe show a placeholder or alert.
    if(process.env.API_KEY) {
       handleGenerateMap(DEFAULT_LOCATION);
    } else {
        // Fallback for demo without key
        setState(prev => ({...prev, generatedImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-generate if map style changes (inverted vs standard)
  useEffect(() => {
    // This logic is tricky. If the user uploaded an image, simply re-generating with 'location' would lose the custom image.
    // For now, we'll only auto-regenerate if the location is not "Custom Map".
    if (state.generatedImage && !state.generatedImage.startsWith("http") && state.location !== "Custom Map") { 
        handleGenerateMap(state.location);
    }
    // If it IS a custom map, we'd ideally want to re-run generateMapFromImage with the stored source image, 
    // but we aren't storing the source image in the main AppState to keep it light. 
    // The user can just hit 'Generate' again in the Upload tab if they want to switch styles.
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedMapStyle]);


  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left: Preview */}
        <div className="flex-1 relative order-1 lg:order-1 bg-gray-50">
          <PreviewArea state={state} />
          
          {state.error && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200 shadow-sm z-50">
               {state.error}
             </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="w-full lg:w-[400px] xl:w-[480px] h-[50vh] lg:h-full order-2 lg:order-2 z-20 shadow-2xl shadow-gray-200/50">
          <ConfigControls 
            state={state} 
            onUpdate={updateState} 
            onGenerate={handleGenerateMap}
            onGenerateFromImage={handleGenerateMapFromImage}
          />
        </div>

      </main>
    </div>
  );
};

export default App;