"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApprovalQueueProps {
  workspaceId: string;
}

export function ApprovalQueue({ workspaceId }: ApprovalQueueProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/facebook/approval/queue?workspaceId=${encodeURIComponent(workspaceId)}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch approval queue");
      }

      const data = await response.json();
      setQueue(data.queue || []);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  const handleApprove = async (contentVersionId: string) => {
    try {
      setActionLoading(contentVersionId);
      const response = await fetch("/api/facebook/approval/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          contentVersionId,
          complianceCheckPassed: true,
          brandCheckPassed: true,
          factualCheckPassed: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve content");
      }

      await fetchQueue();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contentVersionId: string) => {
    try {
      setActionLoading(contentVersionId);
      const response = await fetch("/api/facebook/approval/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          contentVersionId,
          decisionReason: "Rejected via dashboard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject content");
      }

      await fetchQueue();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An error occurred");
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
          <div className="rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {queue.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600 opacity-50" />
            <p className="text-gray-600">No pending approvals</p>
            <p className="mt-1 text-sm text-gray-500">All content has been reviewed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item: any) => {
              const versionId = item.facebook_content_versions?.[0]?.id;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.content_type}</Badge>
                      </div>
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {item.facebook_content_versions?.[0]?.caption || "No caption"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      Pending
                    </Badge>
                  </div>

                  {item.scheduled_publish_time && (
                    <p className="mb-3 text-xs text-gray-600">
                      Scheduled: {new Date(item.scheduled_publish_time).toLocaleString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => versionId && handleApprove(versionId)}
                      disabled={!versionId || actionLoading === versionId}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {actionLoading === versionId ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => versionId && handleReject(versionId)}
                      disabled={!versionId || actionLoading === versionId}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      {actionLoading === versionId ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
