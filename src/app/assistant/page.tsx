"use client";

import React, { useState } from "react";
// Note: avoid next/navigation hooks here to prevent invalid hook context.
import { blogStorage } from "@/lib/blogStorage";

/**
 * Blog & Grammarly-Style Assistant
 * - Blog generation: creates structured drafts, SEO, CTAs, social snippets.
 * - Grammarly-like mode: cleans comments/docs inside code without touching logic.
 * - Tailwind CSS styling.
 *
 * Usage:
 *  - Requires backend endpoint at /api/generate.
 *  - Backend should call an AI service (e.g., OpenAI) with provided prompt.
 */

export default function BlogAssistantApp() {
  // Explicit result types for API responses
  interface BlogOption {
    title: string;
    seoMeta: string;
    keywords: string[];
    intro: string;
    draft: string;
    ctas: string[];
    social: {
      x: string;
      linkedin: string;
      instagram: string;
    };
  }

  interface BlogResponse {
    options: BlogOption[];
    inputEcho: string;
    demo?: boolean;
  }

  interface CodeChange {
    before: string;
    after: string;
    note?: string;
  }

  interface CodeResponse {
    summary: string;
    changes: CodeChange[];
    inputEcho: string;
    demo?: boolean;
  }

  type GenerateResult = BlogResponse | CodeResponse;

  // Feature toggles
  type BlogFeatures = {
    seo: boolean;
    keywords: boolean;
    ctas: boolean;
    social: boolean;
    extendedDraft: boolean;
  };

  type CodeFeatures = {
    grammar: boolean;
    clarity: boolean;
    tone: boolean;
    capitalization: boolean;
    preserveLogic: boolean;
  };

  type FeatureSettings = BlogFeatures | CodeFeatures;

  const defaultBlogFeatures: BlogFeatures = {
    seo: true,
    keywords: true,
    ctas: true,
    social: true,
    extendedDraft: true,
  };

  const defaultCodeFeatures: CodeFeatures = {
    grammar: true,
    clarity: true,
    tone: true,
    capitalization: true,
    preserveLogic: true,
  };

  const [mode, setMode] = useState<"blog" | "code">("blog");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<FeatureSettings>(defaultBlogFeatures);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Switch feature defaults when mode changes
  React.useEffect(() => {
    setFeatures(mode === "blog" ? defaultBlogFeatures : defaultCodeFeatures);
  }, [mode]);

  // Initialize mode from query string in browser (inside component)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("mode");
      if (m === "blog" || m === "code") {
        setMode(m);
      }
    }
  }, []);

  function buildPrompt() {
    if (mode === "blog") {
      const f = features as BlogFeatures;
      const sections: string[] = [];
      sections.push("titles");
      if (f.seo) sections.push("SEO meta");
      if (f.keywords) sections.push("5-10 keywords");
      sections.push("intro");
      sections.push(f.extendedDraft ? "full draft (700-900 words)" : "concise draft (400-600 words)");
      if (f.ctas) sections.push("CTAs");
      if (f.social) sections.push("3 social media snippets (X, LinkedIn, IG)");

      return `You are a professional blog assistant. Expand the following idea into 3 structured blog post options with: ${sections.join(", ")}. Idea: ${input}`;
    } else {
      const f = features as CodeFeatures;
      const focus: string[] = [];
      if (f.grammar) focus.push("grammar");
      if (f.clarity) focus.push("clarity");
      if (f.tone) focus.push("tone");
      if (f.capitalization) focus.push("capitalization");
      const preserve = f.preserveLogic ? "Do NOT modify code logic." : "Focus on comments and docs; minimal code changes allowed if needed.";
      return `You are a Grammarly-like assistant for developers. Improve ${focus.join(", ")} and readability of comments, documentation, and inline text in the following code or markdown. ${preserve} Input: ${input}`;
    }
  }

  async function handleGenerate() {
    setError(null);
    if (!input.trim()) {
      setError("Please provide input to generate from.");
      return;
    }

    setLoading(true);
    setResult(null);
    const prompt = buildPrompt();

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode, features }),
      });

      if (!resp.ok) throw new Error(await resp.text());
      const data: GenerateResult = await resp.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    setSaveMessage(null);
    if (!result || !("options" in result)) {
      setSaveMessage("No blog result to save.");
      return;
    }
    const first = result.options[0];
    if (!first) {
      setSaveMessage("No blog options found.");
      return;
    }
    setSaveLoading(true);
    try {
      const excerpt = first.intro?.slice(0, 160) || first.draft.slice(0, 160);
      const data = {
        title: first.title,
        excerpt,
        content: first.draft,
        status: "draft" as const,
        categories: [],
        tags: [],
        seo: {
          title: first.title,
          description: first.seoMeta,
          keywords: first.keywords,
        },
        isFeatured: false,
      };
      const author = { id: "assistant", name: "Assistant", email: "assistant@local" };
      await blogStorage.createPost(data, author);
      setSaveMessage("Draft saved. View it in Admin → Blog Posts.");
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Failed to save draft.");
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">Blog & Grammarly Assistant</h1>
          <p className="mt-2 text-slate-600">Generate feature-rich blog posts or clean developer documentation/comments.</p>
        </header>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setMode("blog")}
            className={`px-4 py-2 rounded-md ${mode === "blog" ? "bg-sky-600 text-white" : "border"}`}
          >
            Blog Mode
          </button>
          <button
            onClick={() => setMode("code")}
            className={`px-4 py-2 rounded-md ${mode === "code" ? "bg-sky-600 text-white" : "border"}`}
          >
            Grammarly Mode
          </button>
        </div>

        {/* Enable Features Panel */}
        <div className="mb-4 p-4 border rounded-md bg-white">
          <div className="font-semibold mb-2">Enable Features</div>
          {mode === "blog" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as BlogFeatures).seo} onChange={(e) => setFeatures({ ...(features as BlogFeatures), seo: e.target.checked })} />
                SEO meta
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as BlogFeatures).keywords} onChange={(e) => setFeatures({ ...(features as BlogFeatures), keywords: e.target.checked })} />
                Keywords
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as BlogFeatures).ctas} onChange={(e) => setFeatures({ ...(features as BlogFeatures), ctas: e.target.checked })} />
                CTAs
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as BlogFeatures).social} onChange={(e) => setFeatures({ ...(features as BlogFeatures), social: e.target.checked })} />
                Social snippets
              </label>
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input type="checkbox" checked={(features as BlogFeatures).extendedDraft} onChange={(e) => setFeatures({ ...(features as BlogFeatures), extendedDraft: e.target.checked })} />
                Extended draft length
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as CodeFeatures).grammar} onChange={(e) => setFeatures({ ...(features as CodeFeatures), grammar: e.target.checked })} />
                Grammar
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as CodeFeatures).clarity} onChange={(e) => setFeatures({ ...(features as CodeFeatures), clarity: e.target.checked })} />
                Clarity
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as CodeFeatures).tone} onChange={(e) => setFeatures({ ...(features as CodeFeatures), tone: e.target.checked })} />
                Tone
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(features as CodeFeatures).capitalization} onChange={(e) => setFeatures({ ...(features as CodeFeatures), capitalization: e.target.checked })} />
                Capitalization
              </label>
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input type="checkbox" checked={(features as CodeFeatures).preserveLogic} onChange={(e) => setFeatures({ ...(features as CodeFeatures), preserveLogic: e.target.checked })} />
                Preserve code logic
              </label>
            </div>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "blog" ? "Enter blog idea, keywords, or draft..." : "Paste code snippet or documentation..."}
          className="w-full min-h-[160px] p-3 border rounded-md mb-4"
        />

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading && <div className="bg-white p-6 rounded shadow">Processing request...</div>}

        {result && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Results</h2>
            <pre className="whitespace-pre-wrap text-sm text-slate-800">{JSON.stringify(result, null, 2)}</pre>
            {mode === "blog" && (
              <div className="mt-4 flex items-center gap-3">
                <button onClick={handleSaveDraft} disabled={saveLoading} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  {saveLoading ? "Saving..." : "Save as Draft"}
                </button>
                <a href="/admin/blog/posts" className="text-blue-600 hover:underline">Go to Blog Posts</a>
              </div>
            )}
            {saveMessage && <p className="mt-2 text-sm text-slate-700">{saveMessage}</p>}
          </div>
        )}

        <footer className="mt-10 text-center text-sm text-slate-500">Connect <code>/api/generate</code> to your AI backend for functionality.</footer>
      </div>
    </div>
  );
}