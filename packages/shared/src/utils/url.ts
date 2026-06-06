/**
 * Builds a URL with query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  });
  
  return url.toString();
}

/**
 * Extracts query parameters from a URL
 */
export function getQueryParams(url: string): Record<string, string | string[]> {
  const urlObj = new URL(url);
  const params: Record<string, string | string[]> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });
  
  return params;
}

/**
 * Gets a single query parameter from a URL
 */
export function getQueryParam(url: string, param: string): string | null {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(param);
}

/**
 * Removes query parameters from a URL
 */
export function removeQueryParams(url: string, paramsToRemove: string[]): string {
  const urlObj = new URL(url);
  
  paramsToRemove.forEach(param => {
    urlObj.searchParams.delete(param);
  });
  
  return urlObj.toString();
}

/**
 * Updates query parameters in a URL
 */
export function updateQueryParams(
  url: string,
  updates: Record<string, string | null>
): string {
  const urlObj = new URL(url);
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      urlObj.searchParams.delete(key);
    } else {
      urlObj.searchParams.set(key, value);
    }
  });
  
  return urlObj.toString();
}

/**
 * Extracts domain from a URL
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Checks if a URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/**
 * Converts relative URL to absolute
 */
export function toAbsoluteUrl(url: string, baseUrl: string): string {
  if (isAbsoluteUrl(url)) {
    return url;
  }
  
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

/**
 * Gets the file extension from a URL
 */
export function getUrlExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const lastDot = pathname.lastIndexOf('.');
    
    if (lastDot === -1) return '';
    
    return pathname.slice(lastDot + 1).toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a safe URL slug from text
 */
export function createUrlSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Joins URL paths safely
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

/**
 * Creates a data URL from file
 */
export function createDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}