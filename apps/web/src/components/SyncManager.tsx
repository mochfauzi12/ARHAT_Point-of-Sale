'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { offlineDB } from '@/lib/indexeddb';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function SyncManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkQueue = useCallback(async () => {
    const queue = await offlineDB.getSyncQueue();
    setPendingCount(queue.length);
  }, []);

  const syncData = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    const queue = await offlineDB.getSyncQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    
    // Simple getToken helper to re-use
    const getToken = () => {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      return match ? match[2] : '';
    };

    for (const item of queue) {
      try {
        const token = getToken();
        // Fire request
        const res = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(item.body)
        });

        if (res.ok || res.status === 400 || res.status === 401) {
          // If successful or hard error (not network error), we dequeue to prevent infinite loop
          await offlineDB.dequeueSync(item.id!);
        }
      } catch (err) {
        console.error('Sync failed for item', item.id, err);
        // Break out of loop, network probably dropped again
        break;
      }
    }
    
    setIsSyncing(false);
    checkQueue();
  }, [isOnline, isSyncing, checkQueue]);

  useEffect(() => {
    // Initial check
    setIsOnline(window.navigator.onLine);
    checkQueue();

    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also poll every 30 seconds just in case
    const interval = setInterval(() => {
      checkQueue();
      if (window.navigator.onLine) {
        syncData();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncData, checkQueue]);

  if (isOnline && pendingCount === 0) {
    // Clean state, don't show anything to keep UI clean
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border ${isOnline ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'} backdrop-blur-md`}>
      {isOnline ? (
        <Wifi size={20} className="text-amber-600" />
      ) : (
        <WifiOff size={20} className="text-red-500" />
      )}
      
      <div className="flex flex-col">
        <span className="font-bold text-sm leading-tight">
          {isOnline ? 'Internet Restored' : 'You are offline'}
        </span>
        <span className="text-xs opacity-80 font-medium">
          {pendingCount} transactions pending
        </span>
      </div>

      {isOnline && pendingCount > 0 && (
        <button 
          onClick={syncData}
          disabled={isSyncing}
          className="ml-2 p-2 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors disabled:opacity-50"
          title="Sync Now"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
}
