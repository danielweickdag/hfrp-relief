"use client";
import { useState, useRef } from "react";

interface Frontmatter {
  [key: string]: string | string[];
}

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  type: string;
}

function makeMarkDown(frontmatter: Frontmatter, body: string) {
  let fm = "---\n";
  for (const [k, v] of Object.entries(frontmatter)) {
    if (k === "images" && Array.isArray(v)) {
      if (v.length > 0) {
        fm += `${k}:\n`;
        for (const img of v) {
          fm += `  - "${img}"\n`;
        }
      }
    } else if (v !== "" && !(Array.isArray(v) && v.length === 0)) {
      fm += `${k}: "${v}"\n`;
    }
  }
  fm += "---\n\n";
  return fm + body;
}

export default function AdminBlogEditor() {
  const [frontmatter, setFrontmatter] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    author: "",
    summary: "",
    image: "",
    images: [] as string[],
  });
  const [body, setBody] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateField(field: string, value: string) {
    setFrontmatter((fm) => ({ ...fm, [field]: value }));
  }

  async function uploadImage(file: File): Promise<UploadedImage | null> {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      const uploadedImage: UploadedImage = {
        url: result.url,
        filename: result.filename,
        size: result.size,
        type: result.type,
      };

      setUploadedImages((prev) => [...prev, uploadedImage]);

      // Automatically add to images array
      setFrontmatter((prev) => {
        const currentImages = prev.images || [];
        if (!currentImages.includes(uploadedImage.url)) {
          return { ...prev, images: [...currentImages, uploadedImage.url] };
        }
        return prev;
      });

      return uploadedImage;
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadImage(file);
    }
  }

  function insertImageIntoBody(imageUrl: string) {
    const imageMarkdown = `![Image](${imageUrl})\n\n`;
    setBody((prev) => prev + imageMarkdown);
  }

  function setAsFeaturedImage(imageUrl: string) {
    updateField("image", imageUrl);
    // Also add to images array if not already present
    setFrontmatter((prev) => {
      const currentImages = prev.images || [];
      if (!currentImages.includes(imageUrl)) {
        return { ...prev, images: [...currentImages, imageUrl] };
      }
      return prev;
    });
  }

  function handleExport() {
    const fileContent = makeMarkDown(frontmatter, body);
    const blob = new Blob([fileContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${frontmatter.title ? frontmatter.title.replace(/\s+/g, "-").toLowerCase() : "my-post"}.md`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    link.remove();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-6">New Blog Post Editor</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <form className="space-y-4">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Title"
            value={frontmatter.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            placeholder="Date"
            value={frontmatter.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Author"
            value={frontmatter.author}
            onChange={(e) => updateField("author", e.target.value)}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Image (URL or /uploads/ path)"
            value={frontmatter.image}
            onChange={(e) => updateField("image", e.target.value)}
          />
          <textarea
            className="w-full border px-3 py-2 rounded"
            placeholder="Summary"
            value={frontmatter.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            rows={2}
          />
          <textarea
            className="w-full border px-3 py-2 rounded font-mono min-h-[100px]"
            placeholder="Markdown Body (main content)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
          />
          {/* Image Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drop images here or{" "}
                        <span className="text-blue-600 hover:text-blue-500">
                          browse
                        </span>
                      </span>
                      <input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="mt-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block mr-2"></div>
                  Uploading...
                </div>
              )}

              {uploadError && (
                <div className="mt-2 text-red-600 text-sm">{uploadError}</div>
              )}
            </div>
          </div>

          {/* Uploaded Images Gallery */}
          {uploadedImages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Uploaded Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => insertImageIntoBody(image.url)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                          title="Insert into content"
                        >
                          Insert
                        </button>
                        <button
                          onClick={() => setAsFeaturedImage(image.url)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          title="Set as featured image"
                        >
                          Featured
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {image.filename}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="bg-blue-700 text-white px-5 py-2 rounded font-bold shadow hover:bg-blue-800"
            type="button"
            onClick={handleExport}
          >
            Export .md File
          </button>
        </form>
        <div>
          <div className="mb-3 text-zinc-700 font-bold">Live Preview</div>
          <div className="border rounded-lg p-4 bg-zinc-50">
            <div className="mb-2 text-sm text-zinc-400">
              {frontmatter.date}
              {frontmatter.author && <> · By {frontmatter.author}</>}
            </div>
            <h3 className="text-xl font-bold mb-1">
              {frontmatter.title || (
                <span className="italic text-zinc-400">Title...</span>
              )}
            </h3>
            <div className="text-zinc-600 mb-3">{frontmatter.summary}</div>
            {frontmatter.image ? (
              <img
                src={frontmatter.image}
                alt="preview"
                className="rounded-lg mb-3 max-h-40"
              />
            ) : null}
            <pre className="text-sm max-h-44 overflow-auto text-primary-800 bg-zinc-100 p-2 rounded whitespace-pre-line">
              {body}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
