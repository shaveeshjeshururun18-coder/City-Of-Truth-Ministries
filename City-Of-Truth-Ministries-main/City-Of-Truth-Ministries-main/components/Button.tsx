import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost' | 'glass';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "relative px-8 py-4 rounded-2xl font-bold transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group";

  const variants = {
    primary: "bg-brand-600 text-white shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(37,99,235,0.6)] border-0",
    secondary: "bg-white text-brand-900 border border-brand-100 shadow-xl shadow-gray-200/50 hover:bg-gray-50",
    outline: "bg-transparent border-2 border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white",
    accent: "bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 text-white shadow-[0_15px_30px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(245,158,11,0.6)] border-0",
    ghost: "bg-transparent text-brand-600 hover:bg-brand-50 shadow-none",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-2xl"
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
