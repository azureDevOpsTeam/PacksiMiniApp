import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import AdminLayout from '../components/AdminLayout';
import DashboardCard from '../components/DashboardCard';

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === 'fa';

  const title = isRTL ? 'داشبورد مدیریت' : 'Admin Dashboard';

  return (
    <AdminLayout title={title}>
      {/* Dashboard Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <DashboardCard
          title={isRTL ? 'تعداد کاربران' : 'Total Users'}
          value="1,247"
          icon="👥"
          subtitle={isRTL ? 'کاربر فعال' : 'Active Users'}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        
        <DashboardCard
          title={isRTL ? 'موجودی ریال' : 'IRR Balance'}
          value="₹ 2,450,000"
          icon="💰"
          subtitle={isRTL ? 'ریال ایران' : 'Iranian Rial'}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        
        <DashboardCard
          title={isRTL ? 'موجودی دلار' : 'USD Balance'}
          value="$ 15,320"
          icon="💵"
          subtitle={isRTL ? 'دلار آمریکا' : 'US Dollar'}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        
        <DashboardCard
          title={isRTL ? 'تعداد بسته‌ها' : 'Total Packages'}
          value="856"
          icon="📦"
          subtitle={isRTL ? 'بسته در حال ارسال' : 'Packages in Transit'}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
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