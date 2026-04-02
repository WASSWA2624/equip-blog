import AppProviders from "@/components/common/app-providers";
import StyledRegistry from "@/styles/styled-registry";

export const metadata = {
  title: {
    default: "Equip Blog",
    template: "%s | Equip Blog",
  },
  description:
    "Locale-ready scaffold for the Equip Blog public site and admin workspace.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
