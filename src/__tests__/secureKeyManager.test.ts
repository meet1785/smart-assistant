import { SecureKeyManager } from '../services/secureKeyManager';

describe('SecureKeyManager', () => {
  let manager: SecureKeyManager;

  beforeEach(() => {
    // Reset the singleton instance for clean tests
    // Access private static field via bracket notation for testing
    (SecureKeyManager as unknown as { instance: undefined }).instance = undefined;
    manager = SecureKeyManager.getInstance();

    // Clear chrome storage mock
    (chrome.storage.sync.get as jest.Mock).mockClear();
    (chrome.storage.sync.set as jest.Mock).mockClear();
    (chrome.storage.sync.remove as jest.Mock).mockClear();
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SecureKeyManager.getInstance();
      const instance2 = SecureKeyManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getApiKey', () => {
    it('should retrieve API key from Chrome storage', async () => {
      (chrome.storage.sync.get as jest.Mock).mockResolvedValueOnce({
        gemini_api_key: 'AIzaTestKey123456789012345678901',
      });

      const key = await manager.getApiKey();
      expect(key).toBe('AIzaTestKey123456789012345678901');
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['gemini_api_key']);
    });

    it('should return cached key on subsequent calls', async () => {
      (chrome.storage.sync.get as jest.Mock).mockResolvedValueOnce({
        gemini_api_key: 'AIzaTestKey123456789012345678901',
      });

      await manager.getApiKey();
      const key2 = await manager.getApiKey();

      expect(key2).toBe('AIzaTestKey123456789012345678901');
      // Should only call Chrome storage once due to caching
      expect(chrome.storage.sync.get).toHaveBeenCalledTimes(1);
    });

    it('should return empty string when no key is stored', async () => {
      (chrome.storage.sync.get as jest.Mock).mockResolvedValueOnce({});

      const key = await manager.getApiKey();
      expect(key).toBe('');
    });

    it('should return empty string on storage error', async () => {
      (chrome.storage.sync.get as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const key = await manager.getApiKey();
      expect(key).toBe('');
    });
  });

  describe('setApiKey', () => {
    it('should store a valid API key', async () => {
      (chrome.storage.sync.set as jest.Mock).mockResolvedValueOnce(undefined);

      await manager.setApiKey('AIzaTestKey123456789012345678901');

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        gemini_api_key: 'AIzaTestKey123456789012345678901',
      });
    });

    it('should reject invalid API key format (wrong prefix)', async () => {
      await expect(manager.setApiKey('InvalidKey123456789012345678901'))
        .rejects.toThrow('Invalid API key format');
    });

    it('should reject API key that is too short', async () => {
      await expect(manager.setApiKey('AIzaShort'))
        .rejects.toThrow('Invalid API key format');
    });

    it('should reject empty key', async () => {
      await expect(manager.setApiKey(''))
        .rejects.toThrow('Invalid API key format');
    });

    it('should throw on storage error', async () => {
      (chrome.storage.sync.set as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await expect(manager.setApiKey('AIzaTestKey123456789012345678901'))
        .rejects.toThrow('Failed to save API key');
    });

    it('should update cache after successful storage', async () => {
      (chrome.storage.sync.set as jest.Mock).mockResolvedValueOnce(undefined);

      await manager.setApiKey('AIzaTestKey123456789012345678901');

      // Subsequent getApiKey should use cache
      const key = await manager.getApiKey();
      expect(key).toBe('AIzaTestKey123456789012345678901');
      // get should not be called since cache was set
      expect(chrome.storage.sync.get).not.toHaveBeenCalled();
    });
  });

  describe('clearApiKey', () => {
    it('should remove key from storage and cache', async () => {
      (chrome.storage.sync.remove as jest.Mock).mockResolvedValueOnce(undefined);

      await manager.clearApiKey();

      expect(chrome.storage.sync.remove).toHaveBeenCalledWith(['gemini_api_key']);
    });
  });

  describe('hasApiKey', () => {
    it('should return true when key exists', async () => {
      (chrome.storage.sync.get as jest.Mock).mockResolvedValueOnce({
        gemini_api_key: 'AIzaTestKey123456789012345678901',
      });

      const has = await manager.hasApiKey();
      expect(has).toBe(true);
    });

    it('should return false when no key exists', async () => {
      (chrome.storage.sync.get as jest.Mock).mockResolvedValueOnce({});

      const has = await manager.hasApiKey();
      expect(has).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should force re-fetch from storage on next getApiKey', async () => {
      (chrome.storage.sync.get as jest.Mock)
        .mockResolvedValueOnce({ gemini_api_key: 'AIzaKey1_________________________' })
        .mockResolvedValueOnce({ gemini_api_key: 'AIzaKey2_________________________' });

      await manager.getApiKey();
      manager.clearCache();
      const key = await manager.getApiKey();

      expect(key).toBe('AIzaKey2_________________________');
      expect(chrome.storage.sync.get).toHaveBeenCalledTimes(2);
    });
  });
});
