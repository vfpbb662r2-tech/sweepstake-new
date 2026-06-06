/**
 * Creates a deep clone of an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Picks specified keys from an object
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omits specified keys from an object
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Checks if an object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Gets nested value from an object using dot notation
 */
export function getValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Sets nested value in an object using dot notation
 */
export function setValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Merges objects deeply
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {} as any;
        }
        deepMerge(target[key] as any, source[key] as any);
      } else {
        target[key] = source[key] as any;
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Converts object to query string
 */
export function toQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
}

/**
 * Converts query string to object
 */
export function fromQueryString(queryString: string): Record<string, any> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, any> = {};
  
  params.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * Removes null and undefined values from an object
 */
export function removeNullish<T extends object>(obj: T): Partial<T> {
  const result = {} as Partial<T>;
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      result[key as keyof T] = value;
    }
  });
  
  return result;
}

/**
 * Flattens a nested object into dot notation keys
 */
export function flatten(
  obj: object,
  prefix: string = '',
  result: Record<string, any> = {}
): Record<string, any> {
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
}

/**
 * Unflatens a dot notation object back to nested structure
 */
export function unflatten(obj: Record<string, any>): object {
  const result = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    setValue(result, key, value);
  });
  
  return result;
}