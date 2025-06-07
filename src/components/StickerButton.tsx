
import React from 'react';
import { Button } from '@/components/ui/button';

interface StickerButtonProps {
  emoji: string;
  label: string;
  onClick: () => void;
  className?: string;
}

export const StickerButton: React.FC<StickerButtonProps> = ({
  emoji,
  label,
  onClick,
  className = '',
}) => {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className={`
        h-16 w-16 text-2xl hover:scale-110 transition-all duration-200 
        hover:shadow-lg hover:border-primary border-2 group
        ${className}
      `}
      title={`Add ${label} sticker`}
    >
      <span className="group-hover:animate-bounce">{emoji}</span>
    </Button>
  );
};
