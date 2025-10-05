import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const viewer = req.nextUrl.searchParams.get("viewer") || "";
    if (!viewer) {
      return new Response(JSON.stringify({ error: "Missing 'viewer' param" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Basic SSRF guard: only allow video.zig.ht viewer URLs
    const url = new URL(viewer);
    if (url.hostname !== "video.zig.ht") {
      return new Response(JSON.stringify({ error: "Unsupported host" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Fetch the viewer page HTML
    const htmlRes = await fetch(viewer, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    const html = await htmlRes.text();

    // Try to find a direct MP4 link in the HTML (anchor or source)
    const mp4Regex = /(https?:\/\/[^\s"'<>]+\.mp4)/gi;
    const match = mp4Regex.exec(html);
    const mp4Url = match?.[1] || null;

    if (!mp4Url) {
      return new Response(JSON.stringify({ error: "No MP4 link found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    // Validate the MP4 URL returns a video content-type
    try {
      const head = await fetch(mp4Url, { method: "HEAD" });
      const ct = head.headers.get("content-type") || "";
      if (!head.ok || !ct.startsWith("video/")) {
        return new Response(
          JSON.stringify({ error: "Resolved link is not a video", mp4Url, contentType: ct }),
          { status: 415, headers: { "content-type": "application/json" } }
        );
      }
    } catch {
      // If HEAD fails, still return the URL — client will test playability
    }

    return new Response(JSON.stringify({ mp4Url }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Resolver error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}