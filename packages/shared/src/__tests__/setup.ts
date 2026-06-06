// Global test setup
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  
  constructor(fileBits: any[], fileName: string, options: { type?: string } = {}) {
    this.name = fileName;
    this.type = options.type || '';
    // Rough size calculation for mock
    this.size = fileBits.reduce((size, bit) => {
      if (typeof bit === 'string') {
        return size + bit.length;
      }
      return size + 1;
    }, 0);
  }
} as any;

global.FileReader = class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = `data:${file.type || 'application/octet-stream'};base64,${btoa(file.name)}`;
      if (this.onload) {
        this.onload.call(this, {} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
} as any;

// Mock URL constructor for node environment
if (typeof URL === 'undefined') {
  global.URL = class MockURL {
    pathname: string = '';
    hostname: string = '';
    searchParams: URLSearchParams;
    
    constructor(url: string, base?: string) {
      this.searchParams = new URLSearchParams();
      // Basic URL parsing for tests
      if (url.includes('://')) {
        const [protocol, rest] = url.split('://');
        const [domain, path] = rest.split('/');
        this.hostname = domain;
        this.pathname = '/' + (path || '');
      }
    }
    
    toString() {
      return `https://${this.hostname}${this.pathname}`;
    }
  } as any;
}

// Mock URLSearchParams if not available
if (typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = class MockURLSearchParams {
    private params: Map<string, string[]> = new Map();
    
    append(name: string, value: string) {
      if (!this.params.has(name)) {
        this.params.set(name, []);
      }
      this.params.get(name)!.push(value);
    }
    
    set(name: string, value: string) {
      this.params.set(name, [value]);
    }
    
    get(name: string) {
      const values = this.params.get(name);
      return values ? values[0] : null;
    }
    
    delete(name: string) {
      this.params.delete(name);
    }
    
    forEach(callback: (value: string, key: string) => void) {
      this.params.forEach((values, key) => {
        values.forEach(value => callback(value, key));
      });
    }
    
    toString() {
      const pairs: string[] = [];
      this.params.forEach((values, key) => {
        values.forEach(value => {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        });
      });
      return pairs.join('&');
    }
  } as any;
}