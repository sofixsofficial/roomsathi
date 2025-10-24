# Network Connection Troubleshooting Guide

## The Problem
Your Android device cannot connect to Supabase, resulting in "Network request failed" errors when trying to load properties and users.

## What We've Fixed

### 1. **Improved Error Handling**
- Added better retry logic with exponential backoff (2s, 4s, 6s)
- More detailed error logging to help diagnose issues
- Better error messages for users

### 2. **Timeout Configuration**
- Added 15-second timeout for all Supabase requests
- Prevents requests from hanging indefinitely

### 3. **Network Status Detection**
- Created `hooks/use-network-status.ts` for monitoring connectivity

## Common Causes & Solutions

### Solution 1: Check Your Internet Connection
**The most common issue:**
- Make sure your Android device has an active internet connection
- Try opening a web browser on your device to verify connectivity
- Switch between WiFi and mobile data to see if one works better

### Solution 2: Same Network Requirement
**For development with Expo:**
- Your computer running the Expo dev server MUST be on the same network as your Android device
- Both devices should be on the same WiFi network
- Some corporate/school networks block device-to-device communication

**To verify:**
1. Check your computer's IP address
2. Check your phone's IP address
3. They should have similar IP patterns (e.g., 192.168.1.x)

### Solution 3: Firewall & Security Software
- Temporarily disable firewall/antivirus on your computer
- Check if your router has any device isolation features enabled
- Some routers have "AP Isolation" or "Client Isolation" that blocks devices from talking to each other

### Solution 4: Use Expo Tunnel
If same-network doesn't work, use Expo's tunnel:

```bash
# Stop your current dev server (Ctrl+C)
# Then start with tunnel flag
bun run start --tunnel
```

This creates a public URL that works regardless of network configuration.

### Solution 5: Verify Supabase URL
Check that your Supabase project is accessible:

1. Open a browser on your Android device
2. Navigate to: `https://dcsoudthcmkrficgcbio.supabase.co`
3. You should see a Supabase page (not an error)

If you can't access it:
- Your network might be blocking Supabase
- Try using mobile data instead of WiFi
- Check if you're behind a corporate proxy/VPN

### Solution 6: Clear App Data
Sometimes cached data causes issues:

1. On your Android device, go to Settings > Apps
2. Find "Expo Go"
3. Tap "Storage"
4. Tap "Clear Data" and "Clear Cache"
5. Restart the app

### Solution 7: Android Network Security
For SDK 53+, you may need to configure network security:

1. The app.json needs these Android permissions (already added):
   - INTERNET
   - ACCESS_NETWORK_STATE
   - ACCESS_WIFI_STATE

2. For development, cleartext traffic should be allowed (already configured in app.json)

### Solution 8: Check Expo Go Version
Make sure you're using Expo Go v53 or compatible:

1. Open Play Store on your Android device
2. Search for "Expo Go"
3. Update if available

### Solution 9: Restart Everything
Sometimes a fresh start helps:

1. Close Expo Go on your Android device
2. Stop the dev server on your computer (Ctrl+C)
3. Restart your computer's WiFi
4. Restart your Android device's WiFi
5. Start the dev server again: `bun run start`
6. Scan the QR code again in Expo Go

## Testing Network Connectivity

### Test 1: Can you reach Supabase from your device?
Open this URL in your Android browser:
```
https://dcsoudthcmkrficgcbio.supabase.co/rest/v1/properties?select=*&limit=1
```

You should see JSON data or an auth error (not a network error).

### Test 2: Can you reach Google?
Open this in your Android browser:
```
https://www.google.com
```

If this doesn't work, your device has no internet.

### Test 3: Are you on the same network?
On your computer, run:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Check the IP address. Then check your Android's IP in Settings > WiFi > Your Network.
They should have similar patterns.

## Debug Logs to Check

Look for these in your console:

### Good Signs:
```
✅ Initializing Supabase client...
✅ Supabase URL: https://dcsoudthcmkrficgcbio.supabase.co
✅ Platform: android
✅ Loading properties...
✅ Successfully loaded X properties
```

### Bad Signs:
```
❌ ERROR Failed to load properties: Network request failed
❌ Retrying... Attempt 1
❌ Retrying... Attempt 2
❌ Retrying... Attempt 3
❌ Cannot connect to server
```

## Still Having Issues?

### Last Resort Options:

1. **Use Web Version Instead**
   - The app works on web browser
   - Run: `bun run start-web`
   - Open in your browser

2. **Test on iOS Device**
   - If you have access to an iPhone/iPad
   - Download Expo Go from App Store
   - Try scanning the QR code

3. **Use Android Emulator**
   - Install Android Studio
   - Set up an Android Virtual Device (AVD)
   - The emulator has better network compatibility

## Environment Variables

Make sure your `.env` file has:
```env
EXPO_PUBLIC_SUPABASE_URL=https://dcsoudthcmkrficgcbio.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Next Steps

1. Try Solution 1 (check internet) - 2 minutes
2. Try Solution 4 (use tunnel) - 5 minutes  
3. Try Solution 9 (restart everything) - 5 minutes
4. Try Solution 5 (verify Supabase URL on device) - 2 minutes

If none of these work, the issue is likely with your network configuration blocking device-to-device communication or blocking Supabase's domain.

## Contact Information

If you need more help:
1. Check Expo forums: https://forums.expo.dev
2. Check Supabase status: https://status.supabase.com
3. Try the app on web version while troubleshooting mobile
