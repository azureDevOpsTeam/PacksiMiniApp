import type { CreateRequestPayload, ApiResponse, CreateRequestResponse } from '../types/api';

const API_BASE_URL = 'https://web.draton.io/api';

class ApiService {
  private getHeaders(isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};
    
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Telegram Init Data if available
    if (window.Telegram?.WebApp?.initData) {
      headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Handle specific HTTP status codes
      switch (response.status) {
        case 400:
          errorMessage = 'درخواست نامعتبر است';
          break;
        case 401:
          errorMessage = 'احراز هویت ناموفق';
          break;
        case 403:
          errorMessage = 'دسترسی مجاز نیست';
          break;
        case 404:
          errorMessage = 'سرویس یافت نشد';
          break;
        case 429:
          errorMessage = 'تعداد درخواست‌ها بیش از حد مجاز';
          break;
        case 500:
          errorMessage = 'خطای داخلی سرور';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'سرور در دسترس نیست';
          break;
        default:
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If response is not JSON, use the text as error message
            errorMessage = errorText || errorMessage;
          }
      }

      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch {
      return {
        success: true,
        data: null as T
      };
    }
  }

  async createRequest(payload: CreateRequestPayload, files?: File[]): Promise<ApiResponse<CreateRequestResponse>> {
    try {
      let body: string | FormData;
      let isFormData = false;

      if (files && files.length > 0) {
        // Use FormData when files are present
        const formData = new FormData();
        
        // Add model data as JSON string
        formData.append('model', JSON.stringify(payload.model));
        
        // Add files
        files.forEach((file) => {
          formData.append(`files`, file);
        });
        
        body = formData;
        isFormData = true;
      } else {
        // Use JSON when no files
        body = JSON.stringify(payload);
      }

      const response = await fetch(`${API_BASE_URL}/MiniApp/Create`, {
        method: 'POST',
        headers: this.getHeaders(isFormData),
        body
      });

      return await this.handleResponse<CreateRequestResponse>(response);
    } catch (error) {
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        return {
          success: false,
          message: 'خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید.'
        };
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted
        return {
          success: false,
          message: 'درخواست لغو شد'
        };
      }
      
      // Other errors (including our custom API errors)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'خطا در ارسال درخواست'
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;