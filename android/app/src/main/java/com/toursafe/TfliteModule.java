package com.toursafe;

import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import org.tensorflow.lite.Interpreter;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;

public class TfliteModule extends ReactContextBaseJavaModule {
    private Interpreter tflite;
    private static final String MODEL_NAME = "fall_detection_cnn_model.tflite";

    public TfliteModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TfliteModule";
    }

    @ReactMethod
    public void loadModel(Promise promise) {
        try {
            MappedByteBuffer tfliteModel = loadModelFile();
            Interpreter.Options options = new Interpreter.Options();
            options.setNumThreads(4);
            tflite = new Interpreter(tfliteModel, options);
            promise.resolve("Model loaded successfully");
        } catch (Exception e) {
            promise.reject("MODEL_LOAD_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void runModel(ReadableArray input, Promise promise) {
        try {
            if (tflite == null) {
                promise.reject("MODEL_NOT_LOADED", "Model not loaded. Call loadModel first.");
                return;
            }

            // Convert input array to float array
            float[][][] inputArray = new float[1][50][6];
            for (int i = 0; i < 50; i++) {
                ReadableArray timeStep = input.getArray(i);
                for (int j = 0; j < 6; j++) {
                    inputArray[0][i][j] = (float) timeStep.getDouble(j);
                }
            }

            // Output array
            float[][] output = new float[1][1];

            // Run inference
            tflite.run(inputArray, output);

            // Return result
            WritableArray result = new WritableNativeArray();
            result.pushDouble(output[0][0]);
            promise.resolve(result);

        } catch (Exception e) {
            promise.reject("INFERENCE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void closeModel(Promise promise) {
        try {
            if (tflite != null) {
                tflite.close();
                tflite = null;
            }
            promise.resolve("Model closed");
        } catch (Exception e) {
            promise.reject("CLOSE_ERROR", e.getMessage());
        }
    }

    private MappedByteBuffer loadModelFile() throws IOException {
        AssetManager assetManager = getReactApplicationContext().getAssets();
        AssetFileDescriptor fileDescriptor = assetManager.openFd(MODEL_NAME);
        FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = fileDescriptor.getStartOffset();
        long declaredLength = fileDescriptor.getDeclaredLength();
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
    }
}