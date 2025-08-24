import React from 'react';

const ChatPanel: React.FC = () => {
  const [chatExpanded, setChatExpanded] = React.useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: chatExpanded ? '0px' : '-350px',
      width: '350px',
      height: '80%',
      backgroundColor: '#212a33',
      borderRadius: '0 12px 12px 0',
      border: '1px solid #3a4a5c',
      borderLeft: 'none',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      transition: 'left 0.3s ease-in-out',
      padding: '20px 20px 0px 20px'
    }}>
      {/* Chat Icon Button */}
      <div
        onClick={() => setChatExpanded(!chatExpanded)}
        style={{
          position: 'absolute',
          right: '-40px',
          bottom: '10px',
          width: '40px',
          height: '40px',
          backgroundColor: '#212a33',
          borderRadius: '0 10px 10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid #3a4a5c',
          borderLeft: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: '#848d96',
            transform: chatExpanded ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease-in-out'
          }}>
          <path
            d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Chat Content */}
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: '#848d96'
      }}>
        <div style={{
          borderBottom: '1px solid #3a4a5c',
          paddingBottom: '10px',
          marginBottom: '15px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#ebf7ff'
        }}>
          چت آنلاین
        </div>
        
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          در حال حاضر چت آنلاین در دسترس نیست
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;