'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lock, Unlock } from 'lucide-react';

interface EmergencyControlsProps {
  workspaceId: string;
  connectorId: string;
}

export function EmergencyControls({ workspaceId, connectorId }: EmergencyControlsProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [workspaceId, connectorId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/facebook/emergency/status?workspaceId=${workspaceId}&connectorId=${connectorId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch emergency status');
      }

      const data = await response.json();
      setStatus(data.emergencyStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyLock = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/facebook/emergency/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          connectorId,
          reason: 'Manual emergency lock via dashboard'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to activate emergency lock');
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergencyUnlock = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/facebook/emergency/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          connectorId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate emergency lock');
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    <Card className={status?.isLocked ? 'border-red-300 bg-red-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Emergency Controls
          </CardTitle>
          <Badge variant={status?.isLocked ? 'destructive' : 'outline'}>
            {status?.isLocked ? 'LOCKED' : 'ACTIVE'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold mb-2">Current Status</p>
          <p className="text-sm text-gray-700">
            {status?.isLocked
              ? 'Publishing is PAUSED. All scheduled posts are on hold.'
              : 'Publishing is ACTIVE. Posts will publish according to schedule.'}
          </p>

          {status?.isLocked && status?.lockReason && (
            <div className="mt-3 p-2 bg-white rounded border border-red-200">
              <p className="text-xs text-gray-600">Lock Reason:</p>
              <p className="text-sm font-mono text-gray-800">{status.lockReason}</p>
            </div>
          )}

          {status?.isLocked && status?.lockedAt && (
            <p className="text-xs text-gray-600 mt-3">
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
              <Unlock className="w-4 h-4 mr-2" />
              {actionLoading ? 'Unlocking...' : 'Resume Publishing'}
            </Button>
          ) : (
            <Button
              onClick={handleEmergencyLock}
              disabled={actionLoading}
              variant="destructive"
              className="flex-1"
            >
              <Lock className="w-4 h-4 mr-2" />
              {actionLoading ? 'Locking...' : 'Pause Publishing'}
            </Button>
          )}
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Emergency Lock</p>
          <p>
            Use this to immediately pause all Facebook publishing. Scheduled posts will not publish until you resume.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
