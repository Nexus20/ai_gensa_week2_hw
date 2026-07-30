import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getData, getDataOrNull } from './client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('getData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns typed data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'test' }),
    });

    const data = await getData<{ id: string }>('station');
    expect(data.id).toBe('test');
    expect(mockFetch).toHaveBeenCalledWith('/api/station.json');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(getData('missing')).rejects.toThrow('Request failed: 404');
  });
});

describe('getDataOrNull', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null on error', async () => {
    mockFetch.mockRejectedValue(new Error('network'));
    const result = await getDataOrNull('test');
    expect(result).toBeNull();
  });
});
