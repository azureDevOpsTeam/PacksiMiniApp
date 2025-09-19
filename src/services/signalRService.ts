import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { RetryContext } from '@microsoft/signalr';
import type { ChatMessage } from '../types/api';

class SignalRService {
  private connection: HubConnection | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private connectionPromise: Promise<void> | null = null;
  private heartbeatInterval: number | null = null;
  private isAndroid = /Android/i.test(navigator.userAgent);

  // Event handlers
  private onMessageReceived: ((message: ChatMessage) => void) | null = null;
  private onConnectionStateChanged: ((connected: boolean) => void) | null = null;
  private onTypingReceived: ((userId: string, isTyping: boolean) => void) | null = null;
  private onUserOnlineStatusChanged: ((userId: string, isOnline: boolean) => void) | null = null;

  constructor() {
    this.initializeConnection();
    this.setupVisibilityHandlers();
  }

  private setupVisibilityHandlers(): void {
    // Handle page visibility changes for better Android support
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('صفحه مرئی شد - بررسی اتصال SignalR');
          this.handlePageVisible();
        } else {
          console.log('صفحه مخفی شد');
          this.handlePageHidden();
        }
      });
    }

    // Handle app resume/pause for Android WebView
    if (this.isAndroid) {
      window.addEventListener('focus', () => {
        console.log('اپلیکیشن فوکوس یافت - بررسی اتصال');
        this.handlePageVisible();
      });
      
      window.addEventListener('blur', () => {
        console.log('اپلیکیشن فوکوس از دست داد');
        this.handlePageHidden();
      });
    }
  }

  private async handlePageVisible(): Promise<void> {
    // Check connection when page becomes visible
    if (!this.isConnected()) {
      console.log('اتصال قطع است - تلاش برای اتصال مجدد');
      try {
        await this.connect();
      } catch (error) {
        console.error('خطا در اتصال مجدد هنگام مرئی شدن صفحه:', error);
      }
    }
    this.startHeartbeat();
  }

  private handlePageHidden(): void {
    // Stop heartbeat when page is hidden to save resources
    this.stopHeartbeat();
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval || !this.isAndroid) return;
    
    // Send ping every 30 seconds on Android to keep connection alive
    this.heartbeatInterval = setInterval(async () => {
      if (this.isConnected()) {
        try {
          await this.connection?.invoke('Ping');
          console.log('Heartbeat ping ارسال شد');
        } catch (error) {
          console.warn('خطا در ارسال heartbeat ping:', error);
          // Try to reconnect if ping fails
          this.connect().catch(e => console.error('خطا در اتصال مجدد:', e));
        }
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private initializeConnection(): void {
    try {
      // Detect if running on Android WebView
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isWebView = /wv/i.test(navigator.userAgent);
      
      const connectionOptions: any = {
        withCredentials: false,
        headers: {
          // Add Telegram init data if available
          ...(window.Telegram?.WebApp?.initData && {
            'X-Telegram-Init-Data': window.Telegram.WebApp.initData
          })
        },
        // Add timeout settings for better Android compatibility
        timeout: 30000
      };

      // Use different transport for Android WebView
      if (isAndroid && isWebView) {
        connectionOptions.transport = 1; // LongPolling
      }

      this.connection = new HubConnectionBuilder()
        .withUrl('https://api.packsi.net/chathub', connectionOptions)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext: RetryContext) => {
            // Shorter delays for Android
            const baseDelay = isAndroid ? 1000 : 2000;
            if (retryContext.previousRetryCount < 3) {
              return baseDelay; 
            } else if (retryContext.previousRetryCount < 6) {
              return baseDelay * 2.5; 
            } else {
              return baseDelay * 5; 
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
    this.connection.onclose((error?: Error) => {
      console.log('اتصال SignalR قطع شد:', error);
      this.onConnectionStateChanged?.(false);
      this.handleReconnection();
    });

    this.connection.onreconnecting((error?: Error) => {
      console.log('در حال تلاش برای اتصال مجدد SignalR:', error);
      this.onConnectionStateChanged?.(false);
    });

    this.connection.onreconnected((connectionId?: string) => {
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
      
      // Start heartbeat for Android devices
      if (this.isAndroid) {
        this.startHeartbeat();
      }
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

  async sendMessage(conversationId: string, content: string, receiverId?: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('اتصال SignalR برقرار نیست');
    }

    try {
      console.log(`ارسال پیام به مکالمه ${conversationId}:`, content);
      
      // Try different message sending methods
      const messageData = {
        conversationId: conversationId,
        content: content,
        ...(receiverId && { receiverId: receiverId })
      };
      
      // Try multiple method names for compatibility
      const methods = ['SendMessage', 'SendMessageToConversation', 'SendChatMessage'];
      
      for (const method of methods) {
        try {
          await this.connection?.invoke(method, messageData);
          console.log(`پیام با موفقیت از طریق ${method} ارسال شد`);
          return;
        } catch (error) {
          console.warn(`خطا در ارسال پیام با ${method}:`, error);
          if (method === methods[methods.length - 1]) {
            throw error;
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
    this.stopHeartbeat();
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