// src/components/TicketComponent/ConnectionStatus.tsx
import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  RefreshCw, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: Error | string | null;
  onReconnect: () => void;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  connectionError,
  onReconnect,
  className
}) => {
  if (isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "bg-green-50 text-green-700 gap-1 cursor-default",
                className
              )}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span className="hidden sm:inline">Connected</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chat connection is active</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (isConnecting) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "bg-yellow-50 text-yellow-700 gap-1 cursor-default",
                className
              )}
            >
              <Clock className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Connecting...</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Establishing connection to chat server</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (connectionError) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Badge 
variant="outline" className="bg-red-50 text-red-700 gap-1 cursor-default">
          <WifiOff className="h-3 w-3" />
          <span className="hidden sm:inline">Disconnected</span>
        </Badge>
        <Badge 
          variant="outline" 
          className="bg-red-50 text-red-700 gap-1 cursor-default ml-1 text-xs"
          title={typeof connectionError === 'string' 
            ? connectionError 
            : connectionError.message}
        >
          <AlertCircle className="h-3 w-3" />
          <span className="hidden sm:inline truncate max-w-[100px]">Error</span>
        </Badge>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReconnect} 
          className="h-6 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Reconnect</span>
        </Button>
      </div>
    );
  }
  
  // Fallback - unknown state
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-gray-50 text-gray-700 gap-1 cursor-default",
        className
      )}
    >
      <AlertCircle className="h-3 w-3" />
      <span className="hidden sm:inline">Checking Connection</span>
    </Badge>
  );
};

export default ConnectionStatus;