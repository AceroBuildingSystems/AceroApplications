// src/types/next.ts (Enhanced)
import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

export interface SocketWithIO extends Socket {
  server: SocketServer;
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketWithIO;
}

export interface Reaction {
  emoji: string;
  userId: string;
  createdAt?: Date;
}

export interface EditHistory {
  content: string;
  editedAt: Date;
}

export interface Attachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

export interface ChatMessage {
  _id?: string;
  ticket: string;
  user: any;
  content: string;
  attachments?: Attachment[];
  replyTo?: string;
  replyToUser?: any;
  replyToContent?: string;
  mentions?: string[];
  reactions?: Reaction[];
  isEdited?: boolean;
  editHistory?: EditHistory[];
  createdAt?: string;
  isRead?: boolean;
  readBy?: string[];
  deliveredAt?: Date;
  readAt?: Date;
}

export interface UserTyping {
  userId: string;
  isTyping: boolean;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastActive?: Date;
}

export interface UserJoined {
  userId: string;
  timestamp: Date;
}

export interface UserLeft {
  userId: string;
  timestamp: Date;
}

export interface MessagesRead {
  messageIds: string[];
  userId: string;
}

export interface FileUploadNotification {
  userId: string;
  ticketId: string;
  file: Attachment;
}

export interface ReactionUpdate {
  messageId: string;
  reactions: Reaction[];
}