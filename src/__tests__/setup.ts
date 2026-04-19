// Global test setup
// Sets required env vars for unit tests that access auth or AI modules.

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-at-least-32-characters-long";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/gem_test";
process.env.ANTHROPIC_API_KEY = "";
process.env.NEXT_PUBLIC_AI_DISCLOSURE_TEXT =
  "GEM Concierge is an AI assistant. Test disclosure text.";
