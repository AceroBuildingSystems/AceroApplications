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
import { MONGO_MODELS } from '@/shared/constants';
import { useCreateApplicationMutation } from '@/services/endpoints/applicationApi';


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
  requestType?: string;
  userList?: any[];
  ticket?: any;
  onClose?: (updatedTicket?: any) => void;
  // Function to refetch attachments after upload
}

const TicketAttachmentComponent: React.FC<TicketAttachmentComponentProps> = ({
  ticketId,
  attachments = [],
  isLoading,
  userId,
  canEdit,
  requestType,
  userList,
  ticket,
  onClose

}) => {
  console.log(attachments, 'attachments');
  const currentAttachments = attachments || [];
  const [updateTicket] = useUpdateTicketMutation();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log("Selected files:", files);
    setSelectedFiles(files);
  };

  // Handle file upload (simulate for now)
  const handleUpload = async () => {

    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 🧭 Step 1: Generate unique task ID (similar to your logic)

      // 🧭 Step 2: Upload all files concurrently
      const uploadPromises = selectedFiles.map(async (file) => {
        const ext = file.name.split(".").pop();
        const baseName = file.name.split(".")[0];
        const uniqueName = `${baseName}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

        // Prepare endpoint
        const endpoint = `/api/uploadCadidatesDocs?fullname=${ticket?.taskId}&documentType=${uniqueName}&folderName=tasks`;
        // const endpoint = `/api/upload?ticketId=${generatedTaskId}&userId=${userId}`;
        const headers: HeadersInit = {
          "Content-Type": file.type || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${file.name}"`,
        };

        const reader = file.stream().getReader();
        let uploaded = 0;
        const total = file.size;
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
        const res = await fetch(endpoint, {
          method: "POST",
          headers,
          body: fileBuffer,
        });

        const result = await res.json();
        if (!res.ok || result.status !== "success") {
          throw new Error(result.message || "Upload failed");
        }

        return {
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
      });

      const uploadResult = await Promise.all(uploadPromises);

      console.log("All files uploaded successfully:", uploadResult);

      // 🧭 Step 3: Update DB
      const formattedData = {
        db: MONGO_MODELS.TASK,
        action: "update",
        filter: { _id: ticketId },
        data: {
          attachments: [
            ...(currentAttachments || []),
            ...uploadResult.map((f) => ({
              fileName: f.fileName,
              filePath: f.url,
              uploadedAt: f.attachedAt,
              uploadedBy: userId,
            })),
          ],
          updatedBy: userId,
        },
      };

      const responseResult = await createMaster(formattedData);

      toast.success("All files uploaded successfully");
      setSelectedFiles([]);
      setIsUploadDialogOpen(false);
      onClose(responseResult?.data?.data);
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err.message || "Upload failed");
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
    <Card className=' bg-gray-50'>
      <CardHeader className="py-3">
        <div className="flex justify-between items-center ">
          <CardTitle className="">Attachments</CardTitle>
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
          Files and documents related to this {requestType === 'task' ? 'task' : 'ticket'}
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
              {attachments?.map((attachment: any) => (
                <div
                  key={attachment.fileName}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(attachment.fileType)}
                    <div>
                      <h4 className="font-medium">{attachment.fileName}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {/* <span>{formatFileSize(attachment.uploadedAt)}</span> */}
                        {/* <span>•</span> */}
                        <span>
                          {format(new Date(attachment?.attachedAt || attachment?.uploadedAt), 'MMM d, yyyy, hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs text-gray-600">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarFallback className="text-[9px]">
                          {`${attachment.attachedBy?.firstName?.[0] ?? ''}${attachment.attachedBy?.lastName?.[0] ?? ''}${userList?.find?.(u => u?._id === attachment.uploadedBy)?.displayName?.toUpperCase()?.split(" ")?.[0]?.[0] ?? ''}
 ${userList?.find?.(u => u?._id === attachment.uploadedBy)?.displayName?.toUpperCase()?.split(" ")?.[1]?.[0] ?? ''}`}
                        </AvatarFallback>
                      </Avatar>
                      {attachment.attachedBy?.firstName}
                    </span>

                    <Button variant="ghost" size="icon" asChild>
                      <a href={attachment.url || attachment.filePath} download target="_blank">
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
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
            <DialogDescription>
              Attach file(s) to this {requestType === 'task' ? 'task' : 'ticket'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Input
                id="file-upload"
                type="file"
                className="max-w-xs"
                multiple
                onChange={handleFileChange}
              />
            </div>

            {/* File preview list */}
            {selectedFiles.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 border-b pb-2 last:border-none"
                  >
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{file.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                ))}

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

          {/* Footer buttons */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
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