// src/components/TicketComponent/TicketAttachmentComponent.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Paperclip, File, FileText, Image, Download, Trash, Upload, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { useUpdateTicketMutation } from '@/services/endpoints/ticketApi'; // adjust import as needed

interface Attachment {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  url: string;
}

interface TicketAttachmentComponentProps {
  ticketId: string;
  attachments: Attachment[];
  isLoading: boolean;
  userId: string;
  canEdit: boolean;
  // Function to refetch attachments after upload
}

const TicketAttachmentComponent: React.FC<TicketAttachmentComponentProps> = ({
  ticketId,
  attachments = [],
  isLoading,
  userId,
  canEdit,

}) => {
  console.log(attachments, 'attachments');
  const currentAttachments = attachments || [];
  const [updateTicket] = useUpdateTicketMutation();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Handle file upload (simulate for now)
  const handleUpload = async () => {
    if (!selectedFile) return;
    console.log('upoading file:', selectedFile.name);
    setIsUploading(true);
    setUploadProgress(0);

    // Prepare API endpoint with ticketId and userId
    const endpoint = `/api/upload?ticketId=${ticketId}&userId=${userId}`;

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": selectedFile.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${selectedFile.name}"`
    };

    // Optional: Track upload progress (for UI only)
    const reader = selectedFile.stream().getReader();
    let uploaded = 0;
    const total = selectedFile.size;
    let chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        uploaded += value.length;
        setUploadProgress(Math.min(100, Math.round((uploaded / total) * 100)));
      }
    }
    const fileBuffer = new Blob(chunks);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: fileBuffer
      });

      const result = await res.json();
      console.log('Upload result:', result);
      if (res.ok && result.status === "success") {
        const newAttachment = {
          url: result.data.url,
          fileName: result.data.fileName,
          fileType: result.data.fileType,
          fileSize: result.data.fileSize,
          attachedBy: result.data.userId,
          attachedAt: result.data.uploadedAt,
          originalName: result.data.originalName,
          storedFileName: result.data.storedFileName,
          ticketId: result.data.ticketId,
        };

        // Create the new array
        const updatedAttachments = [...currentAttachments, newAttachment];

        // Call the mutation
        await updateTicket({
          action: 'update',
          data: { _id: ticketId, attachments: updatedAttachments }
        }).unwrap();


        toast.success("File uploaded successfully");
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        // Optionally: refresh attachments list here
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (fileType?.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Attachments</CardTitle>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Attach File
            </Button>
          )}
        </div>
        <CardDescription>
          Files and documents related to this ticket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardLoader loading={isLoading}>
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attachments yet. Upload files to share with the team.
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment:any) => (
                <div
                  key={attachment._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(attachment.fileType)}
                    <div>
                      <h4 className="font-medium">{attachment.fileName}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(attachment.attachedAt), 'MMM d, yyyy, hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs text-gray-600">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarFallback className="text-[9px]">
                          {`${attachment.attachedBy?.firstName?.[0] ?? ''}${attachment.attachedBy?.lastName?.[0] ?? ''}`}
                        </AvatarFallback>
                      </Avatar>
                      {attachment.attachedBy?.firstName}
                    </span>

                    <Button variant="ghost" size="icon" asChild>
                      <a href={attachment.url} download target="_blank">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>

                    {canEdit && userId === attachment.attachedBy?._id && (
                      <Button variant="ghost" size="icon">
                        {/* <Trash className="h-4 w-4 text-red-500" /> */}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardLoader>
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
            <DialogDescription>
              Attach a file to this ticket
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop a file here, or click to select
              </p>
              <Input
                id="file-upload"
                type="file"
                className="max-w-xs"
                onChange={handleFileChange}
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1">
                    <h4 className="font-medium">{selectedFile.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TicketAttachmentComponent;