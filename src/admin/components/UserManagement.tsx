import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTelegram } from '../../hooks/useTelegram';
import AdminLayout from './AdminLayout';
import { apiService } from '../../services/apiService';
import type { InvitedUser, GetMyInvitedUsersResponse } from '../../types/api';

interface UserManagementProps {
  onNavigate?: (page: 'dashboard' | 'usermanagement' | 'advertisements') => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { webApp } = useTelegram();
  const isRTL = language === 'fa';

  const [users, setUsers] = useState<InvitedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: GetMyInvitedUsersResponse = await apiService.getMyInvitedUsers();
        
        if (response?.requestStatus?.value === 0 && response.objectResult) {
          setUsers(response.objectResult);
        } else {
          setError(isRTL ? 'خطا در دریافت اطلاعات کاربران' : 'Failed to fetch users data');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(isRTL ? 'خطا در ارتباط با سرور' : 'Server connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isRTL]);

  // Setup Telegram back button
  useEffect(() => {
    if (webApp && onNavigate) {
      // Show back button
      webApp.BackButton.show();
      
      // Set up back button click handler
      const handleBackClick = () => {
        onNavigate('dashboard');
      };
      
      webApp.BackButton.onClick(handleBackClick);
      
      // Cleanup on unmount
      return () => {
        webApp.BackButton.hide();
        webApp.BackButton.offClick(handleBackClick);
      };
    }
  }, [webApp, onNavigate]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm)
  );

  // Statistics
  const totalUsers = users.length;
  const verifiedEmails = users.filter(user => user.confirmEmail).length;
  const twoFactorEnabled = users.filter(user => user.twoFactorEnabled).length;

  // Mask phone number for privacy
  const maskPhoneNumber = (phone: string | null): string => {
    if (!phone) return isRTL ? 'نامشخص' : 'Unknown';
    if (phone.length <= 4) return phone;
    const start = phone.slice(0, 3);
    const end = phone.slice(-2);
    const middle = '*'.repeat(phone.length - 5);
    return `${start}${middle}${end}`;
  };

  // Get user status color
  const getUserStatusColor = (user: InvitedUser): string => {
    if (user.confirmEmail && user.confirmPhoneNumber && user.twoFactorEnabled) {
      return '#10b981'; // Green - Fully verified
    } else if (user.confirmEmail || user.confirmPhoneNumber) {
      return '#f59e0b'; // Orange - Partially verified
    } else {
      return '#ef4444'; // Red - Not verified
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          color: '#ffffff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <div>{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          color: '#ef4444'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
            <div>{error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        textAlign: isRTL ? 'right' : 'left',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        <h2 style={{
          color: '#ffffff',
          fontSize: '18px',
          fontFamily: 'IRANSansX, sans-serif',
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          {isRTL ? 'مدیریت کاربران' : 'User Management'}
        </h2>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          fontFamily: 'IRANSansX, sans-serif',
          margin: '0'
        }}>
          {isRTL ? 'مشاهده و مدیریت کاربران دعوت شده' : 'View and manage invited users'}
        </p>
      </div>

      {/* Statistics Cards - Compact */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {totalUsers}
          </div>
          <div style={{ color: '#dbeafe', fontSize: '10px', marginTop: '2px' }}>
            {isRTL ? 'کل کاربران' : 'Total Users'}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {verifiedEmails}
          </div>
          <div style={{ color: '#d1fae5', fontSize: '10px', marginTop: '2px' }}>
            {isRTL ? 'ایمیل تایید شده' : 'Verified Emails'}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {twoFactorEnabled}
          </div>
          <div style={{ color: '#ede9fe', fontSize: '10px', marginTop: '2px' }}>
            {isRTL ? '2FA فعال' : '2FA Enabled'}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '16px',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder={isRTL ? 'جستجو در کاربران...' : 'Search users...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: 'IRANSansX, sans-serif',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left'
          }}
        />
      </div>

      {/* Users List - Compact Table Style */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 80px 60px',
          gap: '8px',
          padding: '12px',
          backgroundColor: '#111827',
          borderBottom: '1px solid #374151',
          fontSize: '11px',
          fontWeight: '600',
          color: '#9ca3af',
          textTransform: 'uppercase',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          <div>{isRTL ? 'کاربر' : 'User'}</div>
          <div>{isRTL ? 'تلفن' : 'Phone'}</div>
          <div>{isRTL ? 'شرکت' : 'Company'}</div>
          <div>{isRTL ? 'وضعیت' : 'Status'}</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredUsers.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
              <div style={{ fontSize: '14px' }}>
                {searchTerm 
                  ? (isRTL ? 'کاربری یافت نشد' : 'No users found')
                  : (isRTL ? 'هنوز کاربری دعوت نشده' : 'No users invited yet')
                }
              </div>
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <div
                key={user.userAccountId || index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 80px 60px',
                  gap: '8px',
                  padding: '12px',
                  borderBottom: index < filteredUsers.length - 1 ? '1px solid #374151' : 'none',
                  backgroundColor: index % 2 === 0 ? '#1f2937' : '#111827',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer',
                  direction: isRTL ? 'rtl' : 'ltr'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#1f2937' : '#111827';
                }}
              >
                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${getUserStatusColor(user)} 0%, ${getUserStatusColor(user)}80 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.fullName || (isRTL ? 'نام نامشخص' : 'Unknown Name')}
                    </div>
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '11px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.email || (isRTL ? 'ایمیل نامشخص' : 'No email')}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div style={{
                  color: '#d1d5db',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'monospace'
                }}>
                  {maskPhoneNumber(user.phoneNumber)}
                </div>

                {/* Company */}
                <div style={{
                  color: '#9ca3af',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.company || '-'}
                </div>

                {/* Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getUserStatusColor(user)
                  }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info */}
      {filteredUsers.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#111827',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#6b7280',
          textAlign: 'center',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          {isRTL 
            ? `نمایش ${filteredUsers.length} از ${totalUsers} کاربر`
            : `Showing ${filteredUsers.length} of ${totalUsers} users`
          }
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement;