import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-10 h-10',
  size = 40,
  priority = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-[#FAF5EE] border border-[#E8E2D9] p-1 overflow-hidden shadow-xs shrink-0 transition-transform hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-gh-roviq.svg"
        alt="GH ROVIQ Logo"
        width={size}
        height={size}
        priority={priority}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

