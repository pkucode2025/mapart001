import React from 'react';
import { Map as MapIcon, Menu, ShoppingBag } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-sm flex items-center justify-center text-white">
            <MapIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-900 tracking-tight">City Memory</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">Map Art Studio</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-gray-900">Create</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Gallery</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Pricing</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">About</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-gray-900 md:hidden">
            <Menu size={24} />
          </button>
          <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Cart (0)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
