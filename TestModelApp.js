import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  NativeModules
} from 'react-native';
import Tflite from 'react-native-tensorflow-lite';
import { accelerometer, gyroscope } from 'react-native-sensors';

const { TfliteModule } = NativeModules;

export default function TestModelApp() {
  const [sensorData, setSensorData] = useState({
    acc: { x: 0, y: 0, z: 0 },
    gyro: { x: 0, y: 0, z: 0 }
  });
  const [buffer, setBuffer] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);

  let accSub = null;
  let gyroSub = null;
  let tempBuffer = [];

  // Load TFLite model on component mount
  useEffect(() => {
    // TestModelApp.js mein loadModel() se pehle add karo
    console.log('TfliteModule:', TfliteModule);
    console.log('Available methods:', Object.keys(TfliteModule || {}));
    loadModel();
    
    return () => {
      // Cleanup subscriptions
      if (accSub) accSub.unsubscribe();
      if (gyroSub) gyroSub.unsubscribe();
      // Close TFLite model
      try {
        Tflite.close();
      } catch (e) {
        console.log('Model cleanup:', e);
      }
    };
  }, []);

  const loadModel = async () => {
    try {
      console.log('🔄 Loading TFLite model...');
      setModelLoading(true);
      setModelError(null);
      
      // Load model from assets folder
      await Tflite.loadModel({
        model: 'fall_detection_cnn_model.tflite',
        numThreads: 4, // Use 4 CPU threads for faster inference
      });
      
      setModelLoaded(true);
      setModelLoading(false);
      console.log('✅ Model loaded successfully');
      Alert.alert('Success', 'Fall detection model loaded successfully!');
      
    } catch (error) {
      console.error('❌ Model loading error:', error);
      setModelError(error.message);
      setModelLoading(false);
      Alert.alert(
        'Model Load Error', 
        `Failed to load model: ${error.message}\n\nMake sure fall_detection_cnn_model.tflite is in android/app/src/main/assets/`
      );
    }
  };

  const startRecording = () => {
    console.log('▶️ Starting recording...');
    setIsRecording(true);
    setBuffer([]);
    setPrediction(null);
    tempBuffer = [];

    let accData = { x: 0, y: 0, z: 0 };
    let gyroData = { x: 0, y: 0, z: 0 };

    // Subscribe to accelerometer
    accSub = accelerometer.subscribe(({ x, y, z }) => {
      accData = { x, y, z };
      setSensorData(prev => ({ ...prev, acc: { x, y, z } }));
    });

    // Subscribe to gyroscope
    gyroSub = gyroscope.subscribe(({ x, y, z }) => {
      gyroData = { x, y, z };
      setSensorData(prev => ({ ...prev, gyro: { x, y, z } }));

      // Collect 50 readings
      if (tempBuffer.length < 50) {
        const reading = [
          accData.x, accData.y, accData.z,
          gyroData.x, gyroData.y, gyroData.z
        ];
        tempBuffer.push(reading);
        setBuffer([...tempBuffer]);
        
        console.log(`📊 Reading ${tempBuffer.length}/50`);
      }

      if (tempBuffer.length === 50) {
        console.log('✅ 50 readings collected, stopping...');
        stopRecordingInternal();
      }
    });
  };

  const stopRecordingInternal = () => {
    console.log('⏸️ Stopping recording...');
    if (accSub) {
      accSub.unsubscribe();
      accSub = null;
    }
    if (gyroSub) {
      gyroSub.unsubscribe();
      gyroSub = null;
    }
    setIsRecording(false);
  };

  const stopRecording = () => {
    stopRecordingInternal();
    Alert.alert('Stopped', `Collected ${buffer.length} readings`);
  };

  const testPrediction = async () => {
    console.log('🧠 Testing prediction with TFLite model...');
    
    if (!modelLoaded) {
      Alert.alert('Error', 'Model not loaded. Please restart the app.');
      return;
    }

    if (buffer.length < 50) {
      Alert.alert('Error', `Need 50 readings. Current: ${buffer.length}`);
      return;
    }

    try {
      // Step 1: Normalize data (z-score normalization)
      console.log('📐 Normalizing data...');
      const normalized = normalizeBuffer(buffer);
      
      // Step 2: Flatten to 1D array for TFLite
      const inputArray = normalized.flat(); // [300 values: 50 timesteps × 6 features]
      console.log(`📥 Input array length: ${inputArray.length}`);
      
      if (inputArray.length !== 300) {
        throw new Error(`Invalid input size: ${inputArray.length}, expected 300`);
      }

      // Step 3: Run TFLite model prediction
      console.log('🚀 Running TFLite prediction...');
      const output = await Tflite.runModelOnBinary({
        input: new Float32Array(inputArray),
        inputShape: [1, 50, 6], // Batch=1, Timesteps=50, Features=6
        outputShape: [1, 1],    // Batch=1, Output=1 (probability)
      });

      // Step 4: Get prediction result
      const fallProbability = output[0];
      console.log(`📊 TFLite output (fall probability): ${fallProbability}`);

      // Step 5: Apply threshold (0.35 optimized for fall detection)
      const FALL_THRESHOLD = 0.35;
      const result = {
        probability: fallProbability.toFixed(3),
        isFall: fallProbability > FALL_THRESHOLD,
        timestamp: new Date().toISOString(),
        confidence: Math.abs(fallProbability - 0.5) * 200 // Confidence percentage
      };

      setPrediction(result);

      // Show alert
      Alert.alert(
        result.isFall ? '⚠️ FALL DETECTED!' : '✅ Normal Activity',
        `Probability: ${result.probability}\n` +
        `Threshold: ${FALL_THRESHOLD}\n` +
        `Confidence: ${result.confidence.toFixed(1)}%\n\n` +
        `${result.isFall ? 'FALL DETECTED - Emergency alert ready!' : 'Safe - No fall detected'}`
      );

      console.log('✅ Prediction complete:', result);
      
    } catch (error) {
      console.error('❌ Prediction error:', error);
      Alert.alert(
        'Prediction Error', 
        `${error.message}\n\nCheck console logs for details.`
      );
    }
  };

  const normalizeBuffer = (data) => {
    console.log('Normalizing buffer data...');
    const normalized = [];
    
    // Normalize each feature column (z-score normalization)
    for (let col = 0; col < 6; col++) {
      const column = data.map(row => row[col]);
      
      // Calculate mean
      const mean = column.reduce((a, b) => a + b, 0) / column.length;
      
      // Calculate standard deviation
      const variance = column.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / column.length;
      const std = Math.sqrt(variance);
      
      // Normalize column
      const normalizedCol = column.map(val => 
        std === 0 ? 0 : (val - mean) / std
      );
      
      normalized.push(normalizedCol);
    }

    // Transpose back to [timesteps, features] format
    const result = [];
    for (let i = 0; i < 50; i++) {
      result.push(normalized.map(col => col[i]));
    }
    
    return result;
  };

  const clearData = () => {
    console.log('🗑️ Clearing data...');
    stopRecordingInternal();
    setBuffer([]);
    setPrediction(null);
    Alert.alert('Cleared', 'All data cleared. Ready for new recording.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fall Detection Test App</Text>

      {/* Model Status Card */}
      <View style={[
        styles.card,
        modelLoading ? styles.cardWarning : 
        modelLoaded ? styles.cardSuccess : styles.cardDanger
      ]}>
        <Text style={styles.cardTitle}>🤖 Model Status</Text>
        
        {modelLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF9800" />
            <Text style={styles.dataText}>Loading model...</Text>
          </View>
        ) : modelLoaded ? (
          <View>
            <Text style={styles.successText}>✅ Model Loaded Successfully</Text>
            <Text style={styles.smallText}>Ready for predictions</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.errorText}>❌ Model Not Loaded</Text>
            {modelError && (
              <Text style={styles.smallText}>Error: {modelError}</Text>
            )}
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary, {marginTop: 10}]}
              onPress={loadModel}
            >
              <Text style={styles.buttonText}>Retry Load Model</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Live Sensor Data Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📡 Live Sensor Data</Text>
        <Text style={styles.dataText}>
          Accelerometer:{'\n'}
          X: {sensorData.acc.x.toFixed(3)}{'\n'}
          Y: {sensorData.acc.y.toFixed(3)}{'\n'}
          Z: {sensorData.acc.z.toFixed(3)}
        </Text>
        <Text style={styles.dataText}>
          Gyroscope:{'\n'}
          X: {sensorData.gyro.x.toFixed(3)}{'\n'}
          Y: {sensorData.gyro.y.toFixed(3)}{'\n'}
          Z: {sensorData.gyro.z.toFixed(3)}
        </Text>
      </View>

      {/* Buffer Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💾 Buffer Status</Text>
        <Text style={styles.dataText}>
          Readings Collected: {buffer.length} / 50
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(buffer.length / 50) * 100}%` }
            ]} 
          />
        </View>
        {buffer.length === 50 && (
          <Text style={styles.successText}>✅ Ready for prediction!</Text>
        )}
        {isRecording && (
          <Text style={styles.recordingText}>🔴 Recording...</Text>
        )}
      </View>

      {/* Control Buttons */}
      <TouchableOpacity 
        style={[
          styles.button,
          isRecording ? styles.buttonWarning : styles.buttonSuccess,
          (buffer.length === 50 || !modelLoaded) && styles.buttonDisabled
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={buffer.length === 50 || !modelLoaded}
      >
        <Text style={styles.buttonText}>
          {isRecording ? '⏸️ Stop Recording' : '▶️ Start Recording (1 sec)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.button,
          styles.buttonPrimary,
          (buffer.length < 50 || !modelLoaded) && styles.buttonDisabled
        ]}
        onPress={testPrediction}
        disabled={buffer.length < 50 || !modelLoaded}
      >
        <Text style={styles.buttonText}>🧠 Test Prediction (TFLite)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonDanger]}
        onPress={clearData}
      >
        <Text style={styles.buttonText}>🗑️ Clear Data</Text>
      </TouchableOpacity>

      {/* Prediction Result Card */}
      {prediction && (
        <View style={[
          styles.card, 
          styles.resultCard,
          prediction.isFall ? styles.cardDanger : styles.cardSuccess
        ]}>
          <Text style={styles.resultTitle}>
            {prediction.isFall ? '⚠️ FALL DETECTED!' : '✅ Normal Activity'}
          </Text>
          <Text style={styles.dataText}>
            Probability: {prediction.probability}{'\n'}
            Confidence: {prediction.confidence.toFixed(1)}%{'\n'}
            Threshold: 0.35{'\n'}
            Time: {new Date(prediction.timestamp).toLocaleTimeString()}
          </Text>
          {prediction.isFall && (
            <Text style={styles.warningText}>
              Emergency alert would be triggered in production!
            </Text>
          )}
        </View>
      )}

      {/* Instructions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📖 Instructions</Text>
        <Text style={styles.instructionText}>
          <Text style={styles.bold}>How to Test:{'\n\n'}</Text>
          
          1️⃣ Ensure model is loaded (green status){'\n'}
          2️⃣ Press "Start Recording"{'\n'}
          3️⃣ For FALL: Shake phone vigorously{'\n'}
          4️⃣ For NORMAL: Keep phone still{'\n'}
          5️⃣ Wait 1 second (auto-stops at 50 readings){'\n'}
          6️⃣ Press "Test Prediction"{'\n'}
          7️⃣ View result{'\n'}
          8️⃣ Press "Clear Data" to test again{'\n\n'}
          
          <Text style={styles.bold}>Threshold: 0.35{'\n'}</Text>
          - Above 0.35 = Fall detected{'\n'}
          - Below 0.35 = Normal activity
        </Text>
      </View>

      {/* Technical Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Technical Info</Text>
        <Text style={styles.smallText}>
          Model: fall_detection_cnn_model.tflite{'\n'}
          Input: [1, 50, 6] - 50 timesteps, 6 features{'\n'}
          Features: acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z{'\n'}
          Output: [1, 1] - Fall probability (0-1){'\n'}
          Normalization: Z-score per feature{'\n'}
          Sampling Rate: ~50Hz{'\n'}
          CPU Threads: 4
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardWarning: {
    backgroundColor: '#fff3e0',
  },
  cardDanger: {
    backgroundColor: '#ffebee',
  },
  cardSuccess: {
    backgroundColor: '#e8f5e9',
  },
  resultCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  dataText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginVertical: 5,
    color: '#555',
  },
  instructionText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#555',
  },
  smallText: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 14,
  },
  warningText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  recordingText: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    height: 25,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#4CAF50',
  },
  buttonWarning: {
    backgroundColor: '#FF9800',
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonDanger: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});