import { defaultLocale, supportedLocales } from "@/features/i18n/config";
import { buildCanonicalPath, publicStaticRoutes } from "@/features/i18n/routing";
import { env } from "@/lib/env/server";

export default function sitemap() {
  const baseUrl = env.app.url;

  const localeUrls = supportedLocales.flatMap((locale) =>
    publicStaticRoutes.map((route) => ({
      url: `${baseUrl}${buildCanonicalPath(locale, route.segments)}`,
      changeFrequency: route.key === "home" ? "weekly" : "monthly",
      priority: route.key === "home" && locale === defaultLocale ? 1 : 0.7,
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
