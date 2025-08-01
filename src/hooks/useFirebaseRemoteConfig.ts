import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import remoteConfig from '@react-native-firebase/remote-config';
import type { Config } from '../models/config';
import { REFETCH_INTERVAL } from '../constants';

export function useFirebaseRemoteConfig(
  configName: string
): UseQueryResult<Config, Error> {
  return useQuery({
    queryKey: ['firebaseRemoteConfig', configName],
    queryFn: async () => {
      try {
        await remoteConfig().fetchAndActivate();
        return JSON.parse(remoteConfig().getValue(configName).asString());
      } catch (error) {
        console.log(error);
      }
    },
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}
