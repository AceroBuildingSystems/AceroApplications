// src/components/TicketComponent/TicketCommentComponent.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTicketCommentMutation } from '@/services/endpoints/ticketCommentApi';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import DashboardLoader from '@/components/ui/DashboardLoader';

interface TicketCommentComponentProps {
  ticketId: string;
  comments: any[];
  isLoading: boolean;
  userId: string;
  currentUserName: string;
}

const TicketCommentComponent: React.FC<TicketCommentComponentProps> = ({
  ticketId,
  comments,
  isLoading,
  userId,
  currentUserName
}) => {
  const [comment, setComment] = useState('');
  const [createComment, { isLoading: isSubmitting }] = useCreateTicketCommentMutation();
  
  const handleSubmit = async () => {
    if (!comment.trim()) return;
    
    try {
      console.log("Creating comment with data:", {
        ticket: ticketId,
        user: userId,
        content: comment,
        addedBy: userId,
        updatedBy: userId
      });
      
      await createComment({
        action: 'create',
        data: {
          ticket: ticketId,
          user: userId,
          content: comment,
          addedBy: userId,
          updatedBy: userId
        }
      }).unwrap();
      
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error("Comment creation error:", error);
      toast.error('Failed to add comment');
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <DashboardLoader loading={isLoading}>
          <div className="space-y-6">
            {/* Comment input */}
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{currentUserName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!comment.trim() || isSubmitting}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Comment list */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {`${comment.user.firstName[0]}${comment.user.lastName[0]}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {`${comment.user.firstName} ${comment.user.lastName}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="mt-1 text-gray-700 whitespace-pre-line">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DashboardLoader>
      </CardContent>
    </Card>
  );
};

export default TicketCommentComponent;