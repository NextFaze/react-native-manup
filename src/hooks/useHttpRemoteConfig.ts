import { useQuery } from '@tanstack/react-query';
import type { Config } from '../models/config';
import { REFETCH_INTERVAL } from '../constants';

async function fetchHttpConfig(url: string): Promise<Config> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  return response.json();
}

export function useHttpRemoteConfig(url: string) {
  return useQuery({
    queryKey: ['httpRemoteConfig', url],
    queryFn: async () => {
      try {
        const data = await fetchHttpConfig(url);
        return data;
      } catch (error) {
        console.log(error);
        return undefined;
      }
    },
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}
