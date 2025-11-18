import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
      bg-white/10 
      backdrop-blur-2xl 
      border border-white/20 
      shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] 
      rounded-3xl 
      ${className}
    `}>
      {children}
    </div>
  );
};

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/30 border border-white/10",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`
      w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40
      focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all
      ${props.className || ''}
    `}
  />
);

export const GlassSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select
      {...props}
      className={`
        w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all
        ${props.className || ''}
      `}
    >
      {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
      </svg>
    </div>
  </div>
);

export const GlassBadge: React.FC<{ children: React.ReactNode; color?: 'blue' | 'purple' | 'pink' | 'orange' }> = ({ children, color = 'blue' }) => {
  const colors = {
    blue: "bg-blue-500/20 text-blue-200 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-200 border-purple-500/30",
    pink: "bg-pink-500/20 text-pink-200 border-pink-500/30",
    orange: "bg-orange-500/20 text-orange-200 border-orange-500/30"
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${colors[color]} inline-block`}>
      {children}
    </span>
  );
};