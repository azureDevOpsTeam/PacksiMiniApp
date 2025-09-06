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
  position: relative;
`;

const TopSpacer = styled.div`
  height: 80px;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0f1419 100%);
  width: 100%;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(10, 213, 193, 0.3) 50%, transparent 100%);
  }
`;



const ChatThread = styled.div`
  height: calc(100vh - 160px);
  margin: 0 auto;
  padding: 15px 15px 80px 15px;
  overflow-y: auto;
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20px 20px 0 0;
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
  padding: 10px 30px 10px 12px;
  margin: 0 0 12px 0;
  font: 12px/16px 'IRANSansX', sans-serif;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(25, 147, 147, 0.15) 0%, rgba(25, 147, 147, 0.25) 100%);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  ${props => props.$isOdd ? css`
    animation: ${showChatOdd} 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    float: right;
    margin-right: 50px;
    color: #0AD5C1;
    background: linear-gradient(135deg, rgba(10, 213, 193, 0.15) 0%, rgba(10, 213, 193, 0.25) 100%);
    
    &:before {
      position: absolute;
      top: 2px;
      right: -45px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      content: '';
      background: linear-gradient(135deg, #0AD5C1 0%, #0EC879 100%);
      box-shadow: 0 2px 8px rgba(10, 213, 193, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    &:after {
      position: absolute;
      top: 12px;
      right: -12px;
      content: '';
      width: 0;
      height: 0;
      border-top: 8px solid rgba(10, 213, 193, 0.25);
      border-right: 8px solid transparent;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
  ` : css`
    animation: ${showChatEven} 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    float: left;
    margin-left: 50px;
    color: #0EC879;
    background: linear-gradient(135deg, rgba(14, 200, 121, 0.15) 0%, rgba(14, 200, 121, 0.25) 100%);
    
    &:before {
      position: absolute;
      top: 2px;
      left: -45px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      content: '';
      background: linear-gradient(135deg, #0EC879 0%, #0AD5C1 100%);
      box-shadow: 0 2px 8px rgba(14, 200, 121, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    &:after {
      position: absolute;
      top: 12px;
      left: -12px;
      content: '';
      width: 0;
      height: 0;
      border-top: 8px solid rgba(14, 200, 121, 0.25);
      border-left: 8px solid transparent;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
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
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.12) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 13px;
  font-family: 'IRANSansX', sans-serif;
  outline: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }
  
  &:focus {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.18) 100%);
    border-color: rgba(10, 213, 193, 0.4);
    box-shadow: 0 0 20px rgba(10, 213, 193, 0.2);
    transform: scale(1.02);
  }
`;

const SendButton = styled.button`
  margin-left: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #0AD5C1 0%, #0EC879 100%);
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: 'IRANSansX', sans-serif;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 15px rgba(10, 213, 193, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(10, 213, 193, 0.5);
    background: linear-gradient(135deg, #0EC879 0%, #0AD5C1 100%);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(10, 213, 193, 0.2);
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
  font-family: 'IRANSansX', sans-serif;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.4;
    filter: drop-shadow(0 2px 4px rgba(10, 213, 193, 0.2));
  }

  h3 {
    margin: 0 0 6px 0;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 11px;
    opacity: 0.7;
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
  top: 90px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'IRANSansX', sans-serif;
  background: ${props => props.$connected ? 
    'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' : 
    'linear-gradient(135deg, #f44336 0%, #EF5350 100%)'};
  color: white;
  z-index: 10;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
`;

const TypingIndicator = styled.div`
  padding: 6px 12px;
  font-size: 10px;
  font-family: 'IRANSansX', sans-serif;
  color: rgba(10, 213, 193, 0.8);
  font-style: italic;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.12) 100%);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 6px 0;
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
  const selectedUserRef = useRef(selectedUser);
  


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedUser) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Create temporary message to show immediately
    const tempMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      content: messageContent,
      senderId: selectedUser.senderId,
      receiverId: selectedUser.reciverId,
      conversationId: selectedUser.conversationId,
      sentAt: new Date().toISOString(),
      isRead: false,
      messageType: 'text'
    };

    // Add message immediately to UI
    setMessages(prev => [...prev, tempMessage]);
    console.log('✅ Message added to UI immediately');

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
        } else {
          console.log('❌ Failed to send message via SignalR');
        }
      } else {
        console.log('⚠️ SignalR not connected, using REST API');
      }
      
      // Use REST API if SignalR failed
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
          // Remove temp message and reload to get real message with proper ID
          setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
          await fetchMessages();
        } else {
          // Remove temp message on failure
          setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
          throw new Error('Failed to send message via REST API');
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Remove temp message and restore input on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
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

  // Update selectedUser ref whenever selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Initialize SignalR connection once
  useEffect(() => {
    const connectionStateHandler = (connected: boolean) => {
      console.log('🔗 SignalR connection state changed:', connected);
      setIsSignalRConnected(connected);
    };

    const messageHandler = (message: ChatMessage) => {
      console.log('📨 Received message via SignalR:', message);
      console.log('📨 Current selectedUser:', selectedUserRef.current);
      
      // Only add message if it belongs to current conversation
      setMessages(prev => {
        // Get current selectedUser from the ref to avoid stale closure
        const currentUser = selectedUserRef.current;
        const currentConversationId = currentUser?.conversationId;
        
        console.log('📨 Message conversationId:', message.conversationId);
        console.log('📨 Current conversationId:', currentConversationId);
        
        // Only process message if it belongs to current conversation OR if no conversation is set yet
        if (message.conversationId === currentConversationId || 
            (currentConversationId === null && 
             (message.senderId === currentUser?.senderId || message.receiverId === currentUser?.senderId))) {
          
          // Check if message already exists (by ID or by content+sender for temp messages)
          const existsById = prev.some(m => m.id === message.id);
          const existsByContent = prev.some(m => 
             m.content === message.content && 
             m.senderId === message.senderId && 
             Math.abs(new Date(m.sentAt).getTime() - new Date(message.sentAt).getTime()) < 5000
           );
          
          if (!existsById && !existsByContent) {
            console.log('✅ Adding new message to current conversation');
            return [...prev, message];
          } else {
            // If this is a real message replacing a temp message, replace it
            if (existsByContent && !existsById) {
              console.log('🔄 Replacing temporary message with real message');
              return prev.map(m => 
                 m.content === message.content && 
                 m.senderId === message.senderId && 
                 Math.abs(new Date(m.sentAt).getTime() - new Date(message.sentAt).getTime()) < 5000
                   ? message : m
               );
            }
            console.log('🚫 Message already exists, ignoring');
          }
        } else {
          console.log('🚫 Message belongs to different conversation, ignoring');
        }
        return prev;
      });
    };

    const typingHandler = (userId: number, typing: boolean) => {
      console.log('⌨️ User typing:', userId, typing);
      // Get current selectedUser from the ref to avoid stale closure
      const currentUser = selectedUserRef.current;
      // Show typing indicator only for current conversation partner
      if (userId === currentUser?.reciverId) {
        setIsTyping(typing);
      }
    };

    const initializeSignalR = async () => {
      // Set up event handlers
      signalRService.onConnectionStateChange(connectionStateHandler);
      signalRService.onMessage(messageHandler);
      signalRService.onTyping(typingHandler);

      // Connect to SignalR
      console.log('🔄 Connecting to SignalR...');
      const connected = await signalRService.connect();
      console.log('✅ SignalR connected:', connected);
    };

    initializeSignalR();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up SignalR event handlers');
      signalRService.offConnectionStateChange(connectionStateHandler);
      signalRService.offMessage(messageHandler);
      signalRService.offTyping(typingHandler);
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
    
    // Event handlers are now set up globally in the first useEffect
    
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
      <TopSpacer />
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
                      margin: '15px 0',
                      color: 'rgba(10, 213, 193, 0.5)',
                      fontSize: '10px',
                      listStyle: 'none',
                      clear: 'both',
                      fontFamily: 'IRANSansX, sans-serif',
                      fontWeight: '500'
                    }}>
                      {formatDate(message.sentAt)}
                    </li>
                  )}
                  
                  <MessageItem key={`msg-${message.id}-${index}`} $isOdd={isMyMessage}>
                    {message.content}
                    <div style={{
                      fontSize: '9px',
                      marginTop: '3px',
                      opacity: 0.6
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