import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../hooks/useLanguage';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

// Simple fade animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 480px) {
    max-height: 85vh;
    margin: 8px;
  }
`;

// Compact header
const ModalHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  text-align: center;
  position: relative;
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  font-family: 'IRANSansX', sans-serif;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const HeaderIcon = styled.span`
  font-size: 18px;
`;

// Scrollable content area
const ModalContent = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #e2e8f0;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  
  h4 {
    color: #1e293b;
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
    font-family: 'IRANSansX', sans-serif;
  }
  
  p {
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    font-family: 'IRANSansX', sans-serif;
    text-align: justify;
  }
`;

// Fixed footer that stays at bottom
const ModalFooter = styled.div`
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const CheckboxWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

const Checkbox = styled.input`
  opacity: 0;
  position: absolute;
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
`;

const CheckboxCustom = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.$checked ? '#667eea' : '#cbd5e1'};
  border-radius: 4px;
  background: ${props => props.$checked ? '#667eea' : '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  ${props => props.$checked && `
    &::after {
      content: '✓';
      color: white;
      font-size: 12px;
      font-weight: bold;
      line-height: 1;
    }
  `}
`;

const CheckboxLabel = styled.label`
  font-size: 12px;
  color: #374151;
  font-family: 'IRANSansX', sans-serif;
  line-height: 1.4;
  cursor: pointer;
  flex: 1;
`;

const AcceptButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-family: 'IRANSansX', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: none;
  
  background: ${props => props.$disabled 
    ? '#e2e8f0' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  
  color: ${props => props.$disabled ? '#94a3b8' : 'white'};
  
  &:hover {
    ${props => !props.$disabled && `
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    `}
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onAccept }) => {
  const { language } = useLanguage();
  const [isAccepted, setIsAccepted] = useState(false);
  
  const handleAccept = () => {
    if (isAccepted) {
      onAccept();
    }
  };
  
  const isRTL = language === 'fa';
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContainer style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <ModalHeader>
          <ModalTitle>
            <HeaderIcon>📋</HeaderIcon>
            {isRTL ? 'قوانین و شرایط' : 'Terms & Conditions'}
          </ModalTitle>
        </ModalHeader>
        
        <ModalContent>
          <ContentSection>
            <h4>{isRTL ? '۱. حریم خصوصی' : '1. Privacy Policy'}</h4>
            <p>
              {isRTL
                ? 'ما متعهد به حفاظت از اطلاعات شخصی شما هستیم. اطلاعات شما به صورت رمزگذاری شده ذخیره می‌شود و هیچ‌گاه با اشخاص ثالث به اشتراک گذاشته نمی‌شود.'
                : 'We are committed to protecting your personal information. Your data is stored encrypted and never shared with third parties.'
              }
            </p>
          </ContentSection>
          
          <ContentSection>
            <h4>{isRTL ? '۲. شرایط استفاده' : '2. Terms of Use'}</h4>
            <p>
              {isRTL
                ? 'با استفاده از این سرویس، شما موافقت می‌کنید که از آن به صورت قانونی و مطابق با قوانین کشور استفاده کنید. هرگونه سوء استفاده منجر به تعلیق حساب کاربری خواهد شد.'
                : 'By using this service, you agree to use it legally and in accordance with the laws of your country. Any misuse will result in account suspension.'
              }
            </p>
          </ContentSection>
          
          <ContentSection>
            <h4>{isRTL ? '۳. مسئولیت‌ها' : '3. Responsibilities'}</h4>
            <p>
              {isRTL
                ? 'شما مسئول صحت اطلاعات ارائه شده هستید و ما متعهد به ارائه بهترین خدمات هستیم. در صورت بروز مشکل، پشتیبانی در دسترس است.'
                : 'You are responsible for the accuracy of provided information and we are committed to providing the best services. Support is available for any issues.'
              }
            </p>
          </ContentSection>
          
          <ContentSection>
            <h4>{isRTL ? '۴. تغییرات' : '4. Changes'}</h4>
            <p>
              {isRTL
                ? 'ما حق تغییر این قوانین را محفوظ می‌داریم. تغییرات از طریق اپلیکیشن اطلاع‌رسانی خواهد شد.'
                : 'We reserve the right to modify these terms. Changes will be communicated through the application.'
              }
            </p>
          </ContentSection>
        </ModalContent>
        
        <ModalFooter>
          <CheckboxContainer>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="accept-terms"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
              />
              <CheckboxCustom $checked={isAccepted} />
            </CheckboxWrapper>
            <CheckboxLabel htmlFor="accept-terms">
              {isRTL ? 'تمام قوانین و شرایط را مطالعه کرده‌ام و می‌پذیرم' : 'I have read and accept all terms and conditions'}
            </CheckboxLabel>
          </CheckboxContainer>
          
          <AcceptButton
            $disabled={!isAccepted}
            onClick={handleAccept}
          >
            {isRTL ? 'قبول و ادامه' : 'Accept & Continue'}
          </AcceptButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TermsOfServiceModal;