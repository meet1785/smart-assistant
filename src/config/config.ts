// Configuration file for production
// SECURITY: API keys are managed through secure Chrome storage, not hardcoded

export const config = {
  // Gemini API Configuration - NO HARDCODED KEYS
  GEMINI_API_KEY: '', // Managed through extension popup
  
  // API Endpoints (using latest Gemini 2.0 Flash model)
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  
  // Extension Settings
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1024,
  DEFAULT_TOP_K: 40,
  DEFAULT_TOP_P: 0.95,
  
  // Production flags (disabled for security)
  DEV_MODE: false,
  DEBUG_LOGGING: false
};