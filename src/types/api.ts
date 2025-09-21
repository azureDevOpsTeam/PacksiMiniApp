// API Types for MiniApp Create Request

// Suggestion interface for price suggestions
export interface Suggestion {
  suggestionId: number;
  userAccountId: number;
  fullName: string;
  price: number;
  currency: number; // 1 = Dollar, 2 = Rial
  description: string | null;
  lastStatusEn: string;
  lastStatusFa: string;
}

export interface CreateRequestModel {
  originCityId: number;
  destinationCityId: number;
  departureDate: string; // ISO string format
  arrivalDate: string; // ISO string format
  requestType: number;
  description: string;
  maxWeightKg: number;
  maxLengthCm: number;
  maxWidthCm: number;
  maxHeightCm: number;
  itemTypeIds: number[];
  files: string[]; // Empty array in model - actual files sent via FormData
}

export interface CreateRequestPayload {
  model: CreateRequestModel;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface CreateRequestResponse {
  id: number;
  status: string;
  createdAt: string;
}

// Cities API Types
export interface CityItem {
  text: string;
  label: string;
  value: string;
  icon: string | null;
  children: CityItem[];
}

export interface ItemType {
  itemTypeId: number;
  itemType: string;
  persianName: string;
}

export interface ItemTypeResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: ItemType[];
  notificationType: {
    name: string;
    value: number;
  };
}

export interface CitiesTreeResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: {
    listItems: CityItem[];
  };
  notificationType: {
    name: string;
    value: number;
  };
}

// Country API Types
export interface CountryItem {
  text: string;
  label: string;
  value: string;
  icon: string;
}

export interface CountriesResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: {
    listItems: CountryItem[];
  };
  notificationType: {
    name: string;
    value: number;
  };
}

// User Info API Types
export interface UserInfo {
  countryOfResidenceId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  address: string;
  gender: number;
  selectedCities?: number[];
  selectedCityLabels?: string[];
}

export interface UserInfoResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: UserInfo;
  notificationType: {
    name: string;
    value: number;
  };
}

// Phone Number Verification API Types
export interface VerifyPhoneNumberModel {
  phoneNumber: string;
}

export interface VerifyPhoneNumberPayload {
  model: VerifyPhoneNumberModel;
}

export interface VerifyPhoneNumberResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Validate API Types
export interface ValidateResult {
  setPreferredLocation: boolean;
  confirmPhoneNumber: boolean;
  hasCompletedProfile: boolean;
}

export interface ValidateResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: ValidateResult;
  notificationType: {
    name: string;
    value: number;
  };
}

export interface AddUserPreferredLocationModel {
  countryOfResidenceId: number;
  cityIds: number[];
}

export interface AddUserPreferredLocationRequest {
  model: AddUserPreferredLocationModel;
}

export interface AddUserPreferredLocationResponse {
  success: boolean;
  message?: string;
}

// Update Profile API Types
export interface UpdateProfileModel {
  countryOfResidenceId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  address: string;
  gender: number;
  cityIds: number[];
}

export interface UpdateProfileRequest {
  model: UpdateProfileModel;
}

export interface UpdateProfileResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Outbound Trips API Types
export interface OutboundTrip {
  requestId: number;
  userAccountId: number;
  fullName: string;
  originCity: string;
  originCityFa: string;
  destinationCity: string;
  destinationCityFa: string;
  departureDate: string;
  departureDatePersian: string | null;
  arrivalDate: string;
  arrivalDatePersian: string | null;
  suggestedPrice: number | null;
  itemTypes: string[];
  itemTypesFa: string[];
  description: string | null;
  maxWeightKg: number | null;
  maxLengthCm: number | null;
  maxWidthCm: number | null;
  maxHeightCm: number | null;
  currentUserStatus: number;
  currentUserStatusEn: string;
  currentUserStatusFa: string;
  isFavorite?: boolean;
  tripType: string;
  selectStatus: string;
  suggestions?: Suggestion[];
  ipicked_OperationButton?: string;
  userRate?: number; // Rating from 1 to 5, can be decimal like 4.5
}

export interface OutboundTripsResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: OutboundTrip[];
  notificationType: {
    name: string;
    value: number;
  };
}

// Select Request API Types
export interface SelectRequestModel {
  requestId: number;
  tripOption?: string;
  suggestionPrice?: number;
  currency?: number;
  description?: string;
  itemTypeId?: number;
  files?: File[];
}

export interface SelectRequestPayload {
  model: SelectRequestModel;
}

export interface SelectRequestResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// My Request Types
export interface MyRequestTrip {
  id: number;
  userAccountId: number;
  originCity: string;
  originCityFa?: string;
  destinationCity: string;
  destinationCityFa?: string;
  departureDate: string;
  arrivalDate: string;
  tripType: string; // 'Passenger' or 'Sender'
  status: string;
  description?: string;
  maxWeightKg?: number;
  maxLengthCm?: number;
  maxWidthCm?: number;
  maxHeightCm?: number;
  itemTypes?: string[];
  itemTypesFa?: string[];
  createdAt?: string;
}

export interface MyRequestTripsResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: MyRequestTrip[];
  notificationType: {
    name: string;
    value: number;
  };
}

export interface GetMyRequestTripsResponse {
  success: boolean;
  data: MyRequestTrip[];
  message?: string;
}

// LiveChat API Types
export interface LiveChatUser {
  requestId: number;
  reciverId: number;
  requestCreatorDisplayName: string;
  senderId: number;
  avatar: string | null;
  lastMessage: string;
  isOnline: boolean;
  isBlocked: boolean;
  lastSeenEn: string | null;
  lastSeenFa: string | null;
  conversationId: number;
}

export interface LiveChatUsersResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: LiveChatUser[];
  notificationType: {
    name: string;
    value: number;
  };
}

// Chat API Types
export interface Conversation {
  id: number;
  participantId: number;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isBlocked: boolean;
}

export interface ConversationsResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: Conversation[];
  notificationType: {
    name: string;
    value: number;
  };
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
}

export interface MessagesResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: ChatMessage[];
  notificationType: {
    name: string;
    value: number;
  };
}

export interface SendMessageModel {
  receiverId: number;
  content: string;
}

export interface SendMessagePayload {
  model: SendMessageModel;
}

export interface SendMessageResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: ChatMessage;
  notificationType: {
    name: string;
    value: number;
  };
}

export interface BlockUserModel {
  userId: number;
  isBlocked: boolean;
}

export interface BlockUserPayload {
  model: BlockUserModel;
}

export interface BlockUserResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

export interface MarkReadResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Suggestion Action Types
export interface SuggestionActionModel {
  requestSuggestionId: number;
}

export interface SuggestionActionPayload {
  model: SuggestionActionModel;
}

export interface SuggestionActionResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Types for InProgress Requests
export interface OfferSuggestion {
  id: number;
  displayName: string;
  suggestionPrice: number;
  currency: number;
  itemType: number;
  itemTypeEn: string;
  itemTypeFa: string;
  createdOn: string;
  attachments: string[];
  descriptions?: string;
  operationButton?: string;
  deliveryCode?: number;
}

export interface OfferRequest {
  id: number;
  originCityName: string;
  originCityPersianName: string;
  destinationCityName: string;
  destinationCityPersianName: string;
  status: number;
  suggestions: OfferSuggestion[];
}

export interface InProgressOffersResult {
  myReciveOffers: OfferRequest[];
  mySentOffers: OfferRequest[];
}

export interface InProgressOffersResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: InProgressOffersResult;
  notificationType: {
    name: string;
    value: number;
  };
}

// ConfirmedBySender API Types
export interface ConfirmedBySenderModel {
  requestSuggestionId: number;
}

export interface ConfirmedBySenderPayload {
  model: ConfirmedBySenderModel;
}

export interface ConfirmedBySenderResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// PickedUp API Types
export interface PickedUpModel {
  requestSuggestionId: number;
}

export interface PickedUpPayload {
  model: PickedUpModel;
}

export interface PickedUpResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Passenger Confirmed Delivery API Types
export interface PassengerConfirmedDeliveryModel {
  requestSuggestionId: number;
  deliveryCode: string;
}

export interface PassengerConfirmedDeliveryPayload {
  model: PassengerConfirmedDeliveryModel;
}

export interface PassengerConfirmedDeliveryResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Sender Confirmed Delivery API Types
export interface SaveRatingModel {
  requestSuggestionId: number;
  rate?: number; // Optional rating parameter (1-5 stars)
}

export interface SaveRatingPayload {
  model: SaveRatingModel;
}

export interface SaveRatingResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Not Delivered API Types
export interface NotDeliveredModel {
  requestSuggestionId: number;
}

export interface NotDeliveredPayload {
  model: NotDeliveredModel;
}

export interface NotDeliveredResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: any;
  notificationType: {
    name: string;
    value: number;
  };
}

// Admin Management Types
export interface GetInviteCodeResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: string; // The invite code like "K9P2Pk"
  notificationType: {
    name: string;
    value: number;
  };
}

// Dashboard Data Types
export interface DashboardData {
  referralCount: number;
  irrBalance: number;
  usdtBalance: number;
  totalPackage: number;
}

export interface GetDashboardDataResponse {
  validationResult: any;
  requestStatus: {
    name: string;
    value: number;
  };
  message: string;
  objectResult: DashboardData;
  notificationType: {
    name: string;
    value: number;
  };
}