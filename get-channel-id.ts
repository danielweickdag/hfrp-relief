import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

async function getChannelId() {
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

    const response = await youtube.channels.list({
      part: ["id"],
      mine: true,
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("Could not find YouTube channel for the authenticated user.");
    }

    const channelId = response.data.items[0].id;
    console.log("YouTube Channel ID:", channelId);

  } catch (error) {
    console.error("Error fetching YouTube channel ID:", error);
  }
}

getChannelId();
