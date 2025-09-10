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
    /* iOS specific fixes */
    margin: 0;
    width: 100%;
    min-height: 100vh;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-text-size-adjust: none;
  }

  #root {
    min-height: 100vh;
    width: 100%;
    /* iOS specific fixes */
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
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

  /* Focus styles - Remove outline */
  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }

  /* Remove default button styles */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  /* Remove default input styles and fix iOS issues */
  input,
  textarea,
  select {
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 0;
    -webkit-text-size-adjust: 100%;
    -webkit-user-select: text;
    user-select: text;
  }

  /* Fix iOS input focus issues */
  input:focus,
  textarea:focus,
  select:focus {
    -webkit-tap-highlight-color: transparent;
    transform: translateZ(0); /* Force hardware acceleration */
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

  /* iOS specific fixes */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  /* Prevent horizontal scrolling on all elements */
  * {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Fix for iOS input zoom */
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  input[type="tel"],
  input[type="url"],
  input[type="search"],
  input[type="date"],
  input[type="datetime-local"],
  input[type="time"],
  textarea,
  select {
    font-size: 16px !important;
    -webkit-appearance: none;
    border-radius: 0;
  }

  /* Prevent iOS bounce effect */
  html,
  body {
    overscroll-behavior: none;
    -webkit-overscroll-behavior: none;
  }

  /* Fix for iOS Safari viewport */
  @supports (-webkit-touch-callout: none) {
    body {
      height: -webkit-fill-available;
    }
    
    #root {
      height: -webkit-fill-available;
    }
  }
`;