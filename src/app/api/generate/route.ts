import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse and validate request body without using any
    const raw = (await req.json()) as unknown;
    if (typeof raw !== "object" || raw === null) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const obj = raw as { prompt?: unknown; mode?: unknown; features?: unknown };
    if (
      typeof obj.prompt !== "string" ||
      (obj.mode !== "blog" && obj.mode !== "code")
    ) {
      return NextResponse.json(
        { error: "Missing or invalid prompt/mode" },
        { status: 400 },
      );
    }
    const prompt: string = obj.prompt;
    const mode: "blog" | "code" = obj.mode;

    // Optional features validation (shallow, mode-aware)
    const features = obj.features as unknown;
    let appliedFeatures: Record<string, boolean> | undefined;
    if (features && typeof features === "object" && features !== null) {
      const f = features as Record<string, unknown>;
      appliedFeatures = Object.fromEntries(
        Object.entries(f)
          .filter(([_, v]) => typeof v === "boolean")
          .map(([k, v]) => [k, v as boolean]),
      );
    }

    if (!prompt || !mode) {
      return NextResponse.json(
        { error: "Missing prompt or mode" },
        { status: 400 },
      );
    }

    // Demo response. Replace with real AI provider integration as needed.
    if (mode === "blog") {
      const demo = {
        options: [
          {
            title: "Building Hope: How Community Support Transforms Lives",
            seoMeta: "Community support, charity impact, family relief",
            keywords: [
              "charity",
              "donations",
              "community",
              "relief",
              "families",
            ],
            intro: "In times of crisis, communities come together to uplift...",
            draft: "Full 700-word draft based on idea...",
            ctas: ["Donate today", "Share this story", "Volunteer"],
            social: {
              x: "Stories of hope from our relief efforts — join us.",
              linkedin: "Driving measurable impact through community support.",
              instagram: "Faces of hope: real families, real impact. 💙",
            },
          },
          {
            title: "From Donations to Impact: The Journey of Every Dollar",
            seoMeta: "Donation transparency and measurable impact",
            keywords: ["transparency", "impact", "donation", "charity"],
            intro: "Every dollar fuels a chain of positive change...",
            draft: "Full 650-word draft based on idea...",
            ctas: ["See our impact", "Join monthly giving", "Spread the word"],
            social: {
              x: "Your support → direct impact. See how.",
              linkedin: "Operational transparency builds donor trust.",
              instagram: "Every donation tells a story. 📘",
            },
          },
          {
            title: "Why Monthly Giving Sustains Long-Term Relief",
            seoMeta: "Recurring donations and sustainable programs",
            keywords: ["monthly", "recurring", "sustainability", "programs"],
            intro: "Long-term relief needs predictable funding...",
            draft: "Full 600-word draft based on idea...",
            ctas: ["Become a monthly donor", "Learn more", "Partner with us"],
            social: {
              x: "Monthly giving makes relief sustainable.",
              linkedin: "Sustainable programs powered by recurring donors.",
              instagram: "Consistency saves lives. 🌱",
            },
          },
        ],
        inputEcho: prompt,
        demo: true,
      };
      return NextResponse.json({ ...demo, appliedFeatures });
    }

    // mode === "code" demo response
    const cleaned = {
      summary:
        "Improved clarity and grammar of documentation/comments without changing code logic.",
      changes: [
        {
          before: "// teh functon calc totals",
          after: "// Calculates totals",
          note: "Fixed typos and clarified intent",
        },
        {
          before: "/* doc: this module handle donation */",
          after: "/* Documentation: This module handles donations */",
          note: "Improved grammar and capitalization",
        },
      ],
      inputEcho: prompt,
      demo: true,
    };
    return NextResponse.json({ ...cleaned, appliedFeatures });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
