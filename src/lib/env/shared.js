import { parseSharedEnv } from "@/lib/env/runtime";

const sharedEnvSource = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  DEFAULT_LOCALE: process.env.DEFAULT_LOCALE,
  NEXT_PUBLIC_WHATSAPP_ADVERT_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_ADVERT_NUMBER,
  SUPPORTED_LOCALES: process.env.SUPPORTED_LOCALES,
};

export const sharedEnv = parseSharedEnv(sharedEnvSource);
