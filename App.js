import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import TouristIdScreen from './src/screens/TouristIdScreen';
import SOSScreen from './src/screens/SOSScreen';
import EmergencyAlertScreen from './src/screens/EmergencyAlertScreen'; // ← Add this
import BottomNavigation from './src/components/BottomNavigation';
import { commonStyles } from './src/styles/commonStyles';
import FallDetectionService from './src/services/FallDetectionService'; // ← Add this

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  // Fall Detection Service Start Karo
  useEffect(() => {
    // Service start with callback
    FallDetectionService.start(() => {
      // Fall detect hone par Emergency Alert screen dikhaao
      setCurrentScreen('emergencyAlert');
    });

    // Cleanup on app close
    return () => {
      FallDetectionService.stop();
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
    // User ne "I'm OK" press kiya
    setCurrentScreen('dashboard');
  };

  const handleEmergencyConfirm = () => {
    // User ne "Send SOS" confirm kiya ya auto-send hua
    // Yahan tumhara actual SOS logic aayega
    sendEmergencySOS();
    setCurrentScreen('sos'); // SOS screen pe le jao
  };

  const sendEmergencySOS = () => {
    // Yahan tumhara SOS logic
    console.log('🚨 Emergency SOS Sent!');
    // Example:
    // - Location fetch karo
    // - Emergency contacts ko SMS/call karo
    // - Backend API call karo
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigateToTouristId={() => setCurrentScreen('touristId')} />;
      case 'touristId':
        return <TouristIdScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'sos':
        return <SOSScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'emergencyAlert': // ← Add this
        return (
          <EmergencyAlertScreen
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