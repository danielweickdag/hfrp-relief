"use client";

import { useState, useRef, useEffect } from "react";

interface PhotoUploadData {
  title: string;
  description: string;
  category: "feeding" | "healthcare" | "education" | "housing";
  tags: string[];
  date: string;
}

interface UploadedPhoto extends PhotoUploadData {
  id: string;
  src: string;
  file?: File;
  preview: string;
}

const programCategories = [
  { id: "feeding", label: "Feeding Program", icon: "🍽️", color: "orange" },
  { id: "healthcare", label: "Healthcare Program", icon: "🏥", color: "green" },
  { id: "education", label: "Education Program", icon: "📚", color: "blue" },
  { id: "housing", label: "Housing Program", icon: "🏠", color: "purple" },
];

const commonTags = {
  feeding: [
    "community-kitchen",
    "food-prep",
    "volunteers",
    "distribution",
    "fresh-food",
    "vegetables",
    "family-meals",
    "nutrition",
    "community",
    "gathering",
    "support",
    "training",
    "daily-meals",
    "service",
    "children",
    "health",
    "kitchen",
    "operations",
    "supplies",
    "equipment",
    "food-security",
    "access",
    "outreach",
    "families",
    "programs",
  ],
  healthcare: [
    "medical-care",
    "health-education",
    "community",
    "mobile-clinic",
    "patient-care",
    "preventive-care",
    "health-awareness",
    "nutrition",
    "hygiene",
    "disease-prevention",
    "checkup",
    "treatment",
    "healthcare-workers",
    "clinic",
  ],
  education: [
    "school-supplies",
    "resources",
    "children",
    "education",
    "learning",
    "teaching",
    "classroom",
    "students",
    "books",
    "uniforms",
    "tuition",
    "literacy",
    "training",
    "workshops",
    "technology",
    "computer",
  ],
  housing: [
    "housing-assistance",
    "shelter",
    "families",
    "construction",
    "repair",
    "emergency-shelter",
    "home-building",
    "infrastructure",
    "community-development",
    "disaster-response",
    "safe-housing",
    "construction-training",
  ],
};

export default function PhotoUpload() {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<PhotoUploadData>({
    title: "",
    description: "",
    category: "feeding",
    tags: [],
    date: new Date().toISOString().split("T")[0],
  });
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newTag, setNewTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing images
  useEffect(() => {
    fetch("/api/upload/images")
      .then((res) => res.json())
      .then((data) => {
        if (data.images) {
          const loadedPhotos = data.images.map((img: any) => ({
            id: img.name,
            src: img.url,
            preview: img.url,
            title: img.name,
            description: "",
            category: "feeding", // Default
            tags: [],
            date: new Date().toISOString().split("T")[0],
          }));
          setUploadedPhotos((prev) => {
            // Avoid duplicates
            const newPhotos = loadedPhotos.filter(
              (p: any) => !prev.some((existing) => existing.id === p.id)
            );
            return [...prev, ...newPhotos];
          });
        }
      })
      .catch((err) => console.error("Failed to load images:", err));
  }, []);

  // Handle file selection
  const handleFileSelect = (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          const newPhoto: UploadedPhoto = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            src: "", // Will be set after upload
            file,
            preview,
            ...currentPhoto,
            title:
              currentPhoto.title ||
              file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          };
          setUploadedPhotos((prev) => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  // Add custom tag
  const addCustomTag = () => {
    if (
      newTag.trim() &&
      !currentPhoto.tags.includes(newTag.trim().toLowerCase())
    ) {
      setCurrentPhoto((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setCurrentPhoto((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Update photo metadata
  const updatePhotoMetadata = (
    photoId: string,
    field: keyof PhotoUploadData,
    value: string
  ) => {
    setUploadedPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, [field]: value } : photo
      )
    );
  };

  // Add tag to specific photo
  const addTagToPhoto = (photoId: string, tag: string) => {
    setUploadedPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId && !photo.tags.includes(tag)
          ? { ...photo, tags: [...photo.tags, tag] }
          : photo
      )
    );
  };

  // Remove photo
  const removePhoto = (photoId: string) => {
    setUploadedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  // Upload process
  const uploadPhotos = async () => {
    if (uploadedPhotos.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      const totalPhotos = uploadedPhotos.length;

      for (let i = 0; i < totalPhotos; i++) {
        const photo = uploadedPhotos[i];

        // Skip if already uploaded (has src)
        if (photo.src && !photo.src.startsWith("data:")) continue;

        if (!photo.file) continue;

        const formData = new FormData();
        formData.append("file", photo.file);

        try {
          const response = await fetch("/api/upload/images", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${photo.title}`);
          }

          const data = await response.json();

          if (data.success) {
            // Update photo with real URL
            setUploadedPhotos((prev) =>
              prev.map((p) => (p.id === photo.id ? { ...p, src: data.url } : p))
            );
            successCount++;
          }
        } catch (err) {
          console.error(`Error uploading ${photo.title}:`, err);
        }

        // Update progress
        setUploadProgress(((i + 1) / totalPhotos) * 100);
      }

      // Show success message
      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} photo(s)!`);
        // Optional: Clear uploaded photos or keep them to show success
        // setUploadedPhotos([]);
      } else {
        alert("No photos were uploaded successfully.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const selectedCategoryColor =
    programCategories.find((cat) => cat.id === currentPhoto.category)?.color ||
    "blue";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📸 Photo Upload Manager
        </h1>
        <p className="text-gray-600">
          Upload and manage photos for HFRP program galleries
        </p>
      </div>

      {/* Default Metadata Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Default Photo Metadata
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Category
            </label>
            <select
              value={currentPhoto.category}
              onChange={(e) =>
                setCurrentPhoto((prev) => ({
                  ...prev,
                  category: e.target.value as PhotoUploadData["category"],
                  tags: [], // Reset tags when category changes
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {programCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={currentPhoto.date}
              onChange={(e) =>
                setCurrentPhoto((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Title
            </label>
            <input
              type="text"
              value={currentPhoto.title}
              onChange={(e) =>
                setCurrentPhoto((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter default title (will be applied to new uploads)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Description
            </label>
            <textarea
              value={currentPhoto.description}
              onChange={(e) =>
                setCurrentPhoto((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter default description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {currentPhoto.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 bg-${selectedCategoryColor}-100 text-${selectedCategoryColor}-800 rounded-full text-sm flex items-center gap-1`}
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Common Tags */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                Common tags for {currentPhoto.category}:
              </p>
              <div className="flex flex-wrap gap-2">
                {commonTags[currentPhoto.category].slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (!currentPhoto.tags.includes(tag)) {
                        setCurrentPhoto((prev) => ({
                          ...prev,
                          tags: [...prev.tags, tag],
                        }));
                      }
                    }}
                    disabled={currentPhoto.tags.includes(tag)}
                    className={`px-2 py-1 rounded text-xs ${
                      currentPhoto.tags.includes(tag)
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : `bg-${selectedCategoryColor}-50 text-${selectedCategoryColor}-700 hover:bg-${selectedCategoryColor}-100`
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                placeholder="Add custom tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addCustomTag}
                className={`px-4 py-2 bg-${selectedCategoryColor}-600 text-white rounded-lg hover:bg-${selectedCategoryColor}-700`}
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Drag & Drop Photos Here
        </h3>
        <p className="text-gray-600 mb-4">
          Or click the button below to select files
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Select Photos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <p className="text-sm text-gray-500 mt-2">
          Supports JPG, PNG, GIF, WebP formats
        </p>
      </div>

      {/* Uploaded Photos Preview */}
      {uploadedPhotos.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Uploaded Photos ({uploadedPhotos.length})
            </h2>
            <button
              onClick={uploadPhotos}
              disabled={isUploading}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading... {Math.round(uploadProgress)}%
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload All Photos
                </>
              )}
            </button>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={photo.preview}
                      alt={photo.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={photo.title}
                      onChange={(e) =>
                        updatePhotoMetadata(photo.id, "title", e.target.value)
                      }
                      placeholder="Photo title"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <textarea
                      value={photo.description}
                      onChange={(e) =>
                        updatePhotoMetadata(
                          photo.id,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Photo description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={photo.category}
                        onChange={(e) =>
                          updatePhotoMetadata(
                            photo.id,
                            "category",
                            e.target.value
                          )
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {programCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove photo"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
