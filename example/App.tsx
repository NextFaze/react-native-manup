import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
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
      queryKey="exampleConfig"
    >
      <Home />
    </RemoteConfigProvider>
  );
}

const Home = () => {
  const appVersion = DeviceInfo.getVersion();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCancelable, setModalCancelable] = useState(true);

  const onUpdateAvailable = () => {
    setModalTitle('Update available');
    setModalMessage(message);
    setModalCancelable(true);
    setModalVisible(true);
  };

  const onUpdateRequired = () => {
    setModalTitle('Update required');
    setModalMessage(message);
    setModalCancelable(false);
    setModalVisible(true);
  };

  const onMaintenanceMode = () => {
    setModalTitle('Maintenance mode');
    setModalMessage(message);
    setModalCancelable(false);
    setModalVisible(true);
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

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.buttonContainer}>
              {modalCancelable && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonCancel: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
