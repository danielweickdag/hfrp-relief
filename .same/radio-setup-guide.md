# 📻 How to Set Up Your Own Live Radio Stream for HFRP Website

## 🎯 **Goal**: Stream your own live radio content on the HFRP website homepage

## **Option 1: Quick Setup with Free Streaming Services (Recommended)**

### **1.1 Radio.co (Free Plan Available)**
- **Cost**: Free plan (limited hours) or $15/month
- **Setup Time**: 15 minutes
- **Website**: https://radio.co

**Steps:**
1. Sign up at radio.co
2. Create your radio station
3. Choose "Auto DJ" or "Live Broadcasting"
4. Upload your music/content or go live
5. Get your stream URL (e.g., `https://streaming.radio.co/s123456/listen`)
6. Add to HFRP website (see Code Integration below)

### **1.2 Mixlr (Simple Live Streaming)**
- **Cost**: Free with limits, $14/month for Pro
- **Setup Time**: 10 minutes
- **Website**: https://mixlr.com

**Steps:**
1. Create Mixlr account
2. Download Mixlr app
3. Start broadcasting live
4. Get your stream URL (e.g., `https://edge.mixlr.com/channel/yourname`)
5. Add to HFRP website

### **1.3 Live365 (Professional)**
- **Cost**: $39/month
- **Setup Time**: 30 minutes
- **Website**: https://live365.com

**Steps:**
1. Sign up for broadcaster account
2. Upload content or set up live streaming
3. Configure your station settings
4. Get broadcast URL
5. Integrate with HFRP website

## **Option 2: Self-Hosted Streaming (Advanced)**

### **2.1 Icecast Server Setup**
- **Cost**: Server costs (~$10-50/month)
- **Setup Time**: 2-4 hours
- **Requirements**: VPS/Dedicated server

**Equipment Needed:**
- Computer with audio software (OBS, BUTT, Mixxx)
- Microphone
- Audio interface (optional but recommended)
- Stable internet connection (upload: 128kbps minimum)

**Software Setup:**
1. **Install Icecast2** on your server
2. **Configure Icecast** (`/etc/icecast2/icecast.xml`)
3. **Set up broadcasting software** (OBS, BUTT, or Mixxx)
4. **Connect to your Icecast server**
5. **Get stream URL** (e.g., `http://yourserver.com:8000/live`)

### **2.2 Recommended VPS Providers:**
- **DigitalOcean**: $5-10/month
- **Linode**: $5-10/month
- **Vultr**: $5-10/month
- **AWS**: Variable pricing

## **Option 3: Mobile Live Streaming (Easiest)**

### **3.1 Anchor.fm by Spotify**
- **Cost**: Free
- **Setup**: 5 minutes
- **Perfect for**: Podcasts and live audio

**Steps:**
1. Download Anchor app
2. Create account
3. Start live episode
4. Get RSS feed URL
5. Convert to audio stream for website

### **3.2 Instagram Live Audio**
- Use Instagram Live
- Stream to Instagram
- Use third-party tools to capture stream URL

## **Code Integration: Adding Your Stream to HFRP Website**

Once you have your stream URL, add it to the radio components:

### **Step 1: Update LiveRadio Component**

```typescript
// Add your station to src/app/_components/LiveRadio.tsx
const radioStations = [
  {
    name: 'HFRP Live Radio', // Your station name
    url: 'YOUR_STREAM_URL_HERE', // Replace with your stream URL
    description: 'Live from HFRP - Haiti Relief Updates'
  },
  // ... existing stations
];
```

### **Step 2: Update FloatingRadio Component**

```typescript
// Update src/app/_components/FloatingRadio.tsx
const radioStation = {
  name: 'HFRP Live Radio',
  url: 'YOUR_STREAM_URL_HERE', // Your stream URL
  description: 'HFRP Live Updates'
};
```

### **Step 3: Make HFRP Station Default**

```typescript
// Set your station as the first/default option
const [currentStation, setCurrentStation] = useState(radioStations[0]); // HFRP station first
```

## **Broadcasting Equipment Recommendations**

### **Basic Setup ($50-100)**
- **USB Microphone**: Audio-Technica ATR2100x-USB ($69)
- **Headphones**: Sony MDR-7506 ($99)
- **Broadcasting Software**: OBS Studio (Free)

### **Professional Setup ($200-500)**
- **Audio Interface**: Focusrite Scarlett Solo ($120)
- **Microphone**: Shure SM58 ($100)
- **Headphones**: Audio-Technica ATH-M40x ($99)
- **Mixer**: Behringer Xenyx Q802USB ($89)

### **Mobile Setup ($20-50)**
- **Lavalier Mic**: Rode SmartLav+ ($79)
- **Phone Stand**: Any smartphone tripod ($15)
- **App**: Anchor, Spreaker, or Mixlr mobile app

## **Content Ideas for HFRP Radio**

### **Daily Programming**
- **Morning**: Haiti news updates (15 minutes)
- **Midday**: HFRP project updates (10 minutes)
- **Evening**: Community stories and testimonials (20 minutes)

### **Weekly Shows**
- **Monday**: "Impact Monday" - Success stories
- **Wednesday**: "Community Voices" - Interviews with beneficiaries
- **Friday**: "Future Friday" - Upcoming projects and goals

### **Special Content**
- Live events from Haiti
- Fundraising campaign updates
- Educational content about Haiti
- Music from Haitian artists

## **Technical Requirements**

### **Internet Connection**
- **Minimum Upload Speed**: 256 kbps (for 128kbps stream)
- **Recommended**: 1 Mbps upload (for 320kbps stream)
- **Stable Connection**: Wired connection preferred over WiFi

### **Audio Quality Settings**
- **Bitrate**: 128kbps (good quality, low bandwidth)
- **Sample Rate**: 44.1kHz
- **Format**: MP3 or AAC
- **Channels**: Stereo

### **Streaming Software Configuration**
```bash
# OBS Studio Settings for Radio
Output Mode: Advanced
Streaming Service: Custom
Server: rtmp://yourserver.com/live
Stream Key: your_stream_key
Audio Bitrate: 128
```

## **Legal Considerations**

### **Music Licensing**
- **ASCAP/BMI License**: Required for copyrighted music
- **Royalty-Free Music**: Use sites like Freesound.org, Jamendo
- **Creative Commons**: Attribution required but free

### **Content Guidelines**
- Keep content family-friendly
- Include regular station identification
- Respect copyright laws
- Consider FCC guidelines if applicable

## **Quick Start Checklist**

### **Day 1: Choose Platform**
- [ ] Sign up for Radio.co, Mixlr, or Live365
- [ ] Test audio quality
- [ ] Get stream URL

### **Day 2: Equipment Setup**
- [ ] Set up microphone
- [ ] Test audio levels
- [ ] Download broadcasting software

### **Day 3: Content Planning**
- [ ] Plan first 1-hour show
- [ ] Prepare intro/outro music
- [ ] Create schedule

### **Day 4: Website Integration**
- [ ] Add stream URL to HFRP radio components
- [ ] Test stream on website
- [ ] Update station name/description

### **Day 5: Go Live!**
- [ ] Start first broadcast
- [ ] Announce on social media
- [ ] Monitor analytics

## **Cost Summary**

### **Budget Option** ($0-30/month)
- Free streaming service (Radio.co free plan)
- USB microphone ($69 one-time)
- Free software (OBS, Audacity)

### **Professional Option** ($50-100/month)
- Paid streaming service ($15-39/month)
- Professional equipment ($200-500 one-time)
- Server costs ($10-50/month)

## **Support Resources**

### **Tutorials**
- OBS Studio: https://obsproject.com/help
- Icecast Setup: https://icecast.org/docs/
- Radio Broadcasting: YouTube "Radio Broadcasting 101"

### **Communities**
- Reddit: r/podcasting, r/radio
- Discord: OBS Community
- Facebook: Radio Broadcasting Groups

---

## 🎯 **Next Steps**

1. **Choose your streaming platform** (Radio.co recommended for beginners)
2. **Set up basic equipment** (USB mic + computer)
3. **Create your first 30-minute show**
4. **Add your stream URL to the HFRP website**
5. **Go live and start connecting with your community!**

The radio feature is already built into your website - you just need to add your stream URL and start broadcasting! 🎉📻
