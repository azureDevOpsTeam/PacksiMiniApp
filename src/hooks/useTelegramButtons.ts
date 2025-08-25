import { useEffect, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { useTelegram } from './useTelegram';

interface TelegramButtonsConfig {
  mainButton?: {
    text: string;
    onClick: () => void;
    isVisible?: boolean;
    isEnabled?: boolean;
    isLoading?: boolean;
    color?: string;
    textColor?: string;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
    isVisible?: boolean;
    isEnabled?: boolean;
    position?: 'left' | 'right' | 'top' | 'bottom';
  };
}

export const useTelegramButtons = (config: TelegramButtonsConfig) => {
  const { isReady } = useTelegram();

  const setupMainButton = useCallback(() => {
    if (!isReady || !config.mainButton) return;

    const { text, onClick, isVisible = true, isEnabled = true, isLoading = false, color, textColor } = config.mainButton;

    // Set button text
    WebApp.MainButton.setText(text);

    // Set button colors if provided
    if (color) {
      WebApp.MainButton.setParams({ color });
    }
    if (textColor) {
      WebApp.MainButton.setParams({ text_color: textColor });
    }

    // Handle loading state
    if (isLoading) {
      WebApp.MainButton.showProgress();
    } else {
      WebApp.MainButton.hideProgress();
    }

    // Set enabled/disabled state
    if (isEnabled && !isLoading) {
      WebApp.MainButton.enable();
    } else {
      WebApp.MainButton.disable();
    }

    // Show/hide button
    if (isVisible) {
      WebApp.MainButton.show();
    } else {
      WebApp.MainButton.hide();
    }

    // Set click handler
    WebApp.MainButton.onClick(onClick);

    return () => {
      WebApp.MainButton.offClick(onClick);
    };
  }, [isReady, config.mainButton]);

  const setupSecondaryButton = useCallback(() => {
    if (!isReady || !config.secondaryButton) return;

    const { text, onClick, isVisible = true, isEnabled = true, position = 'left' } = config.secondaryButton;

    // Set button text
    WebApp.SecondaryButton.setText(text);

    // Set button position
    WebApp.SecondaryButton.setParams({ position });

    // Set enabled/disabled state
    if (isEnabled) {
      WebApp.SecondaryButton.enable();
    } else {
      WebApp.SecondaryButton.disable();
    }

    // Show/hide button
    if (isVisible) {
      WebApp.SecondaryButton.show();
    } else {
      WebApp.SecondaryButton.hide();
    }

    // Set click handler
    WebApp.SecondaryButton.onClick(onClick);

    return () => {
      WebApp.SecondaryButton.offClick(onClick);
    };
  }, [isReady, config.secondaryButton]);

  useEffect(() => {
    const cleanupMain = setupMainButton();
    const cleanupSecondary = setupSecondaryButton();

    return () => {
      cleanupMain?.();
      cleanupSecondary?.();
      // Hide buttons when component unmounts
      WebApp.MainButton.hide();
      WebApp.SecondaryButton.hide();
    };
  }, [setupMainButton, setupSecondaryButton]);

  const updateMainButton = useCallback((updates?: Partial<TelegramButtonsConfig['mainButton']>) => {
    if (!isReady || !config.mainButton || !updates) return;

    const updatedConfig = { ...config.mainButton, ...updates };
    
    // Debounce updates to prevent rapid show/hide on iOS
    const timeoutId = setTimeout(() => {
      if (updates.text) {
        WebApp.MainButton.setText(updates.text);
      }
      
      if (updates.isLoading !== undefined) {
        if (updates.isLoading) {
          WebApp.MainButton.showProgress();
        } else {
          WebApp.MainButton.hideProgress();
        }
      }
      
      if (updates.isEnabled !== undefined) {
        if (updates.isEnabled && !updatedConfig.isLoading) {
          WebApp.MainButton.enable();
        } else {
          WebApp.MainButton.disable();
        }
      }
      
      if (updates.isVisible !== undefined) {
        if (updates.isVisible) {
          WebApp.MainButton.show();
        } else {
          WebApp.MainButton.hide();
        }
      }
    }, 100); // 100ms debounce for iOS

    return () => clearTimeout(timeoutId);
  }, [isReady, config.mainButton]);

  const updateSecondaryButton = useCallback((updates?: Partial<TelegramButtonsConfig['secondaryButton']>) => {
    if (!isReady || !config.secondaryButton || !updates) return;

    if (updates.text) {
      WebApp.SecondaryButton.setText(updates.text);
    }
    
    if (updates.isEnabled !== undefined) {
      if (updates.isEnabled) {
        WebApp.SecondaryButton.enable();
      } else {
        WebApp.SecondaryButton.disable();
      }
    }
    
    if (updates.isVisible !== undefined) {
      if (updates.isVisible) {
        WebApp.SecondaryButton.show();
      } else {
        WebApp.SecondaryButton.hide();
      }
    }
  }, [isReady, config.secondaryButton]);

  return {
    updateMainButton,
    updateSecondaryButton,
    hideButtons: () => {
      WebApp.MainButton.hide();
      WebApp.SecondaryButton.hide();
    },
    showButtons: () => {
      if (config.mainButton?.isVisible) WebApp.MainButton.show();
      if (config.secondaryButton?.isVisible) WebApp.SecondaryButton.show();
    }
  };
};