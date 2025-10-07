import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';

const EmergencyAlertScreen = ({ onCancel, onConfirmEmergency }) => {
  const [countdown, setCountdown] = useState(15); // 15 seconds countdown
  const [isCancelled, setIsCancelled] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    // Pulse animation for alert
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handleAutoSend();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      pulseAnimation.stop();
    };
  }, []);

  const handleAutoSend = () => {
    if (!isCancelled) {
      Alert.alert('Emergency SOS Sent', 'Your emergency contacts have been notified!');
      onConfirmEmergency();
    }
  };

  const handleCancel = () => {
    setIsCancelled(true);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    Alert.alert('Cancelled', "Glad you're okay!", [
      {
        text: 'OK',
        onPress: () => onCancel(),
      },
    ]);
  };

  const handleSendNow = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    Alert.alert('Emergency SOS Sent', 'Your emergency contacts have been notified immediately!');
    onConfirmEmergency();
  };

  return (
    <View style={styles.container}>
      {/* Warning Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
        </Animated.View>
        <Text style={styles.title}>FALL DETECTED!</Text>
      </View>

      {/* Countdown Circle */}
      <View style={styles.countdownContainer}>
        <View style={styles.countdownCircle}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownText}>seconds</Text>
        </View>
        <Text style={styles.message}>
          Emergency SOS will be sent automatically
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>✓ I'm OK</Text>
          <Text style={styles.buttonSubtext}>Cancel Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.emergencyButton]}
          onPress={handleSendNow}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🚨 Send SOS Now</Text>
          <Text style={styles.buttonSubtext}>Get Help Immediately</Text>
        </TouchableOpacity>
      </View>

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📍 Your location will be shared{'\n'}
          📞 Emergency contacts will be notified{'\n'}
          🚑 Local emergency services alerted
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff3b30',
    textAlign: 'center',
    letterSpacing: 2,
  },
  countdownContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  countdownCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#ff6b6b',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
  },
  countdownText: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
  },
  message: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#4CAF50',
  },
  emergencyButton: {
    backgroundColor: '#ff3b30',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EmergencyAlertScreen;