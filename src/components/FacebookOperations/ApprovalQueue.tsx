'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApprovalQueueProps {
  workspaceId: string;
}

export function ApprovalQueue({ workspaceId }: ApprovalQueueProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, [workspaceId]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/facebook/approval/queue?workspaceId=${workspaceId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch approval queue');
      }

      const data = await response.json();
      setQueue(data.queue || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentVersionId: string) => {
    try {
      setActionLoading(contentVersionId);
      const response = await fetch('/api/facebook/approval/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          contentVersionId,
          complianceCheckPassed: true,
          brandCheckPassed: true,
          factualCheckPassed: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve content');
      }

      await fetchQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contentVersionId: string) => {
    try {
      setActionLoading(contentVersionId);
      const response = await fetch('/api/facebook/approval/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          contentVersionId,
          decisionReason: 'Rejected via dashboard'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject content');
      }

      await fetchQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading approval queue...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Approval Queue</CardTitle>
          <Badge variant="outline">{queue.length} pending</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md text-sm text-red-800">
            {error}
          </div>
        )}

        {queue.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3 opacity-50" />
            <p className="text-gray-600">No pending approvals</p>
            <p className="text-sm text-gray-500 mt-1">All content has been reviewed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item: any) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Badge variant="outline">{item.content_type}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {item.facebook_content_versions?.[0]?.caption || 'No caption'}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50">
                    Pending
                  </Badge>
                </div>

                {item.scheduled_publish_time && (
                  <p className="text-xs text-gray-600 mb-3">
                    Scheduled: {new Date(item.scheduled_publish_time).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(item.facebook_content_versions?.[0]?.id)}
                    disabled={actionLoading === item.facebook_content_versions?.[0]?.id}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {actionLoading === item.facebook_content_versions?.[0]?.id ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleReject(item.facebook_content_versions?.[0]?.id)}
                    disabled={actionLoading === item.facebook_content_versions?.[0]?.id}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {actionLoading === item.facebook_content_versions?.[0]?.id ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
