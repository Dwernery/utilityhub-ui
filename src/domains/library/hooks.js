import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { AUTHORS_KEY, BOOKS_KEY, SERIES_KEY } from "./queryKeys";
import { uploadFileToS3, validateFile } from "./utils/s3Upload";
import { useToast } from "../../context/ToastContext";
import { todayIso } from "../../lib/dates";

// Library queries and mutations. Mirrors utility-hub-mobile's lib/library/hooks.ts.

// ── Queries ────────────────────────────────────────────────────────────────

export function useBooks() {
  return useQuery({ queryKey: BOOKS_KEY, queryFn: api.getBooks });
}

export function useAuthors() {
  return useQuery({ queryKey: AUTHORS_KEY, queryFn: api.getAuthors });
}

export function useSeries() {
  return useQuery({ queryKey: SERIES_KEY, queryFn: api.getSeries });
}

// ── Mutations ──────────────────────────────────────────────────────────────

// Each mutation refetches the list it changes once it succeeds.
function useInvalidatingMutation(mutationFn, queryKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export const useAddBook = () => useInvalidatingMutation(api.addBook, BOOKS_KEY);
export const useUpdateBook = () =>
  useInvalidatingMutation(api.updateBook, BOOKS_KEY);
export const useDeleteBook = () =>
  useInvalidatingMutation(api.deleteBook, BOOKS_KEY);
export const useCreateAuthor = () =>
  useInvalidatingMutation((name) => api.createAuthor(name), AUTHORS_KEY);
export const useCreateSeries = () =>
  useInvalidatingMutation((name) => api.createSeries(name), SERIES_KEY);

// Shared "start reading" mutation used by Randomize, StartReadingModal, and
// (indirectly) CurrentlyReading so the payload shape and toast copy can't
// drift out of sync between call sites.
export function useStartReading() {
  const updateBookMutation = useUpdateBook();
  const addToast = useToast();

  const startReading = (book, { onSuccess, onError } = {}) => {
    updateBookMutation.mutate(
      {
        id: book.id,
        status: "IN_PROGRESS",
        startDate: todayIso(),
        endDate: null,
        currentPage: 0,
      },
      {
        onSuccess: () => {
          addToast(`Started reading "${book.title}"`, "success");
          onSuccess?.();
        },
        onError: (err) => {
          addToast(
            `Failed to start reading: ${err?.message || "Unknown error"}`,
            "error",
          );
          onError?.(err);
        },
      },
    );
  };

  return { startReading, isPending: updateBookMutation.isPending };
}

/**
 * Custom hook for uploading files to S3
 * Handles: getting presigned URL, validating file, uploading to S3, and attaching to book
 */
export function useS3Upload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const presignedUrlMutation = useMutation({
    mutationFn: ({ fileName, fileType }) =>
      api.getPresignedUploadUrl(fileName, fileType),
  });

  const s3UploadMutation = useMutation({
    mutationFn: ({ presignedUrl, file }) => uploadFileToS3(presignedUrl, file),
  });

  const attachFileMutation = useMutation({
    mutationFn: ({ bookId, s3Key, fileType }) =>
      api.attachFileToBook(bookId, s3Key, fileType),
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
