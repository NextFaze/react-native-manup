import React, { createContext, useContext, useEffect } from 'react';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { useManUp } from '../hooks/useManUp';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queryClient';
import { Platform } from 'react-native';
import type { Config } from '../models/config';
import type { RemoteConfigContext } from '../models/config';

interface RemoteConfigProviderProps {
  fetchConfig: () => Promise<Config>;
  refetchInterval?: number;
  queryKey?: string;
  children: React.ReactNode;
}

export function RemoteConfigProvider({
  fetchConfig,
  refetchInterval,
  queryKey,
  children,
}: RemoteConfigProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RemoteConfigContextProvider
        fetchConfig={fetchConfig}
        refetchInterval={refetchInterval}
        queryKey={queryKey}
      >
        {children}
      </RemoteConfigContextProvider>
    </QueryClientProvider>
  );
}

const RemoteConfigContext = createContext<RemoteConfigContext>(null!);

const RemoteConfigContextProvider = ({
  fetchConfig,
  refetchInterval,
  queryKey,
  children,
}: RemoteConfigProviderProps) => {
  const { data: config, error } = useRemoteConfig({
    fetchConfig,
    refetchInterval,
    queryKey,
  });

  const settings = config?.[Platform.OS];
  const { validate, status, message, handleManUpStatus } = useManUp();

  useEffect(() => {
    if (error) {
      throw error;
    }
    if (config) {
      validate({ config });
    }
  }, [config, error, validate]);

  return (
    <RemoteConfigContext.Provider
      value={{ settings, status, message, handleManUpStatus }}
    >
      {children}
    </RemoteConfigContext.Provider>
  );
};

export const useRemoteConfigManUp = ({
  onUpdateAvailable,
  onUpdateRequired,
  onMaintenanceMode,
}: {
  onUpdateAvailable?: () => void;
  onUpdateRequired?: () => void;
  onMaintenanceMode?: () => void;
}) => {
  const context = useContext(RemoteConfigContext);
  const { status, handleManUpStatus } = context;

  useEffect(() => {
    handleManUpStatus({
      newStatus: status,
      onUpdateAvailable,
      onUpdateRequired,
      onMaintenanceMode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return context;
};
