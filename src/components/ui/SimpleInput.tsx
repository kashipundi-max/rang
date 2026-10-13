import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className = "", type = "text", placeholder = "Enter text", ...props },
    ref
  ) => (
    <div
      className={`grow basis-0 h-[42px] bg-slate-900/20 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.18)] relative hover:border-slate-700/50 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/30 transition-all duration-200 ${className}`}
    >
      <input
        ref={ref}
        type={type}
        className="w-full h-full px-4 bg-transparent outline-none text-gray-200 text-[14px] tracking-[0.98px] font-light rounded-xl placeholder:text-gray-400 placeholder:font-light font-dm-sans"
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
);

Input.displayName = "Input";
export default Input;
