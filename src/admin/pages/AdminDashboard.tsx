import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTelegram } from '../../hooks/useTelegram';
import AdminLayout from '../components/AdminLayout';
import AdminPanel from '../components/AdminPanel';
import DashboardCard from '../components/DashboardCard';
import Logo from '../../components/Logo';
import { apiService } from '../../services/apiService';

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { webApp } = useTelegram();
  const isRTL = language === 'fa';
  
  // State for invite code
  const [inviteCode, setInviteCode] = useState<string>('Invit_Error'); // Default fallback
  const [isLoadingInviteCode, setIsLoadingInviteCode] = useState<boolean>(true);

  // Fetch invite code on component mount
  useEffect(() => {
    const fetchInviteCode = async () => {
      try {
        setIsLoadingInviteCode(true);
        const response = await apiService.getInviteCode();
        if (response.requestStatus.value === 0 && response.objectResult) {
          setInviteCode(response.objectResult);
        }
      } catch (error) {
        console.error('Failed to fetch invite code:', error);
        // Keep the default fallback value
      } finally {
        setIsLoadingInviteCode(false);
      }
    };

    fetchInviteCode();
  }, []);

  return (
    <AdminLayout>
      {/* Logo Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <Logo style={{ width: '120px' }} />
      </div>

      {/* Invitation Link Box */}
      <div style={{
        backgroundColor: '#1a2332',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        position: 'relative'
      }}>
        <div style={{
          color: '#ffffff',
          fontSize: '11px',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          direction: 'ltr',
          textAlign: 'left',
          flex: 1,
          paddingRight: '40px',
          opacity: isLoadingInviteCode ? 0.6 : 1
        }}>
          {isLoadingInviteCode ? 'Loading...' : inviteCode}
        </div>
        <button
          onClick={() => {
            const inviteLink = `https://t.me/PacksiBot?start=${inviteCode}`;
            navigator.clipboard.writeText(inviteLink);
            if (webApp) {
              webApp.showAlert(isRTL ? 'لینک دعوت کپی شد!' : 'Invitation link copied!');
            }
          }}
          disabled={isLoadingInviteCode}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            padding: '6px',
            color: isLoadingInviteCode ? '#888' : '#50b4ff',
            fontSize: '14px',
            cursor: isLoadingInviteCode ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isLoadingInviteCode ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoadingInviteCode) {
              e.currentTarget.style.backgroundColor = 'rgba(80, 180, 255, 0.1)';
              e.currentTarget.style.color = '#4a9de8';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoadingInviteCode) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#50b4ff';
            }
          }}
          title={isRTL ? 'کپی لینک' : 'Copy Link'}
        >
          📋
        </button>
      </div>
      {/* Dashboard Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <DashboardCard
          title={isRTL ? 'تعداد کاربران' : 'Total Users'}
          value="0"
          icon="👥"
          subtitle={isRTL ? 'کاربر فعال' : 'Active Users'}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        
        <DashboardCard
          title={isRTL ? 'موجودی ریال' : 'IRR Balance'}
          value="₹ 0"
          icon="💰"
          subtitle={isRTL ? 'ریال ایران' : 'Iranian Rial'}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        
        <DashboardCard
          title={isRTL ? 'موجودی دلار' : 'USD Balance'}
          value="$ 0"
          icon="💵"
          subtitle={isRTL ? 'دلار آمریکا' : 'US Dollar'}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        
        <DashboardCard
          title={isRTL ? 'تعداد بسته‌ها' : 'Total Packages'}
          value="0"
          icon="📦"
          subtitle={isRTL ? 'بسته در حال ارسال' : 'Packages in Transit'}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
      </div>
      
      {/* Admin Panel Links */}
      <div style={{ marginBottom: '24px' }}>
        <AdminPanel />
      </div>
      
      {/* Development Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        flexDirection: 'column',
        backgroundColor: '#1a2332',
        borderRadius: '8px',
        border: '1px solid #3a4a5c'
      }}>
        <div style={{
          fontSize: '32px',
          marginBottom: '12px'
        }}>
          🚧
        </div>
        
        <div style={{
          color: '#ffffff',
          fontSize: '12px',
          fontFamily: 'IRANSansX, sans-serif',
          fontWeight: '400',
          marginBottom: '6px'
        }}>
          {isRTL 
            ? 'سایر امکانات داشبورد در حال توسعه است'
            : 'Other dashboard features are under development'
          }
        </div>
        
        <div style={{
          color: '#848d96',
          fontSize: '10px',
          fontFamily: 'IRANSansX, sans-serif'
        }}>
          {isRTL 
            ? 'گزارشات تفصیلی، نمودارها و تنظیمات پیشرفته به زودی اضافه خواهد شد'
            : 'Detailed reports, charts and advanced settings will be added soon'
          }
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;