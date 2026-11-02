"use client";

import { useId } from "react";

interface SliderProps {
  value: number;
  min?: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
  ariaLabel?: string;
}

export default function Slider({
  value,
  min = 0,
  max,
  step = 0.1,
  onChange,
  className = "",
  ariaLabel = "Progress slider",
}: SliderProps) {
  const inputId = useId();
  const safeMax = Math.max(min + 0.001, max);
  const clampedVal = Math.min(Math.max(min, value), safeMax);
  const percentage = ((clampedVal - min) / (safeMax - min)) * 100;

  return (
    <div className={`relative w-full flex items-center select-none py-2 ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel}
      </label>
      <input
        id={inputId}
        type="range"
        min={min}
        max={safeMax}
        step={step}
        value={clampedVal}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none bg-transparent cursor-pointer relative z-10 
                   [&::-webkit-slider-thumb]:appearance-none 
                   [&::-webkit-slider-thumb]:w-3.5 
                   [&::-webkit-slider-thumb]:h-3.5 
                   [&::-webkit-slider-thumb]:rounded-full 
                   [&::-webkit-slider-thumb]:bg-[#f0ebe1] 
                   [&::-webkit-slider-thumb]:border-2 
                   [&::-webkit-slider-thumb]:border-[#161616] 
                   [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.7)]
                   [&::-moz-range-thumb]:appearance-none 
                   [&::-moz-range-thumb]:w-3.5 
                   [&::-moz-range-thumb]:h-3.5 
                   [&::-moz-range-thumb]:rounded-full 
                   [&::-moz-range-thumb]:bg-[#f0ebe1] 
                   [&::-moz-range-thumb]:border-2 
                   [&::-moz-range-thumb]:border-[#161616]
                   [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.7)]"
      />
      {/* Visual Track */}
      <div className="absolute inset-x-0 h-[2.5px] rounded-full bg-white/20 pointer-events-none overflow-hidden">
        <div
          className="h-full bg-[#f0ebe1] rounded-full shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

