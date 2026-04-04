import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: light;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    min-height: 100%;
    background-color: ${({ theme }) => theme.colors.bg};
    background:
      radial-gradient(circle at top left, rgba(77, 123, 255, 0.16), transparent 28%),
      radial-gradient(circle at 88% 12%, rgba(31, 79, 143, 0.12), transparent 24%),
      linear-gradient(180deg, #f9fbff 0%, #eef4ff 48%, #e7eef9 100%);
    color: ${({ theme }) => theme.colors.text};
    font-family: var(--font-ui), "Segoe UI", sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  body {
    min-height: 100vh;
    overflow-x: hidden;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ::selection {
    background: rgba(77, 123, 255, 0.22);
    color: ${({ theme }) => theme.colors.text};
  }

  button,
  input,
  textarea {
    font: inherit;
  }
`;

export default GlobalStyles;
