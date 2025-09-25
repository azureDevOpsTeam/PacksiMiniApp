import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { apiService } from '../services/apiService';

interface RequestContextType {
  requestCount: number;
  setRequestCount: (count: number) => void;
  refreshRequestCount: () => Promise<void>;
  isLoading: boolean;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

interface RequestProviderProps {
  children: ReactNode;
}

export const RequestProvider: React.FC<RequestProviderProps> = ({ children }) => {
  const [requestCount, setRequestCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshRequestCount = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getInProgressOffers();
      
      if (response?.requestStatus?.value === 0) {
        const myReciveOffers = response.objectResult?.myReciveOffers || [];
        const mySentOffers = response.objectResult?.mySentOffers || [];
        
        // Count total active requests (both received and sent offers)
        const totalCount = myReciveOffers.length + mySentOffers.length;
        setRequestCount(totalCount);
      } else {
        setRequestCount(0);
      }
    } catch (error) {
      console.error('Error fetching request count:', error);
      setRequestCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove initial load - let components call refreshRequestCount when needed

  const value: RequestContextType = {
    requestCount,
    setRequestCount,
    refreshRequestCount,
    isLoading
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequestContext = (): RequestContextType => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequestContext must be used within a RequestProvider');
  }
  return context;
};

export default RequestProvider;