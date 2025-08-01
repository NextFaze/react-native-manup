export enum ManUpStatus {
  Error = 'Error',
  Latest = 'Latest',
  Supported = 'Supported',
  Unsupported = 'Unsupported',
  Disabled = 'Disabled',
}

export const REFETCH_INTERVAL = 60 * 60 * 1000; // Refetch every hour
