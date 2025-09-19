// Secure API Key Management Service
// Handles secure storage and retrieval of API keys using Chrome storage

export class SecureKeyManager {
  private static instance: SecureKeyManager;
  private cachedApiKey: string | null = null;
  
  private constructor() {}
  
  static getInstance(): SecureKeyManager {
    if (!SecureKeyManager.instance) {
      SecureKeyManager.instance = new SecureKeyManager();
    }
    return SecureKeyManager.instance;
  }
  
  /**
   * Get API key from secure Chrome storage
   */
  async getApiKey(): Promise<string> {
    if (this.cachedApiKey) {
      return this.cachedApiKey;
    }
    
    try {
      const result = await chrome.storage.sync.get(['gemini_api_key']);
      this.cachedApiKey = result.gemini_api_key || '';
      return this.cachedApiKey;
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return '';
    }
  }
  
  /**
   * Set API key in secure Chrome storage
   */
  async setApiKey(key: string): Promise<void> {
    if (!key || !this.isValidApiKey(key)) {
      throw new Error('Invalid API key format');
    }
    
    try {
      await chrome.storage.sync.set({ gemini_api_key: key });
      this.cachedApiKey = key;
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to save API key');
    }
  }
  
  /**
   * Remove API key from storage
   */
  async clearApiKey(): Promise<void> {
    try {
      await chrome.storage.sync.remove(['gemini_api_key']);
      this.cachedApiKey = null;
    } catch (error) {
      console.error('Failed to clear API key:', error);
    }
  }
  
  /**
   * Check if API key is configured
   */
  async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key.length > 0;
  }
  
  /**
   * Validate API key format
   */
  private isValidApiKey(key: string): boolean {
    // Basic validation for Google API key format
    return key.startsWith('AIza') && key.length > 30;
  }
  
  /**
   * Clear cached API key (useful for logout/reset)
   */
  clearCache(): void {
    this.cachedApiKey = null;
  }
}