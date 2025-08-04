import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RemoteConfigProvider,
  useRemoteConfigManUp,
} from '../providers/RemoteConfigProvider';
import { View, Text, Platform } from 'react-native';
import type { Config } from '../models/config';

jest.mock('../hooks/useManUp', () => ({
  useManUp: jest.fn(() => ({
    validate: jest.fn(),
    status: 'Latest',
    message: 'App is up to date',
    handleManUpStatus: jest.fn(),
  })),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

// Lock platform OS for testing
Platform.OS = 'android';

const mockUseQuery = require('@tanstack/react-query').useQuery;

const TestComponent = ({
  onUpdateAvailable,
  onUpdateRequired,
  onMaintenanceMode,
}: {
  onUpdateAvailable?: () => void;
  onUpdateRequired?: () => void;
  onMaintenanceMode?: () => void;
}) => {
  const context = useRemoteConfigManUp({
    onUpdateAvailable,
    onUpdateRequired,
    onMaintenanceMode,
  });
  return (
    <View>
      <Text testID="status">{context.status}</Text>
      <Text testID="message">{context.message}</Text>
    </View>
  );
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe('RemoteConfigProvider', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  it('renders children and provides context', async () => {
    const mockConfig: Config = {
      ios: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com',
        enabled: true,
      },
      android: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com',
        enabled: true,
      },
    };

    const mockFetchConfig = jest.fn().mockResolvedValue(mockConfig);

    mockUseQuery.mockReturnValue({
      data: mockConfig,
      error: null,
      isLoading: false,
    });

    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <RemoteConfigProvider fetchConfig={mockFetchConfig}>
          <TestComponent />
        </RemoteConfigProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByTestId('status')).toBeTruthy();
      expect(getByTestId('message')).toBeTruthy();
    });
  });

  it('calls fetchConfig function with react-query', () => {
    const mockFetchConfig = jest.fn().mockResolvedValue({});

    mockUseQuery.mockReturnValue({
      data: {},
      error: null,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RemoteConfigProvider fetchConfig={mockFetchConfig}>
          <TestComponent />
        </RemoteConfigProvider>
      </QueryClientProvider>
    );

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['remoteConfig'],
      queryFn: mockFetchConfig,
      refetchInterval: 3600000, // Default from constants
      refetchOnWindowFocus: true,
    });
  });

  it('uses custom refetchInterval when provided', () => {
    const mockFetchConfig = jest.fn().mockResolvedValue({});
    const customInterval = 5000;

    mockUseQuery.mockReturnValue({
      data: {},
      error: null,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RemoteConfigProvider
          fetchConfig={mockFetchConfig}
          refetchInterval={customInterval}
        >
          <TestComponent />
        </RemoteConfigProvider>
      </QueryClientProvider>
    );

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['remoteConfig'],
      queryFn: mockFetchConfig,
      refetchInterval: customInterval,
      refetchOnWindowFocus: true,
    });
  });

  it('uses custom queryKey when provided', () => {
    const mockFetchConfig = jest.fn().mockResolvedValue({});
    const customQueryKey = 'customConfig';

    mockUseQuery.mockReturnValue({
      data: {},
      error: null,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RemoteConfigProvider
          fetchConfig={mockFetchConfig}
          queryKey={customQueryKey}
        >
          <TestComponent />
        </RemoteConfigProvider>
      </QueryClientProvider>
    );

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: [customQueryKey],
      queryFn: mockFetchConfig,
      refetchInterval: 3600000,
      refetchOnWindowFocus: true,
    });
  });

  it('handles error states', async () => {
    const mockFetchConfig = jest.fn().mockResolvedValue({});
    const mockError = new Error('Network error');

    mockUseQuery.mockReturnValue({
      data: null,
      error: mockError,
      isLoading: false,
    });

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(
        <QueryClientProvider client={queryClient}>
          <RemoteConfigProvider fetchConfig={mockFetchConfig}>
            <TestComponent />
          </RemoteConfigProvider>
        </QueryClientProvider>
      );
    }).toThrow('Network error');

    consoleSpy.mockRestore();
  });

  it('provides platform-specific settings', async () => {
    const mockConfig: Config = {
      ios: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com/ios',
        enabled: true,
      },
      android: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com/android',
        enabled: true,
      },
    };

    const mockFetchConfig = jest.fn().mockResolvedValue(mockConfig);

    mockUseQuery.mockReturnValue({
      data: mockConfig,
      error: null,
      isLoading: false,
    });

    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <RemoteConfigProvider fetchConfig={mockFetchConfig}>
          <TestComponent />
        </RemoteConfigProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByTestId('status')).toBeTruthy();
    });
  });

  it('calls callback functions when status changes', async () => {
    const mockConfig: Config = {
      ios: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com',
        enabled: true,
      },
      android: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com',
        enabled: true,
      },
    };

    const mockFetchConfig = jest.fn().mockResolvedValue(mockConfig);
    const onUpdateAvailable = jest.fn();
    const onUpdateRequired = jest.fn();
    const onMaintenanceMode = jest.fn();

    mockUseQuery.mockReturnValue({
      data: mockConfig,
      error: null,
      isLoading: false,
    });

    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <RemoteConfigProvider fetchConfig={mockFetchConfig}>
          <TestComponent
            onUpdateAvailable={onUpdateAvailable}
            onUpdateRequired={onUpdateRequired}
            onMaintenanceMode={onMaintenanceMode}
          />
        </RemoteConfigProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByTestId('status')).toBeTruthy();
    });
  });

  it('fetches and provides custom properties from remote config', async () => {
    const mockConfig: Config = {
      ios: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com',
        enabled: true,
        publicApiUrl: 'https://api.ios-example.com/v1',
      },
      android: {
        latest: '1.0.0',
        minimum: '0.9.0',
        url: 'https://example.com',
        enabled: true,
        publicApiUrl: 'https://api.android-example.com/v1',
      },
      publicApiUrl: 'https://api.example.com/v1',
    };

    const mockFetchConfig = jest.fn().mockResolvedValue(mockConfig);

    mockUseQuery.mockReturnValue({
      data: mockConfig,
      error: null,
      isLoading: false,
    });

    const CustomTestComponent = () => {
      const { status, config, settings } = useRemoteConfigManUp({});
      return (
        <View>
          <Text testID="status">{status}</Text>
          <Text testID="publicApiUrl">{config?.publicApiUrl}</Text>
          <Text testID="platformPublicApiUrl">{settings?.publicApiUrl}</Text>
        </View>
      );
    };

    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <RemoteConfigProvider fetchConfig={mockFetchConfig}>
          <CustomTestComponent />
        </RemoteConfigProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByTestId('status')).toBeTruthy();
      expect(getByTestId('publicApiUrl')).toHaveTextContent(
        'https://api.example.com/v1'
      );
      expect(getByTestId('platformPublicApiUrl')).toHaveTextContent(
        'https://api.android-example.com/v1'
      );
    });
  });
});
