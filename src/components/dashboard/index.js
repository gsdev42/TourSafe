import React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function LiveScreen() {
  const [region] = React.useState({
    latitude: 28.4595,
    longitude: 77.0266,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{ latitude: 28.4595, longitude: 77.0266 }}
          title="Police Station"
        />
      </MapView>

      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.topRightIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="map" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="navigation" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.warningBanner}>
        <Icon name="battery-alert" size={20} color="#4CAF50" />
        <Text style={styles.warningText}>
          Verify if the battery is securely connected and not drained.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    width: width,
    height: height,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  topRightIcons: {
    position: 'absolute',
    top: 40,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A5568',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  warningBanner: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
  },
});

