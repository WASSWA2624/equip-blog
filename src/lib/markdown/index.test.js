import { describe, expect, it } from "vitest";

import {
  buildHtmlFromStructuredArticle,
  buildMarkdownFromStructuredArticle,
} from "./index";

describe("markdown rendering", () => {
  it("strips unsafe manual and reference URLs from rendered artifacts", () => {
    const article = {
      excerpt: "Microscope excerpt",
      sections: [
        {
          id: "manuals_and_technical_documents",
          items: [
            {
              title: "Unsafe manual",
              url: "javascript:alert(1)",
            },
            {
              title: "Safe manual",
              url: "https://example.com/manual.pdf",
            },
          ],
          kind: "manuals",
          title: "Manuals",
        },
        {
          id: "references",
          items: [
            {
              title: "Unsafe reference",
              url: "javascript:alert(1)",
            },
            {
              title: "Safe reference",
              url: "https://example.com/reference",
            },
          ],
          kind: "references",
          title: "References",
        },
      ],
      title: "Microscope",
    };

    const markdown = buildMarkdownFromStructuredArticle(article);
    const html = buildHtmlFromStructuredArticle(article);

    expect(markdown).not.toContain("javascript:");
    expect(markdown).toContain("[Safe manual](https://example.com/manual.pdf)");
    expect(markdown).toContain("Unsafe reference");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://example.com/manual.pdf"');
    expect(html).toContain(">Unsafe reference<");
  });
});
