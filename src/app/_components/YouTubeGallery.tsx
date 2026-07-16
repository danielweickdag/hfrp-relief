import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

async function getYouTubeVideos() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // First, get the channel ID for "familygospelministry"
    const searchResponse = await youtube.search.list({
      part: ["snippet"],
      q: "Family Gospel ministry",
      type: ["channel"],
      maxResults: 1,
    });

    const channelId = searchResponse.data.items![0].id!.channelId!;

    // Then, get the playlist of uploaded videos for that channel
    const channelInfo = await youtube.channels.list({
      part: ["contentDetails"],
      id: [channelId!],
    });

    const uploadsPlaylistId = channelInfo.data.items![0].contentDetails?.relatedPlaylists?.uploads;

    // Finally, get the videos from the uploads playlist
    const playlistResponse = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: uploadsPlaylistId,
      maxResults: 12, // Fetch the 12 most recent videos
    });

    return playlistResponse.data.items;

  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
}

export default async function YouTubeGallery() {
  const videos = await getYouTubeVideos();

  if (!videos || videos.length === 0) {
    return <p>Could not load videos at this time. Please try again later.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <a
          key={video.snippet!.resourceId!.videoId!}
          href={`https://www.youtube.com/watch?v=${video.snippet!.resourceId!.videoId!}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
        >
          <img
            src={video.snippet!.thumbnails!.high!.url!}
            alt={video.snippet!.title!}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold truncate">{video.snippet!.title}</h3>
          </div>
        </a>
      ))}
    </div>
  );
}
