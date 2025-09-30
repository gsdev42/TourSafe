// import React, { useState } from 'react';
// import { SafeAreaView, StatusBar } from 'react-native';
// import DashboardScreen from './src/screens/DashboardScreen';
// import TouristIdScreen from './src/screens/TouristIdScreen';
// import SOSScreen from './src/screens/SOSScreen';
// import BottomNavigation from './src/components/BottomNavigation';
// import { commonStyles } from './src/styles/commonStyles';

// export default function App() {
//   const [currentScreen, setCurrentScreen] = useState('dashboard');

//   const handleNavigation = (screenId) => {
//     if (screenId === 'dashboard') {
//       setCurrentScreen('dashboard');
//     } else if (screenId === 'sos') {
//       setCurrentScreen('sos');
//     } else {
//       alert(`${screenId.toUpperCase()} - Coming soon!`);
//     }
//   };

//   const renderScreen = () => {
//     switch (currentScreen) {
//       case 'dashboard':
//         return <DashboardScreen onNavigateToTouristId={() => setCurrentScreen('touristId')} />;
//       case 'touristId':
//         return <TouristIdScreen onBack={() => setCurrentScreen('dashboard')} />;
//       case 'sos':
//         return <SOSScreen onBack={() => setCurrentScreen('dashboard')} />;
//       default:
//         return <DashboardScreen onNavigateToTouristId={() => setCurrentScreen('touristId')} />;
//     }
//   };

//   return (
//     <SafeAreaView style={commonStyles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Render Current Screen */}
//       {renderScreen()}

//       {/* Bottom Navigation */}
//       <BottomNavigation
//         activeScreen={currentScreen === 'touristId' || currentScreen === 'sos' ? 'dashboard' : currentScreen}
//         onNavigate={handleNavigation}
//       />
//     </SafeAreaView>
//   );
// }
//***************************************8 
// THIS CODE IS FOR TESTING THE ETHEREUM MODULE
//-------------------------------------
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import EthereumService from './src/services/blockchain/EthereumService';

const App = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEthereumModule = async () => {
    setIsLoading(true);
    console.log('🧪 Starting Ethereum module test...');
    
    try {
      // Test 1: Check if module exists
      const { NativeModules } = require('react-native');
      console.log('Available native modules:', Object.keys(NativeModules));
      
      // Test 2: Test connection
      console.log('Testing connection...');
      const connectionResult = await EthereumService.testConnection();
      setTestResult(connectionResult);
      console.log('✅ Connection test result:', connectionResult);
      
      // Test 3: Create a test tourist ID
      console.log('Creating test tourist ID...');
      const touristResult = await EthereumService.createTouristID({
        name: 'Test Tourist',
        passportNumber: 'TEST123456',
        arrivalDate: '2024-01-01',
        departureDate: '2024-01-15'
      });
      console.log('✅ Tourist ID created:', touristResult);
      
      Alert.alert('Success!', `Ethereum Module is working!\nTourist ID: ${touristResult.touristID}`);
      
    } catch (error) {
      console.log('❌ Test failed:', error);
      setTestResult({ error: error.message });
      Alert.alert('Test Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test when app starts
    testEthereumModule();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Ethereum Module Test</Text>
      
      {isLoading && <Text>Testing Ethereum Module...</Text>}
      
      {testResult && !testResult.error && (
        <View style={{ alignItems: 'center' }}>
          <Text>✅ Module: {testResult.module}</Text>
          <Text>✅ Network: {testResult.network}</Text>
          <Text>✅ Status: {testResult.status}</Text>
        </View>
      )}
      
      {testResult && testResult.error && (
        <View style={{ alignItems: 'center' }}>
          <Text>❌ Error: {testResult.error}</Text>
        </View>
      )}
      
      <Button 
        title="Re-run Test" 
        onPress={testEthereumModule}
        disabled={isLoading}
      />
    </View>
  );
};

export default App;