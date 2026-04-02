const fallbackDefaultLocale = "en";

export const localeRegistry = {
  en: {
    label: "English",
    loadMessages: () => import("@/messages/en.json"),
  },
};

export const supportedLocales = Object.keys(localeRegistry);

export const defaultLocale =
  supportedLocales.find((locale) => locale === process.env.DEFAULT_LOCALE) ||
  fallbackDefaultLocale;

export function getLocaleDefinition(locale) {
  return localeRegistry[locale] || null;
}

export function isSupportedLocale(locale) {
  return supportedLocales.includes(locale);
}
