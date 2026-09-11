import { useState, useRef } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { formatFileSize } from "../utils/s3Upload";

export default function FileUploadInput({
  onFileSelected,
  onUploadError,
  disabled = false,
  uploadProgress = 0,
  selectedFile = null,
  isUploading = false,
  label = "Upload File",
  acceptedTypes = ".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx",
  maxSizeMB = 10,
}) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [fileError, setFileError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setFileName(file.name);

    onFileSelected?.(file);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFileName(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelected?.(null);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-2">
        {label}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={acceptedTypes}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Upload button / status area */}
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center
          transition-all duration-200 cursor-pointer
          ${
            disabled || isUploading
              ? "bg-slate-50 border-slate-200 opacity-60"
              : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
          }
          ${fileError ? "border-red-300 bg-red-50" : ""}
          ${selectedFile && !fileError ? "border-green-300 bg-green-50" : ""}
        `}
      >
        {isUploading ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>
            <div className="text-xs text-slate-600">
              Uploading... {uploadProgress}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : selectedFile && !fileError ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xs text-slate-700 font-medium">
              {fileName || selectedFile.name}
            </div>
            <div className="text-xs text-slate-500">
              {formatFileSize(selectedFile.size)}
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-red-600 hover:text-red-700 mt-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-xs text-slate-600">
              Click to upload or drag and drop
            </div>
            <div className="text-xs text-slate-500">
              Max {maxSizeMB}MB • JPG, PNG, PDF, etc.
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {fileError && (
        <div className="mt-2 text-xs text-red-600">{fileError}</div>
      )}
    </div>
  );
}
