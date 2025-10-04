// ScreamDetectionScreen.js - Main screen for scream detection
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AudioRecord from 'react-native-audio-record';
import screamDetector from './services/ScreamDetectionService';
import EmergencyAlertScreen from './screens/EmergencyAlertScreen';

const ScreamDetectionScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingIntervalRef = useRef(null);

  // Backend URL - Replace with your server IP
  const BACKEND_URL = 'http://192.168.1.XXX:5000/extract_features';

  useEffect(() => {
    initializeDetection();
    return () => cleanup();
  }, []);

  const initializeDetection = async () => {
    try {
      // Request audio permissions
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'TourSafe needs microphone access for scream detection',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Microphone access is required for scream detection');
          return;
        }
      }

      // Initialize audio recorder
      const options = {
        sampleRate: 22050, // Match training sample rate
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'scream_audio.wav',
      };
      AudioRecord.init(options);

      // Load TFLite model
      await screamDetector.loadModel('scream_classifier.tflite');
      setIsModelLoaded(true);
      console.log('Scream detector initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize scream detector');
    }
  };

  const cleanup = async () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (isListening) {
      AudioRecord.stop();
    }
    await screamDetector.unloadModel();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const toggleListening = async () => {
    if (!isModelLoaded) {
      Alert.alert('Please Wait', 'Model is still loading...');
      return;
    }

    if (isListening) {
      // Stop listening
      setIsListening(false);
      stopPulseAnimation();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      AudioRecord.stop();
      console.log('Scream detection stopped');
    } else {
      // Start listening
      setIsListening(true);
      startPulseAnimation();
      startContinuousDetection();
      console.log('Scream detection started');
    }
  };

  const startContinuousDetection = () => {
    // Record audio in 3-second chunks for continuous monitoring
    const RECORDING_DURATION = 3000; // 3 seconds

    const recordAndCheck = async () => {
      try {
        // Start recording
        AudioRecord.start();
        
        // Wait for recording duration
        await new Promise(resolve => setTimeout(resolve, RECORDING_DURATION));
        
        // Stop and get audio path
        const audioPath = await AudioRecord.stop();
        
        // Process audio
        setIsProcessing(true);
        const result = await screamDetector.processAudio(audioPath, BACKEND_URL);
        setIsProcessing(false);

        console.log('Detection result:', result);
        
        // If scream detected with high confidence
        if (result.isDanger && parseFloat(result.confidence) > 70) {
          setConfidence(result.confidence);
          setIsListening(false);
          stopPulseAnimation();
          setShowAlert(true);
          
          // Clear interval when scream is detected
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
          }
        }
      } catch (error) {
        console.error('Detection error:', error);
        setIsProcessing(false);
      }
    };

    // Initial recording
    recordAndCheck();

    // Set up interval for continuous monitoring
    recordingIntervalRef.current = setInterval(recordAndCheck, RECORDING_DURATION + 500);
  };

  const handleEmergency = () => {
    // Handle emergency SOS
    Alert.alert('Emergency', 'SOS sent to emergency contacts!');
    setShowAlert(false);
    // Add your emergency handling logic here
    // - Send SMS to emergency contacts
    // - Share location
    // - Call emergency services
  };

  if (showAlert) {
    return (
      <EmergencyAlertScreen
        alertType="scream"
        confidenceLevel={confidence}
        onCancel={() => {
          setShowAlert(false);
          setConfidence(null);
        }}
        onConfirmEmergency={handleEmergency}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎤 Scream Detection</Text>
        <Text style={styles.subtitle}>
          {isModelLoaded ? 'Ready to protect you' : 'Loading...'}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status Indicator */}
        <Animated.View 
          style={[
            styles.statusCircle,
            isListening && styles.statusCircleActive,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={styles.statusIcon}>
            {isListening ? '🎤' : '🔇'}
          </Text>
          <Text style={styles.statusText}>
            {isListening ? 'LISTENING' : 'IDLE'}
          </Text>
        </Animated.View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.processingText}>Analyzing audio...</Text>
          </View>
        )}

        {/* Toggle Button */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isListening ? styles.toggleButtonActive : styles.toggleButtonInactive,
            !isModelLoaded && styles.toggleButtonDisabled,
          ]}
          onPress={toggleListening}
          disabled={!isModelLoaded}
        >
          <Text style={styles.toggleButtonText}>
            {isListening ? 'Stop Detection' : 'Start Detection'}
          </Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • Continuously monitors audio in background{'\n'}
            • Detects distress screams using AI{'\n'}
            • Automatically alerts emergency contacts{'\n'}
            • 15-second countdown to cancel false alarms
          </Text>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Safety Tips</Text>
          <Text style={styles.tipsText}>
            Keep your phone unlocked while in unsafe areas for faster detection
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isListening 
            ? '⚠️ Detection active - Stay safe!' 
            : 'Tap "Start Detection" to begin monitoring'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statusCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    borderWidth: 5,
    borderColor: '#34495e',
  },
  statusCircleActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  statusIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  processingText: {
    color: '#3498db',
    marginLeft: 10,
    fontSize: 14,
  },
  toggleButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 30,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleButtonInactive: {
    backgroundColor: '#3498db',
  },
  toggleButtonActive: {
    backgroundColor: '#e74c3c',
  },
  toggleButtonDisabled: {
    backgroundColor: '#7f8c8d',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    marginBottom: 15,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(241, 196, 15, 0.3)',
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#a0a0a0',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  footerText: {
    color: '#a0a0a0',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ScreamDetectionScreen;
