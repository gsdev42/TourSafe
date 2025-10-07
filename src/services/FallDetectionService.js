// FallDetectionService.js (React Native proper)
import { NativeEventEmitter, NativeModules } from 'react-native';
import * as RNFS from 'react-native-fs';

// Use react-native-sensors (pure RN library)
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

class FallDetectionService {
  constructor() {
    this.model = null;
    this.isRunning = false;
    this.sensorBuffer = [];
    this.WINDOW_SIZE = 50;
    this.fallDetected = false;
    this.onFallCallback = null;
    this.accSubscription = null;
    this.gyroSubscription = null;
  }

  async initialize() {
    try {
      console.log('Initializing model...');
      
      // TFLite React Native integration
      const TFLite = NativeModules.TfLite;
      
      if (!TFLite) {
        throw new Error('TFLite module not found');
      }

      // Load model from assets
      const modelPath = `${RNFS.MainBundlePath}/fall_detection_cnn_model.tflite`;
      await TFLite.loadModel({ model: modelPath });
      
      this.model = TFLite;
      console.log('Model loaded successfully');
      return true;
    } catch (error) {
      console.error('Model initialization error:', error);
      return false;
    }
  }

  async start(onFallDetected) {
    if (this.isRunning) return;
    
    if (!this.model) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.error('Failed to initialize model');
        return;
      }
    }

    this.onFallCallback = onFallDetected;
    this.subscribeSensors();
    this.isRunning = true;
    console.log('Fall Detection Service Started');
  }

  subscribeSensors() {
    // Set update interval to 20ms (50Hz)
    setUpdateIntervalForType(SensorTypes.accelerometer, 20);
    setUpdateIntervalForType(SensorTypes.gyroscope, 20);

    let accData = { x: 0, y: 0, z: 0 };
    let gyroData = { x: 0, y: 0, z: 0 };

    // Subscribe to accelerometer
    this.accSubscription = accelerometer.subscribe(({ x, y, z }) => {
      accData = { x, y, z };
    });

    // Subscribe to gyroscope and process
    this.gyroSubscription = gyroscope.subscribe(({ x, y, z }) => {
      gyroData = { x, y, z };
      
      // Combine readings
      const reading = [
        accData.x, accData.y, accData.z,
        gyroData.x, gyroData.y, gyroData.z
      ];

      // Add to buffer
      this.sensorBuffer.push(reading);

      // Keep only last 50 readings
      if (this.sensorBuffer.length > this.WINDOW_SIZE) {
        this.sensorBuffer.shift();
      }

      // Run prediction when buffer is full
      if (this.sensorBuffer.length === this.WINDOW_SIZE) {
        this.runPrediction();
      }
    });
  }

  normalizeSensorData(data) {
    const normalized = [];
    
    for (let col = 0; col < 6; col++) {
      const column = data.map(row => row[col]);
      const mean = column.reduce((a, b) => a + b, 0) / column.length;
      const std = Math.sqrt(
        column.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / column.length
      );
      
      const normalizedCol = column.map(val => 
        std === 0 ? 0 : (val - mean) / std
      );
      normalized.push(normalizedCol);
    }

    // Transpose back
    const result = [];
    for (let i = 0; i < this.WINDOW_SIZE; i++) {
      result.push(normalized.map(col => col[i]));
    }
    return result;
  }

  async runPrediction() {
    if (!this.isRunning || !this.model) return;

    try {
      // Normalize data
      const normalizedData = this.normalizeSensorData(this.sensorBuffer);
      
      // Flatten for TFLite
      const inputArray = normalizedData.flat();

      // Run TFLite model
      const output = await this.model.run(inputArray, [1, 50, 6]);
      const fallProbability = output[0];

      // Check for fall (threshold 0.35)
      if (fallProbability > 0.35 && !this.fallDetected) {
        this.fallDetected = true;
        this.handleFallDetection(fallProbability);
      } else if (fallProbability <= 0.25) {
        this.fallDetected = false;
      }

    } catch (error) {
      console.error('Prediction error:', error);
    }
  }

  handleFallDetection(probability) {
    console.log(`FALL DETECTED! Probability: ${probability.toFixed(3)}`);
    
    if (this.onFallCallback) {
      this.onFallCallback({
        probability: probability.toFixed(3),
        timestamp: new Date().toISOString()
      });
    }
  }

  stop() {
    if (!this.isRunning) return;

    if (this.accSubscription) {
      this.accSubscription.unsubscribe();
    }
    if (this.gyroSubscription) {
      this.gyroSubscription.unsubscribe();
    }

    this.sensorBuffer = [];
    this.isRunning = false;
    console.log('Fall Detection Service Stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      fallDetected: this.fallDetected,
      bufferSize: this.sensorBuffer.length,
      bufferFull: this.sensorBuffer.length === this.WINDOW_SIZE
    };
  }
}

export default new FallDetectionService();