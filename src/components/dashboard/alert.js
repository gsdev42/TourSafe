import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AlertScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D5C5C" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer}>
          <Icon name="shield-check" size={24} color="#4299E1" />
          <Text style={styles.logoText}>TourSafe</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Icon name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }}>
            <Icon name="bell" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>ALERTS</Text>
      <Text style={styles.subtitle}>
        Generate textual and verbal reports, help is just a click away
      </Text>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 28.4595,
            longitude: 77.0266,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
        <Text style={styles.mapLabel}>Nearby Help Centres</Text>
      </View>

      <View style={styles.alertBox}>
        <Icon name="shield-alert" size={32} color="#4299E1" />
        <Text style={styles.alertText}>
          We have detected a crash, and initiated a sos request. if its made by accident
          then u can cancel it in the next 1 minute
        </Text>
      </View>

      <View style={styles.reportingSection}>
        <Text style={styles.reportingTitle}>EMERGENCY REPORTING</Text>
        
        <View style={styles.reportButtons}>
          <TouchableOpacity style={styles.reportButton}>
            <Icon name="file-document" size={40} color="#4299E1" />
            <Text style={styles.reportButtonText}>Generate Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton}>
            <Icon name="shield-alert" size={40} color="#E53E3E" />
            <Text style={styles.reportButtonText}>Contact Police</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton}>
            <Icon name="microphone" size={40} color="#D946A3" />
            <Text style={styles.reportButtonText}>Voice report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D5C5C',
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#B2D4D4',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    height: 150,
  },
  mapLabel: {
    backgroundColor: '#134E4E',
    color: '#fff',
    padding: 12,
    fontSize: 12,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A4646',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  alertText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
  },
  reportingSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  reportingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FC8181',
    textAlign: 'center',
    marginBottom: 20,
  },
  reportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#0A4646',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  reportButtonText: {
    color: '#E2E8F0',
    fontSize: 11,
    textAlign: 'center',
  },
});