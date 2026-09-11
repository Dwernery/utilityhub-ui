import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getPresignedUploadUrl, attachFileToBook } from "../api";
import { uploadFileToS3, validateFile } from "../utils/s3Upload";
import { BOOKS_KEY } from "./queryKeys";

/**
 * Custom hook for uploading files to S3
 * Handles: getting presigned URL, validating file, uploading to S3, and attaching to book
 */
export function useS3Upload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const presignedUrlMutation = useMutation({
    mutationFn: ({ fileName, fileType }) =>
      getPresignedUploadUrl(fileName, fileType),
  });

  const s3UploadMutation = useMutation({
    mutationFn: ({ presignedUrl, file }) => uploadFileToS3(presignedUrl, file),
  });

  const attachFileMutation = useMutation({
    mutationFn: ({ bookId, s3Key, fileType }) =>
      attachFileToBook(bookId, s3Key, fileType),
  });

  /**
   * Upload a file: get presigned URL -> upload to S3 -> attach to book
   * @param {File} file - The file to upload
   * @param {string} bookId - Book ID to attach file to
   * @param {string} fileType - Type of file (default: 'cover')
   * @returns {Promise<Object>}
   */
  const uploadFile = async (file, bookId, fileType = "cover") => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      setUploadProgress(25);

      // Step 1: Get presigned URL
      const urlData = await presignedUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
      });

      setUploadProgress(50);

      // Step 2: Upload to S3
      await s3UploadMutation.mutateAsync({
        presignedUrl: urlData.presignedUrl,
        file,
      });

      setUploadProgress(75);

      // Step 3: Attach file to book
      const result = await attachFileMutation.mutateAsync({
        bookId,
        s3Key: urlData.s3Key,
        fileType,
      });

      // Invalidate books cache to refetch updated book data
      await queryClient.invalidateQueries({ queryKey: BOOKS_KEY });

      setUploadProgress(100);
      return result;
    } catch (error) {
      setUploadProgress(0);
      throw error;
    }
  };

  const isUploading =
    presignedUrlMutation.isPending ||
    s3UploadMutation.isPending ||
    attachFileMutation.isPending;

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    error:
      presignedUrlMutation.error ||
      s3UploadMutation.error ||
      attachFileMutation.error,
  };
}
