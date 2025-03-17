  
  // src/lib/getStatusColor.ts
  export function getStatusColor(status: string) {
    const statusMap = {
      NEW: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      ASSIGNED: 'bg-violet-50 text-violet-800 border-violet-200',
      IN_PROGRESS: 'bg-amber-50 text-amber-800 border-amber-200',
      RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    
    return statusMap[status?.toUpperCase()] || statusMap.NEW;
  }
  
  export function getPriorityColor(priority: string) {
    const priorityMap = {
      HIGH: 'bg-red-50 text-red-800 border-red-200',
      MEDIUM: 'bg-orange-50 text-orange-800 border-orange-200',
      LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
    
    return priorityMap[priority?.toUpperCase()] || priorityMap.MEDIUM;
  }