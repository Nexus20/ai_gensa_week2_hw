import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiResource } from './useApiResource';

const mockGetData = vi.fn();

vi.mock('../api/client', () => ({
  getData: (path: string) => mockGetData(path),
}));

describe('useApiResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockGetData.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useApiResource<string>('test'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('returns data on successful fetch', async () => {
    mockGetData.mockResolvedValue('hello');
    const { result } = renderHook(() => useApiResource<string>('test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBe('');
  });

  it('returns error after all retries exhausted', async () => {
    mockGetData.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() =>
      useApiResource<string>('test', { maxRetries: 0 }),
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('retries on failure', async () => {
    // fail twice, succeed on third
    mockGetData
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('recovered');

    const { result } = renderHook(() =>
      useApiResource<string>('test', { maxRetries: 2, retryDelayMs: 0 }),
    );

    await waitFor(() => {
      expect(result.current.data).toBe('recovered');
    });

    expect(result.current.loading).toBe(false);
  });

  it('retry() resets and re-fetches', async () => {
    mockGetData.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() =>
      useApiResource<string>('test', { maxRetries: 0 }),
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    mockGetData.mockResolvedValue('recovered');
    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.data).toBe('recovered');
    });
  });
});
