import { useSafeArea } from '../contexts/SafeAreaContext';
import type { SafeAreaInsets } from '../contexts/SafeAreaContext';

/**
 * Hook to get safe area insets directly
 * @returns SafeAreaInsets object
 */
export const useSafeAreaInsets = (): SafeAreaInsets => {
  const { insets } = useSafeArea();
  return insets;
};

/**
 * Hook to get specific safe area inset values
 * @returns Object with individual inset values and helper functions
 */
export const useSafeAreaValues = () => {
  const { insets, isReady } = useSafeArea();
  
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    isReady,
    
    // Helper functions
    getTopPadding: (additional = 0) => insets.top + additional,
    getBottomPadding: (additional = 0) => insets.bottom + additional,
    getLeftPadding: (additional = 0) => insets.left + additional,
    getRightPadding: (additional = 0) => insets.right + additional,
    
    // CSS string helpers
    getTopPaddingCSS: (additional = 0) => `${insets.top + additional}px`,
    getBottomPaddingCSS: (additional = 0) => `${insets.bottom + additional}px`,
    getLeftPaddingCSS: (additional = 0) => `${insets.left + additional}px`,
    getRightPaddingCSS: (additional = 0) => `${insets.right + additional}px`,
    
    // Combined padding helpers
    getHorizontalPadding: (additional = 0) => insets.left + insets.right + additional,
    getVerticalPadding: (additional = 0) => insets.top + insets.bottom + additional,
    
    // Check if device has safe areas
    hasTopInset: insets.top > 0,
    hasBottomInset: insets.bottom > 0,
    hasLeftInset: insets.left > 0,
    hasRightInset: insets.right > 0,
    hasSafeAreas: insets.top > 0 || insets.bottom > 0 || insets.left > 0 || insets.right > 0,
  };
};

export default useSafeArea;