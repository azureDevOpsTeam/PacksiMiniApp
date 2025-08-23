import type { CreateRequestPayload, ApiResponse, CreateRequestResponse, CitiesTreeResponse, ItemTypeResponse, CountriesResponse, UserInfoResponse, VerifyPhoneNumberPayload, VerifyPhoneNumberResponse, ValidateResponse, AddUserPreferredLocationRequest, AddUserPreferredLocationResponse, UpdateProfileRequest, UpdateProfileResponse } from '../types/api';

const API_BASE_URL = 'https://api.packsi.net/api';

class ApiService {
  private getHeaders(isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};
    
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Telegram Init Data if available
    const initData = window.Telegram?.WebApp?.initData;
    if (initData && initData.trim() !== '') {
      console.log('Using Telegram initData:', initData.substring(0, 50) + '...');
      headers['X-Telegram-Init-Data'] = initData;
    } else {
      console.log('No Telegram initData available, using development token');
      // Use provided token for development
      headers['X-Telegram-Init-Data'] = 'query_id=AAEUWrBhAgAAABRasGE_HYpx&user=%7B%22id%22%3A5933914644%2C%22first_name%22%3A%22Shahram%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22ShahramOweisy%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FQGwtYapyXkY4-jZJkczPeUb_XKfimJozOKy8lZzBhtQc4cO4xBQzwdPwcb_QSNih.svg%22%7D&auth_date=1755948305&signature=z_ox7tsfQmjtIANsyqVft3aMlF-2P6l5KEK7nivPnLHTvLnqP4Z2OsIPvn9uooDzxKfeScQOkAqZoZEtICyRDg&hash=1d5a19786e50f68519ad78ecf36b6dd52bac454b1afe0c18038d675256d79595';
    }

    // Add additional headers for mobile compatibility
    headers['Accept'] = 'application/json';
    headers['Cache-Control'] = 'no-cache';

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

  async getCities(): Promise<CitiesTreeResponse> {
    return this.getCitiesTree();
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
      console.log('Sending phone verification request:', payload);
      console.log('Headers:', this.getHeaders());
      
      const response = await fetch(`${API_BASE_URL}/MiniApp/VerifyPhoneNumber`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle specific HTTP status codes for phone verification
        switch (response.status) {
          case 400:
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || 'فرمت شماره موبایل نامعتبر است';
            } catch {
              errorMessage = 'فرمت شماره موبایل نامعتبر است';
            }
            break;
          case 401:
            errorMessage = 'احراز هویت ناموفق - لطفاً دوباره وارد شوید';
            break;
          case 429:
            errorMessage = 'تعداد درخواست‌ها بیش از حد مجاز - لطفاً کمی صبر کنید';
            break;
          case 500:
            errorMessage = 'خطای سرور - لطفاً دوباره تلاش کنید';
            break;
          default:
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Phone verification response:', data);
      return data;
    } catch (error) {
      console.error('Error verifying phone number:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید.');
      }
      
      throw error;
    }
  }

  async validate(): Promise<ValidateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/MiniApp/validate`, {
        method: 'GET',
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

  async addUserPreferredLocation(request: AddUserPreferredLocationRequest): Promise<AddUserPreferredLocationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/MiniApp/AddUserPreferredLocation`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding user preferred location:', error);
      throw error;
    }
  }

  async updateProfile(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/MiniApp/UpdateProfile`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;