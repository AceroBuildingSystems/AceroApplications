import React from 'react';

interface PlaceholderImageProps {
  className?: string;
  fileName?: string;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  className = "max-w-[200px] max-h-[200px] rounded-lg",
  fileName
}) => {
  return (
    <div 
      className={`flex items-center justify-center bg-gray-200 ${className}`}
      style={{ minHeight: '100px', minWidth: '100px' }}
    >
      <div className="flex flex-col items-center text-gray-500 p-4 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mb-2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span className="text-xs">
          {fileName ? `Unable to load ${fileName}` : 'Image not available'}
        </span>
      </div>
    </div>
  );
};

export default PlaceholderImage;