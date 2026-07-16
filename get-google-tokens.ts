import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://familyreliefproject7.org/auth/google/callback"
);

const code = "4/0AXEQxIBy-Za07wmu-zOx92c_AZe_4CjujpSmcCSXAKozdTB6bc68e8ca0tDyJKK45ssItg";

async function getTokens() {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Successfully retrieved access and refresh tokens:", tokens);

    // Append tokens to the .env.local file
    const envPath = path.resolve(__dirname, ".env.local");
    const envFileContent = fs.readFileSync(envPath, "utf-8");
    const newEnvFileContent = `${envFileContent}
GOOGLE_ACCESS_TOKEN=${tokens.access_token}
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
`;
    fs.writeFileSync(envPath, newEnvFileContent);
    console.log("Tokens have been securely stored in .env.local");

  } catch (error) {
    console.error("Error retrieving access token:", error);
  }
}

getTokens();
