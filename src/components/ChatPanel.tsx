import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Chat Toggle Button */}
      <div
        onClick={() => navigate('/chatlist')}
        style={{
          position: 'fixed',
          left: '10px',
          bottom: '25px',
          width: '50px',
          height: '50px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 5px 30px rgba(0, 0, 0, 0.3)',
          zIndex: 1001,
          transition: 'transform 0.3s ease-in-out'
        }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'transform 0.3s ease-in-out'
          }}>
          <path
            d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
            fill="currentColor"
          />
        </svg>
      </div>
    </>
  );
};

export default ChatPanel;