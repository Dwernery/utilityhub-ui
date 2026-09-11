/**
 * Utility functions for S3 file uploads
 */

/**
 * Upload a file to S3 using a presigned URL
 * @param {string} presignedUrl - The presigned URL from the backend
 * @param {File} file - The file to upload
 * @returns {Promise<void>}
 */
export async function uploadFileToS3(presignedUrl, file) {
  // Validate inputs
  if (!presignedUrl || typeof presignedUrl !== "string") {
    throw new Error("Invalid presigned URL provided");
  }

  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file object");
  }

  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      // Provide contextual error messages for common S3 issues
      if (response.status === 403) {
        throw new Error(
          "Access denied: presigned URL may have expired. Please try again.",
        );
      }
      if (response.status === 400) {
        throw new Error(
          "Bad request: file may be corrupted or incompatible.",
        );
      }
      if (response.status >= 500) {
        throw new Error(
          "Server error: S3 service unavailable. Please try again later.",
        );
      }
      throw new Error(
        `Failed to upload file (HTTP ${response.status}). Please check your connection and try again.`,
      );
    }
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      throw new Error(
        "Network error during upload. Please check your internet connection.",
        { cause: error },
      );
    }
    // Re-throw our custom errors
    throw error;
  }
}

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 10)
 * @param {string[]} options.allowedTypes - Allowed MIME types (default: common image and document types)
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFile(file, options = {}) {
  const {
    maxSizeMB = 10,
    allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  } = options;

  // Validate file object exists
  if (!file || !(file instanceof File)) {
    return {
      valid: false,
      error: "Invalid file object",
    };
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Supported: JPG, PNG, WebP, GIF, PDF, DOC, DOCX`,
    };
  }

  return { valid: true };
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
