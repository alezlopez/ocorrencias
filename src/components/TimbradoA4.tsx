import React from 'react';

interface TimbradoA4Props {
  children: React.ReactNode;
}

export const TimbradoA4 = ({ children }: TimbradoA4Props) => {
  return (
    <div 
      className="relative w-full mx-auto bg-white shadow-lg"
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundImage: `url(/lovable-uploads/64a6e884-bff1-48e8-af2e-8d05186bf824.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Área de conteúdo com margens */}
      <div 
        className="relative z-10 text-black"
        style={{
          paddingTop: '5cm',
          paddingBottom: '3.3cm',
          paddingLeft: '1.27cm',
          paddingRight: '1.27cm',
          minHeight: '297mm',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </div>
  );
};