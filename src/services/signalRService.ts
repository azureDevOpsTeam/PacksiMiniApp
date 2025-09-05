import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { ChatMessage } from '../types/api';

class SignalRService {
  private connection: HubConnection | null = null;
  private isConnected = false;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  // Event handlers
  private onMessageReceived: ((message: ChatMessage) => void) | null = null;
  private onConnectionStateChanged: ((isConnected: boolean) => void) | null = null;
  private onUserTyping: ((userId: number, isTyping: boolean) => void) | null = null;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    // Get Telegram init data for authentication
    const telegramInitData = (window as any).Telegram?.WebApp?.initData || '';
    
    this.connection = new HubConnectionBuilder()
      .withUrl('https://api.packsi.net/chatHub', {
        accessTokenFactory: () => telegramInitData
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

    // Handle connection state changes
    this.connection.onclose(() => {
      this.isConnected = false;
      this.onConnectionStateChanged?.(false);
      console.log('SignalR connection closed');
    });

    this.connection.onreconnecting(() => {
      this.isConnected = false;
      this.onConnectionStateChanged?.(false);
      console.log('SignalR reconnecting...');
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
      this.onConnectionStateChanged?.(true);
      console.log('SignalR reconnected');
    });

    // Handle incoming messages
    this.connection.on('ReceiveMessage', (message: ChatMessage) => {
      console.log('Received message via SignalR:', message);
      this.onMessageReceived?.(message);
    });

    // Handle typing indicators
    this.connection.on('UserTyping', (userId: number, isTyping: boolean) => {
      this.onUserTyping?.(userId, isTyping);
    });

    // Handle message status updates (read, delivered, etc.)
    this.connection.on('MessageStatusUpdated', (messageId: number, status: string) => {
      console.log(`Message ${messageId} status updated to: ${status}`);
    });
  }

  async connect(): Promise<boolean> {
    if (!this.connection || this.isConnected) {
      return this.isConnected;
    }

    try {
      await this.connection.start();
      this.isConnected = true;
      this.onConnectionStateChanged?.(true);
      console.log('SignalR connected successfully');
      return true;
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      this.isConnected = false;
      this.onConnectionStateChanged?.(false);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        this.onConnectionStateChanged?.(false);
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
      await this.connection.invoke('SendMessage', {
        conversationId,
        content,
        receiverId
      });
      return true;
    } catch (error) {
      console.error('Error sending message via SignalR:', error);
      return false;
    }
  }

  async joinConversation(conversationId: number): Promise<boolean> {
    if (!this.connection || !this.isConnected) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('JoinConversation', conversationId);
      console.log(`Joined conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error joining conversation:', error);
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
    this.onMessageReceived = callback;
  }

  onConnectionStateChange(callback: (isConnected: boolean) => void): void {
    this.onConnectionStateChanged = callback;
  }

  onTyping(callback: (userId: number, isTyping: boolean) => void): void {
    this.onUserTyping = callback;
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