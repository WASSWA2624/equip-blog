import { redirect } from "next/navigation";

import { defaultLocale } from "@/features/i18n/config";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
