import { createContext } from 'react';
import type { TelegramContextType } from '../types/telegram';

export const TelegramContext = createContext<TelegramContextType | undefined>(undefined);