// Fetch wrapper for the station API.

export async function getData<T>(path: string): Promise<T> {
  const url = '/api/' + path + '.json';
  // simulated network latency so loading states are visible
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));
  if (typeof window !== 'undefined' && window.location.search.indexOf('fail=1') !== -1) {
    throw new Error('Simulated uplink failure (remove ?fail=1 from the URL)');
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Request failed: ' + res.status);
  }
  const data: T = await res.json();
  return data;
}

export async function getDataOrNull<T>(path: string): Promise<T | null> {
  return getData<T>(path).catch(() => null);
}
