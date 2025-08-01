import React, { createContext, useContext, useEffect } from 'react';
import { useManUp } from '../hooks/useManUp';
import { useHttpRemoteConfig } from '../hooks/useHttpRemoteConfig';
import type { ManUpContext } from '../models/manUpContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queryClient';

export function HttpManUpProvider({
  httpManUpConfigUrl,
  children,
}: {
  httpManUpConfigUrl: string;
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <HttpManUpContextProvider httpManUpConfigUrl={httpManUpConfigUrl}>
        {children}
      </HttpManUpContextProvider>
    </QueryClientProvider>
  );
}

const HttpManUpContext = createContext<ManUpContext>(null!);

const HttpManUpContextProvider = ({
  httpManUpConfigUrl,
  children,
}: {
  httpManUpConfigUrl: string;
  children: React.ReactNode;
}) => {
  const { data: config } = useHttpRemoteConfig(httpManUpConfigUrl);
  const { validate, status, message, handleManUpStatus } = useManUp();

  useEffect(() => {
    if (config) {
      validate({ config });
    }
  }, [config, validate]);

  return (
    <HttpManUpContext.Provider
      value={{ config, status, message, handleManUpStatus }}
    >
      {children}
    </HttpManUpContext.Provider>
  );
};

export const useHttpManUp = ({
  onUpdateAvailable,
  onUpdateRequired,
  onMaintenanceMode,
}: {
  onUpdateAvailable?: () => void;
  onUpdateRequired?: () => void;
  onMaintenanceMode?: () => void;
}) => {
  const context = useContext(HttpManUpContext);
  const { status, handleManUpStatus } = context;

  useEffect(() => {
    handleManUpStatus({
      newStatus: status,
      onUpdateAvailable,
      onUpdateRequired,
      onMaintenanceMode,
    });
  }, [
    status,
    handleManUpStatus,
    onUpdateAvailable,
    onUpdateRequired,
    onMaintenanceMode,
  ]);

  return context;
};
