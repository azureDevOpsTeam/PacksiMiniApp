import React from 'react';
import styled from 'styled-components';
import TabBar from './TabBar';
import type { TabItem } from './TabBar';

interface AppLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
  tabItems: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
`;

const ContentArea = styled.div<{ $hasTabBar: boolean }>`
  flex: 1;
  padding-bottom: ${({ $hasTabBar }) => $hasTabBar ? '100px' : '0'};
  overflow-y: auto;
`;

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showTabBar = true,
  tabItems,
  activeTab,
  onTabChange
}) => {
  return (
    <LayoutContainer>
      <ContentArea $hasTabBar={showTabBar}>
        {children}
      </ContentArea>
      
      {showTabBar && (
        <TabBar
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </LayoutContainer>
  );
};

export default AppLayout;