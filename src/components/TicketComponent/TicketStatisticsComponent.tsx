// src/components/TicketComponent/TicketStatisticsComponent.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

interface TicketStatisticsComponentProps {
  tickets: any[];
  departmentFilter?: string;
  userFilter?: string;
}

const TicketStatisticsComponent: React.FC<TicketStatisticsComponentProps> = ({
  tickets,
  departmentFilter,
  userFilter
}) => {
  // Filter tickets based on department and user filters
  const filteredTickets = tickets.filter(ticket => {
    if (departmentFilter && ticket.department._id !== departmentFilter) return false;
    if (userFilter && ticket.assignee?._id !== userFilter && ticket.creator._id !== userFilter) return false;
    return true;
  });
  
  // Status distribution data
  const statusCounts = filteredTickets.reduce((acc, ticket) => {
    const status = ticket.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const statusData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));
  
  // Priority distribution data
  const priorityCounts = filteredTickets.reduce((acc, ticket) => {
    const priority = ticket.priority;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  
  const priorityData = Object.keys(priorityCounts).map(priority => ({
    name: priority,
    value: priorityCounts[priority]
  }));
  
  // Department distribution data
  const departmentCounts = filteredTickets.reduce((acc, ticket) => {
    const department = ticket.department.name;
    acc[department] = (acc[department] || 0) + 1;
    return acc;
  }, {});
  
  const departmentData = Object.keys(departmentCounts).map(department => ({
    name: department,
    value: departmentCounts[department]
  }));
  
  // Recent activity data - tickets created in the last 14 days
  const twoWeeksAgo = subDays(new Date(), 14);
  const recentTickets = filteredTickets.filter(ticket => new Date(ticket.createdAt) >= twoWeeksAgo);
  
  const dailyTicketCounts = {};
  for (let i = 0; i < 14; i++) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    dailyTicketCounts[dateStr] = 0;
  }
  
  recentTickets.forEach(ticket => {
    const dateStr = format(new Date(ticket.createdAt), 'yyyy-MM-dd');
    if (dailyTicketCounts[dateStr] !== undefined) {
      dailyTicketCounts[dateStr]++;
    }
  });
  
  const activityData = Object.keys(dailyTicketCounts)
    .sort()
    .map(date => ({
      date,
      count: dailyTicketCounts[date],
      displayDate: format(new Date(date), 'MMM dd')
    }));
  
  // Color configurations
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const PRIORITY_COLORS = {
    'HIGH': '#FF6B6B',
    'MEDIUM': '#FFD166',
    'LOW': '#06D6A0'
  };
  const STATUS_COLORS = {
    'NEW': '#4361EE',
    'ASSIGNED': '#3F37C9',
    'IN_PROGRESS': '#F7B801',
    'RESOLVED': '#4CC9F0',
    'CLOSED': '#4F4F4F'
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredTickets.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredTickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredTickets.filter(t => t.priority === 'HIGH').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredTickets.filter(t => t.status === 'CLOSED').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Tickets created in the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3F37C9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of tickets by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Breakdown of tickets by priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {!departmentFilter && (
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
              <CardDescription>Breakdown of tickets by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884D8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketStatisticsComponent;