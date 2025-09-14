import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import SafeAreaWrapper from './SafeAreaWrapper';



interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabBarContainer = styled.div<{ $bottomPadding: number }>`
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ $bottomPadding, theme }) => `calc(${theme.spacing.sm} + ${$bottomPadding}px)`};
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: padding-bottom 0.3s ease;
  
  ${({ theme }) => theme.colors.background === '#1b2026' && `
    background: rgba(27, 32, 38, 0.9);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  `}
`;

const TabBarContent = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xs};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  ${({ theme }) => theme.colors.background === '#1b2026' && `
    background: rgba(33, 42, 51, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  `}
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  background: ${({ $isActive, theme }) => 
    $isActive 
      ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
      : 'transparent'
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 60px;
  
  &:hover {
    background: ${({ $isActive, theme }) => 
      $isActive 
        ? `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.secondary}30)`
        : 'rgba(255, 255, 255, 0.05)'
    };
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${({ $isActive, theme }) => $isActive && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: ${theme.borderRadius.lg};
      background: linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15);
      border: 1px solid rgba(80, 180, 255, 0.3);
    }
  `}
`;

const TabIcon = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.primary : theme.colors.text.secondary
  };
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  
  svg {
    width: 20px;
    height: 20px;
    filter: ${({ $isActive }) => 
      $isActive ? 'drop-shadow(0 0 8px rgba(80, 180, 255, 0.4))' : 'none'
    };
  }
`;

const TabLabel = styled.span<{ $isActive: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ $isActive, theme }) => 
    $isActive ? theme.typography.fontWeight.bold : theme.typography.fontWeight.normal
  };
  color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.primary : theme.colors.text.secondary
  };
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  font-family: 'IRANSansX', sans-serif;
  text-align: center;
  line-height: 1.2;
`;

const ActiveIndicator = styled.div<{ $isActive: boolean }>`
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  opacity: ${({ $isActive }) => $isActive ? 1 : 0};
  transition: all 0.3s ease;
  box-shadow: 0 0 8px ${({ theme }) => theme.colors.primary};
`;

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange, className }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaWrapper>
      <TabBarContainer 
        className={className} 
        theme={theme}
        $bottomPadding={0}
      >
        <TabBarContent theme={theme}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TabButton
                key={tab.id}
                $isActive={isActive}
                onClick={() => onTabChange(tab.id)}
                theme={theme}
                aria-label={tab.label}
              >
                <ActiveIndicator $isActive={isActive} theme={theme} />
                <TabIcon $isActive={isActive} theme={theme}>
                  {tab.icon}
                </TabIcon>
                <TabLabel $isActive={isActive} theme={theme}>
                  {tab.label}
                </TabLabel>
              </TabButton>
            );
          })}
        </TabBarContent>
      </TabBarContainer>
    </SafeAreaWrapper>
  );
};

export default TabBar;
export type { TabItem, TabBarProps };