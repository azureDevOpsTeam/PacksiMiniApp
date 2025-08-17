import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as { standalone?: boolean }).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
      setIsInstalled(standalone);
      return standalone;
    };

    // Check if device is iOS
    const checkIOS = () => {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
      setIsIOS(ios);
      return ios;
    };

    // Check if device is mobile (Android or iOS)
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const standalone = checkStandalone();
    const ios = checkIOS();
    const isMobile = checkMobile();

    // Don't show if already installed
    if (standalone) {
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after 3 seconds if not installed
      setTimeout(() => {
        if (!standalone) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS or mobile devices without beforeinstallprompt support
    let timer: NodeJS.Timeout;
    if ((ios || isMobile) && !standalone) {
      timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, ios ? 5000 : 4000); // 5s for iOS, 4s for other mobile
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome installation
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else if (isIOS) {
      // iOS installation instructions
      alert(t('installPrompt.iosInstructions', 'برای نصب این اپلیکیشن، روی دکمه Share در Safari کلیک کرده و "Add to Home Screen" را انتخاب کنید.'));
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed in this session
  if (isInstalled || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      backgroundColor: '#2196F3',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      fontFamily: 'IRANSansX, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'white',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#2196F3'
          }}>
            📱
          </div>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {t('installPrompt.title', 'نصب اپلیکیشن')}
          </h4>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>
      
      <p style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        lineHeight: '1.4',
        opacity: 0.9
      }}>
        {isIOS 
          ? t('installPrompt.messageIOS', 'برای دسترسی آسان‌تر، این اپلیکیشن را به صفحه اصلی خود اضافه کنید.')
          : t('installPrompt.message', 'برای تجربه بهتر، این اپلیکیشن را روی دستگاه خود نصب کنید.')
        }
      </p>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'IRANSansX, sans-serif'
          }}
        >
          {t('installPrompt.later', 'بعداً')}
        </button>
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: 'white',
            border: 'none',
            color: '#2196F3',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'IRANSansX, sans-serif'
          }}
        >
          {isIOS 
            ? t('installPrompt.howToInstall', 'نحوه نصب')
            : t('installPrompt.install', 'نصب')
          }
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;