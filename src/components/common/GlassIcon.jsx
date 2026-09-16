import React from 'react';

export default function GlassIcon({
  icon: Icon,
  variant = 'sky', // 'sky' | 'yellow' | 'pink' | 'red' | 'white'
  size = 'md', // 'sm' (32px), 'md' (38px), 'lg' (44px), 'xl' (52px)
  className = '',
  iconClassName = '',
}) {
  if (!Icon) return null;

  const sizeMap = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-11 h-11 rounded-2xl',
    xl: 'w-13 h-13 rounded-2xl',
  };

  const iconSizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const variantMap = {
    sky: {
      container: 'bg-sky-500/10 border-sky-400/25 text-sky-400 hover:border-sky-400/50 hover:bg-sky-500/20 hover:shadow-[0_0_16px_rgba(14,165,233,0.35)]',
    },
    yellow: {
      container: 'bg-yellow-500/10 border-yellow-400/25 text-yellow-400 hover:border-yellow-400/50 hover:bg-yellow-500/20 hover:shadow-[0_0_16px_rgba(234,179,8,0.35)]',
    },
    pink: {
      container: 'bg-pink-500/10 border-pink-400/25 text-pink-400 hover:border-pink-400/50 hover:bg-pink-500/20 hover:shadow-[0_0_16px_rgba(236,72,153,0.35)]',
    },
    red: {
      container: 'bg-red-500/10 border-red-400/25 text-red-400 hover:border-red-400/50 hover:bg-red-500/20 hover:shadow-[0_0_16px_rgba(239,68,68,0.35)]',
    },
    white: {
      container: 'bg-white/10 border-white/20 text-white hover:border-white/40 hover:bg-white/15 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]',
    },
  };

  const v = variantMap[variant] || variantMap.sky;

  return (
    <div
      className={`glass-icon-container shrink-0 inline-flex items-center justify-center border backdrop-blur-md transition-all duration-300 ${
        sizeMap[size] || sizeMap.md
      } ${v.container} ${className}`}
    >
      <Icon className={`${iconSizeMap[size] || iconSizeMap.md} ${iconClassName}`} />
    </div>
  );
}
