// src/components/TicketComponent/ConnectionStatus.tsx
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;
  onReconnect: () => void;
  className?: string;
}

/**
 * A component to display the current connection status with optimized rendering
 * to prevent unnecessary re-renders during typing.
 */
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  connectionError,
  onReconnect,
  className
}) => {
  if (isConnected) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-green-50 text-green-700 flex items-center gap-1", className)}
      >
        <CheckCircle className="h-3 w-3" />
        <span className="hidden sm:inline">Connected</span>
      </Badge>
    );
  }
  
  if (isConnecting) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-yellow-50 text-yellow-700 flex items-center gap-1 animate-pulse", className)}
      >
        <Loader className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Connecting...</span>
      </Badge>
    );
  }
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        <span className="hidden sm:inline">Offline</span>
      </Badge>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onReconnect} 
        className="h-6 p-0 px-2"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        <span className="text-xs">Reconnect</span>
      </Button>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(ConnectionStatus);