
import React, { useRef, forwardRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Sticker {
  id: string;
  x: number;
  y: number;
  image: HTMLImageElement;
  width: number;
  height: number;
}

interface StickerCanvasProps {
  stickers: Sticker[];
  onUpdateSticker: (id: string, x: number, y: number) => void;
  onDeleteSticker: (id: string) => void;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRID_SIZE = 40;

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const StickerCanvas = forwardRef<HTMLCanvasElement, StickerCanvasProps>(({
  stickers,
  onUpdateSticker,
  onDeleteSticker,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const dragSticker = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#dbeafe');
    gradient.addColorStop(1, '#e0e7ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stickers
    stickers.forEach((sticker) => {
      ctx.drawImage(sticker.image, sticker.x, sticker.y, sticker.width, sticker.height);
    });
  }, [stickers]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getStickerAt = (x: number, y: number) => {
    // Check stickers in reverse order (last drawn = on top)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i];
      if (
        x >= sticker.x &&
        x <= sticker.x + sticker.width &&
        y >= sticker.y &&
        y <= sticker.y + sticker.height
      ) {
        return sticker;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const sticker = getStickerAt(pos.x, pos.y);
    
    if (sticker) {
      isDragging.current = true;
      dragSticker.current = sticker.id;
      dragOffset.current = {
        x: pos.x - sticker.x,
        y: pos.y - sticker.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePos(e);
    const sticker = getStickerAt(pos.x, pos.y);
    
    // Change cursor
    canvas.style.cursor = sticker ? 'pointer' : 'default';

    if (isDragging.current && dragSticker.current) {
      const newX = pos.x - dragOffset.current.x;
      const newY = pos.y - dragOffset.current.y;
      onUpdateSticker(dragSticker.current, newX, newY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current && dragSticker.current) {
      // Snap to grid on mouse up
      const sticker = stickers.find(s => s.id === dragSticker.current);
      if (sticker) {
        const snappedX = snapToGrid(sticker.x);
        const snappedY = snapToGrid(sticker.y);
        onUpdateSticker(dragSticker.current, snappedX, snappedY);
      }
    }
    
    isDragging.current = false;
    dragSticker.current = null;
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const sticker = getStickerAt(pos.x, pos.y);
    
    if (sticker) {
      onDeleteSticker(sticker.id);
      toast.success('Sticker deleted!', {
        duration: 2000,
      });
    }
  };

  // Forward ref to canvas element
  React.useImperativeHandle(ref, () => canvasRef.current!, []);

  return (
    <div className="border-2 border-border rounded-lg overflow-hidden shadow-lg bg-white">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="cursor-default"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
});

StickerCanvas.displayName = 'StickerCanvas';

export { CANVAS_WIDTH, CANVAS_HEIGHT, snapToGrid };
