import { createGlobalStyle } from 'styled-components';
import './fonts.css';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background};
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  #root {
    min-height: 100vh;
    width: 100%;
  }

  /* Telegram WebApp specific styles */
  .tg-viewport {
    height: 100vh;
    overflow: hidden;
  }

  /* Custom scrollbar for webkit browsers */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.text.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.primary};
  }

  /* Focus styles */
  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Remove default button styles */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  /* Remove default input styles */
  input,
  textarea,
  select {
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  /* RTL support for Persian */
  [dir="rtl"] {
    direction: rtl;
    text-align: right;
  }

  [dir="ltr"] {
    direction: ltr;
    text-align: left;
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-left {
    text-align: left;
  }
`;