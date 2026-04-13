"use client";

import GlobalStyles from "@/app/globals";
import { lightTheme } from "@/styles/theme";
import { ThemeProvider } from "styled-components";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
