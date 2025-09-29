package com.toursafe.modules;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class SimpleTestModule extends ReactContextBaseJavaModule {

    public SimpleTestModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SimpleTestModule";
    }

    @ReactMethod
    public void testConnection(Promise promise) {
        try {
            promise.resolve("Java module is working!");
        } catch (Exception e) {
            promise.reject("TEST_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void addNumbers(int a, int b, Promise promise) {
        try {
            int result = a + b;
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("MATH_ERROR", e.getMessage());
        }
    }
}