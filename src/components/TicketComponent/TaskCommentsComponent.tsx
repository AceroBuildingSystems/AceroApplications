import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Comment {
    text: string;
    commentedBy?: {
        displayName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatarUrl?: string;
    };
    commentedAt: string | Date;
}

interface Props {
    comments: Comment[];
    isLoading?: boolean;
    onAddComment?: (text: string) => Promise<void> | void;
    currentUser?: { _id: string; displayName: string; avatarUrl?: string };
}

export default function TaskCommentsComponent({
    comments = [],
    isLoading = false,
    onAddComment,
    currentUser,
}: Props) {
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        await onAddComment?.(newComment);
        setNewComment("");
        setIsSubmitting(false);
    };

    return (
        <div className="p-4 bg-gray-50 rounded-xl flex flex-col h-[400px] shadow-md border border-gray-300">
            <h3 className="font-semibold text-gray-700 mb-3">Comments</h3>

            {/* Comment input */}
            <div className="flex items-start gap-3 mb-3">
                <Avatar className="text-sm w-9 h-9">
                    <AvatarFallback>
                        {currentUser?.displayName?.toProperCase()?.split(" ")?.[0]?.[0] || "U"}
                        {currentUser?.displayName?.toProperCase()?.split(" ")?.[1]?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[40px]"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !newComment.trim()}
                                className="px-4"
                            >
                                {isSubmitting ? "Posting..." : "Post"}
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-4 px-2">
                {comments.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                        No comments yet. Be the first to comment!
                    </p>
                )}

                {comments.map((c, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 border-b pb-3 last:border-none"
                    >
                        <Avatar className="text-sm w-9 h-9">
                            <AvatarFallback>
                                {c?.commentedBy?.displayName?.toProperCase()?.split(" ")?.[0]?.[0] ||
                                    currentUser?.displayName?.toProperCase()?.split(" ")?.[0]?.[0]}
                                {c?.commentedBy?.displayName?.toProperCase()?.split(" ")?.[1]?.[0] ||
                                    currentUser?.displayName?.toProperCase()?.split(" ")?.[1]?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-gray-800">
                                    {c.commentedBy?.displayName?.toProperCase() || currentUser?.displayName?.toProperCase()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {format(new Date(c.commentedAt), "dd MMM yyyy, hh:mm a")}
                                </p>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{c.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}