import type { ManUpStatus } from '../constants';

export interface Config {
  [key: string]: PlatFormData;
}

export interface PlatFormData {
  latest: string;
  minimum: string;
  url: string;
  enabled: boolean;
}

export interface RemoteConfigContext {
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
