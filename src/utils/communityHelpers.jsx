// src/utils/communityHelpers.js - Loomiq Utility Functions (Updated for Vercel Blob with Server-Side API)

import {
  deleteImageFromBlob,
  validateImageFile as blobValidateImageFile,
  createImagePreview as blobCreateImagePreview,
  cleanupImagePreviews as blobCleanupImagePreviews,
  formatFileSize as blobFormatFileSize
} from './blobStorage';

/**
 * Helper function to safely format dates
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown date';
  
  let date;
  if (dateValue && typeof dateValue.toDate === 'function') {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    date = new Date(dateValue);
  } else {
    return 'Unknown date';
  }
  
  if (isNaN(date.getTime())) {
    return 'Unknown date';
  }
  
  return date.toLocaleDateString();
};

/**
 * Helper function to safely format time
 */
export const formatTime = (dateValue) => {
  if (!dateValue) return '';
  
  let date;
  if (dateValue && typeof dateValue.toDate === 'function') {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    date = new Date(dateValue);
  } else {
    return '';
  }
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Format file size for image uploads
 */
export const formatFileSize = (bytes) => {
  return blobFormatFileSize(bytes);
};

/**
 * Create image preview URL
 */
export const createImagePreview = (file) => {
  return blobCreateImagePreview(file);
};

/**
 * Cleanup image preview URLs
 */
export const cleanupImagePreviews = (previewUrls) => {
  blobCleanupImagePreviews(previewUrls);
};

/**
 * Validate image file for upload (Vercel Blob)
 */
export const validateImageFile = (file) => {
  return blobValidateImageFile(file);
};

/**
 * Convert file to base64 for API transmission
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 encoded file data
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Get base64 string without the data URL prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return 'file';
  
  // Remove special characters and spaces
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Generate unique filename with timestamp
 * @param {string} originalName - Original file name
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  const sanitizedBase = sanitizeFilename(baseName);
  
  return `${sanitizedBase}_${timestamp}_${randomString}.${extension}`;
};

/**
 * Upload image to Vercel Blob via server-side API
 * @param {File} file - Image file to upload
 * @param {string} folder - Optional folder (default: 'posts')
 * @returns {Promise<Object>} - Upload result with URL and metadata
 */
export const uploadImageToStorage = async (file, folder = 'posts') => {
  try {
    // Validate file first
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filepath = `${folder}/${uniqueFilename}`;

    // Call unified server-side API endpoint
    const response = await fetch('/api/blob-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filepath,
        contentType: file.type,
        fileData: base64Data,
        originalName: file.name,
        size: file.size
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // Return standardized format
    return {
      url: result.url,
      pathname: result.pathname || filepath,
      type: file.type,
      size: file.size,
      name: file.name,
      contentType: result.contentType || file.type
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Vercel Blob via server-side API
 * @param {string} urlOrPathname - Image URL or pathname
 */
export const deleteImageFromStorage = async (urlOrPathname) => {
  try {
    // Call unified server-side API endpoint for deletion
    const response = await fetch('/api/blob-storage', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: urlOrPathname
      })
    });

    if (!response.ok) {
      console.error('Failed to delete image:', await response.text());
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - deletion failures shouldn't break the app
  }
};

/**
 * Upload multiple images to Vercel Blob with progress tracking
 * @param {File[]} files - Array of image files
 * @param {Function} onProgress - Optional progress callback (index, progress, total)
 * @param {string} folder - Optional folder path
 * @returns {Promise<Object[]>} - Array of upload results
 */
export const uploadMultipleImages = async (files, onProgress = null, folder = 'posts') => {
  if (!files || files.length === 0) {
    return [];
  }

  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      if (onProgress) onProgress(i, 0, total);
      
      const result = await uploadImageToStorage(files[i], folder);
      results.push(result);
      
      if (onProgress) onProgress(i, 100, total);
    } catch (error) {
      console.error(`Error uploading file ${i} (${files[i].name}):`, error);
      results.push({ 
        error: error.message, 
        filename: files[i].name,
        failed: true 
      });
      
      if (onProgress) onProgress(i, -1, total);
    }
  }
  
  return results;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Check if user is online (last active within 5 minutes)
 * @param {Date|string|number} lastActive - Last active timestamp
 * @returns {boolean} - Online status
 */
export const isUserOnline = (lastActive) => {
  if (!lastActive) return false;
  
  const lastActiveDate = lastActive instanceof Date ? lastActive : new Date(lastActive);
  if (isNaN(lastActiveDate.getTime())) return false;
  
  const now = new Date();
  const diffInMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
  
  return diffInMinutes < 5;
};

/**
 * Get optimized image URL (for future CDN integration)
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options (width, height, quality)
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  // For now, return original URL
  // Can be extended to add query parameters for image optimization
  const { width, height, quality } = options;
  
  // Future: Add Vercel Image Optimization parameters
  // Example: ?w=800&q=75
  
  return url;
};

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 * @param {Date|string|number} dateValue - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return 'Unknown time';
  
  let date;
  if (dateValue && typeof dateValue.toDate === 'function') {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    date = new Date(dateValue);
  } else {
    return 'Unknown time';
  }
  
  if (isNaN(date.getTime())) {
    return 'Unknown time';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
};

/**
 * Extract hashtags from text
 * @param {string} text - Text to parse
 * @returns {string[]} - Array of hashtags (without #)
 */
export const extractHashtags = (text) => {
  if (!text) return [];
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
};

/**
 * Extract URLs from text
 * @param {string} text - Text to parse
 * @returns {string[]} - Array of URLs
 */
export const extractUrls = (text) => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
};

/**
 * Check if image URL is valid and accessible
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - True if valid and accessible
 */
export const isValidImageUrl = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType && contentType.startsWith('image/');
  } catch (error) {
    console.error('Error checking image URL:', error);
    return false;
  }
};

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<Object>} - Object with width and height
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Compress image before upload (client-side)
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} quality - Compression quality 0-1 (default: 0.8)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = url;
  });
};

/**
 * Batch upload images with progress tracking
 * @param {File[]} files - Array of image files
 * @param {Function} onProgress - Progress callback (index, progress)
 * @param {string} folder - Optional folder path
 * @returns {Promise<Object[]>} - Array of upload results
 */
export const batchUploadImages = async (files, onProgress, folder = 'posts') => {
  return uploadMultipleImages(files, onProgress, folder);
};

/**
 * Validate multiple image files
 * @param {File[]} files - Array of files to validate
 * @returns {Object} - Validation result with valid files and errors
 */
export const validateMultipleImages = (files) => {
  const validFiles = [];
  const errors = [];
  
  if (!files || files.length === 0) {
    return { validFiles, errors };
  }
  
  files.forEach((file, index) => {
    const error = validateImageFile(file);
    if (error) {
      errors.push({ index, filename: file.name, error });
    } else {
      validFiles.push(file);
    }
  });
  
  return { validFiles, errors };
};

/**
 * Format bytes to human readable size with more precision
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted size string
 */
export const formatBytesDetailed = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Export all functions as named exports
export default {
  formatDate,
  formatTime,
  formatRelativeTime,
  copyToClipboard,
  formatFileSize,
  formatBytesDetailed,
  createImagePreview,
  cleanupImagePreviews,
  validateImageFile,
  uploadImageToStorage,
  deleteImageFromStorage,
  uploadMultipleImages,
  truncateText,
  isUserOnline,
  getOptimizedImageUrl,
  extractHashtags,
  extractUrls,
  sanitizeFilename,
  generateUniqueFilename,
  isValidImageUrl,
  getImageDimensions,
  compressImage,
  batchUploadImages,
  validateMultipleImages
};
