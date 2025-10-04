import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  Modal,
  NativeModules,
  NativeEventEmitter,
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import TouristIdScreen from './src/screens/TouristIdScreen';
import SOSScreen from './src/screens/SOSScreen';
import EmergencyAlertScreen from './src/screens/EmergencyScreen';
import BottomNavigation from './src/components/BottomNavigation';
import { commonStyles } from './src/styles/commonStyles';

const { TensorFlowModule } = NativeModules;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isFallDetectionActive, setIsFallDetectionActive] = useState(false);
  const [fallProbability, setFallProbability] = useState(0);

  useEffect(() => {
    // Set up event emitter for fall detection
    if (TensorFlowModule) {
      const eventEmitter = new NativeEventEmitter(TensorFlowModule);
      
      const fallDetectionListener = eventEmitter.addListener(
        'onFallDetected',
        (event) => {
          console.log('Fall detected!', event);
          setFallProbability(event.probability);
          setIsEmergencyActive(true);
        }
      );

      // Load the TensorFlow model on app start
      TensorFlowModule.loadFallDetectionModel()
        .then((result) => {
          console.log('Model loaded:', result);
        })
        .catch((error) => {
          console.error('Model load error:', error);
        });

      return () => {
        fallDetectionListener.remove();
        if (isFallDetectionActive) {
          TensorFlowModule.stopFallDetection()
            .catch(err => console.error('Error stopping fall detection:', err));
        }
      };
    }
  }, []);

  const handleToggleFallDetection = () => {
    if (!TensorFlowModule) {
      Alert.alert('Error', 'TensorFlow module not available');
      return;
    }

    if (!isFallDetectionActive) {
      TensorFlowModule.startFallDetection()
        .then(() => {
          setIsFallDetectionActive(true);
          Alert.alert(
            '✅ Fall Detection Active',
            'AI-powered fall detection is now monitoring.\n\nIf a fall is detected, you will have 30 seconds to cancel.'
          );
        })
        .catch((error) => {
          console.error('Error starting fall detection:', error);
          Alert.alert('Error', `Could not start: ${error.message}`);
        });
    } else {
      TensorFlowModule.stopFallDetection()
        .then(() => {
          setIsFallDetectionActive(false);
          Alert.alert('Stopped', 'Fall detection stopped.');
        })
        .catch((error) => {
          console.error('Error stopping fall detection:', error);
        });
    }
  };

  const handleNavigation = (screenId) => {
    if (screenId === 'dashboard') {
      setCurrentScreen('dashboard');
    } else if (screenId === 'sos') {
      setCurrentScreen('sos');
    } else {
      alert(`${screenId.toUpperCase()} - Coming soon!`);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigateToTouristId={() => setCurrentScreen('touristId')} />;
      case 'touristId':
        return <TouristIdScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'sos':
        return <SOSScreen onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return <DashboardScreen onNavigateToTouristId={() => setCurrentScreen('touristId')} />;
    }
  };

  const handleCancelEmergency = () => {
    setIsEmergencyActive(false);
  };

  const handleConfirmEmergency = () => {
    setIsEmergencyActive(false);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" />

      {/* Fall Detection Toggle Button */}
      <View style={styles.fallDetectionBar}>
        <Text style={styles.fallDetectionText}>
          {isFallDetectionActive ? '🟢 Fall Detection: ON' : '⚪ Fall Detection: OFF'}
        </Text>
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            isFallDetectionActive ? styles.toggleButtonActive : styles.toggleButtonInactive
          ]}
          onPress={handleToggleFallDetection}
        >
          <Text style={styles.toggleButtonText}>
            {isFallDetectionActive ? 'STOP' : 'START'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render Current Screen */}
      {renderScreen()}

      {/* Bottom Navigation */}
      <BottomNavigation
        activeScreen={currentScreen === 'touristId' || currentScreen === 'sos' ? 'dashboard' : currentScreen}
        onNavigate={handleNavigation}
      />

      {/* Emergency Alert Modal */}
      <Modal
        visible={isEmergencyActive}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancelEmergency}
      >
        <EmergencyAlertScreen
          onCancel={handleCancelEmergency}
          onConfirmEmergency={handleConfirmEmergency}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fallDetectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  fallDetectionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#ff5722',
  },
  toggleButtonInactive: {
    backgroundColor: '#4caf50',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
