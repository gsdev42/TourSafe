import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity 
        style={styles.settingItem}
        onPress={() => router.push('/smartwatch')}
      >
        <Icon name="watch" size={24} color="#4299E1" />
        <Text style={styles.settingText}>Connect Smartwatch</Text>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Icon name="account" size={24} color="#4299E1" />
        <Text style={styles.settingText}>Profile</Text>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Icon name="bell" size={24} color="#4299E1" />
        <Text style={styles.settingText}>Notifications</Text>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Icon name="shield-lock" size={24} color="#4299E1" />
        <Text style={styles.settingText}>Privacy</Text>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Icon name="help-circle" size={24} color="#4299E1" />
        <Text style={styles.settingText}>Help & Support</Text>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Icon name="information" size={24} color="#4299E1" />
        <Text style={styles.settingText}>About</Text>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2D3748',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    gap: 16,
  },
  settingText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
});