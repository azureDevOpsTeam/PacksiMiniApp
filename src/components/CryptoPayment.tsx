import React from 'react';
import QRCode from 'react-qr-code';
import { useLanguage } from '../hooks/useLanguage';

interface CryptoPaymentProps {
  walletAddress: string;
  amount: string | number;
  currency?: string; // e.g., USDT, BTC
  network?: 'TRC20' | 'BSC' | string;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ walletAddress, amount, currency = 'USDT', network: initialNetwork = 'TRC20' }) => {
  const { language } = useLanguage();
  const isRTL = language === 'fa';
  const [copied, setCopied] = React.useState<boolean>(false);
  const [network, setNetwork] = React.useState<string>(initialNetwork);
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(0);
  const expiresAtRef = React.useRef<number>(0);

  const badgeMarginProp = React.useMemo(() => (isRTL ? { marginRight: '8px' } : { marginLeft: '8px' }), [isRTL]);

  // accent color by network
  const accentColor = React.useMemo(() => {
    switch ((network || '').toUpperCase()) {
      case 'BSC':
        return '#f3ba2f';
      case 'ERC20':
        return '#627EEA';
      case 'TRC20':
      default:
        return '#ff3b3b';
    }
  }, [network]);

  // initialize or restore countdown based on localStorage, keyed by wallet+amount
  React.useEffect(() => {
    try {
      const sessionKey = `cryptoPayment:${walletAddress}:${amount}`;
      const stored = localStorage.getItem(sessionKey);
      let expiresAt = stored ? parseInt(stored, 10) : Date.now() + 20 * 60 * 1000;
      if (!stored) {
        localStorage.setItem(sessionKey, expiresAt.toString());
      }
      expiresAtRef.current = expiresAt;
      const initialRemaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(initialRemaining);
    } catch (_) {
      // if localStorage is unavailable, fall back to fresh 20 minutes
      const expiresAt = Date.now() + 20 * 60 * 1000;
      expiresAtRef.current = expiresAt;
      setRemainingSeconds(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    }
  }, [walletAddress, amount]);

  // countdown tick based on expiresAtRef (stable interval)
  React.useEffect(() => {
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAtRef.current - Date.now()) / 1000));
      setRemainingSeconds(remaining);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // fail silently
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#17212b',
      minHeight: '100vh',
    }}>


      {/* animations */}
      <style>
        {`
          @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 rgba(0,0,0,0); } 50% { box-shadow: 0 10px 30px rgba(80,180,255,0.15); } }
        `}
      </style>

      {/* QR Code with rotating ring */}
      <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '18px' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${accentColor} 0%, rgba(255,255,255,0.2) 25%, ${accentColor} 50%, rgba(255,255,255,0.2) 75%, ${accentColor} 100%)`,
          animation: 'spinRing 6s linear infinite',
          filter: 'drop-shadow(0 0 8px rgba(80,180,255,0.25))',
          WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 8px), black 0)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: '180px',
          height: '180px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'glowPulse 3s ease-in-out infinite'
        }}>
          <QRCode value={walletAddress} size={150} />
        </div>
      </div>

      {/* Timer */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '12px',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', color: '#50b4ff', fontFamily: 'IRANSansX, sans-serif', textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? 'زمان باقی‌مانده' : 'Time Remaining'}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: remainingSeconds > 0 ? '#ffffff' : '#ff6b6b', fontFamily: 'IRANSansX, sans-serif' }}>
            {remainingSeconds > 0 ? formatTime(remainingSeconds) : (isRTL ? 'پایان' : 'Expired')}
          </div>
        </div>
        <div style={{ marginTop: '8px', height: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.max(0, (remainingSeconds / (20 * 60)) * 100)}%`, height: '100%', background: accentColor, transition: 'width 0.5s linear' }} />
        </div>
      </div>

      {/* Wallet Address */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#212a33',
        border: '1px solid #3a4a5c',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#50b4ff',
          marginBottom: '8px',
          fontFamily: 'IRANSansX, sans-serif',
          textAlign: isRTL ? 'right' : 'left'
        }}>آدرس ولت</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{
            flex: 1,
            color: '#ffffff',
            fontSize: '12px',
            fontFamily: 'IRANSansX, sans-serif',
            wordBreak: 'break-all',
            textAlign: isRTL ? 'right' : 'left'
          }}>{walletAddress}</div>
          <button
            onClick={handleCopy}
            aria-label="Copy wallet address"
            style={{
              background: 'none',
              border: '1px solid #848d96',
              color: '#848d96',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px'
            }}
          >{copied ? 'کپی شد' : 'کپی'}</button>
        </div>
      </div>

      {/* Payment Info: Amount + Currency + Network badge */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        marginBottom: '12px',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`,
          border: `1px solid ${accentColor}55`,
          borderRadius: '12px',
          padding: '14px',
          boxShadow: `0 10px 24px ${accentColor}22`,
        }}>
          <div style={{
            fontSize: '12px',
            color: '#dbeafe',
            marginBottom: '6px',
            fontFamily: 'IRANSansX, sans-serif',
            textAlign: isRTL ? 'right' : 'left'
          }}>{isRTL ? 'مبلغ قابل پرداخت' : 'Amount to Pay'}</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{
              color: '#ffffff',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(24px, 6vw, 32px)'
            }}>{amount}</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                color: '#e2e8f0',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                opacity: 0.9
              }}>{currency}</div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '9999px',
                border: `1px solid ${accentColor}88`,
                background: `${accentColor}22`,
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                ...(badgeMarginProp as React.CSSProperties)
              }}>{network}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPayment;