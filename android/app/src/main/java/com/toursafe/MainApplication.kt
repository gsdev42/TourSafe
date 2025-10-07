package com.toursafe

import com.facebook.react.soloader.OpenSourceMergedSoMapping
import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.toursafe.modules.TourSafePackage
import com.toursafe.TflitePackage  // ← Add this line
import com.rntensorflowlite.RNTensorflowLitePackage 

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

    override fun getPackages(): List<ReactPackage> {
      val packages = PackageList(this).packages.toMutableList()
      packages.add(TourSafePackage())
      packages.add(TflitePackage())  // ← Add this line
      return packages
    }

    override fun getJSMainModuleName(): String = "index"

    override val isNewArchEnabled: Boolean = false
    override val isHermesEnabled: Boolean = true
  }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
    }
  }
}