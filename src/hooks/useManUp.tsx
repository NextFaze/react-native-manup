import DeviceInfo from 'react-native-device-info';
import type { Config } from '../models/config';
import { Platform } from 'react-native';
import Semver from 'semver';
import { useMemo, useState } from 'react';
import { ManUpStatus } from '../constants';

export function useManUp() {
  const appVersion = DeviceInfo.getVersion();
  const [status, setStatus] = useState(ManUpStatus.Latest);

  const message = useMemo(() => {
    switch (status) {
      case ManUpStatus.Supported:
        return 'There is an update available.';
      case ManUpStatus.Unsupported:
        return 'This version is no longer supported. Please update to the latest version.';
      case ManUpStatus.Disabled:
        return 'The app is currently in maintenance, please check again shortly.';
      case ManUpStatus.Latest:
      case ManUpStatus.Error:
        return '';
    }
  }, [status]);

  const validateAppVersion = (config: Config): ManUpStatus => {
    try {
      const platformData = config[Platform.OS];

      if (platformData === undefined) {
        return ManUpStatus.Latest;
      }
      if (!platformData.enabled) {
        return ManUpStatus.Disabled;
      }

      const currentVersion = Semver.parse(appVersion);
      const latestRange = `>=${platformData.latest}`;
      const minRange = `>=${platformData.minimum}`;

      if (
        currentVersion &&
        Semver.satisfies(currentVersion, latestRange) &&
        Semver.satisfies(currentVersion, minRange)
      ) {
        return ManUpStatus.Latest;
      } else if (currentVersion && Semver.satisfies(currentVersion, minRange)) {
        return ManUpStatus.Supported;
      }
      return ManUpStatus.Unsupported;
    } catch (error) {
      console.log(error);
      return ManUpStatus.Unsupported;
    }
  };

  const validate = ({ config }: { config: Config }) => {
    const newStatus = validateAppVersion(config);
    setStatus(newStatus);
  };

  const handleManUpStatus = ({
    newStatus,
    onUpdateAvailable,
    onUpdateRequired,
    onMaintenanceMode,
  }: {
    newStatus: ManUpStatus;
    onUpdateAvailable?: () => void;
    onUpdateRequired?: () => void;
    onMaintenanceMode?: () => void;
  }) => {
    switch (newStatus) {
      case ManUpStatus.Supported:
        onUpdateAvailable?.();
        break;
      case ManUpStatus.Unsupported:
        onUpdateRequired?.();
        break;
      case ManUpStatus.Disabled:
        onMaintenanceMode?.();
        break;
      default:
        break;
    }
  };

  return { validate, status, message, handleManUpStatus };
}
