import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTelegramContext } from '../hooks/useTelegramContext';
import Logo from './Logo';
import Settings from './Settings';

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
}

type TabType = 'all' | 'online' | 'archive' | 'groups';

const ChatPersonList: React.FC = () => {
  const { t, language } = useLanguage();
  const { webApp } = useTelegramContext();
  const [activeButton, setActiveButton] = React.useState<'user' | 'admin'>('user');
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(null);
  const [showMenu, setShowMenu] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>('all');

  // Sample data
  const allChatPersons: ChatPerson[] = [
    {
      id: '1',
      name: 'Ahmad Mohammadi',
      lastMessage: 'Hello, how are you?',
      time: '10:30',
      avatar: 'https://via.placeholder.com/40/4a9eff/ffffff?text=A',
      isOnline: true,
      unreadCount: 2,
      type: 'personal',
      isArchived: false
    },
    {
      id: '2', 
      name: 'Fateme Ahmadi',
      lastMessage: 'We have a meeting tomorrow',
      time: '09:15',
      avatar: 'https://via.placeholder.com/40/50b4ff/ffffff?text=F',
      isOnline: true,
      unreadCount: 0,
      type: 'personal',
      isArchived: false
    },
    {
      id: '3',
      name: 'Ali Rezaei', 
      lastMessage: 'Thanks for your help',
      time: 'Yesterday',
      avatar: 'https://via.placeholder.com/40/ff6b6b/ffffff?text=A',
      isOnline: false,
      unreadCount: 1,
      type: 'personal',
      isArchived: false
    },
    {
      id: '4',
      name: 'Development Team',
      lastMessage: 'New project started',
      time: '14:20',
      avatar: 'https://via.placeholder.com/40/2ed573/ffffff?text=D',
      isOnline: false,
      unreadCount: 5,
      type: 'group',
      isArchived: false
    },
    {
      id: '5',
      name: 'Design Team',
      lastMessage: 'New design is ready',
      time: '16:45',
      avatar: 'https://via.placeholder.com/40/ff4757/ffffff?text=D',
      isOnline: false,
      unreadCount: 3,
      type: 'group',
      isArchived: false
    }
  ];

  // Filter chats based on active tab
  const getFilteredChats = () => {
    switch (activeTab) {
      case 'online':
        return allChatPersons.filter(person => person.isOnline && !person.isArchived);
      case 'archive':
        return allChatPersons.filter(person => person.isArchived);
      case 'groups':
        return allChatPersons.filter(person => person.type === 'group' && !person.isArchived);
      case 'all':
      default:
        return allChatPersons.filter(person => !person.isArchived);
    }
  };

  const chatPersons = getFilteredChats();

  const handlePersonClick = (personId: string) => {
    setSelectedPersonId(personId);
    if (webApp) {
      webApp.showAlert(`Opening chat with ${chatPersons.find(p => p.id === personId)?.name}`);
    }
  };

  const handleMenuAction = (action: string, personName: string) => {
    setShowMenu(null);
    if (webApp) {
      webApp.showAlert(`${action} for ${personName}`);
    }
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
                  const person = chatPersons.find(p => p.id === showMenu);
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
        minHeight: '100vh',
        padding: '80px 20px 0 20px',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#17212b',
        direction: 'ltr'
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
          maxWidth: '475px',
          marginBottom: '20px',
          backgroundColor: '#1a2026',
          borderRadius: '16px',
          padding: '8px',
          display: 'flex',
          gap: '6px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(134, 150, 160, 0.15)'
        }}>
          {[
            { key: 'all' as TabType, label: language === 'fa' ? 'همه' : 'All', icon: '💬', count: 3 },
            { key: 'online' as TabType, label: language === 'fa' ? 'آنلاین' : 'Online', icon: '🟢', count: 2 },
            { key: 'archive' as TabType, label: language === 'fa' ? 'آرشیو' : 'Archive', icon: '📁', count: 0 },
            { key: 'groups' as TabType, label: language === 'fa' ? 'گروه‌ها' : 'Groups', icon: '👥', count: 2 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '12px 10px',
                backgroundColor: activeTab === tab.key ? '#50b4ff' : 'transparent',
                color: activeTab === tab.key ? '#ffffff' : '#848d96',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(80, 180, 255, 0.15)';
                  e.currentTarget.style.color = '#50b4ff';
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
                  background: 'linear-gradient(135deg, #50b4ff 0%, #4a9eff 50%, #4488ff 100%)',
                  borderRadius: '12px',
                  zIndex: 0,
                  animation: 'slideIn 0.3s ease-out'
                }} />
              )}
              <span style={{ position: 'relative', zIndex: 1, fontSize: '16px' }}>{tab.icon}</span>
              <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
              
              {/* Badge for notifications */}
              {tab.count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  backgroundColor: '#ff4757',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div style={{
          width: '100%',
          maxWidth: '475px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {chatPersons.length === 0 ? (
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
            chatPersons.map((person, index) => (
              <div
                key={person.id}
                onClick={() => handlePersonClick(person.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: selectedPersonId === person.id ? 'rgba(80, 180, 255, 0.15)' : 'rgba(26, 32, 38, 0.8)',
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
                  width: '56px',
                  height: '56px',
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
                      bottom: '2px',
                      right: '2px',
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
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
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
                      fontSize: '13px',
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
                        background: 'linear-gradient(135deg, #50b4ff 0%, #4a9eff 100%)',
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
                        {person.unreadCount > 99 ? '99+' : person.unreadCount}
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
                    padding: '10px',
                    borderRadius: '12px',
                    marginLeft: '12px',
                    transition: 'all 0.3s ease',
                    fontSize: '18px',
                    width: '36px',
                    height: '36px',
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
    </>
  );
};

export default ChatPersonList;