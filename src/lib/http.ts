// Lightweight fetch-based HTTP client with timeout, retries, and typed helpers

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number; // per request timeout
  retry?: {
    retries: number; // number of retry attempts
    retryOn?: number[]; // HTTP status codes to retry on
    backoffMs?: number; // initial backoff in ms (exponential)
  };
}

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method' | 'headers'> {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  retry?: {
    retries?: number;
    retryOn?: number[];
    backoffMs?: number;
  };
}

export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

export class HttpClient {
  private readonly baseUrl?: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeoutMs: number;
  private readonly retryDefaults: Required<NonNullable<HttpClientOptions['retry']>>;

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl;
    this.defaultHeaders = options.defaultHeaders ?? {'Content-Type': 'application/json'};
    this.defaultTimeoutMs = options.timeoutMs ?? 15000;
    this.retryDefaults = {
      retries: options.retry?.retries ?? 0,
      retryOn: options.retry?.retryOn ?? [408, 429, 500, 502, 503, 504],
      backoffMs: options.retry?.backoffMs ?? 300,
    };
  }

  private buildUrl(input: string, query?: RequestOptions['query']): string {
    const raw = this.baseUrl ? `${this.baseUrl.replace(/\/$/, '')}/${input.replace(/^\//, '')}` : input;
    if (!query) return raw;
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      usp.append(key, String(value));
    }
    const qs = usp.toString();
    return qs ? `${raw}${raw.includes('?') ? '&' : '?'}${qs}` : raw;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, url: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms: ${url}`)), timeoutMs);
      promise.then(
        (val) => {
          clearTimeout(id);
          resolve(val);
        },
        (err) => {
          clearTimeout(id);
          reject(err);
        },
      );
    });
  }

  private async doFetch(method: HttpMethod, url: string, options: RequestOptions, body?: unknown): Promise<Response> {
    const headers = {...this.defaultHeaders, ...(options.headers ?? {})};
    const init: RequestInit = {...options, method, headers};
    if (body !== undefined) {
      init.body = headers['Content-Type'] === 'application/json' ? JSON.stringify(body) : (body as BodyInit);
    }
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const attempt = async (): Promise<Response> => {
      return fetch(url, init);
    };

    const retries = options.retry?.retries ?? this.retryDefaults.retries;
    const retryOn = options.retry?.retryOn ?? this.retryDefaults.retryOn;
    const backoffMs = options.retry?.backoffMs ?? this.retryDefaults.backoffMs;

    let lastError: unknown;
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await this.withTimeout(attempt(), timeoutMs, url);
        if (!res.ok && i < retries && retryOn.includes(res.status)) {
          const delay = backoffMs * Math.pow(2, i);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        return res;
      } catch (err) {
        lastError = err;
        if (i < retries) {
          const delay = backoffMs * Math.pow(2, i);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Unknown fetch error');
  }

  private async request<T>(
    method: HttpMethod,
    input: string,
    options: RequestOptions = {},
    body?: unknown,
  ): Promise<T> {
    const url = this.buildUrl(input, options.query);
    const res = await this.doFetch(method, url, options, body);

    const contentType = res.headers.get('content-type') || '';
    let data: unknown = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else if (contentType.includes('text/')) {
      data = await res.text();
    } else if (contentType.includes('application/octet-stream')) {
      data = await res.arrayBuffer();
    }

    if (!res.ok) {
      throw new HttpError(`HTTP ${res.status} ${res.statusText}`, res.status, data);
    }
    return data as T;
  }

  get<T>(input: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', input, options);
  }

  post<T, B = unknown>(input: string, body?: B, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', input, options, body);
  }

  put<T, B = unknown>(input: string, body?: B, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', input, options, body);
  }

  patch<T, B = unknown>(input: string, body?: B, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', input, options, body);
  }

  delete<T>(input: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', input, options);
  }
}

// Default singleton instance for app-wide use
export const http = new HttpClient({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  timeoutMs: 15000,
});
