import tiktok from "tiktok-app-api";

async function testTikTokApi() {
  try {
    const app = await tiktok();
    const user = await app.getUserByName("Familyreliefproject7");
    const userInfo = await app.getUserInfo(user);
    console.log("User Info:", userInfo);
  } catch (error) {
    console.error("Error fetching TikTok user info:", error);
  }
}

testTikTokApi();
