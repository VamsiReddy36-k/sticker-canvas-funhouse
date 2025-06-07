
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadButtonProps {
  onDownload: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload }) => {
  const handleDownload = () => {
    onDownload();
    toast.success('Canvas downloaded!', {
      description: 'Your sticker creation has been saved as PNG',
      duration: 3000,
    });
  };

  return (
    <Button
      onClick={handleDownload}
      size="lg"
      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
    >
      <Download className="mr-2 h-5 w-5" />
      Download PNG
    </Button>
  );
};
