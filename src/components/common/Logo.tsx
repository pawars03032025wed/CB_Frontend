import React from "react";
import { Activity, Heart, Network } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/carebridge-logo.png" 
        alt="CareBridge Logo" 
        className="object-contain drop-shadow-md hover:scale-105 transition-transform" 
        style={{ width: Math.max(size * 1.5, 48), height: Math.max(size * 1.5, 48) }} 
      />
      <div className="flex flex-col">
        <span 
          className="text-2xl font-semibold tracking-wide leading-none text-slate-900 dark:text-white" 
          style={{ fontFamily: "var(--font-brand)" }}
        >
          CareBridge<span style={{ color: "var(--color-brand-accent)" }}>+</span>
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] leading-none text-slate-500 uppercase mt-1">
          Connecting Care
        </span>
      </div>
    </div>
  );
}
