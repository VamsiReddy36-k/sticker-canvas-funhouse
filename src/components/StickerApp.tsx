import React, { useState, useRef, useCallback } from 'react';
import { StickerCanvas, CANVAS_WIDTH, CANVAS_HEIGHT, snapToGrid } from './StickerCanvas';
import { StickerButton } from './StickerButton';
import { DownloadButton } from './DownloadButton';
import { toast } from 'sonner';

interface Sticker {
  id: string;
  x: number;
  y: number;
  image: HTMLImageElement;
  width: number;
  height: number;
}

const stickerConfigs = [
  // Animals
  { emoji: '🐱', label: 'Cat', size: 60 },
  { emoji: '🐶', label: 'Dog', size: 60 },
  { emoji: '🐧', label: 'Penguin', size: 55 },
  { emoji: '🦊', label: 'Fox', size: 55 },
  { emoji: '🐸', label: 'Frog', size: 55 },
  { emoji: '🦋', label: 'Butterfly', size: 50 },
  
  // Food
  { emoji: '🍎', label: 'Apple', size: 50 },
  { emoji: '🍕', label: 'Pizza', size: 55 },
  { emoji: '🍔', label: 'Burger', size: 55 },
  { emoji: '🍰', label: 'Cake', size: 55 },
  { emoji: '🍓', label: 'Strawberry', size: 50 },
  { emoji: '🥑', label: 'Avocado', size: 50 },
  
  // Nature
  { emoji: '🌸', label: 'Cherry Blossom', size: 55 },
  { emoji: '🌟', label: 'Star', size: 50 },
  { emoji: '🌙', label: 'Moon', size: 50 },
  { emoji: '☀️', label: 'Sun', size: 55 },
  { emoji: '🌈', label: 'Rainbow', size: 60 },
  { emoji: '⚡', label: 'Lightning', size: 50 },
  
  // Objects
  { emoji: '🎈', label: 'Balloon', size: 55 },
  { emoji: '🎁', label: 'Gift', size: 55 },
  { emoji: '🎵', label: 'Music Note', size: 50 },
  { emoji: '⚽', label: 'Soccer Ball', size: 50 },
  { emoji: '🚀', label: 'Rocket', size: 55 },
  { emoji: '💎', label: 'Diamond', size: 50 },
];

export const StickerApp: React.FC = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const stageRef = useRef<any>(null);

  const createImageFromEmoji = useCallback((emoji: string, size: number): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const pixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = size * pixelRatio;
      canvas.height = size * pixelRatio;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      if (context) {
        context.scale(pixelRatio, pixelRatio);
        context.font = `${size * 0.8}px serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(emoji, size / 2, size / 2);
      }

      const image = new Image();
      image.onload = () => resolve(image);
      image.src = canvas.toDataURL();
    });
  }, []);

  const addSticker = useCallback(async (emoji: string, label: string, size: number) => {
    try {
      const image = await createImageFromEmoji(emoji, size);
      const id = `sticker_${Date.now()}_${Math.random()}`;
      
      // Start position in center, then snap to grid
      const startX = snapToGrid(CANVAS_WIDTH / 2 - size / 2);
      const startY = snapToGrid(CANVAS_HEIGHT / 2 - size / 2);
      
      const newSticker: Sticker = {
        id,
        x: startX,
        y: startY,
        image,
        width: size,
        height: size,
      };

      setStickers(prev => [...prev, newSticker]);
      toast.success(`${label} sticker added!`, {
        description: 'Drag to move, double-click to delete',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding sticker:', error);
      toast.error('Failed to add sticker');
    }
  }, [createImageFromEmoji]);

  const updateSticker = useCallback((id: string, x: number, y: number) => {
    setStickers(prev => 
      prev.map(sticker => 
        sticker.id === id 
          ? { ...sticker, x: Math.max(0, Math.min(x, CANVAS_WIDTH - sticker.width)), y: Math.max(0, Math.min(y, CANVAS_HEIGHT - sticker.height)) }
          : sticker
      )
    );
  }, []);

  const deleteSticker = useCallback((id: string) => {
    setStickers(prev => prev.filter(sticker => sticker.id !== id));
  }, []);

  const downloadCanvas = useCallback(() => {
    if (stageRef.current) {
      const stage = stageRef.current.getStage();
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      
      const link = document.createElement('a');
      link.download = `sticker-canvas-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sticker Canvas Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Create, drag, and design with fun stickers! Double-click to delete.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-border">
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Sticker Buttons Grid */}
            <div className="order-2 xl:order-1 w-full xl:w-auto">
              <div className="text-sm font-medium text-muted-foreground mb-4 text-center xl:text-left">
                Choose Stickers
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 xl:grid-cols-4 gap-3 max-w-md xl:max-w-xs">
                {stickerConfigs.map((config, index) => (
                  <StickerButton
                    key={config.emoji}
                    emoji={config.emoji}
                    label={config.label}
                    onClick={() => addSticker(config.emoji, config.label, config.size)}
                    className={`delay-${(index % 6) * 100}`}
                  />
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 order-1 xl:order-2">
              <StickerCanvas
                stickers={stickers}
                onUpdateSticker={updateSticker}
                onDeleteSticker={deleteSticker}
                ref={stageRef}
              />
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center mt-6 pt-6 border-t border-border">
            <DownloadButton onDownload={downloadCanvas} />
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <span>🖱️ Click stickers to add them</span>
                <span>🫳 Drag to move around</span>
                <span>🗑️ Double-click to delete</span>
                <span>📏 Auto-snaps to 40px grid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
