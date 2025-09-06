import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { ChatMessage } from '../types/api';

class SignalRService {
  private connection: HubConnection | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private connectionPromise: Promise<void> | null = null;

  // Event handlers
  private onMessageReceived: ((message: ChatMessage) => void) | null = null;
  private onConnectionStateChanged: ((connected: boolean) => void) | null = null;
  private onTypingReceived: ((userId: string, isTyping: boolean) => void) | null = null;
  private onUserOnlineStatusChanged: ((userId: string, isOnline: boolean) => void) | null = null;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    try {
      this.connection = new HubConnectionBuilder()
        .withUrl('/chatHub', {
          withCredentials: false,
          headers: {
            // Add Telegram init data if available
            ...(window.Telegram?.WebApp?.initData && {
              'X-Telegram-Init-Data': window.Telegram.WebApp.initData
            })
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 3) {
              return 2000; // 2 seconds for first 3 attempts
            } else if (retryContext.previousRetryCount < 6) {
              return 5000; // 5 seconds for next 3 attempts
            } else {
              return 10000; // 10 seconds for subsequent attempts
            }
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      this.setupEventHandlers();
    } catch (error) {
      console.error('خطا در ایجاد اتصال SignalR:', error);
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Connection state events
    this.connection.onclose((error) => {
      console.log('اتصال SignalR قطع شد:', error);
      this.onConnectionStateChanged?.(false);
      this.handleReconnection();
    });

    this.connection.onreconnecting((error) => {
      console.log('در حال تلاش برای اتصال مجدد SignalR:', error);
      this.onConnectionStateChanged?.(false);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('اتصال مجدد SignalR برقرار شد:', connectionId);
      this.onConnectionStateChanged?.(true);
      this.reconnectAttempts = 0;
    });

    // Message events
    this.connection.on('ReceiveMessage', (message: ChatMessage) => {
      console.log('پیام جدید دریافت شد:', message);
      this.onMessageReceived?.(message);
    });

    this.connection.on('MessageReceived', (message: ChatMessage) => {
      console.log('پیام جدید دریافت شد (MessageReceived):', message);
      this.onMessageReceived?.(message);
    });

    // Typing events
    this.connection.on('UserTyping', (userId: string, isTyping: boolean) => {
      console.log(`کاربر ${userId} در حال تایپ: ${isTyping}`);
      this.onTypingReceived?.(userId, isTyping);
    });

    this.connection.on('ReceiveTyping', (userId: string, isTyping: boolean) => {
      console.log(`کاربر ${userId} در حال تایپ (ReceiveTyping): ${isTyping}`);
      this.onTypingReceived?.(userId, isTyping);
    });

    // User online status events
    this.connection.on('UserOnlineStatusChanged', (userId: string, isOnline: boolean) => {
      console.log(`وضعیت آنلاین کاربر ${userId} تغییر کرد: ${isOnline}`);
      this.onUserOnlineStatusChanged?.(userId, isOnline);
    });

    this.connection.on('UserConnected', (userId: string) => {
      console.log(`کاربر ${userId} متصل شد`);
      this.onUserOnlineStatusChanged?.(userId, true);
    });

    this.connection.on('UserDisconnected', (userId: string) => {
      console.log(`کاربر ${userId} قطع شد`);
      this.onUserOnlineStatusChanged?.(userId, false);
    });
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('حداکثر تعداد تلاش برای اتصال مجدد به پایان رسید');
      return;
    }

    this.reconnectAttempts++;
    console.log(`تلاش ${this.reconnectAttempts} برای اتصال مجدد...`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('خطا در اتصال مجدد:', error);
        this.handleReconnection();
      }
    }, this.reconnectDelay);
  }

  async connect(): Promise<void> {
    if (!this.connection) {
      this.initializeConnection();
    }

    if (this.connection?.state === 'Connected') {
      console.log('اتصال SignalR از قبل برقرار است');
      this.onConnectionStateChanged?.(true);
      return;
    }

    if (this.isConnecting || this.connectionPromise) {
      console.log('در حال اتصال به SignalR...');
      return this.connectionPromise || Promise.resolve();
    }

    this.isConnecting = true;
    this.connectionPromise = this.performConnection();

    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  async start(): Promise<void> {
    return this.connect();
  }

  async stop(): Promise<void> {
    return this.disconnect();
  }

  private async performConnection(): Promise<void> {
    if (!this.connection) {
      throw new Error('اتصال SignalR مقداردهی نشده است');
    }

    try {
      console.log('شروع اتصال به SignalR...');
      await this.connection.start();
      console.log('اتصال SignalR با موفقیت برقرار شد');
      this.onConnectionStateChanged?.(true);
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('خطا در اتصال به SignalR:', error);
      this.onConnectionStateChanged?.(false);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        console.log('قطع اتصال SignalR...');
        await this.connection.stop();
        console.log('اتصال SignalR قطع شد');
        this.onConnectionStateChanged?.(false);
      } catch (error) {
        console.error('خطا در قطع اتصال SignalR:', error);
      }
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (!this.isConnected()) {
      console.warn('اتصال SignalR برقرار نیست - تلاش برای اتصال...');
      await this.connect();
    }

    try {
      console.log(`پیوستن به مکالمه: ${conversationId}`);
      await this.connection?.invoke('JoinConversation', conversationId);
      console.log(`با موفقیت به مکالمه ${conversationId} پیوستید`);
    } catch (error) {
      console.error('خطا در پیوستن به مکالمه:', error);
      throw error;
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (!this.isConnected()) {
      console.warn('اتصال SignalR برقرار نیست');
      return;
    }

    try {
      console.log(`خروج از مکالمه: ${conversationId}`);
      await this.connection?.invoke('LeaveConversation', conversationId);
      console.log(`با موفقیت از مکالمه ${conversationId} خارج شدید`);
    } catch (error) {
      console.error('خطا در خروج از مکالمه:', error);
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('اتصال SignalR برقرار نیست');
    }

    try {
      console.log(`ارسال پیام به مکالمه ${conversationId}:`, content);
      
      // Try different method names for compatibility
      const methods = ['SendMessage', 'SendChatMessage', 'SendMessageToConversation'];
      
      for (const method of methods) {
        try {
          await this.connection?.invoke(method, conversationId, content);
          console.log(`پیام با موفقیت از طریق ${method} ارسال شد`);
          return;
        } catch (error) {
          console.warn(`خطا در ارسال پیام با ${method}:`, error);
          if (method === methods[methods.length - 1]) {
            throw error; // Re-throw if it's the last method
          }
        }
      }
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
      throw error;
    }
  }

  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    if (!this.isConnected()) {
      console.warn('اتصال SignalR برقرار نیست - نمی‌توان نشانگر تایپ ارسال کرد');
      return;
    }

    try {
      console.log(`ارسال نشانگر تایپ به مکالمه ${conversationId}: ${isTyping}`);
      
      // Try different method names for compatibility
      const methods = ['SendTyping', 'SendTypingIndicator', 'NotifyTyping'];
      
      for (const method of methods) {
        try {
          await this.connection?.invoke(method, conversationId, isTyping);
          console.log(`نشانگر تایپ با موفقیت از طریق ${method} ارسال شد`);
          return;
        } catch (error) {
          console.warn(`خطا در ارسال نشانگر تایپ با ${method}:`, error);
          if (method === methods[methods.length - 1]) {
            // Don't throw for typing indicator failures
            console.error('خطا در ارسال نشانگر تایپ:', error);
            return;
          }
        }
      }
    } catch (error) {
      console.error('خطا در ارسال نشانگر تایپ:', error);
    }
  }

  isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }

  // Event handler setters
  // Removed duplicate methods - using setOnMessageReceived, setOnConnectionStateChanged, etc. instead

  setOnMessageReceived(handler: (message: ChatMessage) => void): void {
    this.onMessageReceived = handler;
  }

  setOnConnectionStateChanged(handler: (connected: boolean) => void): void {
    this.onConnectionStateChanged = handler;
  }

  setOnTypingReceived(handler: (userId: string, isTyping: boolean) => void): void {
    this.onTypingReceived = handler;
  }

  setOnUserOnlineStatusChanged(handler: (userId: string, isOnline: boolean) => void): void {
    this.onUserOnlineStatusChanged = handler;
  }

  // Cleanup
  dispose(): void {
    this.disconnect();
    this.onMessageReceived = null;
    this.onConnectionStateChanged = null;
    this.onTypingReceived = null;
    this.onUserOnlineStatusChanged = null;
  }
}

// Create and export a singleton instance
export const signalRService = new SignalRService();
export default signalRService;