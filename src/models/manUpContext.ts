import type { ManUpStatus } from '../constants';
import type { Config } from './config';

export interface ManUpContext {
  config?: Config;
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
