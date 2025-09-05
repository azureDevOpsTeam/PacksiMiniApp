import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import type { ChatMessage, Conversation, LiveChatUser } from '../types/api';
import { useTelegramButtons } from '../hooks/useTelegramButtons';

// Animations
const showChatEven = keyframes`
  0% {
    margin-left: -480px;
  }
  100% {
    margin-left: 0;
  }
`;

const showChatOdd = keyframes`
  0% {
    margin-right: -480px;
  }
  100% {
    margin-right: 0;
  }
`;

// Styled Components
const ChatContainer = styled.div`
  height: 100vh;
  background: linear-gradient(-45deg, #183850 0%, #183850 25%, #192C46 50%, #22254C 75%, #22254C 100%);
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  font-family: 'IRANSansX', sans-serif;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(25, 147, 147, 0.1);
  border-bottom: 1px solid rgba(25, 147, 147, 0.2);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #0AD5C1;
  font-size: 18px;
  cursor: pointer;
  margin-left: 15px;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(10, 213, 193, 0.1);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin-left: 15px;
`;

const UserDetails = styled.div`
  color: #0AD5C1;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
  }
`;

const ChatThread = styled.ul`
  flex: 1;
  margin: 24px auto 0 auto;
  padding: 0 20px 0 0;
  list-style: none;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 90%;
  
  @media (min-width: 768px) {
    width: 50%;
  }
  
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: rgba(25, 147, 147, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(25, 147, 147, 0.2);
  }
`;

const MessageItem = styled.li<{ isOdd: boolean }>`
  position: relative;
  clear: both;
  display: inline-block;
  padding: 16px 40px 16px 20px;
  margin: 0 0 20px 0;
  font: 16px/20px 'IRANSansX', sans-serif;
  border-radius: 10px;
  background-color: rgba(25, 147, 147, 0.2);
  
  ${props => props.isOdd ? `
    animation: ${showChatOdd} 0.15s 1 ease-in;
    float: right;
    margin-right: 80px;
    color: #0AD5C1;
    
    &:before {
      position: absolute;
      top: 0;
      right: -80px;
      width: 50px;
      height: 50px;
      border-radius: 50px;
      content: '';
      background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBoRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAExAAIAAAASAAAATgAAAAAAAABgAAAAAQAAAGAAAAABUGFpbnQuTkVUIHYzLjUuMTAA/9sAQwAHBQUGBQQHBgUGCAcHCAoRCwoJCQoVDxAMERgVGhkYFRgXGx4nIRsdJR0XGCIuIiUoKSssKxogLzMvKjInKisq/9sAQwEHCAgKCQoUCwsUKhwYHCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioq/8AAEQgAMgAyAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A8wre0/w55qLLqM62ysMrEWAdh+PSl8M6fFLMbu5K7YziNT3b1/CqniRLq98UA2SlhHGobnA55FdbajHmZwxTnLlRtm78NabDGhs/tEwchmVfMGD0znvn0pqahoN3fCH+z0RcHcWiKY4745/KuUVtTtdSFtJCvmxHmN+317Gp5dTthGZXUSXPJJVsh1PUH1rP2rZt7GKOi1LwxHIv2jRg20jPks4b64b+h/OuZZWRyrqVZTggjBBrZ0PWftFwkA8xImTpu7gVJr1kpX7UhzJ0cZ5I9a0umtDJxcWYVFFFBJ1WlKkOmQASYyoYjZnk81aukuLHTP7YFtDeW6zJEFmyu4555H8PQemaz9NmR9PhO45C7T+HFa1rrk9iwSZ3vLJU+WyaVUCsDncMjJI64H41riYRVHmS7E4KbliOWT7nPePtPvbm8j1trWSyF3GpkgkYEbl4BBHTjHBrn49GkfRLnUpn2tBgtFj76k4GD/e749K63xb4gtdTtp4LeRismGVyOmDnpWBq2pXd74ZsdPjG2GCTdHDEnzSN/ebHLH+VeXBuyR7E4wu35EXhKKObVCRnMKMwY+hwAPz5rrJ7bzYXTfu3Ag5yKwfC+nNZvcPPJHvdQDGnJjOehPTPsOlb0zLFA8m/hVJ/SvXo0oundnhV6slU5UcjRRRXPY3Luk3giYwSHCscqfetfULXOlR3TXIhZ2ZYfLILHHDkjsO3PJPSuXqeC5aPzd5ZjIQdxOcEDFa+0fJyEKmvac5myyQWJlRZnkkTHytjoeuPepLaa9vi4ib7LbOMyFG5KjtnrVMabPd30gcrCjMSZGPQf1NbF0i29pHBAUlbABVT8pPqSOwrljDW53c+lrl/RWxvymyDAWPjsPSpdVnVF8iNsk8tz0HpVFLloowEYvJjBkIwB7AdhUGSxJJyT1JrpU2o8py1IwlJS6hRS0VAiKiiikUKKUUUUxC0ooooAKKKKQH/2Q==);
    }
    
    &:after {
      position: absolute;
      top: 15px;
      right: -15px;
      content: '';
      width: 0;
      height: 0;
      border-top: 15px solid rgba(25, 147, 147, 0.2);
      border-right: 15px solid transparent;
    }
  ` : `
    animation: ${showChatEven} 0.15s 1 ease-in;
    float: left;
    margin-left: 80px;
    color: #0EC879;
    
    &:before {
      position: absolute;
      top: 0;
      left: -80px;
      width: 50px;
      height: 50px;
      border-radius: 50px;
      content: '';
      background-image: url(data:image/jpeg;base64,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);
    }
    
    &:after {
      position: absolute;
      top: 15px;
      left: -15px;
      content: '';
      width: 0;
      height: 0;
      border-top: 15px solid rgba(25, 147, 147, 0.2);
      border-left: 15px solid transparent;
    }
  `}
`;

const ChatWindow = styled.form`
  position: fixed;
  bottom: 18px;
  left: 5%;
  width: 90%;
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (min-width: 768px) {
    left: 25%;
    width: 50%;
  }
`;

const ChatInput = styled.input`
  flex: 1;
  height: 48px;
  font: 32px/48px 'IRANSansX', sans-serif;
  background: none;
  color: #0AD5C1;
  border: 0;
  border-bottom: 1px solid rgba(25, 147, 147, 0.2);
  outline: none;
  
  &::placeholder {
    color: rgba(10, 213, 193, 0.5);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(45deg, #0AD5C1, #0EC879);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(10, 213, 193, 0.3);
  }
  
  &:disabled {
    background: rgba(25, 147, 147, 0.2);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(10, 213, 193, 0.6);
  text-align: center;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  
  div {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(10, 213, 193, 0.2);
    border-top: 3px solid #0AD5C1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface ChatWindowProps {
  selectedUser: LiveChatUser;
  onBack: () => void;
}

const ChatWindowComponent: React.FC<ChatWindowProps> = ({ selectedUser, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Setup Telegram back button
  useTelegramButtons({
    secondaryButton: {
      text: 'بازگشت',
      onClick: () => {
        navigate('/chatlist');
      },
      isVisible: true,
      isEnabled: true,
      position: 'left'
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);



  useEffect(() => {
    loadConversationAndMessages();
  }, [selectedUser.requestCreatorId]);

  useEffect(() => {
    // Mark messages as read when chat window opens
    const markMessagesAsRead = async () => {
      if (conversation?.id) {
        try {
          await apiService.markConversationAsRead(conversation.id);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    markMessagesAsRead();
  }, [conversation?.id]);

  const loadConversationAndMessages = async () => {
    try {
      setLoading(true);
      
      // First get conversations to find the conversation with this user
      const conversationsResponse = await apiService.getConversations();
      const userConversation = conversationsResponse.objectResult.find(
        (conv: Conversation) => conv.participantId === selectedUser.requestCreatorId
      );
      
      if (userConversation) {
        setConversation(userConversation);
        
        // Load messages for this conversation
        const messagesResponse = await apiService.getMessages(userConversation.id);
        setMessages(messagesResponse.objectResult);
        
        // Mark conversation as read
        await apiService.markConversationAsRead(userConversation.id);
      } else {
        // No existing conversation, start with empty messages
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      const response = await apiService.sendMessage({
        model: {
          receiverId: selectedUser.requestCreatorId,
          content: newMessage.trim()
        }
      });

      // Add the new message to the list
      setMessages(prev => [...prev, response.objectResult]);
      setNewMessage('');
      
      // Reload conversation data to get updated info
      await loadConversationAndMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBlockUser = async () => {
    try {
      await apiService.blockUser({
        model: {
          userId: selectedUser.requestCreatorId,
          isBlocked: !isBlocked
        }
      });
      setIsBlocked(!isBlocked);
      setShowMenu(false);
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'امروز';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'دیروز';
    } else {
      return date.toLocaleDateString('fa-IR');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <ChatContainer>
      {/* Header */}
      <ChatHeader>
        <BackButton onClick={onBack}>
          ←
        </BackButton>
        
        <UserInfo>
          <Avatar
            src={selectedUser.avatar || '/default-avatar.png'}
            alt={selectedUser.requestCreatorDisplayName}
          />
          
          <UserDetails>
            <h3>{selectedUser.requestCreatorDisplayName}</h3>
            <p>{selectedUser.isOnline ? 'آنلاین' : 'آفلاین'}</p>
          </UserDetails>
        </UserInfo>
        
        {/* Menu Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0AD5C1',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div style={{
              position: 'absolute',
              left: '0',
              marginTop: '8px',
              width: '200px',
              background: 'rgba(25, 147, 147, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(25, 147, 147, 0.2)',
              zIndex: 50,
              backdropFilter: 'blur(10px)'
            }}>
              <button
                onClick={handleBlockUser}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'right',
                  background: 'none',
                  border: 'none',
                  color: '#0AD5C1',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                <span style={{ marginLeft: '8px' }}>
                  {isBlocked ? 'رفع مسدودیت کاربر' : 'مسدود کردن کاربر'}
                </span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </ChatHeader>

      {/* Messages */}
      <ChatThread>
        {loading ? (
          <LoadingSpinner>
            <div></div>
          </LoadingSpinner>
        ) : messages.length === 0 ? (
          <EmptyState>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3>هنوز پیامی ارسال نشده</h3>
            <p>اولین پیام خود را ارسال کنید</p>
          </EmptyState>
        ) : (
          messages.map((message, index) => {
            const isMyMessage = message.senderId !== selectedUser.requestCreatorId;
            const showDate = index === 0 || 
              formatDate(messages[index - 1].sentAt) !== formatDate(message.sentAt);
            
            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <li style={{
                    textAlign: 'center',
                    margin: '20px 0',
                    color: 'rgba(10, 213, 193, 0.6)',
                    fontSize: '12px',
                    listStyle: 'none',
                    clear: 'both'
                  }}>
                    {formatDate(message.sentAt)}
                  </li>
                )}
                
                <MessageItem isOdd={isMyMessage}>
                  {message.content}
                  <div style={{
                    fontSize: '12px',
                    marginTop: '4px',
                    opacity: 0.7
                  }}>
                    {formatTime(message.sentAt)}
                    {isMyMessage && message.isRead && (
                      <span style={{ marginRight: '4px' }}>✓✓</span>
                    )}
                  </div>
                </MessageItem>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </ChatThread>

      {/* Message Input */}
      <ChatWindow onSubmit={handleFormSubmit}>
        <ChatInput
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isBlocked ? "کاربر مسدود شده است" : "پیام خود را بنویسید..."}
          disabled={isBlocked || sending}
          autoComplete="off"
          autoFocus
        />
        
        <SendButton
          type="submit"
          disabled={!newMessage.trim() || sending || isBlocked}
        >
          {sending ? (
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </SendButton>
      </ChatWindow>
    </ChatContainer>
  );
};

export default ChatWindowComponent;