"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmergencyControlsProps {
  workspaceId: string;
  connectorId: string;
}

interface EmergencyStatus {
  isLocked: boolean;
  lockedAt?: string | null;
  lockReason?: string | null;
}

export function EmergencyControls({ workspaceId, connectorId }: EmergencyControlsProps) {
  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/facebook/emergency/status?workspaceId=${encodeURIComponent(workspaceId)}&connectorId=${encodeURIComponent(connectorId)}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch emergency status");
      }

      const data = await response.json();
      setStatus(data.emergencyStatus);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, connectorId]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const handleEmergencyLock = async () => {
    try {
      setActionLoading(true);
      const response = await fetch("/api/facebook/emergency/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          connectorId,
          reason: "Manual emergency lock via dashboard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate emergency lock");
      }

      await fetchStatus();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergencyUnlock = async () => {
    try {
      setActionLoading(true);
      const response = await fetch("/api/facebook/emergency/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, connectorId }),
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate emergency lock");
      }

      await fetchStatus();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading emergency controls...</p>
      </div>
    );
  }

  return (
    <Card className={status?.isLocked ? "border-red-300 bg-red-50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Emergency Controls
          </CardTitle>
          <Badge variant={status?.isLocked ? "destructive" : "outline"}>
            {status?.isLocked ? "LOCKED" : "ACTIVE"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-sm font-semibold">Current Status</p>
          <p className="text-sm text-gray-700">
            {status?.isLocked
              ? "Publishing is paused. All scheduled posts are on hold."
              : "Publishing is active only when every shared governance gate also passes."}
          </p>

          {status?.isLocked && status.lockReason && (
            <div className="mt-3 rounded border border-red-200 bg-white p-2">
              <p className="text-xs text-gray-600">Lock Reason:</p>
              <p className="font-mono text-sm text-gray-800">{status.lockReason}</p>
            </div>
          )}

          {status?.isLocked && status.lockedAt && (
            <p className="mt-3 text-xs text-gray-600">
              Locked at: {new Date(status.lockedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {status?.isLocked ? (
            <Button
              onClick={handleEmergencyUnlock}
              disabled={actionLoading}
              variant="default"
              className="flex-1"
            >
              <Unlock className="mr-2 h-4 w-4" />
              {actionLoading ? "Unlocking..." : "Resume Publishing"}
            </Button>
          ) : (
            <Button
              onClick={handleEmergencyLock}
              disabled={actionLoading}
              variant="destructive"
              className="flex-1"
            >
              <Lock className="mr-2 h-4 w-4" />
              {actionLoading ? "Locking..." : "Pause Publishing"}
            </Button>
          )}
        </div>

        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
          <p className="mb-1 font-semibold">Emergency lock</p>
          <p>
            Use this to pause Facebook publishing immediately. Scheduled posts remain blocked until an authorized operator resumes them.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
