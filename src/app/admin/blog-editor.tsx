"use client";
import { useState } from "react";

interface Frontmatter {
  [key: string]: string;
}

function makeMarkDown(frontmatter: Frontmatter, body: string) {
  let fm = "---\n";
  for (const [k, v] of Object.entries(frontmatter)) {
    fm += `${k}: \"${v}\"\n`;
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
  });
  const [body, setBody] = useState("");

  function updateField(field: string, value: string) {
    setFrontmatter((fm) => ({ ...fm, [field]: value }));
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
