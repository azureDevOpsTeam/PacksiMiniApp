import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../hooks/useLanguage';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

// Enhanced Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8) translateY(50px);
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    backdrop-filter: blur(10px);
  }
`;



// const float = keyframes`
//   0%, 100% {
//     transform: translateY(0px);
//   }
//   50% {
//     transform: translateY(-10px);
//   }
// `;

// const pulse = keyframes`
//   0%, 100% {
//     transform: scale(1);
//   }
//   50% {
//     transform: scale(1.05);
//   }
// `;

// const shimmer = keyframes`
//   0% {
//     background-position: -200% 0;
//   }
//   100% {
//     background-position: 200% 0;
//   }
// `;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} 0.4s ease-out;
`;

const ModalContainer = styled.div`
  background: #1e293b;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;
`;

const ModalHeader = styled.div`
  background: #0f172a;
  color: white;
  padding: 20px 24px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  font-family: 'IRANSansX', sans-serif;
  margin: 0;
  color: #ffffff;
  position: relative;
  z-index: 1;
`;

const HeaderIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: inline-block;
  position: relative;
  z-index: 1;
`;

const ModalContent = styled.div`
  padding: 20px 24px;
  height: 400px;
  overflow-y: auto;
  position: relative;
  background: #1e293b;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 2px;
    
    &:hover {
      background: #6b7280;
    }
  }
`;

const SlideContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #e2e8f0;
  font-family: 'IRANSansX', sans-serif;
  text-align: justify;
  background: #2d3748;
  padding: 16px;
  border-radius: 12px;
  position: relative;
  
  p {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul {
    text-align: right;
    padding-right: 20px;
    margin: 0;
    
    li {
      margin-bottom: 12px;
      position: relative;
      padding-right: 8px;
      
      &::before {
        content: '•';
        position: absolute;
        right: -16px;
        top: 0;
        font-size: 16px;
        color: #60a5fa;
      }
    }
  }
  
  strong {
    color: #60a5fa;
    font-weight: 600;
  }
`;



const ModalFooter = styled.div`
  padding: 20px 24px;
  background: #0f172a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'IRANSansX', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 120px;
  position: relative;
  
  ${props => props.$variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #64748b;
      transform: none !important;
    }
  ` : `
    background: #334155;
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: #475569;
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: #1e293b;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    background: #263548;
  }
`;

const Checkbox = styled.input`
  width: 24px;
  height: 24px;
  opacity: 0;
  position: absolute;
  cursor: pointer;
  
  &:checked + label::before {
    background: #3b82f6;
    border-color: #3b82f6;
  }
  
  &:checked + label::after {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
`;

const CheckboxLabel = styled.label`
  font-family: 'IRANSansX', sans-serif;
  font-size: 14px;
  color: #e2e8f0;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  position: relative;
  
  &::before {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid #4b5563;
    border-radius: 4px;
    background: #1e293b;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  
  &::after {
    content: '✓';
    position: absolute;
    left: 6px;
    top: 50%;
    transform: translateY(-50%) scale(0);
    color: white;
    font-size: 12px;
    font-weight: bold;
    opacity: 0;
    transition: all 0.2s ease;
  }
  
  &:hover::before {
    border-color: #3b82f6;
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
      <ModalContainer>
        <ModalHeader>
          <HeaderIcon>🛡️</HeaderIcon>
          <ModalTitle>
            {isRTL ? 'قوانین و شرایط استفاده' : 'Terms and Conditions'}
          </ModalTitle>
        </ModalHeader>
        
        <ModalContent>
          <SlideContent>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '12px', fontSize: '18px', fontWeight: '700' }}>
                {isRTL ? '۱. حریم خصوصی' : '1. Privacy Policy'}
              </h4>
              <p style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.6' }}>
                {isRTL
                  ? 'ما متعهد به حفاظت از اطلاعات شخصی شما هستیم. اطلاعات شما به صورت رمزگذاری شده ذخیره می‌شود و هیچ‌گاه با اشخاص ثالث به اشتراک گذاشته نمی‌شود.'
                  : 'We are committed to protecting your personal information. Your data is stored encrypted and never shared with third parties.'
                }
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '12px', fontSize: '18px', fontWeight: '700' }}>
                {isRTL ? '۲. قوانین استفاده' : '2. Usage Rules'}
              </h4>
              <p style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.6' }}>
                {isRTL
                  ? 'لطفاً از اطلاعات صحیح استفاده کنید، از ارسال محتوای نامناسب خودداری کنید و قوانین کشور را رعایت کنید. ارسال مواد خطرناک، غیرقانونی یا ممنوع اکیداً ممنوع است.'
                  : 'Please use accurate information, refrain from inappropriate content, and comply with national laws. Sending dangerous, illegal or prohibited materials is strictly forbidden.'
                }
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '12px', fontSize: '18px', fontWeight: '700' }}>
                {isRTL ? '۳. مسئولیت‌ها' : '3. Responsibilities'}
              </h4>
              <p style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.6' }}>
                {isRTL
                  ? 'شما مسئول صحت اطلاعات ارائه شده هستید و ما متعهد به ارائه بهترین خدمات هستیم. در صورت بروز مشکل، پشتیبانی در دسترس است.'
                  : 'You are responsible for the accuracy of provided information and we are committed to providing the best services. Support is available for any issues.'
                }
              </p>
            </div>
            
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="accept-terms"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
              />
              <CheckboxLabel htmlFor="accept-terms">
                {isRTL ? 'تمام قوانین و شرایط را مطالعه کرده‌ام و می‌پذیرم' : 'I have read and accept all terms and conditions'}
              </CheckboxLabel>
            </CheckboxContainer>
          </SlideContent>
        </ModalContent>
        
        <ModalFooter>
          <Button
            $variant="primary"
            onClick={handleAccept}
            disabled={!isAccepted}
            style={{ width: '100%' }}
          >
            {isRTL ? 'قبول و ادامه' : 'Accept & Continue'}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TermsOfServiceModal;