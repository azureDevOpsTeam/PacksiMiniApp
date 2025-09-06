import React, { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTelegramContext } from '../hooks/useTelegramContext';
import { apiService } from '../services/apiService';
import type { LiveChatUser } from '../types/api';
import Logo from './Logo';
import Settings from './Settings';
import ChatWindow from './ChatWindow';

interface ChatPerson {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  isOnline: boolean;
  unreadCount: number;
  type: 'personal' | 'group';
  isArchived: boolean;
  requestId?: number;
  requestCreatorId?: number;
  currentUserAccountId?: number;
  isBlocked?: boolean;
  LastSeenEn?: string | null;
  LastSeenFa?: string | null;
}

type TabType = 'all' | 'online' | 'archive' | 'groups';

const ChatPersonList: React.FC = () => {
  const { language } = useLanguage();
  const { webApp } = useTelegramContext();
  const [activeButton, setActiveButton] = React.useState<'user' | 'admin'>('user');
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(null);
  const [showMenu, setShowMenu] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>('all');
  const [chatPersons, setChatPersons] = useState<ChatPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatWindow, setShowChatWindow] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<LiveChatUser | null>(null);
  const [liveChatUsers, setLiveChatUsers] = useState<LiveChatUser[]>([]);

  // Convert LiveChatUser to ChatPerson
  const convertLiveChatUserToChatPerson = (user: LiveChatUser): ChatPerson => {
    const lastSeenValue = language === 'fa' ? user.lastSeenFa : user.lastSeenEn;

    return {
      id: user.reciverId?.toString() || `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: user.requestCreatorDisplayName || 'Unknown User',
      lastMessage: user.lastMessage || '',
      time: lastSeenValue || '',
      avatar: user.avatar || '',
      isOnline: user.isOnline || false,
      unreadCount: 0, // This might need to be added to API response
      type: 'personal' as const,
      isArchived: false,
      requestId: user.requestId,
      requestCreatorId: user.reciverId,
      currentUserAccountId: user.senderId,
      isBlocked: user.isBlocked || false,
      LastSeenEn: user.lastSeenEn,
      LastSeenFa: user.lastSeenFa
    };
  };

  // Fetch live chat users
  const fetchLiveChatUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getLiveChatUsers();

      if (response?.requestStatus?.value === 0) {
        const users = response.objectResult || [];
        const usersWithLastSeen = users.map(user => ({
          ...user,
          lastSeenEn: user.lastSeenEn || 'Recently',
          lastSeenFa: user.lastSeenFa || 'به تازگی'
        }));

        setLiveChatUsers(usersWithLastSeen);
        const convertedUsers = usersWithLastSeen.map(convertLiveChatUserToChatPerson);
        setChatPersons(convertedUsers);
      } else {
        setError(response?.message || 'خطا در دریافت لیست کاربران');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست کاربران');
      console.error('Error fetching live chat users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live chat users on component mount
  useEffect(() => {
    fetchLiveChatUsers();
  }, []);

  // Setup back button
  useEffect(() => {
    if (!webApp) return;

    const handleBackButton = () => {
      // Navigate back to home
      window.history.back();
    };

    webApp.BackButton.show();
    webApp.BackButton.onClick(handleBackButton);

    return () => {
      webApp.BackButton.offClick(handleBackButton);
      webApp.BackButton.hide();
    };
  }, [webApp]);

  // Filter chats based on active tab
  const getFilteredChats = () => {
    switch (activeTab) {
      case 'online':
        return chatPersons.filter(person => person.isOnline && !person.isArchived);
      case 'archive':
        return chatPersons.filter(person => person.isArchived);
      case 'groups':
        return chatPersons.filter(person => person.type === 'group' && !person.isArchived);
      case 'all':
      default:
        return chatPersons.filter(person => !person.isArchived);
    }
  };

  const filteredChatPersons = getFilteredChats();

  const handlePersonClick = (personId: string) => {
    setSelectedPersonId(personId);
    
    // Find the selected user from liveChatUsers using reciverId
    const user = liveChatUsers.find(u => u.reciverId?.toString() === personId);
    if (user) {
      setSelectedUser(user);
      setShowChatWindow(true);
    }
  };



  const handleMenuAction = (action: string, personName: string) => {
    setShowMenu(null);
    if (webApp) {
      webApp.showAlert(`${action} for ${personName}`);
    }
  };

  // Refresh function
  const handleRefresh = () => {
    fetchLiveChatUsers();
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(null);
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <>
      {/* Global Menu Overlay */}
      {showMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowMenu(null)}
        >
          <div
            style={{
              backgroundColor: 'rgba(23, 33, 43, 0.98)',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(80, 180, 255, 0.3)',
              border: '2px solid rgba(80, 180, 255, 0.2)',
              minWidth: '280px',
              backdropFilter: 'blur(40px)',
              animation: 'menuSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated glow effect */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(80, 180, 255, 0.4), transparent)',
              animation: 'shimmer 3s infinite',
              pointerEvents: 'none'
            }} />

            {/* Menu Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(80, 180, 255, 0.2)'
            }}>
              <h3 style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '16px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '600'
              }}>
                {language === 'fa' ? 'گزینه‌های چت' : 'Chat Options'}
              </h3>
            </div>

            {/* Menu Items */}
            {[
              { label: language === 'fa' ? 'پین کردن چت' : 'Pin Chat', icon: '📌', color: '#ffa502' },
              { label: language === 'fa' ? 'آرشیو چت' : 'Archive Chat', icon: '📁', color: '#70a1ff' },
              { label: language === 'fa' ? 'حذف چت' : 'Delete Chat', icon: '🗑️', color: '#ff4757' },
              { label: language === 'fa' ? 'علامت‌گذاری به عنوان خوانده نشده' : 'Mark as unread', icon: '📧', color: '#2ed573' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  const person = filteredChatPersons.find(p => p.id === showMenu);
                  if (person) {
                    handleMenuAction(item.label, person.name);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(80, 180, 255, 0.05) 0%, rgba(80, 180, 255, 0.02) 100%)',
                  border: '1px solid rgba(80, 180, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'IRANSansX, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '16px',
                  margin: '6px 0',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${item.color}25 0%, ${item.color}15 100%)`;
                  e.currentTarget.style.color = item.color;
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                  e.currentTarget.style.borderColor = `${item.color}40`;
                  e.currentTarget.style.boxShadow = `0 8px 25px ${item.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(80, 180, 255, 0.05) 0%, rgba(80, 180, 255, 0.02) 100%)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(80, 180, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#17212b',
        direction: 'ltr',
        overflow: 'hidden'
      }}>
        {/* Settings Component */}
        <Settings activeButton={activeButton} setActiveButton={setActiveButton} />

        {/* Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <Logo />
        </div>

        {/* Welcome Text */}
        <p style={{
          marginBottom: '20px',
          fontSize: '14px',
          fontFamily: 'IRANSansX, sans-serif',
          color: '#848d96'
        }}>
          {language === 'fa' ? 'لیست چت‌های شما' : 'Your Chat List'}
        </p>

        {/* Tab Bar */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '20px',
          backgroundColor: '#1a2026',
          borderRadius: '12px',
          padding: '4px',
          display: 'flex',
          gap: '1px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(134, 150, 160, 0.15)',
          height: '40px'
        }}>
          {[
            { key: 'all' as TabType, label: language === 'fa' ? 'همه' : 'All', icon: '💬', count: 3 },
            { key: 'online' as TabType, label: language === 'fa' ? 'آنلاین' : 'Online', icon: '🟢', count: 2 },
            { key: 'archive' as TabType, label: language === 'fa' ? 'آرشیو' : 'Archive', icon: '📁', count: 0 }
          ].map((tab, index) => (
            <React.Fragment key={`tab-${index}-${tab.key}`}>
              <button
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  backgroundColor: activeTab === tab.key ? '#17212b' : 'transparent',
                  color: activeTab === tab.key ? '#ffffff' : '#848d96',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'IRANSansX, sans-serif',
                  fontWeight: activeTab === tab.key ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '32px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'rgba(23, 33, 43, 0.5)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#848d96';
                  }
                }}
              >
                {/* Animated background for active tab */}
                {activeTab === tab.key && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, #17212b 0%, #1a2026 50%, #17212b 100%)',
                    borderRadius: '8px',
                    zIndex: 0,
                    animation: 'slideIn 0.3s ease-out',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} />
                )}
                <span style={{ position: 'relative', zIndex: 1, fontSize: '14px' }}>{tab.icon}</span>
                <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>

                {/* Badge for notifications */}
                {tab.count > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '1px',
                    right: '4px',
                    backgroundColor: '#ff4757',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    borderRadius: '10px',
                    padding: '1px 4px',
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
              {/* Vertical separator line */}
              {index < 2 && (
                <div style={{
                  width: '1px',
                  height: '20px',
                  backgroundColor: 'rgba(134, 150, 160, 0.2)',
                  alignSelf: 'center'
                }} />)}              
            </React.Fragment>
          ))}
        </div>

        {/* Chat List */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '20px'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#848d96',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#ff6b6b',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              <div>{error}</div>
              <button
                onClick={handleRefresh}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#50b4ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'IRANSansX, sans-serif'
                }}
              >
                {language === 'fa' ? 'تلاش مجدد' : 'Retry'}
              </button>
            </div>
          ) : filteredChatPersons.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#848d96',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {language === 'fa' ? 'چتی یافت نشد' : 'No chats found'}
            </div>
          ) : (
            filteredChatPersons.map((person, index) => (
              <div
                key={person.id}
                onClick={() => handlePersonClick(person.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 15px',
                  backgroundColor: selectedPersonId === person.requestCreatorId?.toString() ? 'rgba(80, 180, 255, 0.15)' : 'rgba(26, 32, 38, 0.8)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: selectedPersonId === person.id ? '1px solid rgba(80, 180, 255, 0.3)' : '1px solid rgba(134, 150, 160, 0.08)',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  boxShadow: selectedPersonId === person.id ? '0 4px 20px rgba(80, 180, 255, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transform: selectedPersonId === person.id ? 'translateY(-1px)' : 'translateY(0)',
                  animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`,
                  direction: 'ltr'
                }}
                onMouseEnter={(e) => {
                  if (selectedPersonId !== person.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(36, 43, 53, 0.9)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPersonId !== person.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(26, 32, 38, 0.8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  marginRight: '16px',
                  backgroundImage: `url(${person.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  border: person.isOnline ? '3px solid #2ed573' : '3px solid rgba(134, 150, 160, 0.2)',
                  boxShadow: person.isOnline ? '0 0 20px rgba(46, 213, 115, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  {/* Online indicator */}
                  {person.isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-5px',
                      right: '-5px',
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#2ed573',
                      borderRadius: '50%',
                      border: '3px solid #1a2026',
                      animation: 'pulse 2s infinite'
                    }} />
                  )}
                  {/* Group indicator */}
                  {person.type === 'group' && (
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#ff6b6b',
                      borderRadius: '50%',
                      border: '2px solid #1a2026',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      👥
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  // gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '13px',
                      fontWeight: '600',
                      color: selectedPersonId === person.id ? '#50b4ff' : '#ffffff',
                      fontFamily: 'IRANSansX, sans-serif',
                      transition: 'color 0.3s ease'
                    }}>
                      {person.name}
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      color: '#848d96',
                      fontFamily: 'IRANSansX, sans-serif'
                    }}>
                      {person.time}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#a0a8b0',
                      fontFamily: 'IRANSansX, sans-serif',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px'
                    }}>
                      {person.lastMessage}
                    </p>
                    {person.unreadCount > 0 && (
                      <span style={{
                        background: 'linear-gradient(135deg,rgb(202, 92, 78) 0%, #4a9eff 100%)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        padding: '4px 8px',
                        minWidth: '22px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(80, 180, 255, 0.3)',
                        animation: 'bounce 2s infinite'
                      }}>
                        {/* {person.unreadCount > 99 ? '99+' : person.unreadCount} */}
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === person.id ? null : person.id);
                  }}
                  style={{
                    background: 'rgba(134, 150, 160, 0.1)',
                    border: 'none',
                    color: '#848d96',
                    cursor: 'pointer',
                    padding: '7px',
                    borderRadius: '12px',
                    marginLeft: '12px',
                    transition: 'all 0.3s ease',
                    fontSize: '18px',
                    width: '15px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(80, 180, 255, 0.2)';
                    e.currentTarget.style.color = '#50b4ff';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(134, 150, 160, 0.1)';
                    e.currentTarget.style.color = '#848d96';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ⋮
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-3px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes menuSlideIn {
          0% {
            opacity: 0;
            transform: scale(0.8) rotateY(-15deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            left: '-100%';
          }
          100% {
            left: '100%';
          }
        }
      `}</style>
      
      {/* Chat Window */}
      {showChatWindow && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 10000
        }}>
          <ChatWindow 
            selectedUser={selectedUser} 
          />
        </div>
      )}
    </>
  );
};

export default ChatPersonList;