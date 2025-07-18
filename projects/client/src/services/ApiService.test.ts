import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, get, post } from '../services/ApiService';

// Mock fetch
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
});

// Mock config to use consistent base URL in tests
vi.mock('../config', () => ({
  default: {
    apiBaseUrl: 'http://localhost:3000'
  },
  config: {
    apiBaseUrl: 'http://localhost:3000'
  }
}));

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('api function', () => {
    it('should make a successful request with auth', async () => {
      const mockResponse = { success: true, data: 'test' };
      localStorage.setItem('token', 'test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api('test-path', { test: 'data' }, 'POST', true);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/test-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ test: 'data' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make a successful request without auth', async () => {
      const mockResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api('test-path', null, 'GET', false);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/test-path', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle request errors', async () => {
      const errorResponse = { message: 'Error occurred' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      });

      await expect(api('test-path', null, 'GET', false)).rejects.toThrow('Error occurred');
    });

    it('should handle network errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Network error');
        },
      });

      await expect(api('test-path', null, 'GET', false)).rejects.toThrow('Request failed');
    });
  });

  describe('get function', () => {
    it('should call api with GET method', async () => {
      const mockResponse = { data: 'test' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await get('users');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/users',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('post function', () => {
    it('should call api with POST method', async () => {
      const mockResponse = { success: true };
      const postData = { name: 'test' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await post('auth/login', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
