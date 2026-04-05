import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl border text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';

  const variantStyles = {
    primary: 'border-primary-600 bg-primary-600 text-white shadow-[0_18px_30px_-18px_rgba(79,70,229,0.85)] hover:border-primary-700 hover:bg-primary-700',
    secondary: 'border-slate-200 bg-white text-slate-700 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.35)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
  };

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
