export default {
  "expo": {
    "name": "flood-relief",
    "slug": "flood-relief",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/Loadingicon.png",
    "scheme": "floodrelief",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/boat3.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"
    },
    "android": {
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
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT"
      ],
      "package": "com.affan176.floodrelief"
    },
    "plugins": [
      "expo-router",
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
    ]
  }
};
