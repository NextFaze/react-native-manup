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
npm install react-native-device-info @react-native-firebase/app @react-native-firebase/remote-config
```

## Usage

### HTTP Configuration Provider

```tsx
import React from 'react';
import { Alert } from 'react-native';
import { HttpManUpProvider, useHttpManUp } from 'react-native-manup';

function App() {
  return (
    <HttpManUpProvider httpManUpConfigUrl="https://your-api.com/config.json">
      <HomeScreen />
    </HttpManUpProvider>
  );
}

function HomeScreen() {
  const { status, message } = useHttpManUp({
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

### Firebase Remote Config Provider

> **Prerequisite**: You must install and set up Firebase in your React Native app before using this provider. Follow the [React Native Firebase setup guide](https://rnfirebase.io/#installation) to configure `@react-native-firebase/app` and `@react-native-firebase/remote-config`.

```tsx
import React from 'react';
import { Alert } from 'react-native';
import {
  FirebaseRemoteConfigManUpProvider,
  useFirebaseRemoteConfigManUp
} from 'react-native-manup';

function App() {
  return (
    <FirebaseRemoteConfigManUpProvider firebaseRemoteConfigName="appConfig">
      <HomeScreen />
    </FirebaseRemoteConfigManUpProvider>
  );
}

function HomeScreen() {
  const { status, message } = useFirebaseRemoteConfigManUp({
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
