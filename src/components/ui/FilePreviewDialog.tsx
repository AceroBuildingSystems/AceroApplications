import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, File, Image as ImageIcon, FileText, Video } from 'lucide-react';
import PlaceholderImage from './PlaceholderImage';

interface FilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    storedFileName?: string;
    originalName?: string;
  };
  formatFileSize: (bytes: number) => string;
}

const debugFileInfo = (file) => {
  console.log('File preview info:', {
    name: file.fileName,
    type: file.fileType,
    size: file.fileSize,
    url: file.url
  });
};

const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  isOpen,
  onClose,
  file,
  formatFileSize
}) => {
  const [previewError, setPreviewError] = React.useState(false);
  
  // Reset error state when dialog opens with a new file
  React.useEffect(() => {
    if (isOpen) {
      setPreviewError(false);
      debugFileInfo(file); // Log debug info when opening the preview
    }
  }, [isOpen, file?.url]);
  
  if (!file) return null;
  
  const isImage = file.fileType?.startsWith('image/');
  const isPdf = file.fileType?.includes('pdf');
  const isVideo = file.fileType?.startsWith('video/');
  
  // Get proper download URL
  const getDownloadUrl = () => {
    const filename = file.storedFileName || file.fileName;
    const originalName = file.originalName || file.fileName;
    
    if (!filename) return '#';
    
    return `/api/download?filename=${encodeURIComponent(filename)}&originalName=${encodeURIComponent(originalName)}`;
  };
  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-6 w-6" />;
    if (isPdf) return <FileText className="h-6 w-6 text-red-500" />;
    if (isVideo) return <Video className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <DialogTitle className="text-lg">{file.fileName}</DialogTitle>
          </div>

        </DialogHeader>
        
        <DialogDescription className="text-sm text-gray-500">
          {formatFileSize(file.fileSize)} • {file.fileType}
        </DialogDescription>
        
        <div className="flex-1 overflow-auto my-4 flex items-center justify-center bg-gray-100 rounded-md">
          {isImage && !previewError ? (
            <img
              src={file.url}
              alt={file.fileName}
              className="max-w-full max-h-[60vh] object-contain"
              onError={() => setPreviewError(true)}
            />
          ) : isPdf ? (
            <iframe
              src={`${file.url}#toolbar=0&navpanes=0`}
              className="w-full h-[60vh]"
              title={file.fileName}
              onError={() => setPreviewError(true)}
            />
          ) : isVideo && !previewError ? (
            <video
              src={file.url}
              controls
              className="max-w-full max-h-[60vh]"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="p-8 text-center">
              {previewError ? (
                <div className="flex flex-col items-center">
                  <PlaceholderImage fileName={file.fileName} className="w-32 h-32" />
                  <p className="mt-4 text-gray-500">Preview not available</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {getFileIcon()}
                  <p className="mt-4 text-gray-500">This file type cannot be previewed</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button asChild>
            <a href={getDownloadUrl()} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;