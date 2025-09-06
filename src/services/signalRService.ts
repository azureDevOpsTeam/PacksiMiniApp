import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { ChatMessage } from '../types/api';

class SignalRService {
  private connection: HubConnection | null = null;
  private isConnected = false;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  // Event handlers - support multiple callbacks
  private onMessageReceivedCallbacks: ((message: ChatMessage) => void)[] = [];
  private onConnectionStateChangedCallbacks: ((isConnected: boolean) => void)[] = [];
  private onUserTypingCallbacks: ((userId: number, isTyping: boolean) => void)[] = [];

  constructor() {
    if (!this.connection) {
      this.initializeConnection();
    }
  }

  private initializeConnection() {
    // Get Telegram init data for authentication
    const telegramInitData = (window as any).Telegram?.WebApp?.initData || '';
    console.log('🔑 Telegram init data:', telegramInitData ? 'Available' : 'Not available');
    console.log('🔑 Telegram WebApp object:', (window as any).Telegram?.WebApp ? 'Available' : 'Not available');

    this.connection = new HubConnectionBuilder()
      .withUrl('https://api.packsi.net/chatHub', {
        withCredentials: false,
        headers: telegramInitData ? {
          'X-Telegram-Init-Data': telegramInitData
        } : {}
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
            return this.reconnectDelay;
          }
          return null; // Stop reconnecting
        }
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Add generic event listener for debugging
    this.connection.onclose((error) => {
      console.log('🔌 SignalR connection closed:', error);
    });

    // Log all incoming events for debugging
    const originalOn = this.connection.on.bind(this.connection);
    this.connection.on = function(methodName: string, newMethod: (...args: any[]) => void) {
      console.log(`🎯 Registering handler for event: ${methodName}`);
      return originalOn(methodName, (...args: any[]) => {
        console.log(`📡 Received event '${methodName}' with args:`, args);
        return newMethod(...args);
      });
    };

    // Handle connection state changes
    this.connection.onclose(() => {
      this.isConnected = false;
      this.onConnectionStateChangedCallbacks.forEach(callback => callback(false));
      console.log('SignalR connection closed');
    });

    this.connection.onreconnecting(() => {
      this.isConnected = false;
      this.onConnectionStateChangedCallbacks.forEach(callback => callback(false));
      console.log('SignalR reconnecting...');
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
      this.onConnectionStateChangedCallbacks.forEach(callback => callback(true));
      console.log('SignalR reconnected');
    });

    // Handle incoming messages - try multiple event names
    this.connection.on('MessageReceived', (message: ChatMessage) => {
      console.log('📨 Received message via SignalR (MessageReceived):', message);
      this.onMessageReceivedCallbacks.forEach(callback => callback(message));
    });

    this.connection.on('ReceiveMessage', (message: ChatMessage) => {
      console.log('📨 Received message via SignalR (ReceiveMessage):', message);
      this.onMessageReceivedCallbacks.forEach(callback => callback(message));
    });

    this.connection.on('NewMessage', (message: ChatMessage) => {
      console.log('📨 Received message via SignalR (NewMessage):', message);
      this.onMessageReceivedCallbacks.forEach(callback => callback(message));
    });

    // Handle sent messages (for sender confirmation)
    this.connection.on('MessageSent', (message: ChatMessage) => {
      console.log('📤 Message sent confirmation via SignalR:', message);
      this.onMessageReceivedCallbacks.forEach(callback => callback(message));
    });

    // Add generic message handler for debugging
    this.connection.on('ReceiveTestMessage', (connectionId: string, message: string) => {
      console.log('📨 Test message received:', { connectionId, message });
      // Convert to ChatMessage format if needed
      const chatMessage: ChatMessage = {
        id: Date.now(),
        content: message,
        senderId: 0,
        receiverId: 0,
        conversationId: 0,
        sentAt: new Date().toISOString(),
        isRead: false,
        messageType: 'text'
      };
      this.onMessageReceivedCallbacks.forEach(callback => callback(chatMessage));
    });

    // Handle typing indicators
    this.connection.on('UserTyping', (userId: number, isTyping: boolean) => {
      this.onUserTypingCallbacks.forEach(callback => callback(userId, isTyping));
    });

    // Handle message status updates (read, delivered, etc.)
    this.connection.on('MessageStatusUpdated', (messageId: number, status: string) => {
      console.log(`Message ${messageId} status updated to: ${status}`);
    });
  }

  async connect(): Promise<boolean> {
    if (!this.connection || this.isConnected) {
      console.log('SignalR already connected or no connection object');
      return this.isConnected;
    }

    console.log('Attempting to connect to SignalR...');
    try {
      await this.connection.start();
      this.isConnected = true;
      this.onConnectionStateChangedCallbacks.forEach(callback => callback(true));
      console.log('✅ SignalR connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Error connecting to SignalR:', error);
      this.isConnected = false;
      this.onConnectionStateChangedCallbacks.forEach(callback => callback(false));
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        this.onConnectionStateChangedCallbacks.forEach(callback => callback(false));
        console.log('SignalR disconnected');
      } catch (error) {
        console.error('Error disconnecting from SignalR:', error);
      }
    }
  }

  async sendMessage(conversationId: number, content: string, receiverId: number): Promise<boolean> {
    if (!this.connection || !this.isConnected) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      console.log('📤 Attempting to send message via SignalR:', { conversationId, content, receiverId });
      
      // Try different method names that might be used by backend
      try {
        await this.connection.invoke('SendMessage', {
          conversationId,
          content,
          receiverId
        });
        console.log('✅ Message sent via SendMessage method');
        return true;
      } catch (error1) {
        console.log('❌ SendMessage failed, trying SendChatMessage:', error1);
        
        try {
          await this.connection.invoke('SendChatMessage', conversationId, content, receiverId);
          console.log('✅ Message sent via SendChatMessage method');
          return true;
        } catch (error2) {
          console.log('❌ SendChatMessage failed, trying SendTestMessage:', error2);
          
          try {
            await this.connection.invoke('SendTestMessage', content);
            console.log('✅ Message sent via SendTestMessage method');
            return true;
          } catch (error3) {
            console.error('❌ All send methods failed:', { error1, error2, error3 });
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Error sending message via SignalR:', error);
      return false;
    }
  }

  async joinConversation(conversationId: number): Promise<boolean> {
    if (!this.connection || !this.isConnected) {
      console.error('❌ SignalR not connected for joining conversation');
      return false;
    }

    try {
      await this.connection.invoke('JoinConversation', conversationId);
      console.log(`✅ Joined conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('❌ Error joining conversation:', error);
      return false;
    }
  }

  async leaveConversation(conversationId: number): Promise<boolean> {
    if (!this.connection || !this.isConnected) {
      return true; // Already disconnected
    }

    try {
      await this.connection.invoke('LeaveConversation', conversationId);
      console.log(`Left conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error leaving conversation:', error);
      return false;
    }
  }

  async sendTypingIndicator(conversationId: number, isTyping: boolean): Promise<void> {
    if (!this.connection || !this.isConnected) {
      return;
    }

    try {
      await this.connection.invoke('SendTypingIndicator', conversationId, isTyping);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  // Event subscription methods
  onMessage(callback: (message: ChatMessage) => void): void {
    // Remove existing callback if it exists to prevent duplicates
    const existingIndex = this.onMessageReceivedCallbacks.indexOf(callback);
    if (existingIndex === -1) {
      this.onMessageReceivedCallbacks.push(callback);
    }
  }

  onConnectionStateChange(callback: (isConnected: boolean) => void): void {
    // Remove existing callback if it exists to prevent duplicates
    const existingIndex = this.onConnectionStateChangedCallbacks.indexOf(callback);
    if (existingIndex === -1) {
      this.onConnectionStateChangedCallbacks.push(callback);
    }
  }

  onTyping(callback: (userId: number, isTyping: boolean) => void): void {
    // Remove existing callback if it exists to prevent duplicates
    const existingIndex = this.onUserTypingCallbacks.indexOf(callback);
    if (existingIndex === -1) {
      this.onUserTypingCallbacks.push(callback);
    }
  }

  // Methods to remove event listeners
  offMessage(callback: (message: ChatMessage) => void): void {
    const index = this.onMessageReceivedCallbacks.indexOf(callback);
    if (index > -1) {
      this.onMessageReceivedCallbacks.splice(index, 1);
    }
  }

  offConnectionStateChange(callback: (isConnected: boolean) => void): void {
    const index = this.onConnectionStateChangedCallbacks.indexOf(callback);
    if (index > -1) {
      this.onConnectionStateChangedCallbacks.splice(index, 1);
    }
  }

  offTyping(callback: (userId: number, isTyping: boolean) => void): void {
    const index = this.onUserTypingCallbacks.indexOf(callback);
    if (index > -1) {
      this.onUserTypingCallbacks.splice(index, 1);
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get connectionState(): string {
    return this.connection?.state || 'Disconnected';
  }
}

// Export singleton instance
export const signalRService = new SignalRService();
export default signalRService;