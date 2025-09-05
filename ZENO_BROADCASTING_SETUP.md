# 📻 HFRP Radio - Zeno.FM Broadcasting Setup Guide

## 🎯 Overview

This guide will help you connect your radio station to broadcast live to Zeno.FM, which feeds your website's radio player.

## 📋 Prerequisites

- Zeno.FM broadcaster account
- Broadcasting software (OBS, BUTT, Mixxx, etc.)
- Audio content to stream
- Stable internet connection

## 🔧 Step 1: Zeno.FM Account Setup

### Create Broadcasting Account:

1. Go to [zeno.fm](https://zeno.fm)
2. Click "Start Broadcasting"
3. Create account with email/password
4. Verify your email address
5. Complete broadcaster profile

### Get Your Stream Credentials:

After account setup, you'll receive:

- **Server Address**: `stream.zeno.fm`
- **Port**: `80`
- **Stream Key**: [Your unique streaming key from Zeno.FM]
- **Mount Point**: `ttq4haexcf9uv/source`

**Your Current Credentials:**

- **Server**: `stream.zeno.fm`
- **Port**: `80`
- **Stream Key**: [Enter your stream key here]
- **Mount Point**: `ttq4haexcf9uv/source`

## 🎵 Step 2: Broadcasting Software Options

### Option A: OBS Studio (Recommended)

```
Download: https://obsproject.com/
Settings:
- Service: Custom
- Server: rtmp://stream.zeno.fm/live
- Stream Key: [Your Zeno Stream Key]
```

### Option B: BUTT (Broadcast Using This Tool)

```
Download: https://danielnoethen.de/butt/
YOUR SETTINGS:
- Server: stream.zeno.fm
- Port: 80
- Password: [Your Stream Key]
- Mount Point: ttq4haexcf9uv/source
- Format: MP3
- Bitrate: 128 kbps
```

### Option C: Mixxx DJ Software

```
Download: https://mixxx.org/
YOUR SETTINGS:
- Type: Icecast 2
- Host: stream.zeno.fm
- Port: 80
- Login: source
- Password: [Your Stream Key]
- Mount: ttq4haexcf9uv/source
- Format: MP3
- Bitrate: 128 kbps
```

## ⚙️ Step 3: Audio Configuration

### Recommended Settings:

```
Format: MP3
Bitrate: 128 kbps (good quality/bandwidth balance)
Sample Rate: 44100 Hz
Channels: Stereo (2)
```

### Quality Options:

- **Low bandwidth**: 64 kbps MP3
- **Standard**: 128 kbps MP3
- **High quality**: 192 kbps MP3
- **Premium**: 320 kbps MP3

## 🔗 Step 4: Connect to Your Website

Your website is already configured with:

```typescript
streamUrl = "https://stream.zeno.fm/hls/wvdsqqn1cf9uv"; // HLS format for better compatibility
externalPlayerUrl =
  "https://listen.zeno.fm/player/family-relief-project-radio-station";
```

## 🎵 Step 4.1: Player Options

Your website now includes multiple player options:

### Option A: Native HTML5 Player (Default)

- Direct HLS stream playback
- Lower bandwidth usage
- Integrated with your website design
- Custom controls and branding

### Option B: Embedded Zeno.FM Player

- Full Zeno.FM interface
- Chat functionality (if enabled)
- Song metadata display
- Zeno.FM branding

### Option C: Combined Player (Recommended)

- Gives users choice between both players
- Tabs to switch between native and embedded
- Best of both worlds

```jsx
// Use the combined player component
<CombinedRadioPlayer
  stationSlug="fgm-radio-haiti"
  streamUrl="https://stream.zeno.fm/hls/wvdsqqn1cf9uv"
  stationName="HFRP Radio"
/>
```

## 🤖 Step 4.1: Automated Setup

Run the automated setup script to verify everything is working:

```bash
./radio-setup-automation.sh
```

This script will:

- ✅ Check if your development server is running
- ✅ Test HLS stream connectivity
- ✅ Verify radio player component
- ✅ Display current configuration
- ✅ Show next steps

## 🧪 Step 5: Testing Your Stream

### Test Broadcast:

1. Start your broadcasting software
2. Begin streaming to Zeno.FM
3. Visit your website radio player
4. Click play to test the stream
5. Check external Zeno.FM link

### Troubleshooting:

- **Connection failed**: Check stream key and server settings
- **Audio issues**: Verify bitrate and format settings
- **Website not playing**: Check browser console for errors

## 📊 Step 6: Monitoring & Analytics

### Zeno.FM Dashboard:

- Listener statistics
- Stream status
- Bandwidth usage
- Geographic data

### Website Analytics:

- Radio player usage
- Error tracking
- User engagement

## 🚀 Step 7: Going Live

### Pre-Launch Checklist:

- [ ] Zeno.FM account verified
- [ ] Broadcasting software configured
- [ ] Test stream successful
- [ ] Website player working
- [ ] Audio levels optimized
- [ ] Content ready to broadcast

### Launch Process:

1. Start broadcasting software
2. Begin live stream
3. Monitor Zeno.FM dashboard
4. Test website radio player
5. Announce to audience

## 🔧 Technical Support

### Zeno.FM Support:

- Documentation: [zeno.fm/support](https://zeno.fm/support)
- Contact: support@zeno.fm

### Common Stream URLs:

- **HLS Stream**: `https://stream.zeno.fm/hls/wvdsqqn1cf9uv` (Recommended - better compatibility)
- **Direct Stream**: `https://stream.zeno.fm/wvdsqqn1cf9uv`
- **Playlist**: `https://stream.zeno.fm/wvdsqqn1cf9uv.pls`
- **Player Page**: `https://listen.zeno.fm/player/family-relief-project-radio-station`

### Embedded Player Options:

- **Iframe Embed**: `https://zeno.fm/player/fgm-radio-haiti`
- **Widget Size**: 575x250px (customizable)
- **Features**: Full Zeno.FM interface with chat and metadata

## 📱 Additional Features

### Auto DJ:

- Upload music to Zeno.FM
- Set up automatic playlists
- Schedule live shows

### Mobile Broadcasting:

- Zeno.FM mobile app
- Live streaming from phone
- Remote broadcasting

---

## 🎯 Quick Start Summary

1. **Sign up** at zeno.fm as broadcaster
2. **Get credentials** (server, port, stream key)
3. **Configure software** (OBS/BUTT/Mixxx)
4. **Set audio format** (128kbps MP3 recommended)
5. **Start streaming** to Zeno.FM
6. **Test website** radio player
7. **Go live** and announce!

Your HFRP Radio website is ready to receive the stream once you start broadcasting to Zeno.FM! 🎵📻
