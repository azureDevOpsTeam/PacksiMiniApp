import React from 'react';
import AdminDashboard from '../pages/AdminDashboard';
import UserManagement from './UserManagement';
import AdvertisementManagement from './AdvertisementManagement';

interface AdminRoutesProps {
  currentPage?: string;
  onNavigate?: (page: 'dashboard' | 'usermanagement' | 'advertisements') => void;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({ currentPage = 'dashboard', onNavigate }) => {
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={onNavigate} />;
      case 'usermanagement':
        return <UserManagement />;
      case 'advertisements':
        return <AdvertisementManagement />;
      // در آینده می‌توان صفحات بیشتری اضافه کرد:
      // case 'reports':
      //   return <AdminReports />;
      // case 'settings':
      //   return <AdminSettings />;
      default:
        return <AdminDashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      padding: '0',
      textAlign: 'center'
    }}>
      {renderPage()}
    </div>
  );
};

export default AdminRoutes;