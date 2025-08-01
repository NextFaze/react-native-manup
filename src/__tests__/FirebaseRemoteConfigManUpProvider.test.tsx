// Mock dependencies before imports
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('../queryClient', () => ({
  queryClient: {},
}));

jest.mock('@react-native-firebase/remote-config', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock Platform.OS to always return 'ios'
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useQuery } from '@tanstack/react-query';
import remoteConfig from '@react-native-firebase/remote-config';
import {
  FirebaseRemoteConfigManUpProvider,
  useFirebaseRemoteConfigManUp,
} from '../providers/FirebaseRemoteConfigManUpProvider';
import { ManUpStatus } from '../constants';
import type { Config } from '../models/config';

const mockDeviceInfo = DeviceInfo as jest.Mocked<typeof DeviceInfo>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockRemoteConfig = remoteConfig as jest.MockedFunction<
  typeof remoteConfig
>;

describe('FirebaseRemoteConfigManUpProvider', () => {
  const mockAppVersion = '1.0.0';
  const mockConfigName = 'manup_config';

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeviceInfo.getVersion.mockReturnValue(mockAppVersion);
    mockRemoteConfig.mockReturnValue({
      fetchAndActivate: jest.fn().mockResolvedValue(true),
      getValue: jest.fn().mockReturnValue({
        asString: jest.fn().mockReturnValue('{}'),
      }),
    } as any);
  });

  describe('parseJson converts to a PlatformData object', () => {
    it('correctly parses JSON config into PlatformData structure', async () => {
      let actualSettings: any;
      const mockResponse = {
        ios: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
        android: {
          latest: '1.5.0',
          minimum: '0.9.0',
          url: 'https://example.com/myAppUpdate/android',
          enabled: false,
        },
      };

      mockRemoteConfig.mockReturnValue({
        fetchAndActivate: jest.fn().mockResolvedValue(true),
        getValue: jest.fn().mockReturnValue({
          asString: jest.fn().mockReturnValue(JSON.stringify(mockResponse)),
        }),
      } as any);

      mockUseQuery.mockReturnValue({
        data: mockResponse,
        isLoading: false,
        error: null,
      } as any);

      const TestComponent = () => {
        const { settings } = useFirebaseRemoteConfigManUp({});
        actualSettings = settings;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualSettings).toEqual(mockResponse.ios);
      expect(actualSettings).toEqual({
        latest: '2.4.1',
        minimum: '2.1.0',
        url: 'https://example.com/myAppUpdate',
        enabled: true,
      });
    });
  });

  describe('getMetadata', () => {
    it('reads custom properties from configuration using os specific first', () => {
      let actualSettings: any;

      const mockConfig: Config = {
        ios: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
        android: {
          latest: '2.5.1',
          minimum: '1.9.0',
          url: 'https://example.com/myAppUpdate/android',
          enabled: false,
        },
      };

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      const TestComponent = () => {
        const { settings } = useFirebaseRemoteConfigManUp({});
        actualSettings = settings;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualSettings).toBeDefined();
      expect(actualSettings?.latest).toBeDefined();
      expect(actualSettings?.minimum).toBeDefined();
    });
  });

  describe('validate', () => {
    it('returns unsupported status when version is below minimum', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      let actualStatus: any;
      let actualMessage: any;

      const TestComponent = () => {
        const { status, message } = useFirebaseRemoteConfigManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualStatus).toBe(ManUpStatus.Unsupported);
      expect(actualMessage).toBe(
        'This version is no longer supported. Please update to the latest version.'
      );
    });

    it('returns supported status when version equals minimum', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('2.1.0');

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      let actualStatus: any;
      let actualMessage: any;

      const TestComponent = () => {
        const { status, message } = useFirebaseRemoteConfigManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      // Verify the actual status and message from the provider
      expect(actualStatus).toBe(ManUpStatus.Supported);
      expect(actualMessage).toBe('There is an update available.');
    });

    it('returns supported status when version is between minimum and latest', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('2.2.0');

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      let actualStatus: any;
      let actualMessage: any;

      const TestComponent = () => {
        const { status, message } = useFirebaseRemoteConfigManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualStatus).toBe(ManUpStatus.Supported);
      expect(actualMessage).toBe('There is an update available.');
    });

    it('returns latest status when version equals latest', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('2.4.1');

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      let actualStatus: any;
      let actualMessage: any;

      const TestComponent = () => {
        const { status, message } = useFirebaseRemoteConfigManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualStatus).toBe(ManUpStatus.Latest);
      expect(actualMessage).toBe('');
    });

    it('returns latest status when version is above latest', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('2.5.0');

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      let actualStatus: any;
      let actualMessage: any;

      const TestComponent = () => {
        const { status, message } = useFirebaseRemoteConfigManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualStatus).toBe(ManUpStatus.Latest);
      expect(actualMessage).toBe('');
    });

    it('returns disabled status when platform is disabled', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: false,
        },
      };

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      let actualStatus: any;
      let actualMessage: any;

      const TestComponent = () => {
        const { status, message } = useFirebaseRemoteConfigManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualStatus).toBe(ManUpStatus.Disabled);
      expect(actualMessage).toBe(
        'The app is currently in maintenance, please check again shortly.'
      );
    });

    it('throws exception when config fetch fails', () => {
      const networkError = new Error('Network error');
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: networkError,
      } as any);

      const TestComponent = () => {
        useFirebaseRemoteConfigManUp({});
        return null;
      };

      expect(() => {
        render(
          <FirebaseRemoteConfigManUpProvider
            firebaseRemoteConfigName={mockConfigName}
          >
            <TestComponent />
          </FirebaseRemoteConfigManUpProvider>
        );
      }).toThrow('Network error');
    });

    it('handles error when semver parsing fails', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: 'invalid-version',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      let actualStatus: any;
      let actualMessage: any;

      const TestComponent = () => {
        const { status, message } = useFirebaseRemoteConfigManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(actualStatus).toBe(ManUpStatus.Unsupported);
      expect(actualMessage).toBe(
        'This version is no longer supported. Please update to the latest version.'
      );
    });
  });

  describe('useFirebaseRemoteConfigManUp hook', () => {
    it('calls onUpdateAvailable callback when status is Supported', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('2.2.0');
      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      const onUpdateAvailable = jest.fn();
      const onUpdateRequired = jest.fn();
      const onMaintenanceMode = jest.fn();

      const TestComponent = () => {
        useFirebaseRemoteConfigManUp({
          onUpdateAvailable,
          onUpdateRequired,
          onMaintenanceMode,
        });
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(onUpdateAvailable).toHaveBeenCalled();
      expect(onUpdateRequired).not.toHaveBeenCalled();
      expect(onMaintenanceMode).not.toHaveBeenCalled();
    });

    it('calls onUpdateRequired callback when status is Unsupported', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');
      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      const onUpdateAvailable = jest.fn();
      const onUpdateRequired = jest.fn();
      const onMaintenanceMode = jest.fn();

      const TestComponent = () => {
        useFirebaseRemoteConfigManUp({
          onUpdateAvailable,
          onUpdateRequired,
          onMaintenanceMode,
        });
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(onUpdateAvailable).not.toHaveBeenCalled();
      expect(onUpdateRequired).toHaveBeenCalled();
      expect(onMaintenanceMode).not.toHaveBeenCalled();
    });

    it('calls onMaintenanceMode callback when status is Disabled', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: false,
        },
      };

      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      const onUpdateAvailable = jest.fn();
      const onUpdateRequired = jest.fn();
      const onMaintenanceMode = jest.fn();

      const TestComponent = () => {
        useFirebaseRemoteConfigManUp({
          onUpdateAvailable,
          onUpdateRequired,
          onMaintenanceMode,
        });
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(onUpdateAvailable).not.toHaveBeenCalled();
      expect(onUpdateRequired).not.toHaveBeenCalled();
      expect(onMaintenanceMode).toHaveBeenCalled();
    });

    it('does not call any callbacks when status is Latest', () => {
      const mockConfig: Config = {
        [Platform.OS]: {
          latest: '2.4.1',
          minimum: '2.1.0',
          url: 'https://example.com/myAppUpdate',
          enabled: true,
        },
      };

      mockDeviceInfo.getVersion.mockReturnValue('2.4.1');
      mockUseQuery.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        error: null,
      } as any);

      const onUpdateAvailable = jest.fn();
      const onUpdateRequired = jest.fn();
      const onMaintenanceMode = jest.fn();

      const TestComponent = () => {
        useFirebaseRemoteConfigManUp({
          onUpdateAvailable,
          onUpdateRequired,
          onMaintenanceMode,
        });
        return null;
      };

      render(
        <FirebaseRemoteConfigManUpProvider
          firebaseRemoteConfigName={mockConfigName}
        >
          <TestComponent />
        </FirebaseRemoteConfigManUpProvider>
      );

      expect(onUpdateAvailable).not.toHaveBeenCalled();
      expect(onUpdateRequired).not.toHaveBeenCalled();
      expect(onMaintenanceMode).not.toHaveBeenCalled();
    });
  });
});
