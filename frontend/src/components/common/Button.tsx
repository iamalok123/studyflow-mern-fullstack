import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap';

  const variantStyles = {
    primary: 'bg-slate-950 text-white shadow-xl shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-slate-800',
    secondary: 'bg-white border border-slate-200 text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700',
    outline: 'bg-white border border-slate-200 text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700',
  };

  const sizeStyles = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
