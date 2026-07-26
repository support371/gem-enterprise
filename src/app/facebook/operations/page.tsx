import React from 'react';
import { FacebookDashboard } from '@/components/FacebookOperations/FacebookDashboard';
import { EmergencyControls } from '@/components/FacebookOperations/EmergencyControls';
import { ApprovalQueue } from '@/components/FacebookOperations/ApprovalQueue';

export const metadata = {
  title: 'Facebook Operations | GEM Enterprise',
  description: 'Manage Facebook Page content, publishing, and analytics'
};

interface PageProps {
  searchParams: {
    workspace?: string;
    connector?: string;
  };
}

export default function FacebookOperationsPage({ searchParams }: PageProps) {
  const workspaceId = searchParams.workspace || '';
  const connectorId = searchParams.connector || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <FacebookDashboard workspaceId={workspaceId} connectorId={connectorId} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ApprovalQueue workspaceId={workspaceId} />
          </div>

          <div>
            {connectorId && (
              <EmergencyControls workspaceId={workspaceId} connectorId={connectorId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
