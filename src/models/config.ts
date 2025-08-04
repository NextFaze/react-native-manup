import type { ManUpStatus } from '../constants';

export interface Config {
  ios: PlatFormData;
  android: PlatFormData;
  [key: string]: any;
}

export interface PlatFormData {
  latest: string;
  minimum: string;
  url: string;
  enabled: boolean;
  [key: string]: any;
}

export interface RemoteConfigContext {
  config?: Config;
  settings?: PlatFormData;
  status: ManUpStatus;
  message: string;
  handleManUpStatus: ({
    newStatus,
    onUpdateAvailable,
    onUpdateRequired,
    onMaintenanceMode,
  }: {
    newStatus: ManUpStatus;
    onUpdateAvailable?: () => void;
    onUpdateRequired?: () => void;
    onMaintenanceMode?: () => void;
  }) => void;
}
