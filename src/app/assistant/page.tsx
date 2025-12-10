"use client";

import React, { useState, useRef } from "react";
// Note: avoid next/navigation hooks here to prevent invalid hook context.
import { blogStorage } from "@/lib/blogStorage";
import BackNavigation from "@/app/_components/BackNavigation";

/**
 * Blog & Grammarly-Style Assistant
 * - Blog generation: creates structured drafts, SEO, CTAs, social snippets.
 * - Grammarly-like mode: cleans comments/docs inside code without touching logic.
 * - Rich media support: image uploads, share links, and attachment management.
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

  // New interfaces for attachments
  interface ImageAttachment {
    id: string;
    file: File;
    preview: string;
    alt?: string;
  }

  interface LinkAttachment {
    id: string;
    url: string;
    title?: string;
    description?: string;
  }

  interface BlogFeatures {
    seo: boolean;
    keywords: boolean;
    ctas: boolean;
    social: boolean;
    extendedDraft: boolean;
  }

  interface CodeFeatures {
    grammar: boolean;
    clarity: boolean;
    tone: boolean;
    capitalization: boolean;
    preserveLogic: boolean;
  }

  // State management
  const [mode, setMode] = useState<"blog" | "code">("blog");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BlogResponse | CodeResponse | null>(
    null,
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // New state for attachments
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>(
    [],
  );
  const [linkAttachments, setLinkAttachments] = useState<LinkAttachment[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Features state
  const [features, setFeatures] = useState<BlogFeatures | CodeFeatures>(
    mode === "blog"
      ? {
          seo: true,
          keywords: true,
          ctas: true,
          social: true,
          extendedDraft: true,
        }
      : {
          grammar: true,
          clarity: true,
          tone: true,
          capitalization: true,
          preserveLogic: true,
        },
  );

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

  // Image upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ImageAttachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string,
            alt: file.name.split(".")[0],
          };
          setImageAttachments((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImageAttachments((prev) => prev.filter((img) => img.id !== id));
  };

  const updateImageAlt = (id: string, alt: string) => {
    setImageAttachments((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt } : img)),
    );
  };

  // Link attachment handlers
  const addLinkAttachment = () => {
    if (!newLinkUrl.trim()) return;

    const newLink: LinkAttachment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: newLinkUrl.trim(),
      title: newLinkTitle.trim() || undefined,
      description: undefined,
    };

    setLinkAttachments((prev) => [...prev, newLink]);
    setNewLinkUrl("");
    setNewLinkTitle("");
  };

  const removeLinkAttachment = (id: string) => {
    setLinkAttachments((prev) => prev.filter((link) => link.id !== id));
  };

  const updateLinkAttachment = (
    id: string,
    updates: Partial<LinkAttachment>,
  ) => {
    setLinkAttachments((prev) =>
      prev.map((link) => (link.id === id ? { ...link, ...updates } : link)),
    );
  };

  // Enhanced prompt generation with attachments
  function buildPrompt(
    input: string,
    mode: "blog" | "code",
    features: BlogFeatures | CodeFeatures,
  ): string {
    if (mode === "code") {
      const sections = [];
      if ((features as CodeFeatures).grammar) sections.push("grammar fixes");
      if ((features as CodeFeatures).clarity)
        sections.push("clarity improvements");
      if ((features as CodeFeatures).tone) sections.push("tone adjustments");
      if ((features as CodeFeatures).capitalization)
        sections.push("capitalization fixes");
      if ((features as CodeFeatures).preserveLogic)
        sections.push("preserve all code logic");
      return `You are a code documentation assistant. Clean up the following code comments/docs with: ${sections.join(", ")}. Code: ${input}`;
    }

    const sections = [];
    if ((features as BlogFeatures).seo) sections.push("SEO meta description");
    if ((features as BlogFeatures).keywords)
      sections.push("keyword suggestions");
    if ((features as BlogFeatures).ctas)
      sections.push("call-to-action buttons");
    if ((features as BlogFeatures).social)
      sections.push("social media snippets");
    if ((features as BlogFeatures).extendedDraft)
      sections.push("extended content");

    let prompt = `You are a professional blog assistant. Expand the following idea into 3 structured blog post options with: ${sections.join(", ")}. Idea: ${input}`;

    // Add attachment context
    if (imageAttachments.length > 0) {
      prompt += `\n\nImages to incorporate: ${imageAttachments.map((img) => `"${img.alt || img.file.name}"`).join(", ")}`;
    }

    if (linkAttachments.length > 0) {
      prompt += `\n\nLinks to reference: ${linkAttachments.map((link) => `${link.title || link.url} (${link.url})`).join(", ")}`;
    }

    return prompt;
  }

  async function handleGenerate() {
    if (
      !input.trim() &&
      imageAttachments.length === 0 &&
      linkAttachments.length === 0
    ) {
      setError("Please enter some content or add attachments.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prompt = buildPrompt(input, mode, features);

      // Create form data for file uploads
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("mode", mode);

      // Add image files
      imageAttachments.forEach((img, index) => {
        formData.append(`image_${index}`, img.file);
        formData.append(`image_${index}_alt`, img.alt || "");
      });

      // Add link data
      formData.append("links", JSON.stringify(linkAttachments));

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Generation error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (!result || mode !== "blog") return;

    setSaveLoading(true);
    setSaveMessage(null);

    try {
      const blogResult = result as BlogResponse;
      if (blogResult.options && blogResult.options.length > 0) {
        const firstOption = blogResult.options[0];

        // Include attachment data in the saved draft
        const draftData = {
          ...firstOption,
          attachments: {
            images: imageAttachments.map((img) => ({
              id: img.id,
              alt: img.alt,
              filename: img.file.name,
              size: img.file.size,
              type: img.file.type,
            })),
            links: linkAttachments,
          },
          originalInput: input,
          createdAt: new Date().toISOString(),
        };

        const postId = `draft-${Date.now()}`;
        await blogStorage.saveDraft(postId, JSON.stringify(draftData));
        setSaveMessage("Draft saved successfully!");
      }
    } catch (e) {
      console.error("Save error:", e);
      setSaveMessage(e instanceof Error ? e.message : "Failed to save draft.");
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <BackNavigation text="← Back to Home" href="/" className="mb-4" />
          <h1 className="text-3xl font-extrabold">
            Blog & Grammarly Assistant
          </h1>
          <p className="mt-2 text-slate-600">
            Generate feature-rich blog posts with rich media attachments or
            clean developer documentation/comments.
          </p>
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
                <input
                  type="checkbox"
                  checked={(features as BlogFeatures).seo}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as BlogFeatures),
                      seo: e.target.checked,
                    })
                  }
                />
                SEO meta
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(features as BlogFeatures).keywords}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as BlogFeatures),
                      keywords: e.target.checked,
                    })
                  }
                />
                Keywords
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(features as BlogFeatures).ctas}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as BlogFeatures),
                      ctas: e.target.checked,
                    })
                  }
                />
                CTAs
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(features as BlogFeatures).social}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as BlogFeatures),
                      social: e.target.checked,
                    })
                  }
                />
                Social snippets
              </label>
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input
                  type="checkbox"
                  checked={(features as BlogFeatures).extendedDraft}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as BlogFeatures),
                      extendedDraft: e.target.checked,
                    })
                  }
                />
                Extended draft length
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(features as CodeFeatures).grammar}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as CodeFeatures),
                      grammar: e.target.checked,
                    })
                  }
                />
                Grammar
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(features as CodeFeatures).clarity}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as CodeFeatures),
                      clarity: e.target.checked,
                    })
                  }
                />
                Clarity
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(features as CodeFeatures).tone}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as CodeFeatures),
                      tone: e.target.checked,
                    })
                  }
                />
                Tone
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(features as CodeFeatures).capitalization}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as CodeFeatures),
                      capitalization: e.target.checked,
                    })
                  }
                />
                Capitalization
              </label>
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input
                  type="checkbox"
                  checked={(features as CodeFeatures).preserveLogic}
                  onChange={(e) =>
                    setFeatures({
                      ...(features as CodeFeatures),
                      preserveLogic: e.target.checked,
                    })
                  }
                />
                Preserve code logic
              </label>
            </div>
          )}
        </div>

        {/* Rich Media Attachments Section */}
        {mode === "blog" && (
          <div className="mb-4 p-4 border rounded-md bg-white">
            <div className="font-semibold mb-3">📎 Rich Media Attachments</div>

            {/* Image Upload Section */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium">🖼️ Images</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Add Images
                </button>
              </div>

              {imageAttachments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {imageAttachments.map((img) => (
                    <div
                      key={img.id}
                      className="relative border rounded-lg p-2"
                    >
                      <img
                        src={img.preview}
                        alt={img.alt}
                        className="w-full h-20 object-cover rounded"
                      />
                      <input
                        type="text"
                        value={img.alt || ""}
                        onChange={(e) => updateImageAlt(img.id, e.target.value)}
                        placeholder="Alt text..."
                        className="w-full mt-1 text-xs p-1 border rounded"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Link Attachments Section */}
            <div>
              <div className="text-sm font-medium mb-2">🔗 Share Links</div>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 text-sm p-2 border rounded"
                />
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Link title (optional)"
                  className="flex-1 text-sm p-2 border rounded"
                />
                <button
                  onClick={addLinkAttachment}
                  disabled={!newLinkUrl.trim()}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {linkAttachments.length > 0 && (
                <div className="space-y-2">
                  {linkAttachments.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {link.title || link.url}
                        </div>
                        <div className="text-xs text-gray-600">{link.url}</div>
                      </div>
                      <button
                        onClick={() => removeLinkAttachment(link.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "blog"
              ? "Enter blog idea, keywords, or draft..."
              : "Paste code snippet or documentation..."
          }
          className="w-full min-h-[160px] p-3 border rounded-md mb-4"
        />

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {mode === "blog" &&
            (imageAttachments.length > 0 || linkAttachments.length > 0) && (
              <div className="flex items-center text-sm text-gray-600">
                📎 {imageAttachments.length} images, {linkAttachments.length}{" "}
                links attached
              </div>
            )}
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading && (
          <div className="bg-white p-6 rounded shadow">
            Processing request with attachments...
          </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Results</h2>
            <pre className="whitespace-pre-wrap text-sm text-slate-800">
              {JSON.stringify(result, null, 2)}
            </pre>
            {mode === "blog" && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saveLoading}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {saveLoading ? "Saving..." : "Save as Draft"}
                </button>
                <a
                  href="/admin/blog/posts"
                  className="text-blue-600 hover:underline"
                >
                  Go to Blog Posts
                </a>
              </div>
            )}
            {saveMessage && (
              <p className="mt-2 text-sm text-slate-700">{saveMessage}</p>
            )}
          </div>
        )}

        <footer className="mt-10 text-center text-sm text-slate-500">
          Connect <code>/api/generate</code> to your AI backend for
          functionality.
        </footer>
      </div>
    </div>
  );
}
