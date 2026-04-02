"use client";

import { ThemeProvider } from "styled-components";

import GlobalStyles from "@/app/globals";
import StoreProvider from "@/store/provider";
import { lightTheme } from "@/styles/theme";

export default function AppProviders({ children }) {
  return (
    <StoreProvider>
      <ThemeProvider theme={lightTheme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </StoreProvider>
  );
}
