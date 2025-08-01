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

// Mock Platform.OS to always return 'ios'
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

global.fetch = jest.fn();

import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useQuery } from '@tanstack/react-query';
import {
  HttpManUpProvider,
  useHttpManUp,
} from '../providers/HttpManUpProvider';
import { ManUpStatus } from '../constants';
import type { Config } from '../models/config';

const mockDeviceInfo = DeviceInfo as jest.Mocked<typeof DeviceInfo>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('HttpManUpProvider', () => {
  const mockAppVersion = '1.0.0';
  const mockConfigUrl = 'https://example.com/manup.json';

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeviceInfo.getVersion.mockReturnValue(mockAppVersion);
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      mockUseQuery.mockReturnValue({
        data: mockResponse,
        isLoading: false,
        error: null,
      } as any);

      const TestComponent = () => {
        const { settings } = useHttpManUp({});
        actualSettings = settings;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
      );

      // Verify the platform-specific settings are correct
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
        const { settings } = useHttpManUp({});
        actualSettings = settings;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
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
        const { status, message } = useHttpManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
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
        const { status, message } = useHttpManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
      );

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
        const { status, message } = useHttpManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
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
        const { status, message } = useHttpManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
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
        const { status, message } = useHttpManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
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
        const { status, message } = useHttpManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
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
        useHttpManUp({});
        return null;
      };

      expect(() => {
        render(
          <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
            <TestComponent />
          </HttpManUpProvider>
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
        const { status, message } = useHttpManUp({});
        actualStatus = status;
        actualMessage = message;
        return null;
      };

      render(
        <HttpManUpProvider httpManUpConfigUrl={mockConfigUrl}>
          <TestComponent />
        </HttpManUpProvider>
      );

      expect(actualStatus).toBe(ManUpStatus.Unsupported);
      expect(actualMessage).toBe(
        'This version is no longer supported. Please update to the latest version.'
      );
    });
  });
});
