import { describe, expect, it } from "vitest";

import { buildWhatsAppContactHref, normalizeWhatsAppNumber } from "./whatsapp";

describe("WhatsApp contact helpers", () => {
  it("normalizes international phone numbers for wa.me links", () => {
    expect(normalizeWhatsAppNumber("+256 783 230321")).toBe("256783230321");
  });

  it("builds a wa.me href when the number is valid", () => {
    expect(buildWhatsAppContactHref("+256783230321", "Hello there")).toBe(
      "https://wa.me/256783230321?text=Hello+there",
    );
  });

  it("returns null when the number is missing or invalid", () => {
    expect(buildWhatsAppContactHref("")).toBeNull();
    expect(buildWhatsAppContactHref("1234")).toBeNull();
  });
});
