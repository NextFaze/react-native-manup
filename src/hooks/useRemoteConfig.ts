import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Config } from '../models/config';
import { REFETCH_INTERVAL } from '../constants';

interface UseRemoteConfigOptions {
  fetchConfig: () => Promise<Config>;
  refetchInterval?: number;
  queryKey?: string;
}

export function useRemoteConfig({
  fetchConfig,
  refetchInterval = REFETCH_INTERVAL,
  queryKey = 'remoteConfig',
}: UseRemoteConfigOptions): UseQueryResult<Config, Error> {
  return useQuery({
    queryKey: [queryKey],
    queryFn: fetchConfig,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
}
