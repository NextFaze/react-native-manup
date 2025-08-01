export interface Config {
  [key: string]: PlatFormData;
}

export interface PlatFormData {
  latest: string;
  minimum: string;
  url: string;
  enabled: boolean;
}
