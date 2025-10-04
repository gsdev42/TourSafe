
import { Vibration } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import Tflite from 'react-native-tensorflow-lite';
import RNFS from 'react-native-fs';

class ScreamDetectionService {
  constructor() {
    this.isRunning = false;
    this.screamDetected = false;
    this.onScreamCallback = null;
    this.intervalId = null;
    this.audioBuffer = [];
    this.isProcessing = false;
  }

  async start(onScreamDetected) {
    if (this.isRunning) {
      console.log('Service already running');
      return;
    }

    this.onScreamCallback = onScreamDetected;

    try {
      // TFLite Model load karo
      await Tflite.loadModel({
        model: 'scream_classifier.tflite',
        numThreads: 4,
      });

      console.log('✅ Scream detection model loaded successfully');

      // Audio recorder initialize karo
      const options = {
        sampleRate: 22050, // Training sample rate ke saath match
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'scream_buffer.wav',
      };
      AudioRecord.init(options);

      console.log('✅ Audio recorder initialized');

      // Continuous recording shuru karo
      AudioRecord.start();

      // Har 3 seconds me audio process karo
      this.intervalId = setInterval(() => {
        this.processAudioChunk();
      }, 3000); // 3 second chunks

      this.isRunning = true;
      console.log('🚀 Scream Detection Service Started');
    } catch (error) {
      console.error('❌ Service start error:', error);
    }
  }

  async processAudioChunk() {
    if (!this.isRunning || this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Current recording stop karo aur file path lo
      const audioPath = await AudioRecord.stop();
      
      // Immediately next recording shuru karo (continuous monitoring)
      AudioRecord.start();

      // Audio file se features extract karo
      const features = await this.extractMFCCFeatures(audioPath);

      // Model ko input do
      const output = await Tflite.runModelOnBinary({
        input: new Float32Array(features),
        inputShape: [1, 40], // 40 MFCC features
        outputShape: [1, 1], // Sigmoid output
      });

      const screamProbability = output[0];

      // Scream detection logic
      if (screamProbability > 0.7 && !this.screamDetected) {
        this.screamDetected = true;
        this.handleScreamDetection(screamProbability);
        console.log(`🚨 SCREAM DETECTED! Probability: ${(screamProbability * 100).toFixed(1)}%`);
      } else if (screamProbability <= 0.5) {
        // Reset flag when probability is low
        this.screamDetected = false;
      }

      // Cleanup temporary file
      await this.cleanupAudioFile(audioPath);

    } catch (error) {
      console.error('❌ Audio processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async extractMFCCFeatures(audioPath) {
    try {
      // Backend API se features fetch karo
      const formData = new FormData();
      formData.append('audio', {
        uri: audioPath,
        type: 'audio/wav',
        name: 'audio.wav',
      });

      // Backend URL - Replace with your server
      const BACKEND_URL = 'http://192.168.1.XXX:5000/extract_features';
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 5000, // 5 second timeout
      });

      const result = await response.json();
      
      if (result.success && result.features) {
        return result.features;
      } else {
        throw new Error('Failed to extract features from backend');
      }
    } catch (error) {
      console.error('❌ Feature extraction error:', error);
      // Return dummy features as fallback (not recommended for production)
      return new Array(40).fill(0);
    }
  }

  async cleanupAudioFile(filePath) {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
      }
    } catch (error) {
      console.error('❌ File cleanup error:', error);
    }
  }

  handleScreamDetection(probability) {
    // Strong vibration pattern for scream alert
    Vibration.vibrate([0, 500, 200, 500, 200, 500, 200, 500]);

    // Callback trigger karo (Emergency screen dikhaane ke liye)
    if (this.onScreamCallback) {
      this.onScreamCallback({
        confidence: (probability * 100).toFixed(2),
        timestamp: new Date().toISOString(),
      });
    }
  }

  stop() {
    if (!this.isRunning) {
      console.log('Service not running');
      return;
    }

    // Audio recording stop karo
    try {
      AudioRecord.stop();
    } catch (error) {
      console.error('Audio stop error:', error);
    }

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
    this.screamDetected = false;
    this.isProcessing = false;
    console.log('🛑 Scream Detection Service Stopped');
  }

  // Status check karne ke liye
  getStatus() {
    return {
      isRunning: this.isRunning,
      screamDetected: this.screamDetected,
      isProcessing: this.isProcessing,
    };
  }

  // Backend connectivity check
  async checkBackendConnection(backendUrl) {
    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        timeout: 3000,
      });
      const result = await response.json();
      return result.status === 'ok';
    } catch (error) {
      console.error('❌ Backend connection check failed:', error);
      return false;
    }
  }
}

// Singleton instance export karo
export default new ScreamDetectionService();
