'use client';

import React from 'react';
import { X } from 'lucide-react';

interface LightboxOverlayProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function LightboxOverlay({ imageUrl, onClose }: LightboxOverlayProps) {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[99999] flex items-center justify-center animate-fadeIn p-4 cursor-pointer"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer shadow-md"
      >
        <X className="w-5 h-5" />
      </button>

      <div 
        className="relative max-w-full max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Fullscreen View" 
          className="max-w-full max-h-[85vh] object-contain rounded-xl border border-neutral-900 shadow-2xl animate-scaleIn select-none cursor-default"
        />
      </div>
    </div>
  );
}
