'use client';
import React, { useState } from 'react';

export function Branding() {
  const [isGo, setIsGo] = useState(true);

  return (
    <div className="flex justify-center items-center flex-col space-y-4">
      {/* Branding */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-4">
          {/* Simple Interactive Toggle Switch */}
          <button 
            onClick={() => setIsGo(!isGo)}
            className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
            aria-label="Toggle between Go and No-Go"
          >
            <div className={`w-14 h-8 rounded-full border-2 transition-all duration-300 relative ${
              isGo 
                ? 'bg-primary border-primary' 
                : 'bg-muted border-muted-foreground/30'
            }`}>
              <div className={`absolute top-[0.15rem] w-6 h-6 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${
                isGo 
                  ? 'translate-x-7 bg-primary-foreground' 
                  : 'translate-x-1 bg-muted-foreground'
              }`}>
                <span className={`text-xs font-bold ${
                  isGo ? 'text-primary' : 'text-primary-foreground'
                }`}>
                  {isGo ? 'GO' : 'NO'}
                </span>
              </div>
            </div>
          </button>
          
          {/* Brand Name */}
          <div>
            <h2 className="text-xl font-bold text-foreground">
              GoNo-Go
            </h2>
            <p className="text-xs text-muted-foreground">
              Smart Startup Decisions
            </p>
           
          </div>
           <p className="text-xs text-muted-foreground">Beta launch</p>
        </div>
      </div>
    </div>
  );
}
