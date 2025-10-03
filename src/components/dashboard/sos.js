import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SOSScreen() {
  const [locationSharing, setLocationSharing] = useState(false);
  const [findAssistance, setFindAssistance] = useState(false);
  const [requestMedicalAid, setRequestMedicalAid] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D3748" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer}>
          <Icon name="shield-check" size={24} color="#4299E1" />
          <Text style={styles.logoText}>TourSafe</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="bell" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.characterContainer}>
        <Icon name="account" size={80} color="#D4A574" />
        <Text style={styles.title}>Police</Text>
        <Text style={styles.subtitle}>
          Lost or in danger? Help is just a tap away!
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.miniMap}
          initialRegion={{
            latitude: 28.4595,
            longitude: 77.0266,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
        <Text style={styles.mapLabel}>Nearby Help Centres/ police stations</Text>
      </View>

      <View style={styles.emergencyToggle}>
        <Text style={styles.toggleLabel}>Activate Emergency Mode</Text>
        <Switch
          value={emergencyMode}
          onValueChange={setEmergencyMode}
          trackColor={{ false: '#4A5568', true: '#FC8181' }}
          thumbColor={emergencyMode ? '#E53E3E' : '#CBD5E0'}
        />
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Icon name="map-marker-radius" size={32} color="#48BB78" />
          </View>
          <Text style={styles.featureLabel}>Location Sharing</Text>
          <Switch
            value={locationSharing}
            onValueChange={setLocationSharing}
            trackColor={{ false: '#4A5568', true: '#68D391' }}
          />
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Icon name="map-search" size={32} color="#4299E1" />
          </View>
          <Text style={styles.featureLabel}>Find Assistance</Text>
          <Switch
            value={findAssistance}
            onValueChange={setFindAssistance}
            trackColor={{ false: '#4A5568', true: '#63B3ED' }}
          />
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Icon name="hospital-box" size={32} color="#48BB78" />
          </View>
          <Text style={styles.featureLabel}>Request Medical Aid</Text>
          <Switch
            value={requestMedicalAid}
            onValueChange={setRequestMedicalAid}
            trackColor={{ false: '#4A5568', true: '#68D391' }}
          />
        </View>
      </View>

      <View style={styles.helplineContainer}>
        <Icon name="phone" size={20} color="#F6AD55" />
        <Text style={styles.helplineLabel}>Helpline Number: </Text>
        <Text style={styles.helplineNumber}>100</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3748',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#4299E1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    padding: 8,
  },
  characterContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E0',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#4A5568',
  },
  miniMap: {
    height: 150,
  },
  mapLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    padding: 12,
    backgroundColor: '#4A5568',
  },
  emergencyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1A202C',
    borderRadius: 12,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#1A202C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    color: '#E2E8F0',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  helplineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: '#1A202C',
    borderRadius: 12,
  },
  helplineLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    marginLeft: 8,
  },
  helplineNumber: {
    color: '#FC8181',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
