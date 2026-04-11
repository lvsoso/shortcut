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
  const baseStyles = 'inline-flex items-center justify-center rounded-xl border text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] focus:outline-none focus:ring-2 focus:ring-accent/35 focus:ring-offset-2 focus:ring-offset-app disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';

  const variantStyles = {
    primary: 'border-transparent bg-accent-gradient text-fg-onAccent shadow-panel hover:brightness-[1.02]',
    secondary: 'border-border bg-card text-fg shadow-panel hover:border-border-strong hover:bg-panel hover:text-fg',
    ghost: 'border-transparent bg-transparent text-fg-secondary hover:bg-accent-soft hover:text-fg',
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
