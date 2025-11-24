// src/components/TicketComponent/TicketHistoryComponent.tsx
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { formatDistanceToNow } from 'date-fns';
import { format } from 'date-fns';

interface TaskHistoryComponentProps {
    history: any[];
    isLoading: boolean;
    requestType: string;
}

const getHistoryActionLabel = (action: string) => {
    switch (action) {
        case 'CREATE':
            return 'created this ticket';
        case 'UPDATE':
            return 'updated this ticket';
        case 'ASSIGN':
            return 'assigned this ticket';
        case 'STATUS_CHANGE':
            return 'changed the status';
        case 'COMMENT':
            return 'commented on this ticket';
        case 'TASK_CREATE':
            return 'created a task';
        case 'TASK_UPDATE':
            return 'updated a task';
        case 'TASK_STATUS_CHANGE':
            return 'changed a task status';
        default:
            return action;
    }
};

const getHistoryDetails = (action: string, oldValue: any, newValue: any) => {

    switch (action) {
        case 'Task':
            return `New ${newValue}`;
        case 'status':
            return `Task status changed from ${oldValue} to ${newValue}`;
        case 'progress':
            return `Task progress updated from ${oldValue}% to ${newValue}%`;
        case 'taskType':
            return `Task type changed from ${oldValue} to ${newValue}`;
        default:
            return null;
    }
};

const TaskHistoryComponent: React.FC<TaskHistoryComponentProps> = ({
    history,
    isLoading,
    requestType
}) => {
    console.log({ history })
    return (
        <Card className='bg-gray-50'>
            <CardContent className="p-4">
                <DashboardLoader loading={isLoading}>
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No history available for this {requestType === 'task' ? 'task' : 'ticket'}.
                        </div>
                    ) : (
                        <div className="relative space-y-4 before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
                            {history.map((entry) => (
                                <div key={entry._id} className="relative pl-12">
                                    <div className="absolute left-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 ">
                                        <Avatar className="text-sm mt-2">
                                            <AvatarFallback>{`${entry.changedBy?.displayName?.toProperCase()?.split(" ")?.[0]?.[0]}${entry.changedBy?.displayName?.toProperCase()?.split(" ")?.[1]?.[0]}`}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex flex-col rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">
                                                    {`${entry.changedBy?.displayName?.toProperCase()}`}
                                                </span>
                                                {/* <span className="text-gray-500">
                                                    {getHistoryActionLabel(entry.action)}
                                                </span> */}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(entry?.changedAt), 'MMM d, yyyy, hh:mm a')}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-700">
                                            {getHistoryDetails(entry.field, entry.oldValue, entry.newValue)}
                                        </p>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardLoader>
            </CardContent>
        </Card>
    );
};

export default TaskHistoryComponent;