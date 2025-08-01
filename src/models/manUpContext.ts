import type { ManUpStatus } from '../constants';
import type { PlatFormData } from './config';

export interface ManUpContext {
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
