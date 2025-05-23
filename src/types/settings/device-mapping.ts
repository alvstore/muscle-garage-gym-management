
export type DeviceType = 'entry' | 'exit' | 'gym' | 'swimming' | 'special';
export type ApiMethod = 'OpenAPI' | 'ISAPI';
export type SyncStatus = 'success' | 'failed' | 'pending';

export interface ApiTestResult {
  success: boolean;
  message: string;
  apiMethod: ApiMethod;
  timestamp: string;
}

export interface DeviceMapping {
  id: string;
  branchId: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  deviceSerial: string;
  deviceLocation: string;
  isActive: boolean;
  apiMethod: ApiMethod;
  ipAddress?: string;
  port?: string;
  username?: string;
  password?: string;
  useISAPIFallback?: boolean;
  syncStatus?: SyncStatus;
  lastSuccessfulSync?: string;
  lastFailedSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceMappingFormValues {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  deviceSerial: string;
  deviceLocation: string;
  isActive: boolean;
  apiMethod: ApiMethod;
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  useISAPIFallback: boolean;
}

export interface BranchDeviceSettings {
  branchId: string;
  devices: DeviceMapping[];
  defaultAccessRules: {
    gymOnlyAccess: boolean;
    swimmingOnlyAccess: boolean;
    premiumAccess: boolean;
  };
  syncFrequency: 'realtime' | '15min' | 'hourly' | 'daily';
  integrationEnabled: boolean;
  useISAPIWhenOpenAPIFails: boolean;
}
