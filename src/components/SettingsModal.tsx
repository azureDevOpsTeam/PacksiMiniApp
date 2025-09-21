import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeButton: 'user' | 'admin';
  setActiveButton: (button: 'user' | 'admin') => void;
}

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: ${({ $isOpen }) => $isOpen ? fadeIn : fadeOut} 0.3s ease-in-out;
  pointer-events: ${({ $isOpen }) => $isOpen ? 'auto' : 'none'};
  direction: ltr;
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background: #17212b;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  margin: 0 auto;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${({ $isOpen }) => $isOpen ? slideUp : slideDown} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ theme }) => theme.colors.background === '#1b2026' && `
    background: #1e252b;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  `}
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-family: 'IRANSansX', sans-serif;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SettingsSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px 0;
  font-family: 'IRANSansX', sans-serif;
`;

const ToggleContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
`;

const ToggleButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  font-family: 'IRANSansX', sans-serif;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  background: ${({ $isActive, theme }) => 
    $isActive 
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
      : 'transparent'
  };
  
  color: ${({ $isActive, theme }) => 
    $isActive ? '#ffffff' : theme.colors.text.secondary
  };
  
  box-shadow: ${({ $isActive }) => 
    $isActive ? '0 4px 12px rgba(80, 180, 255, 0.3)' : 'none'
  };
  
  &:hover {
    background: ${({ $isActive, theme }) => 
      $isActive 
        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
        : 'rgba(255, 255, 255, 0.05)'
    };
    transform: ${({ $isActive }) => $isActive ? 'none' : 'translateY(-1px)'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    opacity: ${({ $isActive }) => $isActive ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;



const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeButton,
  setActiveButton
}) => {
  const { theme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as 'fa' | 'en');
  };



  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} theme={theme} onClick={(e) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            {t('settings.title') || 'تنظیمات'}
          </ModalTitle>
          <CloseButton onClick={onClose} theme={theme}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>

        <SettingsSection>
          <SectionTitle theme={theme}>
            {t('settings.userType') || 'نوع کاربر'}
          </SectionTitle>
          <ToggleContainer theme={theme}>
            <ToggleButton
              $isActive={activeButton === 'user'}
              onClick={() => {
                setActiveButton('user');
                onClose();
              }}
              theme={theme}
            >
              {t('settings.user') || 'کاربر'}
            </ToggleButton>
            <ToggleButton
              $isActive={activeButton === 'admin'}
              onClick={() => {
                setActiveButton('admin');
                onClose();
              }}
              theme={theme}
            >
              {t('settings.admin') || 'ادمین'}
            </ToggleButton>
          </ToggleContainer>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle theme={theme}>
            {t('settings.language') || 'زبان'}
          </SectionTitle>
          <ToggleContainer>
            <ToggleButton
              $isActive={language === 'fa'}
              onClick={() => {
                handleLanguageChange({ target: { value: 'fa' } } as any);
                onClose();
              }}
              theme={theme}
            >
              فارسی
            </ToggleButton>
            <ToggleButton
              $isActive={language === 'en'}
              onClick={() => {
                handleLanguageChange({ target: { value: 'en' } } as any);
                onClose();
              }}
              theme={theme}
            >
              English
            </ToggleButton>
          </ToggleContainer>
        </SettingsSection>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SettingsModal;