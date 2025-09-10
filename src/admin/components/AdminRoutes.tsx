import React from 'react';
import AdminDashboard from '../pages/AdminDashboard';

interface AdminRoutesProps {
  currentPage?: string;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({ currentPage = 'dashboard' }) => {
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      // در آینده می‌توان صفحات بیشتری اضافه کرد:
      // case 'users':
      //   return <AdminUsers />;
      // case 'reports':
      //   return <AdminReports />;
      // case 'settings':
      //   return <AdminSettings />;
      default:
        return <AdminDashboard />;
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