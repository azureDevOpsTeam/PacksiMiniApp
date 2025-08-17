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
  files: string[];
}

export interface CreateRequestPayload {
  model: CreateRequestModel;
}

export interface ApiResponse<T = any> {
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