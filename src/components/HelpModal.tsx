import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../hooks/useLanguage';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          color: '#ffffff',
          fontFamily: 'IRANSansX, sans-serif',
          direction: language === 'fa' ? 'rtl' : 'ltr',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '20px' }}>❓</span>
            {t('helpModal.title')}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: '1',
            }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ lineHeight: '1.6' }}>
          <p>{t('helpModal.paragraph1')}</p>
          <p>{t('helpModal.paragraph2')}</p>
          <p>{t('helpModal.paragraph3')}</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HelpModal;