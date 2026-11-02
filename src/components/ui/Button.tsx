import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "circle" | "circle-lg" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  let baseStyles =
    "inline-flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer select-none";

  if (variant === "circle") {
    baseStyles +=
      " w-11 h-11 rounded-full border border-white/35 bg-white/[0.04] text-[#f0ebe1] hover:bg-white/10 hover:border-white/60 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]";
  } else if (variant === "circle-lg") {
    baseStyles +=
      " w-14 h-14 rounded-full border-2 border-white/50 bg-white/[0.08] text-[#f0ebe1] hover:bg-white/15 hover:border-white/80 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]";
  } else if (variant === "secondary") {
    baseStyles +=
      " px-4 py-2 rounded-xl border border-white/20 bg-white/[0.03] text-[#e8e4dc] hover:bg-white/[0.08] hover:border-white/40";
  } else if (variant === "ghost") {
    baseStyles +=
      " p-2 rounded-lg text-[#b8b3a8] hover:text-[#f0ebe1] hover:bg-white/[0.05]";
  } else {
    // primary
    baseStyles +=
      " px-5 py-2.5 rounded-xl bg-[#e5dfd3] text-[#121212] font-medium hover:bg-[#f2ede4] shadow-sm";
  }

  return (
    <button
      className={`${baseStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
