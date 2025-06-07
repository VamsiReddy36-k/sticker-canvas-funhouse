
import React from 'react';
import { Button } from '@/components/ui/button';
import { Rows2, Rows3, Rows4 } from 'lucide-react';

interface GridControlsProps {
  gridRows: number;
  gridCols: number;
  showGrid: boolean;
  onGridRowsChange: (rows: number) => void;
  onGridColsChange: (cols: number) => void;
  onToggleGrid: () => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  gridRows,
  gridCols,
  showGrid,
  onGridRowsChange,
  onGridColsChange,
  onToggleGrid,
}) => {
  const rowOptions = [3, 4, 5, 6];
  const colOptions = [5, 6, 7, 8];

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="text-sm font-medium text-muted-foreground">Grid Settings</div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={showGrid ? "default" : "outline"}
          size="sm"
          onClick={onToggleGrid}
          className="text-xs"
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Rows</div>
        <div className="flex gap-1">
          {rowOptions.map((rows) => (
            <Button
              key={rows}
              variant={gridRows === rows ? "default" : "outline"}
              size="sm"
              onClick={() => onGridRowsChange(rows)}
              className="w-8 h-8 p-0 text-xs"
            >
              {rows}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Columns</div>
        <div className="flex gap-1">
          {colOptions.map((cols) => (
            <Button
              key={cols}
              variant={gridCols === cols ? "default" : "outline"}
              size="sm"
              onClick={() => onGridColsChange(cols)}
              className="w-8 h-8 p-0 text-xs"
            >
              {cols}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
