import {HttpClient, HttpError} from '../http';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

function jsonResponse(data: unknown, status = 200, statusText = 'OK') {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({'content-type': 'application/json'}),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

function textResponse(data: string, status = 200, statusText = 'OK') {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({'content-type': 'text/plain'}),
    text: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('HttpClient', () => {
  describe('URL building', () => {
    it('uses baseUrl when provided', async () => {
      const client = new HttpClient({baseUrl: 'https://api.example.com'});
      mockFetch.mockReturnValue(jsonResponse({ok: true}));

      await client.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object),
      );
    });

    it('strips trailing slash from baseUrl and leading slash from path', async () => {
      const client = new HttpClient({baseUrl: 'https://api.example.com/'});
      mockFetch.mockReturnValue(jsonResponse({ok: true}));

      await client.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object),
      );
    });

    it('appends query parameters', async () => {
      const client = new HttpClient();
      mockFetch.mockReturnValue(jsonResponse({ok: true}));

      await client.get('https://api.example.com/users', {
        query: {page: 1, limit: 10, search: 'test'},
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('search=test');
    });

    it('filters out null and undefined query params', async () => {
      const client = new HttpClient();
      mockFetch.mockReturnValue(jsonResponse({ok: true}));

      await client.get('https://api.example.com/users', {
        query: {page: 1, search: undefined, filter: null},
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).not.toContain('search');
      expect(calledUrl).not.toContain('filter');
    });

    it('uses input directly when no baseUrl', async () => {
      const client = new HttpClient();
      mockFetch.mockReturnValue(jsonResponse({ok: true}));

      await client.get('https://other.api.com/data');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://other.api.com/data',
        expect.any(Object),
      );
    });
  });

  describe('HTTP methods', () => {
    const client = new HttpClient();

    it('sends GET request', async () => {
      mockFetch.mockReturnValue(jsonResponse({data: 'test'}));

      const result = await client.get<{data: string}>('https://api.example.com/data');

      expect(result).toEqual({data: 'test'});
      expect(mockFetch.mock.calls[0][1].method).toBe('GET');
    });

    it('sends POST request with body', async () => {
      mockFetch.mockReturnValue(jsonResponse({id: 1}));

      const result = await client.post<{id: number}>('https://api.example.com/data', {name: 'test'});

      expect(result).toEqual({id: 1});
      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.method).toBe('POST');
      expect(callArgs.body).toBe(JSON.stringify({name: 'test'}));
    });

    it('sends PUT request with body', async () => {
      mockFetch.mockReturnValue(jsonResponse({updated: true}));

      await client.put('https://api.example.com/data/1', {name: 'updated'});

      expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
    });

    it('sends PATCH request with body', async () => {
      mockFetch.mockReturnValue(jsonResponse({updated: true}));

      await client.patch('https://api.example.com/data/1', {name: 'patched'});

      expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');
    });

    it('sends DELETE request', async () => {
      mockFetch.mockReturnValue(jsonResponse({deleted: true}));

      await client.delete('https://api.example.com/data/1');

      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
    });
  });

  describe('response handling', () => {
    const client = new HttpClient();

    it('parses JSON responses', async () => {
      mockFetch.mockReturnValue(jsonResponse({users: []}));

      const result = await client.get<{users: unknown[]}>('https://api.example.com/users');

      expect(result).toEqual({users: []});
    });

    it('parses text responses', async () => {
      mockFetch.mockReturnValue(textResponse('hello'));

      const result = await client.get<string>('https://api.example.com/text');

      expect(result).toBe('hello');
    });
  });

  describe('error handling', () => {
    const client = new HttpClient();

    it('throws HttpError for non-OK responses', async () => {
      mockFetch.mockReturnValue(jsonResponse({error: 'Not Found'}, 404, 'Not Found'));

      await expect(client.get('https://api.example.com/missing')).rejects.toThrow(HttpError);
    });

    it('includes status code in HttpError', async () => {
      mockFetch.mockReturnValue(jsonResponse({error: 'Forbidden'}, 403, 'Forbidden'));

      try {
        await client.get('https://api.example.com/secret');
        fail('Expected HttpError');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError);
        expect((e as HttpError).status).toBe(403);
        expect((e as HttpError).data).toEqual({error: 'Forbidden'});
      }
    });
  });

  describe('timeout', () => {
    it('throws on timeout', async () => {
      const client = new HttpClient({timeoutMs: 50});
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(jsonResponse({ok: true})), 200)),
      );

      await expect(client.get('https://api.example.com/slow')).rejects.toThrow(/timed out/);
    });

    it('respects per-request timeout override', async () => {
      const client = new HttpClient({timeoutMs: 5000});
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(jsonResponse({ok: true})), 200)),
      );

      await expect(
        client.get('https://api.example.com/slow', {timeoutMs: 50}),
      ).rejects.toThrow(/timed out/);
    });
  });

  describe('retry', () => {
    it('retries on configured status codes', async () => {
      const client = new HttpClient({retry: {retries: 2, retryOn: [500], backoffMs: 10}});

      mockFetch
        .mockReturnValueOnce(jsonResponse({error: 'Server Error'}, 500, 'Server Error'))
        .mockReturnValueOnce(jsonResponse({error: 'Server Error'}, 500, 'Server Error'))
        .mockReturnValueOnce(jsonResponse({data: 'success'}));

      const result = await client.get<{data: string}>('https://api.example.com/flaky');

      expect(result).toEqual({data: 'success'});
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('does not retry on non-configured status codes', async () => {
      const client = new HttpClient({retry: {retries: 2, retryOn: [500], backoffMs: 10}});

      mockFetch.mockReturnValue(jsonResponse({error: 'Bad Request'}, 400, 'Bad Request'));

      await expect(client.get('https://api.example.com/bad')).rejects.toThrow(HttpError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries on network errors', async () => {
      const client = new HttpClient({retry: {retries: 1, backoffMs: 10}});

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockReturnValueOnce(jsonResponse({data: 'ok'}));

      const result = await client.get<{data: string}>('https://api.example.com/unstable');

      expect(result).toEqual({data: 'ok'});
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting retries on network errors', async () => {
      const client = new HttpClient({retry: {retries: 1, backoffMs: 10}});

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('https://api.example.com/down')).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('headers', () => {
    it('sets default Content-Type to application/json', async () => {
      const client = new HttpClient();
      mockFetch.mockReturnValue(jsonResponse({ok: true}));

      await client.get('https://api.example.com/data');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('merges custom headers with defaults', async () => {
      const client = new HttpClient({defaultHeaders: {'X-Api-Key': 'secret'}});
      mockFetch.mockReturnValue(jsonResponse({ok: true}));

      await client.get('https://api.example.com/data', {
        headers: {'X-Custom': 'value'},
      });

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['X-Api-Key']).toBe('secret');
      expect(headers['X-Custom']).toBe('value');
    });
  });
});

describe('HttpError', () => {
  it('has correct name', () => {
    const error = new HttpError('test', 404, null);
    expect(error.name).toBe('HttpError');
  });

  it('has correct message', () => {
    const error = new HttpError('Not Found', 404, null);
    expect(error.message).toBe('Not Found');
  });

  it('has correct status', () => {
    const error = new HttpError('test', 500, {detail: 'error'});
    expect(error.status).toBe(500);
  });

  it('has correct data', () => {
    const data = {detail: 'server error'};
    const error = new HttpError('test', 500, data);
    expect(error.data).toEqual(data);
  });

  it('is an instance of Error', () => {
    const error = new HttpError('test', 400, null);
    expect(error).toBeInstanceOf(Error);
  });
});
