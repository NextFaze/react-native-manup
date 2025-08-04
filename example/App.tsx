import { View, Text, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { RemoteConfigProvider, useRemoteConfigManUp } from 'react-native-manup';
import { Divider } from './components/Divider';

export default function App() {
  return (
    <RemoteConfigProvider
      fetchConfig={async () => {
        const response = await fetch('https://your-api.com/config.json', {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }}
      refetchInterval={1000}
      queryKey="exampleConfig"
    >
      <Home />
    </RemoteConfigProvider>
  );
}

const Home = () => {
  const appVersion = DeviceInfo.getVersion();

  const onUpdateAvailable = () => {
    Alert.alert(message);
  };

  const onUpdateRequired = () => {
    Alert.alert(message);
  };

  const onMaintenanceMode = () => {
    Alert.alert(message);
  };

  const { settings, status, message } = useRemoteConfigManUp({
    onUpdateAvailable,
    onUpdateRequired,
    onMaintenanceMode,
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>App's version</Text>
      <Text>{appVersion}</Text>
      <Divider />
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Settings</Text>
      <Text style={{ marginBottom: 16 }}>
        {JSON.stringify(settings, null, 4)}
      </Text>
      <Divider />
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Status</Text>
      <Text>{status}</Text>
      <Divider />
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Message</Text>
      <Text>{message}</Text>
    </View>
  );
};
