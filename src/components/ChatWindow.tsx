import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { apiService } from '../services/apiService';
import { signalRService } from '../services/signalRService';
import type { ChatMessage, LiveChatUser } from '../types/api';

// Animations - Simplified and smoother
const slideInLeft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Styled Components - Simplified and modern
const ChatContainer = styled.div`
  background: #f8fafc;
  font-family: 'IRANSansX', sans-serif;
  position: relative;
  min-height: 100vh;
`;

const UserNameDisplay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: #ffffff;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e2e8f0;
`;

const TopSpacer = styled.div`
  height: 70px;
  width: 100%;
`;

const ChatThread = styled.div`
  height: calc(100vh - 150px);
  margin: 0 auto;
  padding: 20px;
  overflow-y: auto;
  max-width: 600px;
  width: 100%;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const containsPersian = (text: string): boolean => {
  const persianRegex = /[\u0600-\u06FF\uFB80-\uFBFB\uFE70-\uFEFF]/;
  return persianRegex.test(text);
};

const MessageItem = styled.li<{
  $isOdd: boolean;
  $isPersian: boolean;
}>`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  position: relative;
  
  ${props => props.$isOdd ? css`
    background: #3b82f6;
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 6px;
    animation: ${slideInRight} 0.3s ease-out;
  ` : css`
    background: white;
    color: #1e293b;
    align-self: flex-start;
    border-bottom-left-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: ${slideInLeft} 0.3s ease-out;
  `}
  
  ${props => props.$isPersian ? css`
    direction: rtl;
    text-align: right;
  ` : css`
    direction: ltr;
    text-align: left;
  `}
`;

const MessageTime = styled.div<{ $isOdd: boolean }>`
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => props.$isOdd ? css`
    justify-content: flex-end;
    color: rgba(255, 255, 255, 0.8);
  ` : css`
    justify-content: flex-start;
    color: #64748b;
  `}
`;

const DateSeparator = styled.div`
  text-align: center;
  margin: 20px 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e2e8f0;
    z-index: 1;
  }
  
  span {
    background: #f8fafc;
    padding: 0 16px;
    position: relative;
    z-index: 2;
  }
`;

const ChatInputForm = styled.form`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChatInput = styled.input<{ $isPersian?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 20px;
  background: #f1f5f9;
  color: #1e293b;
  font-size: 14px;
  font-family: 'IRANSansX', sans-serif;
  outline: none;
  transition: all 0.2s ease;
  
  ${props => props.$isPersian ? css`
    direction: rtl;
    text-align: right;
  ` : css`
    direction: ltr;
    text-align: left;
  `}
  
  &::placeholder {
    color: #64748b;
  }
  
  &:focus {
    background: #e2e8f0;
    transform: scale(1.01);
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
  font-family: 'IRANSansX', sans-serif;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
    color: #cbd5e1;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #475569;
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
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ConnectionStatus = styled.div<{ $isConnected: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 1000;
  transition: all 0.3s ease;
  
  ${props => props.$isConnected ? css`
    background: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  ` : css`
    background: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  `}
`;

const TypingIndicator = styled.div`
  align-self: flex-start;
  padding: 12px 16px;
  background: white;
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: #64748b;
  font-family: 'IRANSansX', sans-serif;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 75%;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
`;



interface ChatWindowProps {
  selectedUser: LiveChatUser;
}

const ChatWindowComponent: React.FC<ChatWindowProps> = ({ selectedUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatThreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [messages]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const [isWindowVisible, setIsWindowVisible] = useState(true);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending || !selectedUser) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Try SignalR first if connected
      if (isSignalRConnected && selectedUser.conversationId) {
        console.log('🚀 Sending message via SignalR...');
        try {
          await signalRService.sendMessage(
            selectedUser.conversationId.toString(), 
            messageContent,
            selectedUser.reciverId?.toString()
          );
          console.log('✅ Message sent via SignalR successfully');
          // Message will be received via SignalR event handler
          return;
        } catch (signalRError) {
          console.warn('⚠️ SignalR send failed, falling back to REST API:', signalRError);
        }
      }

      // Fallback to REST API
      console.log('📡 Sending message via REST API...');
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
      } else {
        throw new Error('Failed to send message via REST API');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, selectedUser, isSignalRConnected]);

  const handleTyping = useCallback(() => {
    if (!isSignalRConnected || !selectedUser.conversationId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    signalRService.sendTypingIndicator(selectedUser.conversationId.toString(), true);

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      signalRService.sendTypingIndicator(selectedUser.conversationId!.toString(), false);
    }, 2000);
  }, [isSignalRConnected, selectedUser.conversationId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
     e.preventDefault();
     handleSendMessage();
   }, [handleSendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversationAndMessages();
  }, [selectedUser.conversationId, selectedUser.reciverId]);
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading]);

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

  // SignalR connection management
  useEffect(() => {
    const initializeSignalR = async () => {
      try {
        // Set up event handlers with current selectedUser reference
        const messageHandler = (message: ChatMessage) => {
          console.log('پیام دریافت شد:', message, 'conversationId فعلی:', selectedUser?.conversationId);
          // بررسی conversationId یا receiverId/senderId
          const isForThisConversation = 
            message.conversationId === selectedUser?.conversationId ||
            (message.senderId === selectedUser?.reciverId && message.receiverId === selectedUser?.senderId) ||
            (message.senderId === selectedUser?.senderId && message.receiverId === selectedUser?.reciverId);
          
          if (isForThisConversation) {
            console.log('پیام برای این مکالمه است، اضافه می‌شود');
            setMessages(prev => {
              // جلوگیری از duplicate پیام‌ها
              const exists = prev.some(m => m.id === message.id);
              if (exists) {
                console.log('پیام تکراری، اضافه نمی‌شود');
                return prev;
              }
              return [...prev, message];
            });
            scrollToBottom();
          } else {
            console.log('پیام برای این مکالمه نیست، نادیده گرفته می‌شود');
          }
        };
        
        signalRService.setOnMessageReceived(messageHandler);

        signalRService.setOnConnectionStateChanged((isConnected) => {
          setIsSignalRConnected(isConnected);
          console.log('SignalR connection status:', isConnected ? 'Connected' : 'Disconnected');
        });

        const typingHandler = (userId: string, isTyping: boolean) => {
          console.log('نشانگر تایپ دریافت شد:', userId, isTyping, 'کاربر فعلی:', selectedUser?.reciverId);
          // بررسی اینکه آیا نشانگر تایپ از طرف مقابل است
          if (userId === selectedUser?.reciverId?.toString()) {
            console.log('نشانگر تایپ برای این مکالمه است');
            setIsTyping(isTyping);
          }
        };
        
        signalRService.setOnTypingReceived(typingHandler);

        // signalRService.setOnUserOnlineStatusChanged((userId, isOnline) => {
        //   setOnlineUsers(prev => {
        //     const updated = new Set(prev);
        //     if (isOnline) {
        //       updated.add(userId);
        //     } else {
        //       updated.delete(userId);
        //     }
        //     return updated;
        //   });
        // });

        // Start connection
        await signalRService.start();
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
      }
    };

    initializeSignalR();

    // Cleanup on unmount or selectedUser change
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Clear event handlers to prevent memory leaks
      signalRService.setOnMessageReceived(() => {});
      signalRService.setOnTypingReceived(() => {});
      console.log('Event handlers پاک شدند');
    };
  }, [selectedUser?.conversationId, selectedUser?.reciverId, selectedUser?.senderId]);

  // Join/Leave conversation when selectedUser changes
  useEffect(() => {
    if (isSignalRConnected && selectedUser.conversationId) {
      signalRService.joinConversation(selectedUser.conversationId.toString());

      return () => {
        if (selectedUser.conversationId) {
          signalRService.leaveConversation(selectedUser.conversationId.toString());
        }
      };
    }
  }, [isSignalRConnected, selectedUser.conversationId]);

  // Handle page visibility changes for Android
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsWindowVisible(isVisible);
      
      if (isVisible && selectedUser.conversationId) {
        console.log('صفحه مرئی شد - بارگذاری مجدد پیام‌ها');
        // Refresh messages when page becomes visible
        fetchMessages();
      }
    };

    const handleFocus = () => {
      setIsWindowVisible(true);
      if (selectedUser.conversationId) {
        console.log('اپلیکیشن فوکوس یافت - بارگذاری مجدد پیام‌ها');
        fetchMessages();
      }
    };

    const handleBlur = () => {
      setIsWindowVisible(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedUser.conversationId]);

  // Real-time message polling
  useEffect(() => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Only start polling if we have a conversation and window is visible
    if (selectedUser.conversationId && isWindowVisible && !loading) {
      console.log('شروع polling برای پیام‌های جدید');
      
      pollingIntervalRef.current = setInterval(() => {
        // Only fetch if window is still visible and we're not loading
        if (isWindowVisible && !loading) {
          console.log('بررسی پیام‌های جدید...');
          fetchMessages();
        }
      }, 3000); // Poll every 3 seconds
    }

    // Cleanup interval on dependency change or unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('متوقف کردن polling');
      }
    };
  }, [selectedUser.conversationId, isWindowVisible, loading]);

  useEffect(() => {
    const scrollAfterRender = () => {
      if (chatThreadRef.current) {
        chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
      }
    };

    // از requestAnimationFrame استفاده کن تا مطمئن بشیم DOM آماده است
    requestAnimationFrame(scrollAfterRender);
  }, [messages, loading]);

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
        const newMessages = messagesResponse.objectResult;
        
        // Update messages only if there are changes to prevent unnecessary re-renders
        setMessages(prevMessages => {
          // Check if messages have actually changed
          if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
            console.log('پیام‌های جدید دریافت شد:', newMessages.length);
            return newMessages;
          }
          return prevMessages;
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Don't stop polling on error, just log it
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
      <ConnectionStatus $isConnected={isSignalRConnected} />
      
      <UserNameDisplay>
        {selectedUser?.requestId || 'کاربر ناشناس'}
      </UserNameDisplay>
      
      <TopSpacer />

      <ChatThread ref={chatThreadRef}>
        {loading ? (
          <LoadingSpinner>
            <div></div>
          </LoadingSpinner>
        ) : messages.length === 0 ? (
          <EmptyState>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                    <DateSeparator key={`date-${message.id}-${index}`}>
                      <span>{formatDate(message.sentAt)}</span>
                    </DateSeparator>
                  )}

                  <MessageItem
                    key={`msg-${message.id}-${index}`}
                    $isOdd={isMyMessage}
                    $isPersian={containsPersian(message.content)}
                  >
                    {message.content}
                    <MessageTime $isOdd={isMyMessage}>
                      {formatTime(message.sentAt)}
                      {isMyMessage && message.isRead && (
                        <span>✓✓</span>
                      )}
                    </MessageTime>
                  </MessageItem>
                </React.Fragment>
              );
            })}
            {isTyping && <TypingIndicator>در حال تایپ...</TypingIndicator>}
          </MessageList>
        )}
        <div ref={messagesEndRef} />
      </ChatThread>

      <ChatInputForm onSubmit={handleSubmit}>
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
          $isPersian={containsPersian(newMessage)}
        />
        <SendButton type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? '...' : '→'}
        </SendButton>
      </ChatInputForm>
    </ChatContainer>
  );
};

export default ChatWindowComponent;