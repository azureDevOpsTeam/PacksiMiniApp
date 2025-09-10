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



const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 30, 60, 0.9) 100%);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalContainer = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(240, 248, 255, 0.98) 50%, 
    rgba(230, 240, 255, 0.95) 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 50%, 
    #f093fb 100%);
  color: white;
  padding: 16px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent);
    animation: ${shimmer} 3s infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.6), 
      transparent);
  }
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  font-family: 'IRANSansX', sans-serif;
  margin: 0;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 255, 255, 0.3);
  background: linear-gradient(45deg, #ffffff, #f0f8ff, #ffffff);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 2s infinite;
  position: relative;
  z-index: 1;
`;

const HeaderIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  display: inline-block;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const ModalContent = styled.div`
  padding: 16px 24px;
  height: 450px;
  overflow-y: auto;
  position: relative;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(240, 248, 255, 0.05) 100%);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(102, 126, 234, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 3px;
    
    &:hover {
      background: linear-gradient(135deg, #764ba2, #f093fb);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(102, 126, 234, 0.3), 
      transparent);
  }
`;

const SlideContent = styled.div`
  font-size: 15px;
  line-height: 1.8;
  color: #4a5568;
  font-family: 'IRANSansX', sans-serif;
  text-align: justify;
  background: rgba(255, 255, 255, 0.7);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
  }
  
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
        content: '✨';
        position: absolute;
        right: -16px;
        top: 0;
        font-size: 12px;
      }
    }
  }
  
  strong {
    color: #667eea;
    font-weight: 700;
  }
`;



const ModalFooter = styled.div`
  padding: 28px 24px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(240, 248, 255, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(102, 126, 234, 0.4), 
      transparent);
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 14px 28px;
  border-radius: 16px;
  font-family: 'IRANSansX', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  min-width: 120px;
  position: relative;
  overflow: hidden;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    color: white;
    box-shadow: 
      0 6px 20px rgba(102, 126, 234, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.3), 
        transparent);
      transition: left 0.6s ease;
    }
    
    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 
        0 8px 25px rgba(102, 126, 234, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
      
      &::before {
        left: 100%;
      }
    }
    
    &:active {
      transform: translateY(-1px) scale(0.98);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
      
      &:hover {
        transform: none !important;
      }
    }
  ` : `
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9) 0%, 
      rgba(240, 248, 255, 0.9) 100%);
    color: #667eea;
    border: 2px solid rgba(102, 126, 234, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 1) 0%, 
        rgba(240, 248, 255, 1) 100%);
      border-color: rgba(102, 126, 234, 0.4);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(0) scale(0.98);
    }
  `}
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(240, 248, 255, 0.9) 100%);
  border-radius: 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(102, 126, 234, 0.4), 
      transparent);
  }
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
`;

const Checkbox = styled.input`
  width: 24px;
  height: 24px;
  opacity: 0;
  position: absolute;
  cursor: pointer;
  
  &:checked + label::before {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    border-color: #4CAF50;
    transform: scale(1.1);
  }
  
  &:checked + label::after {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
`;

const CheckboxLabel = styled.label`
  font-family: 'IRANSansX', sans-serif;
  font-size: 15px;
  color: #4a5568;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  position: relative;
  
  &::before {
    content: '';
    width: 24px;
    height: 24px;
    border: 2px solid #667eea;
    border-radius: 6px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9), 
      rgba(240, 248, 255, 0.9));
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
  }
  
  &::after {
    content: '✓';
    position: absolute;
    left: 7px;
    top: 50%;
    transform: translateY(-50%) scale(0) rotate(45deg);
    color: white;
    font-size: 14px;
    font-weight: bold;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover::before {
    border-color: #764ba2;
    box-shadow: 
      0 4px 8px rgba(102, 126, 234, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
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