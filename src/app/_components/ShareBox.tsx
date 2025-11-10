"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Attachment = {
  id: string;
  type: "image" | "video" | "file" | "link";
  name: string;
  url: string; // object URL or external link
};

export default function ShareBox() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add local files as attachments with object URLs
  const onFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: Attachment[] = [];
    Array.from(files).forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const type: Attachment["type"] = ["mp4", "webm", "ogg"].includes(ext)
        ? "video"
        : ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)
        ? "image"
        : "file";
      newItems.push({
        id: crypto.randomUUID(),
        type,
        name: file.name,
        url: objectUrl,
      });
    });
    setAttachments((prev) => [...prev, ...newItems]);
    // reset input so selecting the same file again is possible
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addLinkAttachment = () => {
    const val = linkInput.trim();
    if (!val) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "link",
        name: val,
        url: val,
      },
    ]);
    setLinkInput("");
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const shareData = useMemo(() => {
    const textParts = [title || "Shared item", description || ""]; 
    if (url) textParts.push(url);
    return {
      title: title || "Shared content",
      text: textParts.filter(Boolean).join("\n\n"),
      url: url || undefined,
    } as ShareData;
  }, [title, description, url]);

  const copyHtmlSnippet = async () => {
    const attachmentsHtml = attachments
      .map((att) => {
        if (att.type === "image") return `<img src="${att.url}" alt="${att.name}" style="max-width:100%;border-radius:8px"/>`;
        if (att.type === "video") return `<video src="${att.url}" controls style="max-width:100%;border-radius:8px"></video>`;
        if (att.type === "link") return `<a href="${att.url}" target="_blank" rel="noopener">${att.name}</a>`;
        return `<a href="${att.url}" download>${att.name}</a>`;
      })
      .join("\n");

    const html = `
<div class="share-card" style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:white;box-shadow:0 1px 3px rgba(0,0,0,.1);">
  <div style="display:flex;flex-direction:column;gap:8px;">
    <h3 style="margin:0;font-size:18px;font-weight:700;color:#111827;">${escapeHtml(title || "Shared content")}</h3>
    ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline;word-break:break-all;">${escapeHtml(url)}</a>` : ""}
    <p style="margin:0;color:#4b5563;">${escapeHtml(description || "")}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">${attachmentsHtml}</div>
  </div>
</div>`;

    try {
      await navigator.clipboard.writeText(html);
      alert("Share HTML copied to clipboard.");
    } catch (e) {
      alert("Failed to copy. Select and copy manually.");
      console.log(e);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.log("Share canceled or failed", e);
      }
    } else {
      alert("Web Share API is not supported in this browser.");
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Share a Blog, Article, or Attachments</h2>
      <p className="text-sm text-gray-600 mb-6">Paste a link and add images, videos, or file links. Generate a shareable card or use the Web Share API.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="e.g., Read this inspiring story"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Blog/Article URL</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 mb-4"
            rows={4}
            placeholder="Add a short description or personal note"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center gap-3 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onFilesSelected(e.target.files)}
              accept="image/*,video/*"
            />
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => fileInputRef.current?.click()}
            >Add Images/Videos</button>

            <input
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="https://link-to-resource.com"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <button
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              onClick={addLinkAttachment}
            >Add Link</button>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleWebShare}
            >Share</button>
            <button
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              onClick={copyHtmlSnippet}
            >Copy Share HTML</button>
          </div>
        </div>

        <div>
          <div className="border rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview</h3>
            <div className="space-y-2">
              <div className="text-base font-bold text-gray-900">{title || "Shared content"}</div>
              {url && (
                <a href={url} target="_blank" rel="noreferrer noopener" className="text-blue-600 underline break-all">{url}</a>
              )}
              {description && <p className="text-gray-600 whitespace-pre-wrap">{description}</p>}
            </div>
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {attachments.map((att) => (
                  <div key={att.id} className="relative group border rounded-lg p-2">
                    {att.type === "image" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={att.url} alt={att.name} className="w-full h-32 object-cover rounded" />
                    )}
                    {att.type === "video" && (
                      <video src={att.url} controls className="w-full h-32 object-cover rounded" />
                    )}
                    {att.type === "link" && (
                      <a href={att.url} target="_blank" rel="noreferrer noopener" className="text-blue-600 underline break-all">{att.name}</a>
                    )}
                    {att.type === "file" && (
                      <a href={att.url} download className="text-gray-900 break-all">{att.name}</a>
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-600 text-white opacity-0 group-hover:opacity-100"
                    >Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}