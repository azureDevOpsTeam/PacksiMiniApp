import React from 'react';

const ChatPanel: React.FC = () => {
  const [chatExpanded, setChatExpanded] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([
    { id: 1, text: 'سلام! چطور می‌تونم کمکتون کنم؟', isPersonal: false, timestamp: '14:30' },
    { id: 2, text: 'سلام، می‌خواستم در مورد وضعیت بسته‌ام سوال کنم', isPersonal: true, timestamp: '14:32' },
    { id: 3, text: 'البته! لطفاً کد رهگیری بسته‌تان را ارسال کنید', isPersonal: false, timestamp: '14:33' }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        isPersonal: true,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate response
      setTimeout(() => {
        const response = {
          id: messages.length + 2,
          text: 'پیام شما دریافت شد. در حال بررسی...',
          isPersonal: false,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!chatExpanded && (
        <div
          onClick={() => setChatExpanded(!chatExpanded)}
          style={{
            position: 'fixed',
            left: '10px',
            bottom: '40px',
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
            transform: chatExpanded ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease-in-out'
          }}>
          <path
            d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
            fill="currentColor"
          />
        </svg>
        </div>
      )}

      {/* Chat Panel */}
      {chatExpanded && (
        <div style={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          height: '85%',
          maxHeight: '600px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderRadius: '20px 20px 0 0',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: 'none',
          zIndex: 1000,
          boxShadow: '0 -5px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
        <div style={{
          flex: '0 1 60px',
          position: 'relative',
          background: 'rgba(0, 0, 0, 0.3)',
          color: '#fff',
          padding: '15px 60px 15px 60px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '12px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.24)',
          backgroundColor: '#248A52'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            پ
          </div>
        </div>
        <h1 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '1.2'
        }}>
          پشتیبانی پکسی
        </h1>
        <h2 style={{
          margin: 0,
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: 'normal'
        }}>
          آنلاین
        </h2>
        
        {/* Close Button */}
        <div
          onClick={() => setChatExpanded(false)}
          style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: '1 1 auto',
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.isPersonal ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '8px'
            }}
          >
            {!msg.isPersonal && (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#248A52',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#fff',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                پ
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              position: 'relative'
            }}>
              <div style={{
                padding: '8px 12px',
                borderRadius: msg.isPersonal ? '15px 15px 5px 15px' : '15px 15px 15px 5px',
                background: msg.isPersonal 
                  ? 'linear-gradient(120deg, #248A52, #257287)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '12px',
                lineHeight: '1.4',
                wordWrap: 'break-word'
              }}>
                {msg.text}
              </div>
              <div style={{
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '4px',
                textAlign: msg.isPersonal ? 'right' : 'left'
              }}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div style={{
        flex: '0 1 60px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '15px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="پیام خود را بنویسید..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 15px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '12px',
            resize: 'none',
            outline: 'none',
            minHeight: '20px',
            maxHeight: '60px',
            fontFamily: 'inherit'
          }}
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          style={{
            background: message.trim() ? '#248A52' : 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease',
            outline: 'none'
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: '#fff' }}
          >
            <path
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;