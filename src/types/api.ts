// API Types for MiniApp Create Request

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