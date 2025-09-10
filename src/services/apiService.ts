import type { CreateRequestPayload, ApiResponse, CreateRequestResponse, CitiesTreeResponse, ItemTypeResponse, CountriesResponse, UserInfoResponse, VerifyPhoneNumberPayload, VerifyPhoneNumberResponse, ValidateResponse, AddUserPreferredLocationRequest, AddUserPreferredLocationResponse, UpdateProfileRequest, UpdateProfileResponse, OutboundTripsResponse, SelectRequestPayload, SelectRequestResponse, GetMyRequestTripsResponse, LiveChatUsersResponse, ConversationsResponse, MessagesResponse, SendMessagePayload, SendMessageResponse, BlockUserPayload, BlockUserResponse, MarkReadResponse, SuggestionActionPayload, SuggestionActionResponse } from '../types/api';

const API_BASE_URL = 'https://api.packsi.net/api/miniapp';
//const API_BASE_URL = 'http://localhost:5005/api/miniapp';

class ApiService {

  // متد فشرده‌سازی تصاویر
  private async compressAndAppendImage(formData: FormData, file: File, fieldName: string): Promise<void> {
    return new Promise<void>((resolve) => {
      // اگر فایل تصویر نیست، بدون فشرده‌سازی اضافه کن
      if (!file.type.startsWith('image/')) {
        formData.append(fieldName, file);
        resolve();
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // حداکثر ابعاد تصویر را محدود کن
          const MAX_SIZE = 1200;
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // تبدیل به JPEG با کیفیت 70%
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // ایجاد فایل جدید با نام اصلی
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                formData.append(fieldName, compressedFile);
                resolve();
              } else {
                // اگر فشرده‌سازی ناموفق بود، فایل اصلی را استفاده کن
                formData.append(fieldName, file);
                resolve();
              }
            },
            'image/jpeg',
            0.7 // کیفیت 70%
          );
        };
        img.onerror = () => {
          // در صورت خطا، فایل اصلی را استفاده کن
          formData.append(fieldName, file);
          resolve();
        };
      };
      reader.onerror = () => {
        // در صورت خطا، فایل اصلی را استفاده کن
        formData.append(fieldName, file);
        resolve();
      };
    });
  }

  private getHeaders(isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};

    // Don't set Content-Type for FormData, let browser set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Telegram Init Data if available
    const initData = window.Telegram?.WebApp?.initData;
    if (initData && initData.trim() !== '') {
      headers['X-Telegram-Init-Data'] = initData;
    } else {
      // Use provided token for development
      headers['X-Telegram-Init-Data'] = 'query_id=AAEfymc9AAAAAB_KZz0pgVLW&user=%7B%22id%22%3A1030212127%2C%22first_name%22%3A%22Shahram%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Shahram0weisy%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FEVbiVIJZP-ipzuxmiuKkh1k1-dJF0U16tjKJdfQM7M4.svg%22%7D&auth_date=1757184054&signature=H18OcG--zgmjs_SXGpAr9OCWEPYdxgThVu1r1_KOyz747kB6zGxUhQEI_WSYN08FWwanwH0cVL-TMObOxGsXAg&hash=5df74314eb234cba4b00d560bbeac4957ffceade7c9d5c163ea6a201a112cc5e';
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

      return {
        success: false,
        message: errorMessage
      };
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
      // Always use FormData to match backend [FromForm] expectation
      const formData = new FormData();

      // بررسی حجم کل فایل‌ها (حداکثر 8 مگابایت)
      if (files && files.length > 0) {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const MAX_TOTAL_SIZE = 8 * 1024 * 1024; // 8MB

        if (totalSize > MAX_TOTAL_SIZE) {
          return {
            success: false,
            message: "حجم کل فایل‌ها نباید بیشتر از 8 مگابایت باشد"
          };
        }
      }

      // Add model fields directly to FormData (matching backend CreateRequestTMACommand)
      const model = payload.model;
      formData.append('OriginCityId', model.originCityId.toString());
      formData.append('DestinationCityId', model.destinationCityId.toString());
      formData.append('DepartureDate', model.departureDate);
      formData.append('ArrivalDate', model.arrivalDate);
      formData.append('RequestType', model.requestType.toString());
      formData.append('Description', model.description || '');
      formData.append('MaxWeightKg', (model.maxWeightKg || 0).toString());
      formData.append('MaxLengthCm', (model.maxLengthCm || 0).toString());
      formData.append('MaxWidthCm', (model.maxWidthCm || 0).toString());
      formData.append('MaxHeightCm', (model.maxHeightCm || 0).toString());

      // Add ItemTypeIds array
      if (model.itemTypeIds && model.itemTypeIds.length > 0) {
        model.itemTypeIds.forEach(id => {
          formData.append('ItemTypeIds', id.toString());
        });
      }

      // Add files with compression for images
      if (files && files.length > 0) {
        for (const file of files) {
          // اگر فایل تصویر است و بیشتر از 1MB حجم دارد، فشرده‌سازی کن
          if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
            await this.compressAndAppendImage(formData, file, "Files");
          } else {
            formData.append("Files", file);
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/Request/Create`, {
        method: 'POST',
        headers: this.getHeaders(true), // Always FormData
        body: formData
      });

      return await this.handleResponse<CreateRequestResponse>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید."
        };
      }

      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          message: "درخواست لغو شد"
        };
      }

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "خطا در ارسال درخواست"
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
      const response = await fetch(`${API_BASE_URL}/Request/ItemType`, {
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
      const response = await fetch(`${API_BASE_URL}/Identity/UserInfo`, {
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

      const response = await fetch(`${API_BASE_URL}/Identity/VerifyPhoneNumber`, {
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
      const response = await fetch(`${API_BASE_URL}/Identity/validate`, {
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
      const response = await fetch(`${API_BASE_URL}/Identity/AddUserPreferredLocation`, {
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
      const response = await fetch(`${API_BASE_URL}/Identity/UpdateUserProfile`, {
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

  async getRequestTrips(): Promise<OutboundTripsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/GetRequestTrips`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching request trips:', error);
      throw error;
    }
  }

  async getMyRequestTrips(): Promise<GetMyRequestTripsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/GetMyRequestTrips`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response to match our expected format
      return {
        success: data.requestStatus?.value === 1,
        data: data.objectResult || [],
        message: data.message
      };
    } catch (error) {
      console.error('Error fetching my request trips:', error);
      throw error;
    }
  }

  async selectRequest(request: SelectRequestPayload): Promise<SelectRequestResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/SelectRequest`, {
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
      console.error('Error selecting request:', error);
      throw error;
    }
  }

  async getLiveChatUsers(): Promise<LiveChatUsersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/LiveChat/users`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching live chat users:', error);
      throw error;
    }
  }

  // Chat API Methods
  async getConversations(): Promise<ConversationsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/LiveChat/conversations`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getMessages(conversationId: number): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/LiveChat/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/LiveChat/messages`, {
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
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async blockUser(payload: BlockUserPayload): Promise<BlockUserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/LiveChat/block`, {
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
      console.error('Error blocking/unblocking user:', error);
      throw error;
    }
  }

  async markConversationAsRead(conversationId: number): Promise<MarkReadResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/LiveChat/conversations/${conversationId}/mark-read`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  // Suggestion Action API Methods
  async confirmSuggestion(payload: SuggestionActionPayload): Promise<SuggestionActionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/ConfirmedBySender`, {
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
      console.error('Error confirming suggestion:', error);
      throw error;
    }
  }

  async rejectSuggestion(payload: SuggestionActionPayload): Promise<SuggestionActionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/RejectSelection`, {
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
      console.error('Error rejecting suggestion:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;