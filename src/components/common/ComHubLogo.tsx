import React, { useState } from 'react';

interface ComHubLogoProps {
  className?: string;
  size?: number; // diameter in pixels (default 44)
}

/**
 * ComHub Physical Circular Logo Sticker
 * - Original black circular logo placed on a solid WHITE FILLED CIRCULAR BACKGROUND
 * - White circle is slightly larger, creating a clearly visible, even white rim (die-cut sticker border)
 * - Original black circle and white clocktower artwork kept completely intact & proportional
 * - No recolor, inversion, distortion, or cropping
 */
export const ComHubLogo: React.FC<ComHubLogoProps> = ({ className, size = 64 }) => {
  const [imgSrc, setImgSrc] = useState('/uploads/comhub_logo.png');
  const [imageError, setImageError] = useState(false);

  // Even rim padding: ~6.5% of diameter creates a crisp, proportional white sticker rim
  const rimPadding = Math.max(2.5, Math.round(size * 0.065));

  const handleImageError = () => {
    if (imgSrc === '/uploads/comhub_logo.png') {
      setImgSrc('/assets/aistudio/image_d8bafdd6.png');
    } else {
      setImageError(true);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-white flex-shrink-0 select-none shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 ${className || ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        padding: `${rimPadding}px`,
      }}
      title="ComHub — Communications Hub"
      aria-label="ComHub Logo Sticker"
    >
      {!imageError ? (
        <img
          src={imgSrc}
          alt="ComHub"
          onError={handleImageError}
          className="w-full h-full object-contain rounded-full block"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
          <span
            className="text-white font-black tracking-widest uppercase text-center leading-none"
            style={{ fontSize: `${Math.max(8, Math.round(size * 0.2))}px` }}
          >
            COMHUB
          </span>
        </div>
      )}
    </div>
  );
};
