use client;

import { useMemo, useRef, useState, type ReactNode } from "react";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuth";

type Attachment = {
  id: string;
  type: "image" | "video" | "file" | "link";
  name: string;
  url: string;
};

function ShareBoxContent() {
  const { isAuthenticated } = useAdminAuth();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkInput, setLinkInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- FILE HANDLING ----
  const onFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;

    const newItems: Attachment[] = [];

    for (const file of Array.from(files)) {
      const objectUrl = URL.createObjectURL(file);
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      const type: Attachment["type"] =
        ["mp4", "webm", "ogg"].includes(ext)
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
    }

    setAttachments((prev) => [...prev, ...newItems]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && target.type !== "link") {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  // ---- SHARE DATA ----
  const shareData = useMemo<ShareData>(() => {
    const textParts = [
      title || "Shared item",
      description || "",
      url || "",
    ].filter(Boolean);

    return {
      title: title || "Shared content",
      text: textParts.join("\n\n"),
      url: url || undefined,
    };
  }, [title, description, url]);

  // ---- HTML COPY ----
  const copyHtmlSnippet = async () => {
    const attachmentsHtml = attachments
      .map((att) => {
        switch (att.type) {
          case "image":
            return `<img src="${att.url}" alt="${escapeHtml(\n              att.name\n            )}" style="max-width:100%;border-radius:8px"/>`;
          case "video":
            return `<video src="${att.url}" controls style="max-width:100%;border-radius:8px"></video>`;
          case "link":
            return `<a href="${escapeHtml(\n              att.url\n            )}" target="_blank" rel="noopener">${escapeHtml(att.name)}</a>`;
          default:
            return `<a href="${att.url}" download>${escapeHtml(\n              att.name\n            )}</a>`;
        }
      })
      .join("\n");

    const html = `
<div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:#fff">
  <h3 style="margin:0 0 8px;font-size:18px;font-weight:700">
    ${escapeHtml(title || "Shared content")}
  </h3>
  ${
    url
      ? `<a href="${escapeHtml(
          url
        )}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`
      : ""
  }
  <p>${escapeHtml(description || "")}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
    ${attachmentsHtml}
  </div>
</div>
`;

    try {
      await navigator.clipboard.writeText(html);
      alert("Share HTML copied to clipboard.");
    } catch {
      alert("Clipboard access failed. Please copy manually.");
    }
  };

  // ---- WEB SHARE ----
  const handleWebShare = async () => {
    if (!navigator.share) {
      alert("Web Share API is not supported in this browser.");
      return;
    }

    try {
      await navigator.share(shareData);
    } catch (e) {
      console.log("Share canceled or failed", e);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="mt-12 bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">
        Share a Blog, Article, or Attachments
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* INPUT SIDE */}
        <div>
          <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <textarea
            className="w-full border rounded-lg px-3 py-2 mb-4"
            rows={4}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-3 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => onFilesSelected(e.target.files)}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              Add Files
            </button>

            <input
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="https://resource-link.com"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-gray-900 text-white rounded-lg"
              onClick={addLinkAttachment}
            >
              Add Link
            </button>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={handleWebShare}
            >
              Share
            </button>
            <button
              className="px-4 py-2 bg-gray-900 text-white rounded-lg"
              onClick={copyHtmlSnippet}
            >
              Copy HTML
            </button>
          </div>
        </div>

        {/* PREVIEW SIDE */}
        <div className="border rounded-xl p-4">
          <div className="font-bold">{title || "Shared content"}</div>
          {url && (
            <a className="text-blue-600 underline break-all" href={url}>
              {url}
            </a>
          )}
          {description && <p className="text-gray-600">{description}</p>}

          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {attachments.map((att) => (
                <div key={att.id} className="relative border rounded p-2">
                  {att.type === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={att.url}
                      alt={att.name}
                      className="h-32 w-full object-cover rounded"
                    />
                  )}
                  {att.type === "video" && (
                    <video src={att.url} controls className="h-32 w-full" />
                  )}
                  {att.type === "link" && (
                    <a className="underline text-blue-600" href={att.url}>
                      {att.name}
                    </a>
                  )}
                  {att.type === "file" && (
                    <span className="text-sm break-all">{att.name}</span>
                  )}
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShareBox() {
  return (
    <AdminAuthProvider loadingFallback={null}>
      <ShareBoxContent />
    </AdminAuthProvider>
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