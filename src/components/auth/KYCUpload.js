import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import EthereumService from '../../services/blockchain/EthereumService';
import { setTouristID } from '../../store/slices/blockchainSlice';

const KYCUpload = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: 'John Doe',
    passportNumber: 'AB123456',
    nationality: 'US',
    arrivalDate: '2024-01-01',
    departureDate: '2024-01-15',
    emergencyContact: '+1234567890'
  });
  const [touristID, setTouristID] = useState(null);
  const [loading, setLoading] = useState(false);

  // TEST THIS: Quick connection test
  const testConnection = async () => {
    try {
      const result = await EthereumService.testConnection();
      Alert.alert('Connection Test', `✅ ${result.network} - ${result.status}`);
    } catch (error) {
      Alert.alert('Connection Test', '❌ Failed to connect');
    }
  };

  // TEST THIS: Create tourist ID
  const handleCreateTouristID = async () => {
    setLoading(true);
    
    try {
      const result = await EthereumService.createTouristID(formData);
      
      setTouristID(result.touristID);
      dispatch(setTouristID({ 
        id: result.touristID, 
        name: formData.name,
        network: 'ETHEREUM'
      }));
      
      Alert.alert('Success!', `Tourist ID: ${result.touristID}\nNetwork: ${result.network}`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create Tourist ID');
    } finally {
      setLoading(false);
    }
  };

  // TEST THIS: Verify ID
  const handleVerifyID = async () => {
    if (!touristID) {
      Alert.alert('Error', 'No Tourist ID to verify');
      return;
    }
    
    try {
      const result = await EthereumService.verifyTouristID(touristID);
      Alert.alert('Verification', result.isValid ? '✅ Valid ID' : '❌ Invalid ID');
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Ethereum Tourist ID System</Text>
      
      <Button title="Test Connection" onPress={testConnection} />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginVertical: 5 }}
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({...formData, name: text})}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginVertical: 5 }}
        placeholder="Passport"
        value={formData.passportNumber}
        onChangeText={(text) => setFormData({...formData, passportNumber: text})}
      />
      
      <Button 
        title={loading ? "Creating..." : "Create Tourist ID"} 
        onPress={handleCreateTouristID}
        disabled={loading}
      />
      
      {touristID && (
        <View style={{ marginTop: 20 }}>
          <Text>Tourist ID: {touristID}</Text>
          <Button title="Verify ID" onPress={handleVerifyID} />
          <Button 
            title="Record Hotel Check-in" 
            onPress={() => EthereumService.recordActivity(touristID, 'HOTEL_CHECKIN', 'Test Hotel')} 
          />
        </View>
      )}
    </View>
  );
};

export default KYCUpload;