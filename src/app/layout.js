import AppProviders from "@/components/common/app-providers";
import { env } from "@/lib/env/server";
import StyledRegistry from "@/styles/styled-registry";

export const metadata = {
  title: {
    default: "Equip Blog",
    template: "%s | Equip Blog",
  },
  description:
    "Locale-ready scaffold for the Equip Blog public site and admin workspace.",
  metadataBase: new URL(env.app.url),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StyledRegistry>
          <AppProviders>{children}</AppProviders>
        </StyledRegistry>
      </body>
    </html>
  );
}
