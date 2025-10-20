plugins {
  id("com.android.library")
}

android {
  namespace = "com.capacitor_native_geocoder"
  compileSdk = 34

  defaultConfig {
    minSdk = 23
    targetSdk = 34
    consumerProguardFiles("consumer-rules.pro")
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}

dependencies {
  implementation("com.capacitorjs:core:7.0.0")
}
