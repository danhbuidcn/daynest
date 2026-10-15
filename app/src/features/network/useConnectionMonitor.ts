import { addNetworkStateListener, getNetworkStateAsync, type NetworkState } from 'expo-network';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { getIssue, setDeviceOnline, subscribeConnection } from '@/lib/connection';
import { timedFetch } from '@/lib/supabase';

const PROBE_INTERVAL_MS = 30_000;

// Same rule the app used before: unknown counts as online.
const isOnline = (n: NetworkState) => n.isConnected !== false && n.isInternetReachable !== false;

// Mounted once: feeds the device's network state into the connection store, probes the server
// every 30 s while it is down, and reloads what is on screen when the connection comes back.
export function useConnectionMonitor() {
  const queryClient = useQueryClient();
  const hadIssue = useRef(false);

  useEffect(() => {
    getNetworkStateAsync().then((n) => setDeviceOnline(isOnline(n)), () => {});
    const sub = addNetworkStateListener((n) => setDeviceOnline(isOnline(n)));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let probe: ReturnType<typeof setInterval> | null = null;
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

    const update = () => {
      const issue = getIssue();
      if (issue === 'server' && !probe) {
        // A call that gets an answer clears the fault by itself (see timedFetch).
        probe = setInterval(() => void timedFetch(`${url}/auth/v1/health`, { headers: { apikey: key } }).catch(() => {}), PROBE_INTERVAL_MS);
      } else if (issue !== 'server' && probe) {
        clearInterval(probe);
        probe = null;
      }
      if (issue) hadIssue.current = true;
      else if (hadIssue.current) {
        hadIssue.current = false;
        void queryClient.invalidateQueries();
      }
    };

    update();
    const unsubscribe = subscribeConnection(update);
    return () => {
      unsubscribe();
      if (probe) clearInterval(probe);
    };
  }, [queryClient]);
}
