import { NativeModules } from 'react-native';
const { EthereumModule } = NativeModules;

class EthereumService {
  constructor() {
    this.isInitialized = false;
  }

  // TEST THIS FIRST - Basic connection test
  async testConnection() {
    try {
      console.log('🧪 Testing Ethereum module connection...');
      const result = await EthereumModule.testConnection();
      console.log('✅ Ethereum test result:', result);
      this.isInitialized = true;
      return result;
    } catch (error) {
      console.log('❌ Ethereum test failed:', error);
      throw error;
    }
  }

  // Create tourist ID
  async createTouristID(touristData) {
    if (!this.isInitialized) {
      await this.testConnection();
    }

    console.log('🆔 Creating tourist ID:', touristData);
    
    try {
      const result = await EthereumModule.createTouristID(
        touristData.name,
        touristData.passportNumber,
        touristData.arrivalDate,
        touristData.departureDate
      );
      
      console.log('✅ Tourist ID created:', result);
      return result;
    } catch (error) {
      console.log('❌ Error creating tourist ID:', error);
      throw error;
    }
  }

  // Verify tourist ID
  async verifyTouristID(touristID) {
    console.log('🔍 Verifying tourist ID:', touristID);
    
    try {
      const result = await EthereumModule.verifyTouristID(touristID);
      console.log('✅ Verification result:', result);
      return result;
    } catch (error) {
      console.log('❌ Verification error:', error);
      throw error;
    }
  }

  // Record activity
  async recordActivity(touristID, activityType, location) {
    console.log('📝 Recording activity:', { touristID, activityType, location });
    
    try {
      const result = await EthereumModule.recordActivity(touristID, activityType, location);
      console.log('✅ Activity recorded:', result);
      return result;
    } catch (error) {
      console.log('❌ Activity error:', error);
      throw error;
    }
  }
}

// INSTANT TEST - Run this to verify everything works
const quickTest = async () => {
  const service = new EthereumService();
  
  try {
    // Test 1: Connection
    console.log('\n=== TEST 1: Connection Test ===');
    await service.testConnection();
    
    // Test 2: Create ID
    console.log('\n=== TEST 2: Create Tourist ID ===');
    const tourist = await service.createTouristID({
      name: 'Test Tourist',
      passportNumber: 'TEST123456',
      arrivalDate: '2024-01-01',
      departureDate: '2024-01-15'
    });
    
    // Test 3: Verify ID
    console.log('\n=== TEST 3: Verify Tourist ID ===');
    await service.verifyTouristID(tourist.touristID);
    
    // Test 4: Record Activity
    console.log('\n=== TEST 4: Record Activity ===');
    await service.recordActivity(tourist.touristID, 'HOTEL_CHECKIN', 'Grand Hotel');
    
    console.log('\n🎉 ALL ETHEREUM TESTS PASSED!');
    return true;
  } catch (error) {
    console.log('\n💥 TEST FAILED:', error);
    return false;
  }
};

// Uncomment to run test immediately
// quickTest();

export default new EthereumService();