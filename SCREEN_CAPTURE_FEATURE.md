# Screen Capture Feature for Finders

## Overview
Added comprehensive screenshot and screen recording functionality for property finder users in RoomRent Nepal app.

## Features Implemented

### 1. Screenshot Capture
- **Single tap screenshot** of property details
- Automatically saves to device with watermark
- Records action in finder history
- Saves reference in database for tracking

### 2. Screen Recording
- **Continuous frame capture** (500ms intervals)
- Records up to 30 seconds automatically
- Manual stop option
- Saves first frame as representative image
- Tracks number of frames captured

### 3. User Interface
- **Two buttons** at bottom of property detail screen:
  - Blue "Screenshot" button (📷)
  - Red "Record" button (🎥) - changes to green "Stop Recording" during recording
- **Recording indicator** shows at top when recording is active
- **Success modal** displays after capture with share/download options

### 4. Data Storage
- Screenshots saved to device storage
- Database records in `screenshots` table
- Finder history logs in `finder_history` table
- Watermark includes: Property name, capture type, "RoomRent Nepal"

### 5. Platform Support
- **Mobile (iOS/Android)**: Full functionality with file system access
- **Web**: Screenshots work with download capability
- Auto-detects platform and adjusts behavior

## Technical Details

### Components Created
1. **ScreenCaptureControls.tsx**
   - Main component for capture controls
   - Handles screenshot and recording logic
   - Modal for success feedback
   - Share/download functionality

### Integration
- Added to `app/property/[id].tsx`
- Only visible for finder users (user_type === 'renter')
- Uses ViewRef to capture entire property detail view
- Non-intrusive positioning at bottom of screen

### Database Schema
```sql
-- Screenshots table (already exists)
CREATE TABLE screenshots (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  image_uri TEXT,
  watermark TEXT,
  timestamp TIMESTAMP,
  created_at TIMESTAMP
);

-- Finder history table (already exists)
CREATE TABLE finder_history (
  id UUID PRIMARY KEY,
  finder_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  action TEXT, -- includes 'screenshot' and 'video_recording'
  timestamp TIMESTAMP,
  created_at TIMESTAMP
);
```

## User Experience Flow

### Taking Screenshot:
1. Finder views property details
2. Taps "Screenshot" button
3. System captures entire screen
4. Success modal shows with options:
   - Share/Download
   - Done
5. Screenshot saved to device and database

### Recording Video:
1. Finder taps "Record" button
2. Confirmation dialog appears
3. Recording starts (indicator shows at top)
4. Captures frames every 500ms
5. Auto-stops at 30 seconds or manual stop
6. First frame saved as reference
7. Success modal shows completion details

## Security & Privacy
- Only finders can capture screens
- Watermark on all captures
- Database tracking for accountability
- Local storage with database backup

## Benefits
1. **For Finders:**
   - Save property details for offline viewing
   - Share with family/friends
   - Compare properties easily
   - Record tours or walkthroughs

2. **For App:**
   - Track user engagement
   - Understand property interest
   - Analytics on popular properties
   - User behavior insights

## Future Enhancements
- Video compilation from frames
- Gallery view of captures
- Bulk delete/share options
- Property comparison tool using captures
- Cloud storage integration
- Enhanced watermarks with QR codes
