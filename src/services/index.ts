import { ENV } from '../constants';
import { 
  ApiResponse, 
  User, 
  UserHistory, 
  Account, 
  Survey, 
  Poll, 
  Collector, 
  Payment, 
  SystemEvent, 
  DashboardStats, 
  PaginatedResponse, 
  PaginationParams, 
  FilterParams,
  ActivityEvent,
  UserSession,
  Invoice,
  AuditLog 
} from '../types';

// Import services
import apiService from './api';
import mockApiService from './mockApi';

// Service facade that chooses between real API and mock API
class OpinionApiService {
  private get service() {
    return ENV.ENABLE_MOCK_API ? mockApiService : apiService;
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getDashboardStats();
    }
    return apiService.get<DashboardStats>('/dashboard/stats');
  }

  async getRecentUsers(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getRecentUsers(params);
    }
    // Call users.getUsers with fromDate parameter for yesterday's users
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fromDate = yesterday.toISOString().split('T')[0] + ' 00:00';
    
    const queryParams = {
      ...params,
      fromDate
    };
    return apiService.post<PaginatedResponse<User>>('/DataPostmaster', {
      users: {
        getUsers: queryParams
      }
    });
  }

  async getActiveUserHistory(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<UserHistory>>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getActiveUserHistory(params);
    }
    // Call users.getHistory with typeIds [1,6] and productId 1 (admin)
    const queryParams = {
      ...params,
      typeIds: [1, 6], // Login and Account Updated events
      productId: 1 // Admin product
    };
    return apiService.post<PaginatedResponse<UserHistory>>('/DataPostmaster', {
      users: {
        getHistory: queryParams
      }
    });
  }

  // Users
  async getUsers(params: PaginationParams & FilterParams & { fromDate?: string; toDate?: string }): Promise<ApiResponse<{ list: User[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getUsers(params);
    }
    // Use the original JSP API format: POST to DataPostmaster with users.getUsers structure
    const requestData = {
      users: {
        getUsers: {
          fromDate: params.fromDate,
          toDate: params.toDate
        }
      }
    };
    return apiService.post<{ users: { getUsers: { list: User[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.users?.getUsers || { list: [] }
      }));
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    console.log('OpinionApiService.getUser called with ID:', id);
    console.log('ENV.ENABLE_MOCK_API:', ENV.ENABLE_MOCK_API);
    console.log('Environment check - import.meta.env.VITE_ENABLE_MOCK_API:', import.meta.env.VITE_ENABLE_MOCK_API);
    
    if (ENV.ENABLE_MOCK_API) {
      console.log('Using mockApiService.getUser');
      return mockApiService.getUser(id);
    }
    console.log('Using real apiService.get');
    return apiService.get<User>(`/users/${id}`);
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.createUser(data);
    }
    return apiService.post<User>('/users', data);
  }

  async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.updateUser(id, data);
    }
    return apiService.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteUser(id);
    }
    return apiService.delete<void>(`/users/${id}`);
  }

  // User Details - Activity
  async getUserActivity(userId: number, params?: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<ActivityEvent>>> {
    if (ENV.ENABLE_MOCK_API) {
      // Mock implementation - return dummy data for now
      return {
        success: true,
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        },
        timestamp: new Date().toISOString()
      };
    }
    return apiService.get<PaginatedResponse<ActivityEvent>>(`/users/${userId}/activity`, { params });
  }

  // User Details - Sessions
  async getUserSessions(userId: number): Promise<ApiResponse<UserSession[]>> {
    if (ENV.ENABLE_MOCK_API) {
      // Mock implementation - return dummy data for now
      return {
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
    return apiService.get<UserSession[]>(`/users/${userId}/sessions`);
  }

  async terminateUserSession(userId: number, sessionId: string): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    }
    return apiService.delete<void>(`/users/${userId}/sessions/${sessionId}`);
  }

  // User Details - Permissions
  async getUserPermissions(userId: number): Promise<ApiResponse<string[]>> {
    if (ENV.ENABLE_MOCK_API) {
      // Mock implementation - return dummy data for now
      return {
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
    return apiService.get<string[]>(`/users/${userId}/permissions`);
  }

  async updateUserPermissions(userId: number, permissions: string[]): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    }
    return apiService.put<void>(`/users/${userId}/permissions`, { permissions });
  }

  // User Details - Billing
  async getUserBilling(userId: number): Promise<ApiResponse<{ invoices: Invoice[]; currentPlan: any }>> {
    if (ENV.ENABLE_MOCK_API) {
      // Mock implementation - return dummy data for now
      return {
        success: true,
        data: {
          invoices: [],
          currentPlan: null
        },
        timestamp: new Date().toISOString()
      };
    }
    return apiService.get<{ invoices: Invoice[]; currentPlan: any }>(`/users/${userId}/billing`);
  }

  // User Details - Notifications
  async getUserNotificationSettings(userId: number): Promise<ApiResponse<Record<string, any>>> {
    if (ENV.ENABLE_MOCK_API) {
      // Mock implementation - return dummy data for now
      return {
        success: true,
        data: {},
        timestamp: new Date().toISOString()
      };
    }
    return apiService.get<Record<string, any>>(`/users/${userId}/notifications`);
  }

  async updateUserNotificationSettings(userId: number, settings: Record<string, any>): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    }
    return apiService.put<void>(`/users/${userId}/notifications`, settings);
  }

  // User Details - Audit Logs
  async getUserAuditLogs(userId: number, params?: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    if (ENV.ENABLE_MOCK_API) {
      // Mock implementation - return dummy data for now
      return {
        success: true,
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        },
        timestamp: new Date().toISOString()
      };
    }
    return apiService.get<PaginatedResponse<AuditLog>>(`/users/${userId}/audit-logs`, { params });
  }

  // Accounts
  async getAccounts(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Account>>> {
    console.log('getAccounts - ENV.ENABLE_MOCK_API:', ENV.ENABLE_MOCK_API);
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getAccounts(params);
    }
    return apiService.get<PaginatedResponse<Account>>('/accounts', { params });
  }

  async getAccount(id: number): Promise<ApiResponse<Account>> {
    console.log('getAccount - ENV.ENABLE_MOCK_API:', ENV.ENABLE_MOCK_API);
    console.log('getAccount - id:', id);
    if (ENV.ENABLE_MOCK_API) {
      console.log('Using mock API for getAccount');
      return mockApiService.getAccount(id);
    }
    console.log('Using real API for getAccount');
    return apiService.get<Account>(`/accounts/${id}`);
  }

  async createAccount(data: Partial<Account>): Promise<ApiResponse<Account>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.createAccount(data);
    }
    return apiService.post<Account>('/accounts', data);
  }

  async updateAccount(id: number, data: Partial<Account>): Promise<ApiResponse<Account>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.updateAccount(id, data);
    }
    return apiService.put<Account>(`/accounts/${id}`, data);
  }

  async deleteAccount(id: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteAccount(id);
    }
    return apiService.delete<void>(`/accounts/${id}`);
  }

  // Surveys - Main surveys page (all surveys across all accounts)
  async getSurveys(params?: { top?: number; from?: string; to?: string; accountId?: number | null }): Promise<ApiResponse<{ list: Survey[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getSurveys(params);
    }
    // Use the original JSP API format: POST to DataPostmaster with opinions.getList structure
    const requestData = {
      opinions: {
        getList: {
          top: params?.top || 100,
          from: params?.from || undefined,
          to: params?.to || undefined,
          accountId: params?.accountId || null, // null for all accounts
          opinionTypeId: 1 // 1 = survey
        }
      }
    };
    return apiService.post<{ opinions: { getList: { list: Survey[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.opinions?.getList || { list: [] }
      }));
  }

  // Copy survey to another account
  async copySurvey(opinionId: number, name: string, accountId: number): Promise<ApiResponse<{ opinionId: number }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.copySurvey(opinionId, name, accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with opinions.copy structure
    const requestData = {
      opinions: {
        copy: {
          opinionId,
          name,
          accountId
        }
      }
    };
    return apiService.post<{ opinions: { copy: { opinionId: number } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.opinions?.copy || { opinionId: 0 }
      }));
  }

  // Delete multiple surveys
  async deleteSurveys(opinionIds: number[], accountId?: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteSurveys(opinionIds, accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with opinions.deleteOpinions structure
    const requestData = {
      opinions: {
        deleteOpinions: {
          list: opinionIds,
          accountId: accountId || null,
          opinionTypeId: 1 // 1 = survey
        }
      }
    };
    return apiService.post<{ opinions: { deleteOpinions: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Export survey results (handled by servlet/export endpoint)
  async exportSurveyResults(opinionId: number, format: 'excel' | 'csv', filename: string): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      // Mock implementation - just log for now
      console.log(`Mock: Exporting ${format} for survey ${opinionId} as ${filename}`);
      return Promise.resolve();
    }
    
    // Create the export request data
    const data = {
      format,
      opinionId,
      name: filename,
      exportType: undefined
    };

    // Use the original export servlet endpoint
    const exportUrl = `${ENV.API_BASE_URL}/servlet/export?rq=${JSON.stringify(data)}`;
    window.location.href = exportUrl;
  }

  // Polls
  async getPolls(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Poll>>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getPolls(params);
    }
    return apiService.get<PaginatedResponse<Poll>>('/polls', { params });
  }

  async getPoll(id: number): Promise<ApiResponse<Poll>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Get poll not implemented in mock service');
    }
    return apiService.get<Poll>(`/polls/${id}`);
  }

  async createPoll(data: Partial<Poll>): Promise<ApiResponse<Poll>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Create poll not implemented in mock service');
    }
    return apiService.post<Poll>('/polls', data);
  }

  async updatePoll(id: number, data: Partial<Poll>): Promise<ApiResponse<Poll>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Update poll not implemented in mock service');
    }
    return apiService.put<Poll>(`/polls/${id}`, data);
  }

  async deletePoll(id: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Delete poll not implemented in mock service');
    }
    return apiService.delete<void>(`/polls/${id}`);
  }

  // Collectors
  async getCollectors(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Collector>>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getCollectors(params);
    }
    return apiService.get<PaginatedResponse<Collector>>('/collectors', { params });
  }

  async getCollector(id: number): Promise<ApiResponse<Collector>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Get collector not implemented in mock service');
    }
    return apiService.get<Collector>(`/collectors/${id}`);
  }

  async createCollector(data: Partial<Collector>): Promise<ApiResponse<Collector>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Create collector not implemented in mock service');
    }
    return apiService.post<Collector>('/collectors', data);
  }

  async updateCollector(id: number, data: Partial<Collector>): Promise<ApiResponse<Collector>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Update collector not implemented in mock service');
    }
    return apiService.put<Collector>(`/collectors/${id}`, data);
  }

  async deleteCollector(id: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Delete collector not implemented in mock service');
    }
    return apiService.delete<void>(`/collectors/${id}`);
  }

  // Payments
  async getPayments(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getPayments(params);
    }
    return apiService.get<PaginatedResponse<Payment>>('/payments', { params });
  }

  async getPayment(id: number): Promise<ApiResponse<Payment>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Get payment not implemented in mock service');
    }
    return apiService.get<Payment>(`/payments/${id}`);
  }

  async createPayment(data: Partial<Payment>): Promise<ApiResponse<Payment>> {
    if (ENV.ENABLE_MOCK_API) {
      throw new Error('Create payment not implemented in mock service');
    }
    return apiService.post<Payment>('/payments', data);
  }

  // System Events
  async getSystemEvents(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<SystemEvent>>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getSystemEvents(params);
    }
    return apiService.get<PaginatedResponse<SystemEvent>>('/system/events', { params });
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return {
        success: true,
        data: { status: 'healthy', timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      };
    }
    return apiService.get('/system/health');
  }

  // User Messages
  async getUserMessages(userId: number, params?: PaginationParams & FilterParams): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getUserMessages(userId, params);
    }
    // Use the original JSP API format: POST to DataPostmaster with messages.getList structure
    const requestData = {
      messages: {
        getList: {
          userId
        }
      }
    };
    return apiService.post<{ messages: { getList: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.messages?.getList || { list: [] }
      }));
  }

  async createUserMessage(userId: number, data: { name: string; content: string }): Promise<ApiResponse<{ id: number }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.createUserMessage(userId, data);
    }
    // Use the original JSP API format: POST to DataPostmaster with messages.create structure
    const requestData = {
      messages: {
        create: {
          userId,
          name: data.name,
          content: data.content
        }
      }
    };
    return apiService.post<{ messages: { create: { id: number } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.messages?.create || { id: 0 }
      }));
  }

  async deleteUserMessages(userId: number, messageIds: number[]): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteUserMessages(userId, messageIds);
    }
    // Use the original JSP API format: POST to DataPostmaster with messages.deleteList structure
    const requestData = {
      messages: {
        deleteList: {
          userId,
          list: messageIds
        }
      }
    };
    return apiService.post<{ messages: { deleteList: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  async publishUserMessage(userId: number, messageId: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.publishUserMessage(userId, messageId);
    }
    // Use the original JSP API format: POST to DataPostmaster with messages.publish structure
    const requestData = {
      messages: {
        publish: {
          userId,
          id: messageId,
          publishDate: new Date().toISOString()
        }
      }
    };
    return apiService.post<{ messages: { publish: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // User Accounts
  async getUserAccounts(userId: number): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getUserAccounts(userId);
    }
    // Use the actual API format: POST to /accounts with userId in body
    const requestData = {
      userId
    };
    return apiService.post<{ top: number; productId: number; list: any[] }>('/accounts', requestData)
      .then(response => ({
        ...response,
        data: { list: response.data?.list || [] }
      }));
  }

  async createUserAccount(userId: number, data: { productId: number; accountName: string }): Promise<ApiResponse<{ id: number }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.createUserAccount(userId, data);
    }
    // Use the original JSP API format: POST to DataPostmaster with users.createAccount structure
    const requestData = {
      users: {
        createAccount: {
          userId,
          productId: data.productId,
          accountName: data.accountName
        }
      }
    };
    return apiService.post<{ users: { createAccount: { id: number } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.users?.createAccount || { id: 0 }
      }));
  }

  async attachUserAccount(userId: number, accountId: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.attachUserAccount(userId, accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with users.attachAccount structure
    const requestData = {
      users: {
        attachAccount: {
          userId,
          accountId
        }
      }
    };
    return apiService.post<{ users: { attachAccount: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  async detachUserAccount(userId: number, accountId: number): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.detachUserAccount(userId, accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with users.detachAccount structure
    const requestData = {
      users: {
        detachAccount: {
          userId,
          accountId
        }
      }
    };
    return apiService.post<{ users: { detachAccount: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // User History
  async getUserHistory(userId: number): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getUserHistory(userId);
    }
    // Use the original JSP API format: POST to DataPostmaster with users.getHistory structure
    const requestData = {
      users: {
        getHistory: {
          userId
        }
      }
    };
    return apiService.post<{ users: { getHistory: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.users?.getHistory || { list: [] }
      }));
  }

  // Packages
  async getPackages(productId: number, includeNonActive: boolean = false): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getPackages(productId, includeNonActive);
    }
    // Use the original JSP API format: POST to DataPostmaster with products.getPackages structure
    const requestData = {
      products: {
        getPackages: {
          productId,
          includeNonActive
        }
      }
    };
    return apiService.post<{ products: { getPackages: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.products?.getPackages || { list: [] }
      }));
  }

  // Get opinions/surveys list for an account
  async getOpinionsList(accountId: number, opinionTypeId: number = 1): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getOpinionsList(accountId, opinionTypeId);
    }
    // Use the original JSP API format: POST to DataPostmaster with opinions.getList structure
    const requestData = {
      opinions: {
        getList: {
          top: 100,
          from: undefined,
          to: undefined,
          accountId,
          opinionTypeId // 1 = survey
        }
      }
    };
    return apiService.post<{ opinions: { getList: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.opinions?.getList || { list: [] }
      }));
  }

  // Get collectors list for an account
  async getCollectorsByAccount(accountId: number): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getCollectorsByAccount(accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with collectors.getCollector structure
    const requestData = {
      collectors: {
        getCollector: {
          top: 100,
          accountId
        }
      }
    };
    return apiService.post<{ collectors: { getCollector: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.collectors?.getCollector || { list: [] }
      }));
  }

  // Delete collectors
  async deleteCollectors(collectorIds: number[]): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteCollectors(collectorIds);
    }
    // Use the original JSP API format: POST to DataPostmaster with collectors.deleteCollectors structure
    const requestData = {
      collectors: {
        deleteCollectors: {
          list: collectorIds
        }
      }
    };
    return apiService.post<{ collectors: { deleteCollectors: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Get business details for billing
  async getBusinessDetails(accountId: number): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getBusinessDetails(accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.getBusinessDetails structure
    const requestData = {
      accounts: {
        getBusinessDetails: {
          accountId
        }
      }
    };
    return apiService.post<{ accounts: { getBusinessDetails: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.accounts?.getBusinessDetails || {}
      }));
  }

  // Update billing settings
  async updateBillingSettings(accountId: number, settings: {
    currencyCode?: string;
    minDeposit?: number;
    maxDeposit?: number;
    taxable?: boolean;
  }): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.updateBillingSettings(accountId, settings);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.updateBillingSettings structure
    const requestData = {
      accounts: {
        updateBillingSettings: {
          accountId,
          ...settings
        }
      }
    };
    return apiService.post<{ accounts: { updateBillingSettings: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Update business details
  async updateBusinessDetails(accountId: number, details: {
    companyName?: string;
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    countryId?: number;
    stateId?: number;
    postalCode?: string;
    phone1?: string;
  }): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.updateBusinessDetails(accountId, details);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.updateBusinessDetails structure
    const requestData = {
      accounts: {
        updateBusinessDetails: {
          accountId,
          ...details
        }
      }
    };
    return apiService.post<{ accounts: { updateBusinessDetails: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Transaction methods
  
  // Get account details (including balance)
  async getAccountDetails(accountId: number): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getAccountDetails(accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.getAccountDetails structure
    const requestData = {
      accounts: {
        getAccountDetails: {
          accountId
        }
      }
    };
    return apiService.post<{ accounts: { getAccountDetails: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.accounts?.getAccountDetails || {}
      }));
  }

  // Get transactions
  async getTransactions(accountId: number, options?: {
    groupBy?: string;
    transactionTypes?: number[];
  }): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getTransactions(accountId, options);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.getTransactions structure
    const requestData = {
      accounts: {
        getTransactions: {
          accountId,
          groupBy: options?.groupBy || 'month',
          transactionTypes: options?.transactionTypes
        }
      }
    };
    return apiService.post<{ accounts: { getTransactions: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.accounts?.getTransactions || { list: [] }
      }));
  }

  // Credit account
  async credit(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.credit(accountId, amount, comments);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.credit structure
    const requestData = {
      accounts: {
        credit: {
          accountId,
          amount,
          comments
        }
      }
    };
    return apiService.post<{ accounts: { credit: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Debit account
  async debit(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.debit(accountId, amount, comments);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.debit structure
    const requestData = {
      accounts: {
        debit: {
          accountId,
          amount,
          comments
        }
      }
    };
    return apiService.post<{ accounts: { debit: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Manual payment
  async manualPayment(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.manualPayment(accountId, amount, comments);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.manualPayment structure
    const requestData = {
      accounts: {
        manualPayment: {
          accountId,
          amount,
          comments
        }
      }
    };
    return apiService.post<{ accounts: { manualPayment: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Manual refund
  async manualRefund(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.manualRefund(accountId, amount, comments);
    }
    // Use the original JSP API format: POST to DataPostmaster with accounts.manualRefund structure
    const requestData = {
      accounts: {
        manualRefund: {
          accountId,
          amount,
          comments
        }
      }
    };
    return apiService.post<{ accounts: { manualRefund: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Payment methods
  
  // Get payment details
  async getPaymentDetails(userId: number, accountId: number): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getPaymentDetails(userId, accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with payments.getPaymentDetails structure
    const requestData = {
      payments: {
        getPaymentDetails: {
          userId,
          accountId
        }
      }
    };
    return apiService.post<{ payments: { getPaymentDetails: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.payments?.getPaymentDetails || {}
      }));
  }

  // Get charges
  async getCharges(accountId: number, charges: number[], statusId: number, invoiced: boolean = false): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getCharges(accountId, charges, statusId);
    }
    // Use the original JSP API format: POST to DataPostmaster with charges.getCharges structure
    const requestData = {
      charges: {
        getCharges: {
          accountId,
          charges,
          statusId,
          invoiced
        }
      }
    };
    return apiService.post<{ charges: { getCharges: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.charges?.getCharges || { list: [], amountDue: 0, amountToFund: 0 }
      }));
  }

  // Direct payment
  // Cancel charge
  async cancelCharge(accountId: number, chargeId: number): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.cancelCharge(accountId, chargeId);
    }
    // Use the original JSP API format: POST to DataPostmaster with charges.cancelCharge structure
    const requestData = {
      charges: {
        cancelCharge: {
          accountId,
          chargeId
        }
      }
    };
    return apiService.post<{ charges: { cancelCharge: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.charges?.cancelCharge || {}
      }));
  }

  async directPayment(paymentData: {
    userId: number;
    accountId: number;
    firstName: string;
    lastName: string;
    creditCardTypeId: number;
    creditCardNumber: string;
    expDateMonth: number;
    expDateYear: number;
    cvv2Number: string;
    address1: string;
    address2: string;
    city: string;
    countryCode: string;
    countryId: number;
    stateId: number | string;
    postalCode: string;
    amount: number;
    charges: number[];
    isAddressChanged: boolean;
  }): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.directPayment(paymentData);
    }
    // Use the original JSP API format: POST to DataPostmaster with payments.directPayment structure
    const requestData = {
      payments: {
        directPayment: paymentData
      }
    };
    return apiService.post<{ payments: { directPayment: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.payments?.directPayment || {}
      }));
  }

  // Recurring charges methods
  
  // Get recurring charges
  async getRecurringCharges(accountId: number): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getRecurringCharges(accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with recurring.getRecurringCharges structure
    const requestData = {
      recurring: {
        getRecurringCharges: {
          accountId
        }
      }
    };
    return apiService.post<{ recurring: { getRecurringCharges: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.recurring?.getRecurringCharges || { list: [] }
      }));
  }

  // Delete recurring charge
  async deleteRecurringCharge(chargeId: number): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteRecurringCharge(chargeId);
    }
    // Use the original JSP API format: POST to DataPostmaster with recurring.deleteRecurringCharge structure
    const requestData = {
      recurring: {
        deleteRecurringCharge: {
          chargeId
        }
      }
    };
    return apiService.post<{ recurring: { deleteRecurringCharge: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.recurring?.deleteRecurringCharge || {}
      }));
  }

  // Get uninvoiced charges
  async getUninvoicedCharges(accountId: number): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getUninvoicedCharges(accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with charges.getCharges structure
    const requestData = {
      charges: {
        getCharges: {
          accountId,
          statusId: 2,
          invoiced: false
        }
      }
    };
    return apiService.post<{ charges: { getCharges: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.charges?.getCharges || { list: [] }
      }));
  }

  // Create invoice from charges (legacy method)
  async createInvoice(accountId: number, chargeIds: number[]): Promise<ApiResponse<{ invoiceId?: number }>>;
  // Create invoice with full parameters (new overloaded method)
  async createInvoice(params: {
    accountId: number;
    statusId: number;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    countryId?: number;
    stateId?: number;
    postalCode?: string;
    phone1?: string;
    notes?: string;
    fromDate?: string;
    toDate?: string;
    charges?: number[];
  }): Promise<ApiResponse<{ invoiceId?: number }>>;
  // Implementation with overload resolution
  async createInvoice(
    accountIdOrParams: number | {
      accountId: number;
      statusId: number;
      companyName?: string;
      firstName?: string;
      lastName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      countryId?: number;
      stateId?: number;
      postalCode?: string;
      phone1?: string;
      notes?: string;
      fromDate?: string;
      toDate?: string;
      charges?: number[];
    },
    chargeIds?: number[]
  ): Promise<ApiResponse<{ invoiceId?: number }>> {
    if (ENV.ENABLE_MOCK_API) {
      if (typeof accountIdOrParams === 'number') {
        return mockApiService.createInvoice(accountIdOrParams, chargeIds!);
      } else {
        return mockApiService.createInvoiceWithDetails(accountIdOrParams);
      }
    }
    
    // Legacy call: createInvoice(accountId, chargeIds)
    if (typeof accountIdOrParams === 'number' && chargeIds) {
      const requestData = {
        invoices: {
          addCharges: {
            accountId: accountIdOrParams,
            charges: chargeIds
          }
        }
      };
      return apiService.post<{ invoices: { addCharges: any } }>('/DataPostmaster', requestData)
        .then(response => ({
          ...response,
          data: response.data?.invoices?.addCharges || {}
        }));
    }
    
    // New call: createInvoice(params)
    if (typeof accountIdOrParams === 'object') {
      const params = accountIdOrParams;
      const requestData = {
        invoices: {
          createInvoice: {
            accountId: params.accountId,
            statusId: params.statusId,
            companyName: params.companyName,
            firstName: params.firstName,
            lastName: params.lastName,
            address1: params.address1,
            address2: params.address2,
            city: params.city,
            countryId: params.countryId,
            stateId: params.stateId,
            postalCode: params.postalCode,
            phone1: params.phone1,
            notes: params.notes,
            fromDate: params.fromDate,
            toDate: params.toDate,
            charges: params.charges || []
          }
        }
      };
      return apiService.post<{ invoices: { createInvoice: any } }>('/DataPostmaster', requestData)
        .then(response => ({
          ...response,
          data: response.data?.invoices?.createInvoice || {}
        }));
    }
    
    throw new Error('Invalid parameters for createInvoice method');
  }

  // Merge charges into existing invoice
  async mergeChargesIntoInvoice(accountId: number, invoiceId: number, chargeIds: number[]): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.mergeChargesIntoInvoice(accountId, invoiceId, chargeIds);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.addCharges structure
    const requestData = {
      invoices: {
        addCharges: {
          accountId,
          invoiceId,
          charges: chargeIds
        }
      }
    };
    return apiService.post<{ invoices: { addCharges: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.invoices?.addCharges || {}
      }));
  }

  // Get draft invoices
  async getDraftInvoices(accountId: number): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getDraftInvoices(accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.getInvoices structure
    const requestData = {
      invoices: {
        getInvoices: {
          accountId,
          statusId: 1 // draft only
        }
      }
    };
    return apiService.post<{ invoices: { getInvoices: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.invoices?.getInvoices || { list: [] }
      }));
  }

  // Get invoices (all or filtered by status)
  async getInvoices(accountId: number, statusId?: number): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getInvoices(accountId, statusId);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.getInvoices structure
    const requestData = {
      invoices: {
        getInvoices: {
          accountId,
          statusId: statusId || null
        }
      }
    };
    return apiService.post<{ invoices: { getInvoices: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.invoices?.getInvoices || { list: [] }
      }));
  }

  // Delete invoices
  async deleteInvoices(invoiceIds: number[]): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteInvoices(invoiceIds);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.deleteInvoices structure
    const requestData = {
      invoices: {
        deleteInvoices: {
          invoices: invoiceIds
        }
      }
    };
    return apiService.post<{ invoices: { deleteInvoices: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Create empty invoice
  async createEmptyInvoice(accountId: number): Promise<ApiResponse<{ invoiceId?: number }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.createEmptyInvoice(accountId);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.createEmptyInvoice structure
    const requestData = {
      invoices: {
        createEmptyInvoice: {
          accountId
        }
      }
    };
    return apiService.post<{ invoices: { createEmptyInvoice: { invoiceId?: number } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.invoices?.createEmptyInvoice || {}
      }));
  }

  // Get invoice details
  async getInvoiceDetails(accountId: number, invoiceId: number, fromDate?: string, toDate?: string): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getInvoiceDetails(accountId, invoiceId, fromDate, toDate);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.getInvoiceDetails structure
    const requestData = {
      invoices: {
        getInvoiceDetails: {
          accountId,
          invoiceId,
          fromDate,
          toDate
        }
      }
    };
    return apiService.post<{ invoices: { getInvoiceDetails: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.invoices?.getInvoiceDetails || {}
      }));
  }

  // Update invoice
  async updateInvoice(params: {
    accountId?: number;
    invoiceId: number;
    statusId: number;
    invoiceDate?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    countryId?: number;
    stateId?: number;
    postalCode?: string;
    phone1?: string;
    notes?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.updateInvoice(params);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.updateInvoice structure
    const requestData = {
      invoices: {
        updateInvoice: params
      }
    };
    return apiService.post<{ invoices: { updateInvoice: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.invoices?.updateInvoice || {}
      }));
  }

  // Get charges for invoice (different from regular getCharges)
  async getInvoiceCharges(accountId: number, invoiceId: number): Promise<ApiResponse<any>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getInvoiceCharges(accountId, invoiceId);
    }
    // Use the original JSP API format: POST to DataPostmaster with charges.getCharges using billId
    const requestData = {
      charges: {
        getCharges: {
          accountId,
          billId: invoiceId
        }
      }
    };
    return apiService.post<{ charges: { getCharges: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.charges?.getCharges || { list: [] }
      }));
  }

  // Remove charges from invoice
  async removeChargesFromInvoice(chargeIds: number[]): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.removeChargesFromInvoice(chargeIds);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.removeCharges structure
    const requestData = {
      invoices: {
        removeCharges: {
          charges: chargeIds
        }
      }
    };
    return apiService.post<{ invoices: { removeCharges: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }

  // Get all collectors (for standalone collectors page)
  async getAllCollectors(filter?: { includeExpired?: boolean; top?: number; from?: string; to?: string }): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getAllCollectors(filter);
    }
    // Use the original JSP API format: POST to DataPostmaster with collectors.getCollectors structure
    const requestData = {
      collectors: {
        getCollectors: {
          top: filter?.top || 100,
          from: filter?.from,
          to: filter?.to,
          includeExpired: filter?.includeExpired || false
        }
      }
    };
    return apiService.post<{ collectors: { getCollectors: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.collectors?.getCollectors || { list: [] }
      }));
  }

  // Get all invoices (for standalone billing invoices page)
  async getAllInvoices(filter?: { statusId?: number | null }): Promise<ApiResponse<{ list: any[] }>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.getAllInvoices(filter);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.getInvoices structure
    const requestData = {
      invoices: {
        getInvoices: {
          statusId: filter?.statusId || null
        }
      }
    };
    return apiService.post<{ invoices: { getInvoices: { list: any[] } } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: response.data?.invoices?.getInvoices || { list: [] }
      }));
  }

  // Delete billing invoices (for standalone billing invoices page)
  async deleteBillingInvoices(invoiceIds: number[]): Promise<ApiResponse<void>> {
    if (ENV.ENABLE_MOCK_API) {
      return mockApiService.deleteBillingInvoices(invoiceIds);
    }
    // Use the original JSP API format: POST to DataPostmaster with invoices.deleteInvoices structure
    const requestData = {
      invoices: {
        deleteInvoices: {
          invoices: invoiceIds
        }
      }
    };
    return apiService.post<{ invoices: { deleteInvoices: any } }>('/DataPostmaster', requestData)
      .then(response => ({
        ...response,
        data: undefined as any
      }));
  }
}

// Create and export singleton instance
export const opinionApiService = new OpinionApiService();
export default opinionApiService;
