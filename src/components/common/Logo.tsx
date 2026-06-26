import React from "react";
import { Activity, Heart, Network } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Connection/Bridge Symbol Background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#005f73] to-[#0a9396] rounded-xl opacity-20 blur-sm" />
        
        <div className="relative bg-linear-to-br from-[#005f73] to-[#0a9396] p-2 rounded-xl shadow-lg border border-white/20">
          <div className="relative">
            {/* Medical Cross Concept using Network/Bridge dots */}
            <Network size={size * 0.8} className="text-white" />
            {/* Overlay a small activity line */}
            <div className="absolute -bottom-1 -right-1 bg-[#ee9b00] rounded-full p-0.5 border border-white">
              <Activity size={size * 0.4} className="text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tighter leading-none dark:text-white uppercase font-display">
          CareBridge<span className="text-[#ee9b00]">+</span>
        </span>
        <span className="text-[10px] font-black tracking-[0.2em] leading-none text-gray-500 uppercase mt-0.5">
          Connecting Care
        </span>
      </div>
    </div>
  );
}
