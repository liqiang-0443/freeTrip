const androidAmapKey = process.env.EXPO_PUBLIC_AMAP_ANDROID_KEY;
const iosAmapKey = process.env.EXPO_PUBLIC_AMAP_IOS_KEY;

module.exports = {
  expo: {
    name: "FreeTrip",
    slug: "freetrip",
    version: "0.1.0",
    orientation: "portrait",
    scheme: "freetrip",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.liqiang.freetrip",
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "FreeTrip uses your photos so you can attach memories to visited routes.",
        NSCameraUsageDescription: "FreeTrip can use the camera when you add a trip photo.",
        NSLocationWhenInUseUsageDescription:
          "FreeTrip uses your location to show your position on the footprint map."
      }
    },
    android: {
      package: "com.liqiang.freetrip",
      permissions: ["READ_MEDIA_IMAGES", "ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    },
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          photosPermission:
            "FreeTrip uses your photos so you can attach memories to visited routes.",
          cameraPermission: "FreeTrip can use the camera when you add a trip photo."
        }
      ],
      [
        "expo-gaode-map",
        {
          androidKey: androidAmapKey,
          iosKey: iosAmapKey
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
};
