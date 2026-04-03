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
    background:
      radial-gradient(circle at top, rgba(0, 95, 115, 0.12), transparent 35%),
      linear-gradient(180deg, #f8fbff 0%, #eef4f7 100%);
    color: ${({ theme }) => theme.colors.text};
    font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  }

  body {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  textarea {
    font: inherit;
  }
`;

export default GlobalStyles;
