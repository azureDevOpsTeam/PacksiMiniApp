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
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
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
      console.error('API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'خطا در ارسال درخواست'
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;