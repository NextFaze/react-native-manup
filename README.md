# react-native-manup

A React Native library for handling mandatory app updates and maintenance mode. This library provides a simple way to check if your app version is supported, requires an update, or if the app is in maintenance mode.

## Features

- 🔄 **Version Validation**: Automatically validates app version against minimum and latest requirements
- 🚧 **Maintenance Mode**: Support for putting apps in maintenance mode
- 🔥 **Firebase Remote Config**: Integration with Firebase Remote Config for dynamic configuration
- 🌐 **HTTP Configuration**: Support for HTTP-based configuration endpoints
- 📱 **Platform Specific**: Different configuration for iOS and Android
- ⚡ **Real-time Updates**: Automatic status updates with callback support

## Installation

```sh
npm install react-native-manup
```

### Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install react-native-device-info
```

#### Optional Firebase Dependencies

If you plan to use Firebase Remote Config as your configuration source, you'll also need to install:

```sh
npm install @react-native-firebase/app @react-native-firebase/remote-config
```

## Usage

### Remote Config Provider

The `RemoteConfigProvider` is a unified solution that works with any config source. It provides automatic caching, refetching, and change detection through react-query.

#### HTTP Configuration Example

```tsx
import React from 'react';
import { Alert } from 'react-native';
import { RemoteConfigProvider, useRemoteConfigManUp } from 'react-native-manup';

function App() {
  return (
    <RemoteConfigProvider
      fetchConfig={async () => {
        const response = await fetch('https://your-api.com/config.json', { cache: 'no-store'});
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }}
      refetchInterval={3600000} // 1 hour (optional)
      queryKey="httpConfig" // optional
    >
      <HomeScreen />
    </RemoteConfigProvider>
  );
}

function HomeScreen() {
  const { status, message } = useRemoteConfigManUp({
    onUpdateAvailable: () => {
      Alert.alert('Update Available', message);
    },
    onUpdateRequired: () => {
      Alert.alert('Update Required', message);
    },
    onMaintenanceMode: () => {
      Alert.alert('Maintenance Mode', message);
    },
  });

  return (
    // Your app content
  );
}
```

#### Firebase Remote Config Example

> **Prerequisite**: You must install and set up Firebase in your React Native app before using this provider. Follow the [React Native Firebase setup guide](https://rnfirebase.io/#installation) to configure `@react-native-firebase/app` and `@react-native-firebase/remote-config`.

```tsx
import React from 'react';
import { Alert } from 'react-native';
import { RemoteConfigProvider, useRemoteConfigManUp } from 'react-native-manup';
import remoteConfig from '@react-native-firebase/remote-config';

function App() {
  return (
    <RemoteConfigProvider
      fetchConfig={async () => {
        await remoteConfig().fetchAndActivate();
        return JSON.parse(remoteConfig().getValue('appConfig').asString());
      }}
      queryKey="firebaseConfig"
    >
      <HomeScreen />
    </RemoteConfigProvider>
  );
}

function HomeScreen() {
  const { status, message } = useRemoteConfigManUp({
    onUpdateAvailable: () => {
      Alert.alert('Update Available', message);
    },
    onUpdateRequired: () => {
      Alert.alert('Update Required', message);
    },
    onMaintenanceMode: () => {
      Alert.alert('Maintenance Mode', message);
    },
  });

  return (
    // Your app content
  );
}
```

## Configuration

The library expects a configuration object with platform-specific data. Here's the structure:

```typescript
interface Config {
  [key: string]: PlatFormData;
}

interface PlatFormData {
  latest: string; // Latest available version
  minimum: string; // Minimum supported version
  url: string; // Download URL for the app
  enabled: boolean; // Whether the app is enabled
}
```

### Example Configuration

```json
{
  "ios": {
    "latest": "1.2.0",
    "minimum": "1.0.0",
    "url": "https://apps.apple.com/app/yourapp",
    "enabled": true
  },
  "android": {
    "latest": "1.2.0",
    "minimum": "1.0.0",
    "url": "https://play.google.com/store/apps/details?id=com.yourapp",
    "enabled": true
  }
}
```

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
