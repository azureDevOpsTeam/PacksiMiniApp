import React from 'react';
import styled from 'styled-components';
import { useSafeArea } from '../contexts/SafeAreaContext';

interface SafeAreaViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string;
  style?: React.CSSProperties;
}

interface StyledSafeAreaViewProps {
  $topPadding: number;
  $bottomPadding: number;
  $leftPadding: number;
  $rightPadding: number;
}

const StyledSafeAreaView = styled.div<StyledSafeAreaViewProps>`
  padding-top: ${({ $topPadding }) => `${$topPadding}px`};
  padding-bottom: ${({ $bottomPadding }) => `${$bottomPadding}px`};
  padding-left: ${({ $leftPadding }) => `${$leftPadding}px`};
  padding-right: ${({ $rightPadding }) => `${$rightPadding}px`};
  transition: padding 0.3s ease;
  
  /* Fallback for browsers that support env() */
  @supports (padding-top: env(safe-area-inset-top)) {
    padding-top: ${({ $topPadding }) => 
      $topPadding > 0 ? `max(${$topPadding}px, env(safe-area-inset-top))` : 'env(safe-area-inset-top)'
    };
    padding-bottom: ${({ $bottomPadding }) => 
      $bottomPadding > 0 ? `max(${$bottomPadding}px, env(safe-area-inset-bottom))` : 'env(safe-area-inset-bottom)'
    };
    padding-left: ${({ $leftPadding }) => 
      $leftPadding > 0 ? `max(${$leftPadding}px, env(safe-area-inset-left))` : 'env(safe-area-inset-left)'
    };
    padding-right: ${({ $rightPadding }) => 
      $rightPadding > 0 ? `max(${$rightPadding}px, env(safe-area-inset-right))` : 'env(safe-area-inset-right)'
    };
  }
`;

const SafeAreaView: React.FC<SafeAreaViewProps> = ({ 
  children, 
  edges = ['top', 'bottom', 'left', 'right'], 
  className,
  style 
}) => {
  const { insets, isReady } = useSafeArea();
  const { top, bottom, left, right } = insets;

  // Only apply padding for specified edges
  const topPadding = edges.includes('top') && isReady ? top : 0;
  const bottomPadding = edges.includes('bottom') && isReady ? bottom : 0;
  const leftPadding = edges.includes('left') && isReady ? left : 0;
  const rightPadding = edges.includes('right') && isReady ? right : 0;

  return (
    <StyledSafeAreaView
      className={className}
      style={style}
      $topPadding={topPadding}
      $bottomPadding={bottomPadding}
      $leftPadding={leftPadding}
      $rightPadding={rightPadding}
    >
      {children}
    </StyledSafeAreaView>
  );
};

export default SafeAreaView;
export type { SafeAreaViewProps };