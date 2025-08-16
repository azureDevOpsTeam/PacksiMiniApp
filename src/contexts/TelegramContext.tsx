import React from 'react';
import type { ReactNode } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { TelegramContext } from './TelegramContextDefinition';

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const telegramData = useTelegram();

  return (
    <TelegramContext.Provider value={telegramData}>
      {children}
    </TelegramContext.Provider>
  );
};

export default TelegramProvider;