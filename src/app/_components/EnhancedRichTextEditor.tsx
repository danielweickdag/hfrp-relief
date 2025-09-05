"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useState, useCallback, useEffect } from "react";

interface EnhancedRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  onImageUpload?: (file: File) => Promise<string>;
  readOnly?: boolean;
}

export default function EnhancedRichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your blog post...",
  maxLength,
  onImageUpload,
  readOnly = false,
}: EnhancedRichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content,
    editable: !readOnly && !isPreview,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Update word count
      const text = editor.getText();
      const words = text.split(/\s+/).filter((word) => word.length > 0);
      setWordCount(words.length);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor || !onImageUpload) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("Failed to upload image:", error);
        alert("Failed to upload image. Please try again.");
      }
    };

    input.click();
  }, [editor, onImageUpload]);

  if (!editor) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />;
  }

  const characterCount = editor.storage.characterCount;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-300 bg-gray-50 p-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text formatting */}
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("bold") ? "bg-gray-200 font-bold" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Bold"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("italic") ? "bg-gray-200" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Italic"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 4h4M8 20h4m2-16l-4 16"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("strike") ? "bg-gray-200" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Strikethrough"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 12h8M8 12H4m8-5a3 3 0 00-3 3m9 0a3 3 0 01-3 3m-3 2a3 3 0 003 3m3-3a3 3 0 003-3"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("code") ? "bg-gray-200" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Code"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                disabled={isPreview}
                className={`px-2 py-1 rounded hover:bg-gray-200 transition-colors text-sm ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-gray-200 font-bold"
                    : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                disabled={isPreview}
                className={`px-2 py-1 rounded hover:bg-gray-200 transition-colors text-sm ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-gray-200 font-bold"
                    : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                disabled={isPreview}
                className={`px-2 py-1 rounded hover:bg-gray-200 transition-colors text-sm ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-gray-200 font-bold"
                    : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Heading 3"
              >
                H3
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("bulletList") ? "bg-gray-200" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Bullet List"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("orderedList") ? "bg-gray-200" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Ordered List"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20h10M7 12h10M7 4h10M3 20h.01M3 12h.01M3 4h.01"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("blockquote") ? "bg-gray-200" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Blockquote"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.657-3.134 3-7 3s-7-1.343-7-3V8c0-1.657 3.134-3 7-3s7 1.343 7 3v8z"
                  />
                </svg>
              </button>
            </div>

            {/* Links and Images */}
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={setLink}
                disabled={isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive("link") ? "bg-gray-200" : ""
                } ${isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Add Link"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </button>
              {onImageUpload && (
                <button
                  type="button"
                  onClick={addImage}
                  disabled={isPreview}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    isPreview ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title="Add Image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo() || isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  !editor.can().undo() || isPreview
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title="Undo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo() || isPreview}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  !editor.can().redo() || isPreview
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title="Redo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
                  />
                </svg>
              </button>
            </div>

            {/* Preview toggle */}
            <div className="flex-1 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isPreview
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {isPreview ? "Edit" : "Preview"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor content */}
      <div
        className={`p-4 min-h-[400px] ${isPreview ? "prose prose-lg max-w-none" : ""}`}
      >
        <EditorContent editor={editor} className="focus:outline-none" />
      </div>

      {/* Footer with stats */}
      {!readOnly && (
        <div className="border-t border-gray-300 bg-gray-50 px-4 py-2 flex justify-between items-center text-sm text-gray-600">
          <div>
            {wordCount} words
            {maxLength && characterCount && (
              <span className="ml-4">
                {characterCount.characters()}/{maxLength} characters
              </span>
            )}
          </div>
          {characterCount &&
            maxLength &&
            characterCount.characters() > maxLength && (
              <div className="text-red-600 font-medium">
                Character limit exceeded
              </div>
            )}
        </div>
      )}
    </div>
  );
}
