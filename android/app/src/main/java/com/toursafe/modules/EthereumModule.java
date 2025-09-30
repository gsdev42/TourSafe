package com.toursafe.modules;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

// SIMPLE TEST MODULE - Replace with actual web3j implementation later
public class EthereumModule extends ReactContextBaseJavaModule {
    
    public EthereumModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "EthereumModule";
    }

    @ReactMethod
    public void createTouristID(String name, String passport, String arrivalDate, String departureDate, Promise promise) {
        try {
            // HARDCODED TEST RESPONSE
            String touristID = "ETH_TOURIST_" + System.currentTimeMillis();
            
            WritableMap result = Arguments.createMap();
            result.putString("touristID", touristID);
            result.putString("name", name);
            result.putString("passport", passport);
            result.putString("status", "ACTIVE");
            result.putString("network", "POLYGON");
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ETH_CREATE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void verifyTouristID(String touristID, Promise promise) {
        try {
            // HARDCODED TEST VERIFICATION
            WritableMap result = Arguments.createMap();
            result.putString("touristID", touristID);
            result.putBoolean("isValid", true);
            result.putString("verificationTime", String.valueOf(System.currentTimeMillis()));
            result.putString("network", "POLYGON");
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ETH_VERIFY_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void recordActivity(String touristID, String activityType, String location, Promise promise) {
        try {
            // HARDCODED TEST ACTIVITY
            WritableMap result = Arguments.createMap();
            result.putString("touristID", touristID);
            result.putString("activity", activityType);
            result.putString("location", location);
            result.putString("timestamp", String.valueOf(System.currentTimeMillis()));
            result.putString("txHash", "0x" + System.currentTimeMillis());
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ETH_ACTIVITY_ERROR", e.getMessage());
        }
    }

    // TEST METHOD - Call this first to check if module works
    @ReactMethod
    public void testConnection(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            result.putString("status", "CONNECTED");
            result.putString("network", "POLYGON");
            result.putString("module", "EthereumModule");
            result.putBoolean("isWorking", true);
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ETH_TEST_ERROR", e.getMessage());
        }
    }
}