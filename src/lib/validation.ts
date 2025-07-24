// Security validation utilities

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const GEMINI_API_KEY_PATTERN = /^[A-Za-z0-9_-]{39}$/;

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' };
  }

  // Additional validation: check file extension matches MIME type
  const extension = file.name.toLowerCase().split('.').pop();
  const mimeTypeMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif']
  };

  const expectedExtensions = mimeTypeMap[file.type];
  if (!expectedExtensions || !extension || !expectedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' };
  }

  return { valid: true };
};

export const validateApiKey = (apiKey: string): { valid: boolean; error?: string } => {
  if (!apiKey.trim()) {
    return { valid: false, error: 'API key is required' };
  }

  if (!GEMINI_API_KEY_PATTERN.test(apiKey.trim())) {
    return { valid: false, error: 'Invalid API key format' };
  }

  return { valid: true };
};

export const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Don't expose internal error details
    if (error.message.includes('API') || error.message.includes('key')) {
      return 'Authentication failed. Please check your API key.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('400')) {
      return 'Invalid request. Please check your input and try again.';
    }
    if (error.message.includes('429')) {
      return 'Rate limit exceeded. Please wait before trying again.';
    }
    if (error.message.includes('500')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift();
    }
    
    if (userRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    userRequests.push(now);
    return true;
  };
};