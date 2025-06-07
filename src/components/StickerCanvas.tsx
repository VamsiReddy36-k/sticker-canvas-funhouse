
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
  showGrid?: boolean;
  gridRows?: number;
  gridCols?: number;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

const StickerCanvas = forwardRef<HTMLCanvasElement, StickerCanvasProps>(({
  stickers,
  onUpdateSticker,
  onDeleteSticker,
  showGrid = true,
  gridRows = 5,
  gridCols = 7,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const dragSticker = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const CELL_WIDTH = CANVAS_WIDTH / gridCols;
  const CELL_HEIGHT = CANVAS_HEIGHT / gridRows;

  const snapToGrid = useCallback((x: number, y: number) => {
    const col = Math.round(x / CELL_WIDTH);
    const row = Math.round(y / CELL_HEIGHT);
    return {
      x: Math.max(0, Math.min(col * CELL_WIDTH, CANVAS_WIDTH - CELL_WIDTH)),
      y: Math.max(0, Math.min(row * CELL_HEIGHT, CANVAS_HEIGHT - CELL_HEIGHT))
    };
  }, [CELL_WIDTH, CELL_HEIGHT]);

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

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let i = 1; i < gridCols; i++) {
        const x = i * CELL_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 1; i < gridRows; i++) {
        const y = i * CELL_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }

    // Draw stickers
    stickers.forEach((sticker) => {
      const centerX = sticker.x + (CELL_WIDTH - sticker.width) / 2;
      const centerY = sticker.y + (CELL_HEIGHT - sticker.height) / 2;
      ctx.drawImage(sticker.image, centerX, centerY, sticker.width, sticker.height);
    });
  }, [stickers, showGrid, gridRows, gridCols, CELL_WIDTH, CELL_HEIGHT]);

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
      const centerX = sticker.x + (CELL_WIDTH - sticker.width) / 2;
      const centerY = sticker.y + (CELL_HEIGHT - sticker.height) / 2;
      
      if (
        x >= centerX &&
        x <= centerX + sticker.width &&
        y >= centerY &&
        y <= centerY + sticker.height
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
        const snapped = snapToGrid(sticker.x, sticker.y);
        onUpdateSticker(dragSticker.current, snapped.x, snapped.y);
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

export { StickerCanvas, CANVAS_WIDTH, CANVAS_HEIGHT };
