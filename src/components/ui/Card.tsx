import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "frame" | "card" | "player";
  className?: string;
}

export default function Card({
  children,
  variant = "card",
  className = "",
  ...props
}: CardProps) {
  let styleClasses = "relative overflow-hidden";

  if (variant === "frame") {
    styleClasses +=
      " rounded-[28px] border border-white/18 bg-[#0a0a0d] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.8)]";
  } else if (variant === "player") {
    styleClasses +=
      " rounded-2xl border border-white/20 bg-white/[0.03] backdrop-blur-sm p-4";
  } else {
    styleClasses +=
      " rounded-2xl border border-white/20 bg-[#121318] hover:border-white/40 transition-all duration-300";
  }

  return (
    <div className={`${styleClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
