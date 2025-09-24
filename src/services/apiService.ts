import type { CreateRequestPayload, ApiResponse, CreateRequestResponse, CitiesTreeResponse, ItemTypeResponse, CountriesResponse, UserInfoResponse, VerifyPhoneNumberPayload, VerifyPhoneNumberResponse, ValidateResponse, AddUserPreferredLocationRequest, AddUserPreferredLocationResponse, UpdateProfileRequest, UpdateProfileResponse, OutboundTripsResponse, SelectRequestPayload, SelectRequestResponse, GetMyRequestTripsResponse, LiveChatUsersResponse, ConversationsResponse, MessagesResponse, SendMessagePayload, SendMessageResponse, BlockUserPayload, BlockUserResponse, MarkReadResponse, SuggestionActionPayload, SuggestionActionResponse, InProgressOffersResponse, ConfirmedBySenderPayload, ConfirmedBySenderResponse, PickedUpPayload, PickedUpResponse, PassengerConfirmedDeliveryPayload, PassengerConfirmedDeliveryResponse, SaveRatingPayload, SaveRatingResponse, NotDeliveredPayload, NotDeliveredResponse, GetInviteCodeResponse, GetDashboardDataResponse } from '../types/api';

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
      //User1
      headers['X-Telegram-Init-Data'] = 'query_id=AAEfymc9AAAAAB_KZz3-1lnV&user=%7B%22id%22%3A1030212127%2C%22first_name%22%3A%22Shahram%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Shahram0weisy%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FEVbiVIJZP-ipzuxmiuKkh1k1-dJF0U16tjKJdfQM7M4.svg%22%7D&auth_date=1757781398&signature=HOhywJXP-xaV5T3lOI4yIQNiPBgE_jzP5fEgTyi_oH61WoJE_5Qrvq6LXmlJ5R_RBA16BQlJExt9N4r2-dOrCg&hash=75baa2138205e2ac7d484e968ae1fec7f3b51ffe9d407f7fb0f95ea2e25ad426';
      //User2
      //headers['X-Telegram-Init-Data'] = 'user=%7B%22id%22%3A5933914644%2C%22first_name%22%3A%22Shahram%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FQGwtYapyXkY4-jZJkczPeUb_XKfimJozOKy8lZzBhtQc4cO4xBQzwdPwcb_QSNih.svg%22%7D&chat_instance=-2675852455221065738&chat_type=sender&auth_date=1757963361&signature=DAkcG5KbmvbKKCL8KYfGxRKGeeL-wdCmBlO5MTGgBTaTJ3JsF_g803MJaQ5xrjlg6Bw_ejc3Tc5Ea_aVeI-5AA&hash=4c406a000ad684a3efb5a169efd08c7123138eccb506b638703833945c66841e';
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

      // بررسی حجم کل فایل‌ها (حداکثر 20 مگابایت)
      if (files && files.length > 0) {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 8MB

        if (totalSize > MAX_TOTAL_SIZE) {
          return {
            success: false,
            message: "حجم کل فایل‌ها نباید بیشتر از 20 مگابایت باشد"
          };
        }
      }

      // Add model fields directly to FormData (matching backend CreateRequestTMACommand)
      const model = payload.model;
      formData.append('OriginCityId', model.originCityId.toString());
      formData.append('DestinationCityId', model.destinationCityId.toString());
      formData.append('DepartureDate', model.departureDate);
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
      
      // Add sample userRate data for testing
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map((trip: any, index: number) => ({
          ...trip,
          userRate: [4.5, 3.2, 5.0, 2.8, 4.1][index % 5] // Sample ratings for testing
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching request trips:', error);
      throw error;
    }
  }

  async getMyRequestTrips(): Promise<GetMyRequestTripsResponse> {
    try {
      // Log headers for debugging
      const headers = this.getHeaders();
      console.log('Request headers:', headers);

      // Make the actual API call
      console.log('Calling GetMyRequestTrips API endpoint');
      const response = await fetch(`${API_BASE_URL}/Request/GetMyRequestTrips`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      console.log('Response status:', response.status);

      // Get the raw text first for debugging
      const responseText = await response.text();
      console.log('Response text:', responseText);

      // Try to parse the JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Error parsing response JSON:', parseError);
        return {
          success: false,
          data: [],
          message: 'Invalid JSON response from server'
        };
      }

      // Check if the response has the expected structure
      if (data && data.objectResult) {
        // API returns data in objectResult, but our interface expects it in data
        return {
          success: true,
          data: data.objectResult,
          message: data.message
        };
      } else if (data && data.requestStatus) {
        // Handle API error with requestStatus
        return {
          success: data.requestStatus.value === 0,
          data: data.objectResult || [],
          message: data.message
        };
      } else {
        // Unexpected response structure
        console.error('Unexpected API response structure:', data);
        return {
          success: false,
          data: [],
          message: 'Unexpected API response structure'
        };
      }
    } catch (error) {
      console.error('Error in getMyRequestTrips:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async selectRequest(payload: SelectRequestPayload): Promise<SelectRequestResponse> {
    try {
      const formData = new FormData();
      const model = payload.model;

      // Append simple fields
      formData.append("RequestId", model.requestId.toString());
      if (model.tripOption) formData.append("TripOption", model.tripOption);
      if (model.suggestionPrice !== undefined) formData.append("SuggestionPrice", model.suggestionPrice.toString());
      if (model.currency !== undefined) formData.append("Currency", model.currency.toString());
      if (model.description) formData.append("Description", model.description);
      if (model.itemTypeId !== undefined) formData.append("ItemTypeId", model.itemTypeId.toString());

      // Append files with compression for images
      if (model.files && model.files.length > 0) {
        for (const file of model.files) {
          if (file.type.startsWith("image/") && file.size > 1024 * 1024) {
            // Compress image if larger than 1MB
            await this.compressAndAppendImage(formData, file, "Files");
          } else {
            formData.append("Files", file);
          }
        }
      }

      const headers = this.getHeaders(true); // FormData mode
      const response = await fetch(`${API_BASE_URL}/Request/SelectRequest`, {
        method: "POST",
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error selecting request:", error);
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

  async getInProgressOffers(): Promise<InProgressOffersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/GetInProgressRequest`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching in progress offers:', error);
      throw error;
    }
  }

  async confirmedBySender(payload: ConfirmedBySenderPayload): Promise<ConfirmedBySenderResponse> {
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
      console.error('Error confirming by sender:', error);
      throw error;
    }
  }

  async pickedUp(payload: PickedUpPayload): Promise<PickedUpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/PickedUp`, {
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
      console.error('Error marking as picked up:', error);
      throw error;
    }
  }

  async passengerConfirmedDelivery(payload: PassengerConfirmedDeliveryPayload): Promise<PassengerConfirmedDeliveryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/PassengerConfirmedDelivery`, {
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
      console.error('Error confirming delivery by passenger:', error);
      throw error;
    }
  }

  async saveRating(payload: SaveRatingPayload): Promise<SaveRatingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/SaveRating`, {
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
      console.error('Error confirming delivery by sender:', error);
      throw error;
    }
  }

  async notDelivered(payload: NotDeliveredPayload): Promise<NotDeliveredResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Request/NotDelivered`, {
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
      console.error('Error marking as not delivered:', error);
      throw error;
    }
  }

  // Admin Management Methods
  async getInviteCode(): Promise<GetInviteCodeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Management/GetInviteCode`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching invite code:', error);
      throw error;
    }
  }

  async getDashboardData(): Promise<GetDashboardDataResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Management/GetDashboardData`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;