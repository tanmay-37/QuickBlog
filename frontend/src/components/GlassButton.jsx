import React from 'react';

const GlassButton = ({ 
  children, 
  type = 'button', 
  className = '', 
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`
        inline-flex justify-center rounded-xl 
        
        bg-white/20
        border border-white/50
        backdrop-blur-md
        
        py-3 px-10 text-sm font-medium 
        text-gray-900
        
        shadow-lg shadow-black/10
        
        hover:bg-white/40
        
        focus:outline-none focus:ring-2 
        focus:ring-gray-600
        focus:ring-offset-2
        focus:ring-offset-white/50
        
        transition-all duration-300 ease-in-out
        
        ${className} 
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;