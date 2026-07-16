import { IgApiClient } from "instagram-private-api";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const ig = new IgApiClient();

async function login() {
  ig.state.generateDevice(process.env.INSTAGRAM_USERNAME!);
  await ig.account.login(process.env.INSTAGRAM_USERNAME!, process.env.INSTAGRAM_PASSWORD!);
  console.log("Logged in as", process.env.INSTAGRAM_USERNAME);
}

async function generateReport() {
  await login();

  const userFeed = ig.feed.user(ig.state.cookieUserId);
  const myPosts = await userFeed.items();

  if (myPosts.length === 0) {
    console.log("No posts found.");
    return;
  }

  let totalLikes = 0;
  let totalComments = 0;

  for (const post of myPosts) {
    totalLikes += post.like_count;
    totalComments += post.comment_count;
  }

  const userInfo = await ig.user.info(ig.state.cookieUserId);
  const followerCount = userInfo.follower_count;

  const avgLikes = totalLikes / myPosts.length;
  const avgComments = totalComments / myPosts.length;
  const engagementRate = ((totalLikes + totalComments) / myPosts.length / followerCount) * 100;

  console.log(
    `
    Instagram Engagement Report for ${process.env.INSTAGRAM_USERNAME}
    ==================================================
    Followers: ${followerCount}
    Total Posts: ${myPosts.length}
    --------------------------------------------------
    Average Likes per Post: ${avgLikes.toFixed(2)}
    Average Comments per Post: ${avgComments.toFixed(2)}
    Engagement Rate: ${engagementRate.toFixed(2)}%
    ==================================================
  `
  );
}

generateReport().catch(console.error);
