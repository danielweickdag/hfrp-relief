# Browser Errors Captured

Captured on: 2025-10-05T00:00:00Z

These errors were observed during local development and preview.

## Video Background
- net::ERR_FAILED https://video.zig.ht/v/arx7xtmfj2ch5vy8dda2f

## Zeno.fm Stream
- net::ERR_ABORTED https://stream-164.zeno.fm/ttq4haexcf9uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJ0dHE0aGFleGNmOXV2IiwiaG9zdCI6InN0cmVhbS0xNjQuemVuby5mbSIsInJ0bGwiOjUsImp0aSI6ImE4enAxR2NWUWZ5SHdYb0hXR0JZZnciLCJpYXQiOjE3NTk2MjkwNDUsImV4cCI6MTc1OTYyOTEwNX0.FPhvTZHNDnSGAeeB3hJxWRt08dAxFSveMDx3GCKG4mY

## Local Video Fallbacks
- net::ERR_ABORTED http://localhost:3002/homepage-video.mp4
- net::ERR_ABORTED http://localhost:3002/homepage-video.mp4
- net::ERR_ABORTED http://localhost:3002/haitian-family-project.mp4
- net::ERR_ABORTED http://localhost:3002/haitian-family-project.mp4
- net::ERR_ABORTED http://localhost:3002/haitian-family-project.mp4

Notes:
- The Zig viewer URL is auto-resolved to direct MP4 via `/api/video-resolve`. If HEAD fails, resolver still runs.
- Zeno iframe streams can show `ERR_ABORTED` due to token refresh/reinitialization. Native player avoids iframe-originated aborts.