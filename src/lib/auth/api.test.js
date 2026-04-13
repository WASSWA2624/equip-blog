import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createBaseEnv() {
  return {
    DATABASE_URL: "mysql://user:password@localhost:3306/med_blog",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    DEFAULT_LOCALE: "en",
    SUPPORTED_LOCALES: "en",
    SESSION_SECRET: "change-me",
    SESSION_MAX_AGE_SECONDS: "28800",
    AI_PROVIDER_DEFAULT: "openai",
    AI_MODEL_DEFAULT: "gpt-5.4",
    AI_PROVIDER_FALLBACK: "openai",
    AI_MODEL_FALLBACK: "gpt-5.4-mini",
    OPENAI_API_KEY: "test-openai-key",
    MEDIA_DRIVER: "local",
    LOCAL_MEDIA_BASE_PATH: "public/uploads",
    LOCAL_MEDIA_BASE_URL: "/uploads",
    S3_MEDIA_BUCKET: "",
    S3_MEDIA_REGION: "",
    S3_MEDIA_BASE_URL: "",
    S3_ACCESS_KEY_ID: "",
    S3_SECRET_ACCESS_KEY: "",
    ADMIN_SEED_EMAIL: "admin@example.com",
    ADMIN_SEED_PASSWORD: "strong-password",
    COMMENT_RATE_LIMIT_WINDOW_MS: "60000",
    COMMENT_RATE_LIMIT_MAX: "5",
    COMMENT_CAPTCHA_ENABLED: "false",
    COMMENT_CAPTCHA_SECRET: "",
    UPLOAD_ALLOWED_MIME_TYPES: "image/jpeg,image/png,image/webp",
    REVALIDATE_SECRET: "change-me",
    CRON_SECRET: "change-me",
  };
}

const originalEnv = process.env;

describe("auth api responses", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      ...createBaseEnv(),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 503 when admin login storage is unavailable", async () => {
    vi.doMock("./index", () => ({
      authenticateAdminCredentials: vi.fn().mockResolvedValue({
        status: "auth_unavailable",
        success: false,
      }),
      buildLoginSuccessPayload: vi.fn(),
      buildLogoutSuccessPayload: vi.fn(),
      invalidateAdminSession: vi.fn(),
      validateRequestAdminSession: vi.fn(),
    }));

    const { createLoginResponse } = await import("./api");
    const response = await createLoginResponse({
      email: "admin@example.com",
      password: "admin",
      userAgent: "vitest",
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      message:
        "Admin authentication is temporarily unavailable. Apply the latest database migrations and try again.",
      status: "auth_unavailable",
      success: false,
    });
  });

  it("returns 503 for protected APIs when auth storage is unavailable", async () => {
    vi.doMock("./index", () => ({
      authenticateAdminCredentials: vi.fn(),
      buildLoginSuccessPayload: vi.fn(),
      buildLogoutSuccessPayload: vi.fn(),
      invalidateAdminSession: vi.fn(),
      validateRequestAdminSession: vi.fn().mockResolvedValue({
        status: "auth_unavailable",
      }),
    }));

    const { requireAdminApiSession } = await import("./api");
    const result = await requireAdminApiSession({
      cookies: {
        get: vi.fn(),
      },
    });

    expect(result.response.status).toBe(503);
    expect(result.response.headers.get("set-cookie")).toBeNull();
    await expect(result.response.json()).resolves.toMatchObject({
      message:
        "Admin authentication is temporarily unavailable. Apply the latest database migrations and try again.",
      status: "auth_unavailable",
      success: false,
    });
  });
});
