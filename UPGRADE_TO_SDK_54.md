# Upgrade to Expo SDK 54

## Current Status
- Your app is currently using **Expo SDK 53**
- Target version: **Expo SDK 54**

## Steps to Upgrade

### 1. Stop the Development Server
First, stop any running development servers:
```bash
# Press Ctrl+C in your terminal to stop the server
```

### 2. Update package.json Dependencies
Run the following command to upgrade to SDK 54:

```bash
bun install expo@^54.0.0
bun install expo-blur@~15.0.0
bun install expo-constants@~18.0.0
bun install expo-font@~14.0.0
bun install expo-haptics@~15.0.0
bun install expo-image@~2.5.0
bun install expo-image-picker@~17.0.0
bun install expo-linear-gradient@~15.0.0
bun install expo-linking@~8.0.0
bun install expo-location@~19.0.0
bun install expo-router@~5.0.25
bun install expo-splash-screen@~0.31.0
bun install expo-status-bar@~2.3.0
bun install expo-symbols@~0.5.0
bun install expo-system-ui@~6.0.0
bun install expo-web-browser@^16.0.0
bun install react-native-gesture-handler@~2.25.0
bun install react-native-safe-area-context@5.4.0
bun install react-native-screens@~4.11.0
bun install react-native-svg@16.0.0
```

Or upgrade all at once:
```bash
bunx expo install --fix
```

### 3. Clear Cache
After updating dependencies, clear the cache:

```bash
# Clear Metro bundler cache
rm -rf .expo
rm -rf node_modules/.cache

# For iOS
rm -rf ios/Pods
cd ios && pod install && cd ..

# For Android
cd android && ./gradlew clean && cd ..
```

### 4. Restart the Development Server
```bash
bun start --clear
```

### 5. Update app.json (if needed)
The SDK version should be automatically detected, but you can explicitly set it:

```json
{
  "expo": {
    "sdkVersion": "54.0.0",
    ...
  }
}
```

## What's New in SDK 54
- Improved performance and stability
- React Native 0.79.x support
- Enhanced expo-router capabilities
- Better TypeScript support
- Improved web compatibility

## Breaking Changes
Most breaking changes are handled automatically by `expo install --fix`, but be aware of:

1. **expo-camera**: Some prop names may have changed
2. **expo-location**: Permission handling improvements
3. **expo-router**: Navigation improvements

## Troubleshooting

### If you encounter module resolution errors:
```bash
# Clear all caches
bun run start --clear
```

### If build fails:
```bash
# Reinstall all dependencies
rm -rf node_modules bun.lockb
bun install
```

### If app crashes on startup:
1. Clear app data on device/simulator
2. Uninstall the app completely
3. Rebuild and reinstall

## Rollback (if needed)
If you need to rollback to SDK 53:
```bash
bun install expo@^53.0.4
bunx expo install --fix
```

## Network Error Fix

The network errors you're experiencing are likely due to:

1. **Internet connectivity**: Ensure your device has internet access
2. **Supabase connectivity**: Verify your Supabase instance is online at https://dcsoudthcmkrficgcbio.supabase.co
3. **Firewall/VPN**: Disable VPN or firewall that might block the connection
4. **Android network security**: On Android, clear network security exceptions

### Quick Network Test
Check if Supabase is accessible:
```bash
curl https://dcsoudthcmkrficgcbio.supabase.co
```

If this fails, your Supabase instance might be down or your network blocks it.

## Support
- Check console logs for detailed error messages
- The app now has retry logic (3 attempts with exponential backoff)
- Network error UI will guide users through troubleshooting
