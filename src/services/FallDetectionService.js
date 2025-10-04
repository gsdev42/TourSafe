import { Vibration } from 'react-native';
import { accelerometer, gyroscope, magnetometer } from 'react-native-sensors';
import Tflite from 'react-native-tensorflow-lite';

class FallDetectionService {
  constructor() {
    this.isRunning = false;
    this.subscriptions = [];
    this.accData = { x: 0, y: 0, z: 0 };
    this.gyroData = { x: 0, y: 0, z: 0 };
    this.oriData = { x: 0, y: 0, z: 0 };
    this.fallDetected = false;
    this.onFallCallback = null;
    this.intervalId = null;
  }

  async start(onFallDetected) {
    if (this.isRunning) {
      console.log('Service already running');
      return;
    }

    this.onFallCallback = onFallDetected;

    try {
      // TFLITE Model load karo
      await Tflite.loadModel({
        model: 'fall_detection_model.tflite',
        numThreads: 4,
      });

      console.log('✅ Model loaded successfully');

      // Accelerometer subscribe
      this.subscriptions.push(
        accelerometer.subscribe(({ x, y, z }) => {
          this.accData = { x, y, z };
        })
      );

      // Gyroscope subscribe
      this.subscriptions.push(
        gyroscope.subscribe(({ x, y, z }) => {
          this.gyroData = { x, y, z };
        })
      );

      // Magnetometer/Orientation subscribe
      this.subscriptions.push(
        magnetometer.subscribe(({ x, y, z }) => {
          this.oriData = { x, y, z };
        })
      );

      console.log('✅ All sensors activated');

      // Har 100ms me prediction run karo
      this.intervalId = setInterval(() => {
        this.runPrediction();
      }, 100);

      this.isRunning = true;
      console.log('🚀 Fall Detection Service Started');
    } catch (error) {
      console.error('❌ Service start error:', error);
    }
  }

  async runPrediction() {
    if (!this.isRunning) return;

    try {
      // Teeno sensors ka data combine karo
      // Format: [acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, ori_x, ori_y, ori_z]
      const inputData = [
        this.accData.x, this.accData.y, this.accData.z,
        this.gyroData.x, this.gyroData.y, this.gyroData.z,
        this.oriData.x, this.oriData.y, this.oriData.z
      ];

      // Model ko input do
      const output = await Tflite.runModelOnBinary({
        input: new Float32Array(inputData),
        inputShape: [1, 9], // 9 features (3 sensors × 3 axes)
        outputShape: [1, 2], // [no_fall_prob, fall_prob]
      });

      const noFallProb = output[0];
      const fallProb = output[1];

      // Fall detection logic
      if (fallProb > 0.7 && !this.fallDetected) {
        this.fallDetected = true;
        this.handleFallDetection();
        console.log(`🚨 FALL DETECTED! Probability: ${(fallProb * 100).toFixed(1)}%`);
      } else if (fallProb <= 0.5) {
        // Reset flag when probability is low
        this.fallDetected = false;
      }
    } catch (error) {
      console.error('❌ Prediction error:', error);
    }
  }

  handleFallDetection() {
    // Strong vibration pattern
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);

    // Callback trigger karo (Emergency screen dikhaane ke liye)
    if (this.onFallCallback) {
      this.onFallCallback();
    }
  }

  stop() {
    if (!this.isRunning) {
      console.log('Service not running');
      return;
    }

    // Sab sensors unsubscribe karo
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error('Unsubscribe error:', error);
      }
    });
    this.subscriptions = [];

    // Interval clear karo
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Model close karo
    try {
      Tflite.close();
    } catch (error) {
      console.error('Model close error:', error);
    }

    this.isRunning = false;
    this.fallDetected = false;
    console.log('🛑 Fall Detection Service Stopped');
  }

  // Status check karne ke liye
  getStatus() {
    return {
      isRunning: this.isRunning,
      fallDetected: this.fallDetected,
      sensorData: {
        accelerometer: this.accData,
        gyroscope: this.gyroData,
        orientation: this.oriData,
      }
    };
  }
}

// Singleton instance export karo
export default new FallDetectionService();