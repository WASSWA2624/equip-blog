import { defaultLocale, supportedLocales } from "@/features/i18n/config";

const publicPaths = [
  "",
  "/about",
  "/blog",
  "/contact",
  "/disclaimer",
  "/privacy",
  "/search",
];

export default function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  const localeUrls = supportedLocales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" && locale === defaultLocale ? 1 : 0.7,
    })),
  );

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...localeUrls,
  ];
}
