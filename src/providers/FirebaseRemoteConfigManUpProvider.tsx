import React, { createContext, useContext, useEffect } from 'react';
import { useFirebaseRemoteConfig } from '../hooks/useFirebaseRemoteConfig';
import type { ManUpContext } from '../models/manUpContext';
import { useManUp } from '../hooks/useManUp';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queryClient';
import { Platform } from 'react-native';

export function FirebaseRemoteConfigManUpProvider({
  firebaseRemoteConfigName,
  children,
}: {
  firebaseRemoteConfigName: string;
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseRemoteConfigManUpContextProvider
        firebaseRemoteConfigName={firebaseRemoteConfigName}
      >
        {children}
      </FirebaseRemoteConfigManUpContextProvider>
    </QueryClientProvider>
  );
}

const FirebaseRemoteConfigManUpContext = createContext<ManUpContext>(null!);

const FirebaseRemoteConfigManUpContextProvider = ({
  firebaseRemoteConfigName,
  children,
}: {
  firebaseRemoteConfigName: string;
  children: React.ReactNode;
}) => {
  const { data: config, error } = useFirebaseRemoteConfig(
    firebaseRemoteConfigName
  );
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
    <FirebaseRemoteConfigManUpContext.Provider
      value={{ settings, status, message, handleManUpStatus }}
    >
      {children}
    </FirebaseRemoteConfigManUpContext.Provider>
  );
};

export const useFirebaseRemoteConfigManUp = ({
  onUpdateAvailable,
  onUpdateRequired,
  onMaintenanceMode,
}: {
  onUpdateAvailable?: () => void;
  onUpdateRequired?: () => void;
  onMaintenanceMode?: () => void;
}) => {
  const context = useContext(FirebaseRemoteConfigManUpContext);
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
