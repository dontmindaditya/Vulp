interface StarsBackgroundProps {
  className?: string;
}

export default function StarsBackground({
  className = "",
}: StarsBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Handcrafted celestial star coordinates matching the mockup */}
      <span className="absolute top-[8%] left-[12%] w-[1.5px] h-[1.5px] rounded-full bg-white opacity-40" />
      <span className="absolute top-[14%] left-[28%] w-[2px] h-[2px] rounded-full bg-white opacity-75 shadow-[0_0_4px_white]" />
      <span className="absolute top-[22%] left-[45%] w-[1.5px] h-[1.5px] rounded-full bg-white opacity-35" />
      <span className="absolute top-[18%] left-[72%] w-[2px] h-[2px] rounded-full bg-white opacity-60" />
      <span className="absolute top-[28%] left-[84%] w-[1px] h-[1px] rounded-full bg-white opacity-40" />
      <span className="absolute top-[35%] left-[16%] w-[1.5px] h-[1.5px] rounded-full bg-white opacity-50" />
      <span className="absolute top-[42%] left-[32%] w-[1px] h-[1px] rounded-full bg-white opacity-30" />
      <span className="absolute top-[48%] left-[65%] w-[2px] h-[2px] rounded-full bg-white opacity-70 shadow-[0_0_4px_white]" />
      <span className="absolute top-[58%] left-[22%] w-[1px] h-[1px] rounded-full bg-white opacity-40" />
      <span className="absolute top-[64%] left-[82%] w-[1.5px] h-[1.5px] rounded-full bg-white opacity-55" />
      <span className="absolute top-[75%] left-[38%] w-[1px] h-[1px] rounded-full bg-white opacity-35" />
      <span className="absolute top-[82%] left-[15%] w-[1.5px] h-[1.5px] rounded-full bg-white opacity-45" />
    </div>
  );
}

