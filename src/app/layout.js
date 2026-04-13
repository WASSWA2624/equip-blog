import { Manrope, Newsreader } from "next/font/google";

import AppProviders from "@/components/common/app-providers";
import { env } from "@/lib/env/server";
import { buildAbsoluteUrl } from "@/lib/seo";
import StyledRegistry from "@/styles/styled-registry";

const uiFont = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ui",
});

const editorialFont = Newsreader({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-editorial",
});

export const metadata = {
  applicationName: "Equip Blog",
  title: {
    default: "Equip Blog | Medical Equipment Guides",
    template: "%s | Equip Blog",
  },
  description:
    "Evidence-led medical equipment guides, manufacturer context, and editorially reviewed troubleshooting references.",
  icons: {
    icon: [{ type: "image/svg+xml", url: "/favicon.svg" }],
    shortcut: ["/favicon.svg"],
    apple: [{ type: "image/svg+xml", url: "/favicon.svg" }],
  },
  metadataBase: new URL(env.app.url),
  openGraph: {
    description:
      "Evidence-led medical equipment guides, manufacturer context, and editorially reviewed troubleshooting references.",
    images: [
      {
        alt: "Equip Blog medical equipment knowledge base",
        url: buildAbsoluteUrl("/opengraph-image"),
      },
    ],
    siteName: "Equip Blog",
    title: "Equip Blog | Medical Equipment Guides",
    type: "website",
    url: env.app.url,
  },
  robots: {
    follow: true,
    index: true,
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Evidence-led medical equipment guides, manufacturer context, and editorially reviewed troubleshooting references.",
    images: [buildAbsoluteUrl("/twitter-image")],
    title: "Equip Blog | Medical Equipment Guides",
  },
};

export const viewport = {
  themeColor: "#e8f1ff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${uiFont.variable} ${editorialFont.variable}`}>
        <StyledRegistry>
          <AppProviders>{children}</AppProviders>
        </StyledRegistry>
      </body>
    </html>
  );
}
