import type { CreateRequestPayload, ApiResponse, CreateRequestResponse, CitiesTreeResponse, ItemTypeResponse, CountriesResponse, UserInfoResponse, VerifyPhoneNumberPayload, VerifyPhoneNumberResponse, ValidateResponse } from '../types/api';

const API_BASE_URL = 'https://api.packsi.net/api';

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

  async getCitiesTree(): Promise<CitiesTreeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Region/GetCitiesTree`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cities tree:', error);
      throw error;
    }
  }

  async getItemTypes(): Promise<ItemTypeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/MiniApp/ItemType`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching item types:', error);
      throw error;
    }
  }

  async getCountries(): Promise<CountriesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Region/GetCountries`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/MiniApp/UserInfo`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async verifyPhoneNumber(payload: VerifyPhoneNumberPayload): Promise<VerifyPhoneNumberResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/MiniApp/VerifyPhoneNumber`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying phone number:', error);
      throw error;
    }
  }

  async validate(): Promise<ValidateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/MiniApp/validate`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating user:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;