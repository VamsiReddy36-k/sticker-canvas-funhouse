
import React, { useRef, forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
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

export const StickerCanvas = forwardRef<any, StickerCanvasProps>(({
  stickers,
  onUpdateSticker,
  onDeleteSticker,
}, ref) => {
  const handleDragEnd = (id: string, x: number, y: number) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    onUpdateSticker(id, snappedX, snappedY);
  };

  const handleDoubleClick = (id: string) => {
    onDeleteSticker(id);
    toast.success('Sticker deleted!', {
      duration: 2000,
    });
  };

  return (
    <div className="border-2 border-border rounded-lg overflow-hidden shadow-lg bg-white">
      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        ref={ref}
        className="bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <Layer>
          {stickers.map((sticker) => (
            <KonvaImage
              key={sticker.id}
              id={sticker.id}
              image={sticker.image}
              x={sticker.x}
              y={sticker.y}
              width={sticker.width}
              height={sticker.height}
              draggable
              onDragEnd={(e) => {
                const node = e.target;
                handleDragEnd(sticker.id, node.x(), node.y());
              }}
              onDblClick={() => handleDoubleClick(sticker.id)}
              onTap={() => handleDoubleClick(sticker.id)}
              shadowColor="black"
              shadowBlur={5}
              shadowOpacity={0.3}
              shadowOffsetX={2}
              shadowOffsetY={2}
              scaleX={1}
              scaleY={1}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) {
                  stage.container().style.cursor = 'pointer';
                }
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) {
                  stage.container().style.cursor = 'default';
                }
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
});

StickerCanvas.displayName = 'StickerCanvas';

export { CANVAS_WIDTH, CANVAS_HEIGHT, snapToGrid };
