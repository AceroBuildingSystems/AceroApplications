// src/components/TicketComponent/ConnectionStatus.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  onReconnect: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  onReconnect
}) => {
  if (isConnected) {
    return (
      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        <span className="hidden sm:inline">Connected</span>
      </Badge>
    );
  }
  
  if (isConnecting) {
    return (
      <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 flex items-center gap-1 animate-pulse">
        <Loader className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Connecting...</span>
      </Badge>
    );
  }
  
  return (
    <div className="flex items-center gap-1 ml-2">
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

export default ConnectionStatus;