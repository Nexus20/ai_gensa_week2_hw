import { useEffect, useState, useCallback, useRef } from 'react';
import { getData } from '../api/client';
import { POLL_INTERVAL_MS, RETRY_MAX_ATTEMPTS, RETRY_DELAY_MS } from '../config';

export interface UseApiResourceOptions {
  pollIntervalMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface UseApiResourceResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  retry: () => void;
}

export function useApiResource<T>(
  path: string,
  options: UseApiResourceOptions = {},
): UseApiResourceResult<T> {
  const {
    pollIntervalMs = POLL_INTERVAL_MS,
    maxRetries = RETRY_MAX_ATTEMPTS,
    retryDelayMs = RETRY_DELAY_MS,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchKey, setFetchKey] = useState(0);
  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const retry = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let retries = 0;
    let cancelled = false;

    const attempt = () => {
      setLoading(true);
      setError('');
      getData<T>(path)
        .then((result) => {
          if (cancelled) return;
          setData(result);
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          if (retries < maxRetries) {
            retries++;
            timerRef.current = setTimeout(attempt, retryDelayMs);
          } else {
            setError(String(err && err.message ? err.message : err));
            setLoading(false);
          }
        });
    };

    cancelledRef.current = false;
    attempt();

    return () => {
      cancelled = true;
      cancelledRef.current = true;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [path, fetchKey, maxRetries, retryDelayMs]);

  // polling
  useEffect(() => {
    if (data === null || pollIntervalMs <= 0) return;
    const id = setInterval(() => {
      setFetchKey((k) => k + 1);
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [data, pollIntervalMs]);

  return { data, loading, error, retry };
}
