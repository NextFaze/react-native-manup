jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(),
}));

jest.mock('semver', () => ({
  parse: jest.fn(),
  satisfies: jest.fn(),
}));

import { renderHook, act } from '@testing-library/react-native';
import DeviceInfo from 'react-native-device-info';
import Semver from 'semver';
import { useManUp } from '../hooks/useManUp';
import { ManUpStatus } from '../constants';
import type { Config } from '../models/config';

const mockDeviceInfo = DeviceInfo as jest.Mocked<typeof DeviceInfo>;
const mockSemver = Semver as jest.Mocked<typeof Semver>;

describe('useManUp', () => {
  const mockAppVersion = '1.0.0';
  const mockCurrentVersion = { version: mockAppVersion } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeviceInfo.getVersion.mockReturnValue(mockAppVersion);
    mockSemver.parse.mockReturnValue(mockCurrentVersion);
  });

  describe('validate platform returns disabled status', () => {
    it('returns disabled status when platform is disabled', () => {
      const config: Config = {
        ios: {
          latest: '2.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: false,
        },
        android: {
          latest: '2.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: false,
        },
      };

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Disabled);
      expect(result.current.message).toBe(
        'The app is currently in maintenance, please check again shortly.'
      );
    });
  });

  describe('disabled status takes precedence', () => {
    it('disabled status takes precedence over version validation', () => {
      const config: Config = {
        ios: {
          latest: '0.5.0',
          minimum: '0.1.0',
          url: 'https://example.com',
          enabled: false,
        },
        android: {
          latest: '0.5.0',
          minimum: '0.1.0',
          url: 'https://example.com',
          enabled: false,
        },
      };

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Disabled);
      expect(result.current.message).toBe(
        'The app is currently in maintenance, please check again shortly.'
      );
    });
  });

  describe('validate platform returns unsupported version', () => {
    it('returns unsupported status when current version is below minimum', () => {
      const config: Config = {
        ios: {
          latest: '2.0.0',
          minimum: '1.5.0',
          url: 'https://example.com',
          enabled: true,
        },
        android: {
          latest: '2.0.0',
          minimum: '1.5.0',
          url: 'https://example.com',
          enabled: true,
        },
      };

      mockSemver.satisfies
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Unsupported);
      expect(result.current.message).toBe(
        'This version is no longer supported. Please update to the latest version.'
      );
    });
  });

  describe('validate platform returns supported version', () => {
    it('returns supported status when current version meets minimum but not latest', () => {
      const config: Config = {
        ios: {
          latest: '2.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: true,
        },
        android: {
          latest: '2.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: true,
        },
      };

      mockSemver.satisfies.mockReturnValueOnce(false).mockReturnValueOnce(true);

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Supported);
      expect(result.current.message).toBe('There is an update available.');
    });
  });

  describe('validate platform returns latest version', () => {
    it('returns latest status when current version equals latest version', () => {
      const config: Config = {
        ios: {
          latest: '1.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: true,
        },
        android: {
          latest: '1.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: true,
        },
      };

      mockSemver.satisfies.mockReturnValueOnce(true).mockReturnValueOnce(true);

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Latest);
      expect(result.current.message).toBe('');
    });

    it('returns latest status when current version is above latest', () => {
      const config: Config = {
        ios: {
          latest: '0.9.0',
          minimum: '0.5.0',
          url: 'https://example.com',
          enabled: true,
        },
        android: {
          latest: '0.9.0',
          minimum: '0.5.0',
          url: 'https://example.com',
          enabled: true,
        },
      };

      mockSemver.satisfies.mockReturnValueOnce(true).mockReturnValueOnce(true);

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Latest);
      expect(result.current.message).toBe('');
    });

    it('returns latest status when platform is undefined', () => {
      const config = {} as Config;

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Latest);
      expect(result.current.message).toBe('');
    });
  });

  describe('handleManUpStatus', () => {
    it('calls appropriate callbacks based on status', () => {
      const onUpdateAvailable = jest.fn();
      const onUpdateRequired = jest.fn();
      const onMaintenanceMode = jest.fn();

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.handleManUpStatus({
          newStatus: ManUpStatus.Supported,
          onUpdateAvailable,
          onUpdateRequired,
          onMaintenanceMode,
        });
      });

      expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
      expect(onUpdateRequired).not.toHaveBeenCalled();
      expect(onMaintenanceMode).not.toHaveBeenCalled();
    });

    it('handles status without callbacks gracefully', () => {
      const { result } = renderHook(() => useManUp());

      expect(() => {
        act(() => {
          result.current.handleManUpStatus({
            newStatus: ManUpStatus.Supported,
          });
        });
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('returns unsupported status when semver parsing fails', () => {
      const config: Config = {
        ios: {
          latest: '2.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: true,
        },
        android: {
          latest: '2.0.0',
          minimum: '1.0.0',
          url: 'https://example.com',
          enabled: true,
        },
      };

      mockSemver.parse.mockImplementation(() => {
        throw new Error('Invalid version');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useManUp());

      act(() => {
        result.current.validate({ config });
      });

      expect(result.current.status).toBe(ManUpStatus.Unsupported);
      expect(result.current.message).toBe(
        'This version is no longer supported. Please update to the latest version.'
      );
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
