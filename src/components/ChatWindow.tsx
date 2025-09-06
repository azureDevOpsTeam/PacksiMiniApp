import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { apiService } from '../services/apiService';
import signalRService from '../services/signalRService';
import type { ChatMessage, LiveChatUser } from '../types/api';

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
  font-family: 'IRANSansX', sans-serif;
`;



const ChatThread = styled.div`
  height: calc(100vh - 80px);
  margin: 0 auto;
  padding: 20px 20px 80px 20px;
  overflow-y: auto;
  max-width: 800px;
  width: 100%;
`;

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MessageItem = styled.li<{ $isOdd: boolean }>`
  position: relative;
  clear: both;
  display: inline-block;
  padding: 16px 40px 16px 20px;
  margin: 0 0 20px 0;
  font: 16px/20px 'IRANSansX', sans-serif;
  border-radius: 10px;
  background-color: rgba(25, 147, 147, 0.2);
  
  ${props => props.$isOdd ? css`
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
  ` : css`
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



const ChatInputForm = styled.form`
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

const ConnectionStatus = styled.div<{ $connected: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$connected ? '#4CAF50' : '#f44336'};
  color: white;
  z-index: 10;
`;

const TypingIndicator = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: #666;
  font-style: italic;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 4px 0;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

interface ChatWindowProps {
  selectedUser: LiveChatUser;
}

const ChatWindowComponent: React.FC<ChatWindowProps> = ({ selectedUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedUser) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      let messageSent = false;
      
      // Try to send via SignalR first
      if (signalRService.connected && selectedUser.conversationId) {
        console.log('📤 Attempting to send message via SignalR...');
        const success = await signalRService.sendMessage(
          selectedUser.conversationId,
          messageContent,
          selectedUser.reciverId
        );
        
        if (success) {
          console.log('✅ Message sent via SignalR successfully');
          messageSent = true;
          
          // Wait a bit to see if we receive the message back via SignalR
          // If not, fallback to REST API
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if we received the message back
          const latestMessage = messages[messages.length - 1];
          if (latestMessage && latestMessage.content === messageContent && 
              latestMessage.senderId === selectedUser.senderId) {
            console.log('✅ Message confirmed via SignalR');
            return;
          } else {
            console.log('⚠️ Message not received back via SignalR, falling back to REST API');
            messageSent = false;
          }
        } else {
          console.log('❌ Failed to send message via SignalR');
        }
      } else {
        console.log('⚠️ SignalR not connected, using REST API');
      }
      
      // Use REST API if SignalR failed or message not confirmed
      if (!messageSent) {
        console.log('📤 Sending message via REST API...');
        const messageData = {
          model: {
            receiverId: selectedUser.reciverId,
            content: messageContent
          }
        };

        const response = await apiService.sendMessage(messageData);
        
        if (response.objectResult) {
          console.log('✅ Message sent via REST API successfully');
          await fetchMessages();
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (signalRService.connected && selectedUser.conversationId) {
      signalRService.sendTypingIndicator(selectedUser.conversationId, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (signalRService.connected && selectedUser.conversationId) {
          signalRService.sendTypingIndicator(selectedUser.conversationId, false);
        }
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize SignalR connection once
  useEffect(() => {
    const initializeSignalR = async () => {
      // Set up event handlers only once
      signalRService.onMessage((message: ChatMessage) => {
        console.log('📨 Received message via SignalR:', message);
        // Only add message if it belongs to current conversation
        setMessages(prev => {
          // Get current conversation ID from the latest state
          const currentConversationId = selectedUser.conversationId;
          
          // Only process message if it belongs to current conversation
          if (message.conversationId === currentConversationId) {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(m => m.id === message.id);
            if (!exists) {
              console.log('✅ Adding new message to current conversation');
              return [...prev, message];
            }
          } else {
            console.log('🚫 Message belongs to different conversation, ignoring');
          }
          return prev;
        });
      });

      signalRService.onConnectionStateChange((connected: boolean) => {
        console.log('🔗 SignalR connection state changed:', connected);
        setIsSignalRConnected(connected);
      });

      signalRService.onTyping((userId: number, typing: boolean) => {
        console.log('⌨️ User typing:', userId, typing);
        // Show typing indicator only for current conversation partner
        setIsTyping(prev => {
          // Get current selectedUser from the latest state
          const currentSelectedUser = selectedUser;
          if (userId === currentSelectedUser.reciverId) {
            return typing;
          }
          return prev;
        });
      });

      // Connect to SignalR
      console.log('🔄 Connecting to SignalR...');
      const connected = await signalRService.connect();
      console.log('✅ SignalR connected:', connected);
    };

    initializeSignalR();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up SignalR connection');
      signalRService.disconnect();
    };
  }, []); // Only run once on mount





  useEffect(() => {
    loadConversationAndMessages();
    
    // Join the new conversation via SignalR
    const joinConversation = async () => {
      if (signalRService.connected && selectedUser.conversationId) {
        console.log('🚪 Joining conversation:', selectedUser.conversationId);
        await signalRService.joinConversation(selectedUser.conversationId);
      } else if (selectedUser.conversationId) {
        // If SignalR is not connected yet, wait and try again
        console.log('⏳ Waiting for SignalR connection to join conversation...');
        setTimeout(async () => {
          if (signalRService.connected) {
            console.log('🚪 Joining conversation after delay:', selectedUser.conversationId);
            await signalRService.joinConversation(selectedUser.conversationId);
          }
        }, 1000);
      }
    };
    
    joinConversation();
    
    // Leave previous conversation when switching
    return () => {
      if (selectedUser.conversationId && signalRService.connected) {
        console.log('🚪 Leaving conversation:', selectedUser.conversationId);
        signalRService.leaveConversation(selectedUser.conversationId);
      }
    };
  }, [selectedUser.conversationId, selectedUser.reciverId]);

  useEffect(() => {
    // Mark messages as read when chat window opens
    const markMessagesAsRead = async () => {
      if (selectedUser.conversationId) {
        try {
          await apiService.markConversationAsRead(selectedUser.conversationId);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    markMessagesAsRead();
  }, [selectedUser.conversationId]);

  const loadConversationAndMessages = async () => {
    try {
      setLoading(true);
      
      // Use conversationId directly from selectedUser
      if (selectedUser.conversationId) {
        // Load messages for this conversation
        const messagesResponse = await apiService.getMessages(selectedUser.conversationId);
        setMessages(messagesResponse.objectResult);
        
        // Mark conversation as read
        await apiService.markConversationAsRead(selectedUser.conversationId);
        
        // Conversation loaded successfully
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

  const fetchMessages = async () => {
    if (selectedUser.conversationId) {
      try {
        const messagesResponse = await apiService.getMessages(selectedUser.conversationId);
        setMessages(messagesResponse.objectResult);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
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



  return (
    <ChatContainer>
      <ConnectionStatus $connected={isSignalRConnected}>
        {isSignalRConnected ? 'متصل' : 'قطع شده'}
      </ConnectionStatus>

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
          <MessageList>
            {messages.map((message, index) => {
              const isMyMessage = message.senderId === selectedUser.senderId;
              const showDate = index === 0 || 
                formatDate(messages[index - 1].sentAt) !== formatDate(message.sentAt);
              
              return (
                <React.Fragment key={`message-fragment-${message.id}-${index}`}>
                  {showDate && (
                    <li key={`date-${message.id}-${index}`} style={{
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
                  
                  <MessageItem key={`msg-${message.id}-${index}`} $isOdd={isMyMessage}>
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
            })}
            {isTyping && (
              <TypingIndicator>
                {selectedUser.requestCreatorDisplayName} در حال تایپ...
              </TypingIndicator>
            )}
          </MessageList>
        )}
        <div ref={messagesEndRef} />
      </ChatThread>
      
      <ChatInputForm onSubmit={handleFormSubmit}>
        <ChatInput
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder="پیام خود را بنویسید..."
          disabled={sending}
        />
        <SendButton type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? '...' : '→'}
        </SendButton>
      </ChatInputForm>
    </ChatContainer>
  );
};

export default ChatWindowComponent;