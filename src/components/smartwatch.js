import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SmartWatchConnectScreen() {
  const router = useRouter();
  const [searching, setSearching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearching(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Icon name="shield-check" size={24} color="#4299E1" />
          <Text style={styles.logoText}>TourSafe</Text>
        </View>
        <TouchableOpacity>
          <Icon name="cog" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Connect your smartwatch</Text>
        <Text style={styles.subtitle}>
          Sync your mobile app to your smartwatch for better data
        </Text>

        <View style={styles.watchContainer}>
          <View style={styles.watch}>
            <View style={styles.watchScreen} />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.searchButton}
          disabled={searching}
          onPress={() => setSearching(true)}
        >
          <Text style={styles.searchButtonText}>
            {searching ? 'Searching...' : 'Search Again'}
          </Text>
        </TouchableOpacity>

        {searching && (
          <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 20 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  watchContainer: {
    marginTop: 60,
    marginBottom: 60,
  },
  watch: {
    width: 200,
    height: 240,
    backgroundColor: '#E2E8F0',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 12,
    borderColor: '#1A202C',
  },
  watchScreen: {
    width: 160,
    height: 160,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 25,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});