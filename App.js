import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import TouristIdScreen from './src/screens/TouristIdScreen';
import SOSScreen from './src/screens/SOSScreen';
import EmergencyAlertScreen from './src/screens/EmergencyAlertScreen';
import BottomNavigation from './src/components/BottomNavigation';
import { commonStyles } from './src/styles/commonStyles';
import FallDetectionService from './src/services/FallDetectionService';
import ScreamDetectionService from './src/services/ScreamDetectionService'; // Added

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [alertType, setAlertType] = useState('fall'); // Added: Track alert type
  const [confidence, setConfidence] = useState(null); // Added: Store confidence level

  // Fall Detection Service Start Karo
  useEffect(() => {
    // Fall Detection Service start with callback
    FallDetectionService.start(() => {
      // Fall detect hone par Emergency Alert screen dikhaao
      setAlertType('fall');
      setConfidence(null); // Fall detection doesn't have confidence
      setCurrentScreen('emergencyAlert');
    });

    // Scream Detection Service start with callback
    ScreamDetectionService.start((data) => {
      // Scream detect hone par Emergency Alert screen dikhaao
      setAlertType('scream');
      setConfidence(data.confidence); // Store confidence from scream detection
      setCurrentScreen('emergencyAlert');
    });

    // Cleanup on app close
    return () => {
      FallDetectionService.stop();
      ScreamDetectionService.stop();
    };
  }, []);

  const handleNavigation = (screenId) => {
    if (screenId === 'dashboard') {
      setCurrentScreen('dashboard');
    } else if (screenId === 'sos') {
      setCurrentScreen('sos');
    } else {
      alert(`${screenId.toUpperCase()} - Coming soon!`);
    }
  };

  // Emergency Alert Screen ke buttons handle karo
  const handleEmergencyCancel = () => {
    // User ne "I'm OK" ya "I'm Safe" press kiya
    setCurrentScreen('dashboard');
    setAlertType('fall'); // Reset to default
    setConfidence(null); // Reset confidence
  };

  const handleEmergencyConfirm = () => {
    // User ne "Send SOS" confirm kiya ya auto-send hua
    sendEmergencySOS();
    setCurrentScreen('sos'); // SOS screen pe le jao
  };

  const sendEmergencySOS = () => {
    // Yahan tumhara SOS logic
    console.log(`🚨 Emergency SOS Sent! Type: ${alertType}`);
    // Example:
    // - Location fetch karo
    // - Emergency contacts ko SMS/call karo
    // - Backend API call karo
    // - Alert type ke basis pe different actions
    if (alertType === 'scream') {
      console.log(`📊 Scream Confidence: ${confidence}%`);
      // Audio recording save karo as evidence
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
      case 'emergencyAlert':
        return (
          <EmergencyAlertScreen
            alertType={alertType} // Pass alert type
            confidenceLevel={confidence} // Pass confidence (for scream)
            onCancel={handleEmergencyCancel}
            onConfirmEmergency={handleEmergencyConfirm}
          />
        );
      default:
        return <DashboardScreen onNavigateToTouristId={() => setCurrentScreen('touristId')} />;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" />
      {renderScreen()}
      
      {/* Emergency Alert screen pe Bottom Navigation nahi dikhana */}
      {currentScreen !== 'emergencyAlert' && (
        <BottomNavigation
          activeScreen={currentScreen === 'touristId' || currentScreen === 'sos' ? 'dashboard' : currentScreen}
          onNavigate={handleNavigation}
        />
      )}
    </SafeAreaView>
  );
}
