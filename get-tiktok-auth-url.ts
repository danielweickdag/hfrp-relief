import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const clientId = process.env.TIKTOK_CLIENT_ID;

if (!clientId) {
  console.error('TikTok Client ID not found. Please check your .env.local file.');
  process.exit(1);
}

const redirectUri = "https://familyreliefproject7.org/auth/tiktok/callback";
const state = "RANDOM_STATE_STRING"; // Should be a random, secure string

// Construct the authorization URL manually
const authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${clientId}&scope=user.info.basic&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

console.log("Please visit this URL to authorize your application:");
console.log(authUrl);
