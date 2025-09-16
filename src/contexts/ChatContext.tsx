import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/apiService';

interface ChatContextType {
  chatCount: number;
  setChatCount: (count: number) => void;
  refreshChatCount: () => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chatCount, setChatCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshChatCount = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getLiveChatUsers();
      
      if (response?.requestStatus?.value === 0) {
        const users = response.objectResult || [];
        setChatCount(users.length);
      } else {
        setChatCount(0);
      }
    } catch (error) {
      console.error('Error fetching chat count:', error);
      setChatCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshChatCount();
  }, []);

  const value: ChatContextType = {
    chatCount,
    setChatCount,
    refreshChatCount,
    isLoading
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatProvider;