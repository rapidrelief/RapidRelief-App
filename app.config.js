export default {
  "expo": {
    "name": "RapidRelief",
    "slug": "rapidrelief",
    "version": "1.0.2",
    "orientation": "portrait",
    "icon": "./assets/images/Loadingicon.png",
    "scheme": "floodrelief",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "updates": {
      "url": "https://u.expo.dev/7022772c-67cf-41aa-b702-5daf1abaf04d",
      "requestHeaders": {
        "expo-channel-name": "preview"
      }
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "splash": {
      "image": "./assets/images/boat3.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"
    },
    "android": {
      "versionCode": 3,
      "config": {
        "googleMaps": {
          "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      "edgeToEdgeEnabled": true,
      "statusBar": {
        "backgroundColor": "#2563EB",
        "barStyle": "light-content"
      },
      "navigationBar": {
        "backgroundColor": "#2563EB",
        "barStyle": "light-content"
      },
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      "package": "com.affan176.floodrelief"
    },
    "plugins": [
      "expo-router",
      [
        "expo-build-properties",
        {
          "android": {
            "ndkVersion": "26.1.10909125"
          }
        }
      ],
      [
        "@config-plugins/react-native-ble-plx",
        {
          "isBackgroundEnabled": false,
          "modes": [
            "peripheral",
            "central"
          ],
          "bluetoothAlwaysPermission": "Allow this app to connect to emergency SOS nodes."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "7022772c-67cf-41aa-b702-5daf1abaf04d"
      }
    }
  }
};
