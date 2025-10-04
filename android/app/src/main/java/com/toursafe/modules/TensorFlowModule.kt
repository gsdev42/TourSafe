package com.toursafe.modules

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.tensorflow.lite.Interpreter as TFLiteInterpreter
import java.io.FileInputStream
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import kotlin.math.sqrt

class TensorFlowModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), SensorEventListener {

    companion object {
        private const val TAG = "TensorFlowModule"  // ✅ Add this
    }

    private var interpreter: TFLiteInterpreter? = null
    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var gyroscope: Sensor? = null
    private var magnetometer: Sensor? = null
    
    private var isMonitoring = false
    private val accData = FloatArray(3) // x, y, z
    private val gyroData = FloatArray(3)
    private val oriData = FloatArray(3)
    
    // For feature extraction (windowed data)
    private val accWindow = mutableListOf<FloatArray>()
    private val gyroWindow = mutableListOf<FloatArray>()
    private val oriWindow = mutableListOf<FloatArray>()
    private val windowSize = 50 // 50 samples at 50Hz = 1 second
    
    // Model metadata for scaling
    private var featureMeans: FloatArray? = null
    private var featureScales: FloatArray? = null
    
    private var lastFallTime = 0L
    private val fallCooldown = 5000L // 5 seconds cooldown

    override fun getName(): String {
        return "TensorFlowModule"
    }

    @ReactMethod
    fun loadFallDetectionModel(promise: Promise) {
        try {
            Log.d(TAG, "Loading fall detection model...")
            
            // Load TFLite model
            val modelFile = loadModelFile("models/sk_mlp_converted.tflite")
            interpreter = TFLiteInterpreter(modelFile)
            
            // Load metadata for feature scaling
            loadModelMetadata()
            
            // Initialize sensors
            sensorManager = reactApplicationContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
            accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
            magnetometer = sensorManager?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
            
            Log.d(TAG, "✅ Fall detection model loaded successfully")
            promise.resolve("Fall detection model loaded successfully")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Model load error", e)
            promise.reject("MODEL_LOAD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startFallDetection(promise: Promise) {
        try {
            Log.d(TAG, "Starting fall detection...")
            
            if (isMonitoring) {
                Log.w(TAG, "Fall detection already running")
                promise.resolve("Fall detection already running")
                return
            }
            
            if (interpreter == null) {
                Log.e(TAG, "Model not loaded")
                promise.reject("MODEL_NOT_LOADED", "Please load model first")
                return
            }
            
            // Register sensor listeners at 50Hz (SENSOR_DELAY_GAME)
            accelerometer?.let { 
                val registered = sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
                Log.d(TAG, "Accelerometer registered: $registered")
            }
            gyroscope?.let { 
                val registered = sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
                Log.d(TAG, "Gyroscope registered: $registered")
            }
            magnetometer?.let { 
                val registered = sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
                Log.d(TAG, "Magnetometer registered: $registered")
            }
            
            isMonitoring = true
            Log.d(TAG, "✅ Fall detection started successfully")
            promise.resolve("Fall detection started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Detection start error", e)
            promise.reject("DETECTION_START_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopFallDetection(promise: Promise) {
        try {
            Log.d(TAG, "🛑 Stopping fall detection...")
            
            if (!isMonitoring) {
                Log.w(TAG, "⚠️ Fall detection is not running")
                promise.reject("NOT_RUNNING", "Fall detection is not currently running")
                return
            }

            // ✅ FIXED: Unregister sensor listeners properly
            sensorManager?.unregisterListener(this)
            
            // Clear data buffers
            accWindow.clear()
            gyroWindow.clear()
            oriWindow.clear()

            // Reset state
            isMonitoring = false
            lastFallTime = 0L

            Log.d(TAG, "✅ Fall detection stopped successfully")
            
            // ✅ Always resolve the promise
            val result = Arguments.createMap()
            result.putBoolean("success", true)
            result.putString("message", "Fall detection stopped successfully")
            promise.resolve(result)
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error stopping fall detection", e)
            
            // Reset state even on error
            isMonitoring = false
            
            promise.reject("STOP_ERROR", "Failed to stop fall detection: ${e.message}", e)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null || !isMonitoring) return
        
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                accData[0] = event.values[0]
                accData[1] = event.values[1]
                accData[2] = event.values[2]
                accWindow.add(accData.clone())
            }
            Sensor.TYPE_GYROSCOPE -> {
                gyroData[0] = event.values[0]
                gyroData[1] = event.values[1]
                gyroData[2] = event.values[2]
                gyroWindow.add(gyroData.clone())
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                oriData[0] = event.values[0]
                oriData[1] = event.values[1]
                oriData[2] = event.values[2]
                oriWindow.add(oriData.clone())
            }
        }
        
        // Keep window size constant
        if (accWindow.size > windowSize) accWindow.removeAt(0)
        if (gyroWindow.size > windowSize) gyroWindow.removeAt(0)
        if (oriWindow.size > windowSize) oriWindow.removeAt(0)
        
        // Run prediction when we have enough data
        if (accWindow.size >= windowSize && 
            gyroWindow.size >= windowSize && 
            oriWindow.size >= windowSize) {
            runFallDetectionInference()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Not needed for this implementation
    }

    private fun runFallDetectionInference() {
        try {
            // Check cooldown
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastFallTime < fallCooldown) {
                return
            }
            
            // Extract 100 features from sensor windows
            val features = extractFeatures()
            
            // Scale features using metadata
            val scaledFeatures = scaleFeatures(features)
            
            // Prepare input tensor
            val inputArray = Array(1) { scaledFeatures }
            val outputArray = Array(1) { FloatArray(2) } // [no_fall_prob, fall_prob]
            
            // Run inference
            interpreter?.run(inputArray, outputArray)
            
            val noFallProb = outputArray[0][0]
            val fallProb = outputArray[0][1]
            
            Log.d(TAG, "Inference result - No Fall: $noFallProb, Fall: $fallProb")
            
            // Fall detected if probability > 70%
            if (fallProb > 0.7) {
                Log.w(TAG, "🚨 FALL DETECTED! Probability: ${(fallProb * 100).toInt()}%")
                lastFallTime = currentTime
                sendFallDetectionEvent(fallProb)
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Inference error", e)
        }
    }

    private fun extractFeatures(): FloatArray {
        val features = FloatArray(100)
        var idx = 0
        
        // Extract features for each sensor (x, y, z)
        // Accelerometer features (33 features)
        for (axis in 0..2) {
            val values = accWindow.map { it[axis] }
            features[idx++] = values.average().toFloat() // mean
            features[idx++] = calculateStd(values) // std
            features[idx++] = values.minOrNull() ?: 0f // min
            features[idx++] = values.maxOrNull() ?: 0f // max
            features[idx++] = calculateMedian(values) // median
            features[idx++] = (values.maxOrNull() ?: 0f) - (values.minOrNull() ?: 0f) // range
            features[idx++] = calculateVariance(values) // var
            features[idx++] = calculateRMS(values) // rms
            features[idx++] = calculatePercentile(values, 0.25f) // q25
            features[idx++] = calculatePercentile(values, 0.75f) // q75
            features[idx++] = calculatePercentile(values, 0.75f) - calculatePercentile(values, 0.25f) // iqr
        }
        
        // Gyroscope features (32 features - missing mean and median for z)
        for (axis in 0..2) {
            val values = gyroWindow.map { it[axis] }
            if (axis < 2) {
                features[idx++] = values.average().toFloat()
                features[idx++] = calculateStd(values)
                features[idx++] = values.minOrNull() ?: 0f
                features[idx++] = values.maxOrNull() ?: 0f
                features[idx++] = calculateMedian(values)
                features[idx++] = (values.maxOrNull() ?: 0f) - (values.minOrNull() ?: 0f)
                features[idx++] = calculateVariance(values)
                features[idx++] = calculateRMS(values)
                features[idx++] = calculatePercentile(values, 0.25f)
                features[idx++] = calculatePercentile(values, 0.75f)
                features[idx++] = calculatePercentile(values, 0.75f) - calculatePercentile(values, 0.25f)
            } else {
                features[idx++] = calculateStd(values)
                features[idx++] = values.minOrNull() ?: 0f
                features[idx++] = values.maxOrNull() ?: 0f
                features[idx++] = (values.maxOrNull() ?: 0f) - (values.minOrNull() ?: 0f)
                features[idx++] = calculateRMS(values)
                features[idx++] = calculatePercentile(values, 0.25f)
                features[idx++] = calculatePercentile(values, 0.75f)
                features[idx++] = calculatePercentile(values, 0.75f) - calculatePercentile(values, 0.25f)
            }
        }
        
        // Orientation features (30 features)
        for (axis in 0..2) {
            val values = oriWindow.map { it[axis] }
            features[idx++] = values.average().toFloat()
            features[idx++] = calculateStd(values)
            features[idx++] = values.minOrNull() ?: 0f
            features[idx++] = values.maxOrNull() ?: 0f
            features[idx++] = calculateMedian(values)
            features[idx++] = (values.maxOrNull() ?: 0f) - (values.minOrNull() ?: 0f)
            features[idx++] = calculateVariance(values)
            features[idx++] = calculateRMS(values)
            features[idx++] = calculatePercentile(values, 0.25f)
            features[idx++] = calculatePercentile(values, 0.75f)
            features[idx++] = calculatePercentile(values, 0.75f) - calculatePercentile(values, 0.25f)
        }
        
        // Magnitude features (5 features)
        val accMagnitudes = accWindow.map { sqrt(it[0]*it[0] + it[1]*it[1] + it[2]*it[2]) }
        features[idx++] = accMagnitudes.average().toFloat()
        features[idx++] = calculateStd(accMagnitudes)
        features[idx++] = accMagnitudes.maxOrNull() ?: 0f
        
        val gyroMagnitudes = gyroWindow.map { sqrt(it[0]*it[0] + it[1]*it[1] + it[2]*it[2]) }
        features[idx++] = gyroMagnitudes.average().toFloat()
        features[idx++] = gyroMagnitudes.maxOrNull() ?: 0f
        
        Log.d(TAG, "Extracted ${idx} features")
        return features
    }

    private fun scaleFeatures(features: FloatArray): FloatArray {
        val means = featureMeans
        val scales = featureScales
        
        if (means == null || scales == null) {
            Log.w(TAG, "⚠️ Feature scaling metadata not loaded, using raw features")
            return features
        }
        
        val scaled = FloatArray(features.size)
        for (i in features.indices) {
            if (i < means.size && i < scales.size) {
                scaled[i] = (features[i] - means[i]) / scales[i]
            } else {
                scaled[i] = features[i]
            }
        }
        return scaled
    }

    private fun loadModelFile(modelPath: String): MappedByteBuffer {
        val assetFileDescriptor = reactApplicationContext.assets.openFd(modelPath)
        val fileChannel = FileInputStream(assetFileDescriptor.fileDescriptor).channel
        val startOffset = assetFileDescriptor.startOffset
        val declaredLength = assetFileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }

    private fun loadModelMetadata() {
        try {
            val inputStream = reactApplicationContext.assets.open("models/model_metadata_trimmed.json")
            val reader = BufferedReader(InputStreamReader(inputStream))
            val json = reader.readText()
            reader.close()
            
            val jsonObject = JSONObject(json)
            val meanArray = jsonObject.getJSONArray("mean")
            val scaleArray = jsonObject.getJSONArray("scale")
            
            featureMeans = FloatArray(meanArray.length()) { meanArray.getDouble(it).toFloat() }
            featureScales = FloatArray(scaleArray.length()) { scaleArray.getDouble(it).toFloat() }
            
            Log.d(TAG, "✅ Model metadata loaded: ${meanArray.length()} means, ${scaleArray.length()} scales")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error loading model metadata", e)
        }
    }

    private fun sendFallDetectionEvent(probability: Float) {
        val params = Arguments.createMap()
        params.putDouble("probability", probability.toDouble())
        params.putDouble("timestamp", System.currentTimeMillis().toDouble())
        params.putBoolean("fallDetected", true)
        
        Log.d(TAG, "🚨 Sending fall detection event to React Native")
        
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onFallDetected", params)
    }

    // Statistical helper functions
    private fun calculateStd(values: List<Float>): Float {
        val mean = values.average()
        val variance = values.map { (it - mean) * (it - mean) }.average()
        return sqrt(variance).toFloat()
    }

    private fun calculateVariance(values: List<Float>): Float {
        val mean = values.average()
        return values.map { (it - mean) * (it - mean) }.average().toFloat()
    }

    private fun calculateRMS(values: List<Float>): Float {
        return sqrt(values.map { it * it }.average()).toFloat()
    }

    private fun calculateMedian(values: List<Float>): Float {
        val sorted = values.sorted()
        return if (sorted.size % 2 == 0) {
            (sorted[sorted.size / 2 - 1] + sorted[sorted.size / 2]) / 2f
        } else {
            sorted[sorted.size / 2]
        }
    }

    private fun calculatePercentile(values: List<Float>, percentile: Float): Float {
        val sorted = values.sorted()
        val index = (percentile * (sorted.size - 1)).toInt()
        return sorted[index]
    }

    // Placeholder methods for other ML features
    @ReactMethod
    fun loadScreamFightDetectionModel(promise: Promise) {
        promise.resolve("Audio detection model - not implemented yet")
    }

    @ReactMethod
    fun processSensorData(accelerometerData: ReadableArray, gyroscopeData: ReadableArray, promise: Promise) {
        promise.resolve("Sensor data processing - not implemented yet")
    }

    @ReactMethod
    fun startAudioMonitoring(promise: Promise) {
        promise.resolve("Audio monitoring - not implemented yet")
    }

    @ReactMethod
    fun stopAudioMonitoring() {
        Log.d(TAG, "Audio monitoring stop - not implemented yet")
    }

    @ReactMethod
    fun processAudioBuffer(audioData: ReadableArray, promise: Promise) {
        promise.resolve("Audio buffer processing - not implemented yet")
    }

    @ReactMethod
    fun detectAbnormalBehavior(behaviorData: ReadableMap, promise: Promise) {
        promise.resolve("Behavior detection - not implemented yet")
    }
}