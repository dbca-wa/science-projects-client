// Basic storage configuration for SPMS
export const STORAGE_CONFIG = {
  SECURITY: {
    ENCRYPTION_KEY: null,
    ENCRYPT_SENSITIVE_DATA: false,
  },
  CLEANUP: {
    ENABLED: false,
    INTERVAL: 60000, // 1 minute
    EXPIRED_CLEANUP: false,
    SIZE_LIMIT_CLEANUP: false,
  },
  STORAGE_TYPES: {
    LOCAL: {
      PREFIX: "spms_",
      MAX_SIZE: 5 * 1024 * 1024, // 5MB
      ENCRYPTION: false,
    },
    SESSION: {
      PREFIX: "spms_session_",
      ENCRYPTION: false,
    },
  },
  MIGRATION: {
    CURRENT_VERSION: "1.0.0",
    AUTO_MIGRATE: false,
  },
  KEYS: {
    THEME: "theme",
  },
  TTL: {
    THEME_SETTINGS: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
};