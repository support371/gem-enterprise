import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Approval Queue | Facebook Operations',
  description: 'Review and approve pending Facebook posts'
};

interface PageProps {
  searchParams: {
    workspace?: string;
    connector?: string;
  };
}

export default function ApprovalsPage({ searchParams }: PageProps) {
  const workspaceId = searchParams.workspace || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckCircle className="w-8 h-8" />
            Approval Queue
          </h1>
          <p className="text-gray-600 mt-1">Review and approve pending Facebook posts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">
              The approval queue is being configured for your workspace.
            </p>
            <p className="text-sm text-gray-500">
              Workspace: {workspaceId || 'Not specified'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
