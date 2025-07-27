'use client';

import { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileUpload?: (file: File) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

export default function AdminFileUploader({
  onFileUpload,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSizeMB = 5,
  className = ''
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setUploadedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    if (onFileUpload) {
      setIsUploading(true);
      // Simulate upload process
      setTimeout(() => {
        onFileUpload(file);
        setIsUploading(false);
      }, 1500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelUpload = () => {
    setUploadedFile(null);
    setPreview(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : errorMessage
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept={allowedTypes.join(',')}
        />

        {!uploadedFile ? (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Drag and drop file here, or{' '}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                onClick={handleBrowseClick}
              >
                browse
              </button>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Allowed file types: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
            </p>
            <p className="text-xs text-gray-500">Maximum size: {maxSizeMB}MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {preview ? (
              <div className="relative mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 max-w-full rounded border border-gray-200"
                />
              </div>
            ) : (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: isUploading ? '100%' : '0%' }}
              />
            </div>
            <div className="flex items-center justify-between w-full max-w-xs">
              <div className="text-sm">
                <p className="font-medium text-gray-900 truncate" style={{ maxWidth: '200px' }}>
                  {uploadedFile.name}
                </p>
                <p className="text-gray-500 text-xs">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 text-sm text-red-600 text-center">{errorMessage}</div>
        )}
      </div>
    </div>
  );
}
