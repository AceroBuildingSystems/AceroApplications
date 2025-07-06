'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Briefcase, FileText, Users, Workflow, Ticket, ShieldCheck, Bell, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data
const modules = [
  { title: 'HRMS', description: 'Manage HR forms and workflows.', href: '/dashboard/hrms', icon: <FileText className="h-8 w-8" /> },
  { title: 'Tickets', description: 'Track and manage support tickets.', href: '/dashboard/tickets', icon: <Ticket className="h-8 w-8" /> },
  { title: 'AQM', description: 'Advanced Quality Management.', href: '/dashboard/aqm', icon: <ShieldCheck className="h-8 w-8" /> },
  { title: 'Recruitment', description: 'Track positions and candidates.', href: '/', icon: <Briefcase className="h-8 w-8" /> },
];

const ticketData = [
  { name: 'High', value: 3, color: '#ef4444' },
  { name: 'Medium', value: 5, color: '#f97316' },
  { name: 'Low', value: 12, color: '#22c55e' },
];

const pendingTasks = [
  { id: 1, title: 'Approve Manpower Requisition #1023', user: 'Ali Ahmed', time: '2h ago' },
  { id: 2, title: 'Review Candidate Application for "Software Engineer"', user: 'Fatima Khan', time: '5h ago' },
  { id: 3, title: 'Sign Non-Disclosure Agreement', user: 'HR Department', time: '1d ago' },
];

const recentActivity = [
  { id: 1, user: { name: 'Yusuf Islam', avatar: '/avatars/01.png' }, action: 'submitted a new', item: 'Business Trip Request', time: '15m ago' },
  { id: 2, user: { name: 'Aisha Al-Farsi', avatar: '/avatars/02.png' }, action: 'approved', item: 'Manpower Requisition #1022', time: '45m ago' },
  { id: 3, user: { name: 'Zainab Bakar', avatar: '/avatars/03.png' }, action: 'commented on', item: 'Ticket #581', time: '1h ago' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-muted/40 min-h-screen">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here’s what’s happening today.</p>
        </div>
        <Button>Create New Form</Button>
      </header>

      <main className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Modules Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {modules.map((mod) => (
              <Card key={mod.title} className="hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">{mod.icon}</div>
                  <div>
                    <CardTitle>{mod.title}</CardTitle>
                    <CardDescription>{mod.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={mod.href} passHref>
                    <Button variant="outline" className="w-full">
                      <span>Go to {mod.title}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ticket Priority Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Open Ticket Priorities</CardTitle>
              <CardDescription>Distribution of tickets by priority level.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ticketData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Items that require your attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">from {task.user} • {task.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="font-semibold">{activity.user.name}</span> {activity.action} <span className="font-medium text-primary">{activity.item}</span>
                  </div>
                  <time className="ml-auto text-xs text-muted-foreground">{activity.time}</time>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
