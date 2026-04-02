import { describe, expect, it } from "vitest";

import { defaultLocale, getLocaleDefinition, supportedLocales } from "./config";

describe("locale scaffold", () => {
  it("registers english for Release 1", () => {
    expect(supportedLocales).toContain("en");
    expect(getLocaleDefinition("en")).toMatchObject({
      label: "English",
    });
  });

  it("keeps the default locale within the supported registry", () => {
    expect(supportedLocales).toContain(defaultLocale);
  });
});
