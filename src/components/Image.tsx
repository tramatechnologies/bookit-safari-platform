import React, { useState, useEffect, ImgHTMLAttributes } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string; // Optional low-quality placeholder
  priority?: boolean; // For images that should load immediately
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  priority = false,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (priority) {
      // For priority images, load immediately
      setImageSrc(src);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
      onLoad?.();
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
      onError?.();
    };
    img.src = src;
  }, [src, priority]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (error) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {loading && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover blur-sm transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleImageLoad}
        loading={priority ? undefined : 'lazy'}
        onError={() => setError(true)}
      />
    </div>
  );
};

export default OptimizedImage;