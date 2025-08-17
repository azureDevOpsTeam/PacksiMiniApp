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

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as { standalone?: boolean }).standalone ||
        document.referrer.includes('android-app://');
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

    // Check if device is Android specifically
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS or mobile devices without beforeinstallprompt support
    // Also show for Android devices even if beforeinstallprompt doesn't fire
    let timer: number;
    if ((ios || isMobile) && !standalone) {
      timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, ios ? 5000 : (isAndroid ? 6000 : 4000)); // 5s for iOS, 6s for Android, 4s for other mobile
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
      // Android/Chrome installation with beforeinstallprompt
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
    } else {
      // Android or other mobile browsers without beforeinstallprompt
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        alert(t('installPrompt.androidInstructions', 'برای نصب این اپلیکیشن، روی منوی مرورگر (⋮) کلیک کرده و "Add to Home screen" یا "نصب اپلیکیشن" را انتخاب کنید.'));
      } else {
        alert(t('installPrompt.generalInstructions', 'برای نصب این اپلیکیشن، از منوی مرورگر گزینه "Add to Home screen" را انتخاب کنید.'));
      }
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
      backgroundColor: '#212a33',
      color: '#848d96',
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid #3a4a5c',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      fontFamily: 'IRANSansX, sans-serif',
      direction: 'rtl',
      opacity: '0.95'
    }}>
      <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#3a4a5c',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#b3e1ff'
          }}>
            📱
          </div>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ebf7ff'
          }}>
            {t('installPrompt.title', 'نصب اپلیکیشن')}
          </h4>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#848d96',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          ✕
        </button>
      </div>
      
      <p style={{
        margin: '0 0 8px 0',
        fontSize: '12px',
        lineHeight: '1.3',
        color: '#848d96'
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
            background: 'linear-gradient(to top, #242424 0%, #303030 100%)',
            border: '1px solid #3a4a5c',
            color: '#848d96',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'IRANSansX, sans-serif',
            boxShadow: 'inset 0 8px 2px -8px rgba(255,255,255,0.4), 0 8px 5px 0 rgba(0,0,0,0.3)'
          }}
        >
          {t('installPrompt.later', 'بعداً')}
        </button>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(to top, #151515 0%, #1d1d1d 100%)',
            border: '1px solid #3a4a5c',
            color: '#b3e1ff',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'IRANSansX, sans-serif',
            boxShadow: 'inset 0 16px 14px -21px transparent, 0 0px 13px 0 rgba(0,0,0,0.3), inset 0 0 7px 2px rgba(0,0,0,0.4)'
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