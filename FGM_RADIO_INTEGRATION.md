# FGM Radio Haiti Integration Guide

## 🎯 Quick Setup

Your iframe embed code has been converted into reusable React components:

### 1. Available Components

- **ZenoEmbedPlayer**: Pure iframe embed player
- **CombinedRadioPlayer**: Dual-option player (native + embed)
- **RadioPlayer**: Original HLS streaming player

### 2. Integration Options

#### Option A: Replace Current Radio Page (Recommended)

```bash
# Update your radio page to use CombinedRadioPlayer
# See radio-page-example.tsx for complete implementation
```

#### Option B: Add as Additional Player

```tsx
import ZenoEmbedPlayer from "@/app/_components/ZenoEmbedPlayer";

<ZenoEmbedPlayer stationSlug="fgm-radio-haiti" width="100%" height="400" />;
```

### 3. Station Configuration

Your iframe code for "FGM Radio Haiti":

```html
<iframe
  src="https://zeno.fm/player/fgm-radio-haiti"
  width="100%"
  height="400"
  frameborder="0"
  scrolling="no"
></iframe>
```

Has been converted to:

```tsx
<ZenoEmbedPlayer stationSlug="fgm-radio-haiti" />
```

### 4. Features Available

**Native Player (HLS Stream):**

- ✅ Lower bandwidth usage
- ✅ Direct audio stream
- ✅ Mobile-friendly
- ✅ Custom controls

**Embedded Player (Zeno.FM):**

- ✅ Full Zeno.FM interface
- ✅ Song metadata display
- ✅ Chat features (if enabled)
- ✅ Social sharing
- ✅ Volume controls
- ✅ Play history

### 5. Next Steps

1. **Test the Components**: Both components are ready to use
2. **Choose Integration**: Decide between combined or separate implementation
3. **Update Radio Page**: Replace current player with new combined option
4. **Test Mobile**: Verify both players work on mobile devices

### 6. Configuration Options

```tsx
// CombinedRadioPlayer Props
interface CombinedRadioPlayerProps {
  stationSlug: string; // "fgm-radio-haiti"
  streamUrl: string; // HLS stream URL
  stationName: string; // Display name
  defaultPlayer?: "native" | "embed"; // Default tab
  className?: string; // Custom styling
  embedHeight?: string; // Embed player height
}
```

## 🚀 Ready to Deploy

All components are created and ready for integration. The combined player gives users the best of both worlds!
