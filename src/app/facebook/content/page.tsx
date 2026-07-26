import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

export const metadata = {
  title: 'Content Calendar | Facebook Operations',
  description: 'View and manage your 30-day Facebook content calendar'
};

interface PageProps {
  searchParams: {
    workspace?: string;
    connector?: string;
  };
}

export default function ContentCalendarPage({ searchParams }: PageProps) {
  const workspaceId = searchParams.workspace || '';
  const connectorId = searchParams.connector || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Content Calendar
            </h1>
            <p className="text-gray-600 mt-1">30-day view of your scheduled Facebook posts</p>
          </div>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">
              The content calendar is being configured for your workspace.
            </p>
            <p className="text-sm text-gray-500">
              Workspace: {workspaceId || 'Not specified'}
            </p>
            {connectorId && (
              <p className="text-sm text-gray-500">
                Connector: {connectorId}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
