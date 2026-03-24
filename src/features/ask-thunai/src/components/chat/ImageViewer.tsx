// ImageViewer.jsx
import React, { useState, useEffect } from 'react';
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ImageViewer = ({ image, onClose }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  
  // Reset transformations when a new image is loaded
  useEffect(() => {
    setRotation(0);
    setScale(1);
  }, [image]);
  
  if (!image) return null;
  
  const handleRotateLeft = (e) => {
    e.stopPropagation();
    setRotation((prev) => prev - 90);
  };
  
  const handleRotateRight = (e) => {
    e.stopPropagation();
    setRotation((prev) => prev + 90);
  };
  
  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };
  
  const handleReset = (e) => {
    e.stopPropagation();
    setRotation(0);
    setScale(1);
  };
  
  const handleDownload = (e) => {
    e.stopPropagation();
    
    // Create an anchor element and set properties
    const link = document.createElement('a');
    link.href = image;
    link.download = `image-${Date.now()}.jpg`;
    
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Container with fixed dimensions to prevent layout shifts */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Image container with overflow handling */}
        <div 
          className="relative flex-1 w-full flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img 
              src={image.startsWith("data:image") ? image : `data:image/jpeg;base64,${image}`}
              className="max-w-full max-h-[75vh] object-contain transition-transform duration-200"
              alt="Enlarged view"
              style={{ 
                transform: `rotate(${rotation}deg) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        </div>
        
        {/* Fixed position controls at bottom */}
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full p-2 flex items-center gap-2 z-10 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            onClick={handleRotateLeft}
            title="Rotate Left"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            onClick={handleRotateRight}
            title="Rotate Right"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          
          <div className="h-6 w-px bg-white/30 mx-1" />
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            onClick={handleZoomOut}
            title="Zoom Out"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          
          <span className="text-white text-sm min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            onClick={handleZoomIn}
            title="Zoom In"
            disabled={scale >= 3}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          
          <div className="h-6 w-px bg-white/30 mx-1" />
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            onClick={handleReset}
            title="Reset Image"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V8M12 20V16M8 12H4M20 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Fixed position close button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed top-4 right-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
