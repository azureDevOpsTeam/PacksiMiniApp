import type { WebApp, WebAppInitData, WebAppUser } from '@twa-dev/types';

// Extend the global Window interface to include Telegram
declare global {
  interface Window {
    Telegram: {
      WebApp: WebApp;
    };
  }
}

// Custom types for our app
export interface TelegramUser extends WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData extends WebAppInitData {
  user?: TelegramUser;
  chat_type?: "group" | "supergroup" | "channel" | "sender" | "private";
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface TelegramContextType {
  webApp: WebApp | null;
  user: TelegramUser | null;
  initData: TelegramInitData | null;
  isReady: boolean;
  theme: 'light' | 'dark';
}

export type ThemeParams = {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
};