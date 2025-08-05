import axiosInstance from './axios';

// Use the shared axiosInstance from lib/axios.ts
const api = axiosInstance;

// API endpoints
export const dashboardAPI = {
  // Dashboard stats (user-specific)
  getDashboardStats: () => api.get("/api/v1/userdashboard"),
  
  // User dashboard (user-specific)
  getUserDashboard: () => api.get("/api/v1/userdashboard"),

  // Dashboard campaigns (user-specific)
  getDashboardCampaigns: () => api.get("/api/v1/user/campaigns"),

  // User-specific campaigns
  getUserCampaigns: () => api.get("/api/v1/user/campaigns"),

  // Campaigns
  getCampaigns: () => api.get("/campaigns"),
  getCampaignBySlug: (slug: string) => api.get(`/api/v1/campaigns/${slug}`),
  createCampaign: (data: FormData | any) => {
    // Handle FormData for file uploads
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {}
    
    return api.post("/api/v1/campaigns", data, config)
  },
  updateCampaignWithForm: (slug: string, data: FormData | any) => {
    // Handle FormData for file uploads
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {}
    return api.post(`/api/v1/campaigns/${slug}`, data, config)
  },
  updateCampaign: (slug: string, data: FormData | any) => {
    // Handle FormData for file uploads
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {}
    return api.post(`/api/v1/campaigns/${slug}`, data, config)
  },
  deleteCampaign: (id: string) => api.delete(`/campaigns/${id}`),
  boostCampaign: (campaignId: number, data: { plan_id: number; payment_method_id: number }) =>
    api.post(`/api/v1/boost-campaign/${campaignId}`, data),
  getBoostPlans: () => api.get("/api/v1/boost-plans"),
  getPaymentMethods: () => api.get("/api/v1/payment-methods/public"),

  // Categories
  getCategories: () => api.get("/api/v1/categories"),

  // Contributions
  getContributions: () => api.get("/contributions"),
  createContribution: (data: any) => api.post("/contributions", data),

  // Withdrawals
  getWithdrawals: () => api.get("/api/v1/withdrawals"),
  createWithdrawalRequest: (data: { amount: number; reason?: string | null }) =>
    api.post("/api/v1/withdrawals", data),
  requestWithdrawal: async (data: {
    customer: string;
    msisdn: string;
    amount: string;
    network: string;
    narration?: string;
  }) => {
    try {
      // First check balance
      const balanceResponse = await api.get("/api/v1/wallet/balance");
      const currentBalance = parseFloat(balanceResponse.data.data.balance);
      const withdrawalAmount = parseFloat(data.amount);

      if (withdrawalAmount > currentBalance) {
        throw new Error("Insufficient balance");
      }

      // Generate a transaction ID (you might want to adjust this format)
      const transactionId = `WD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // First, request the credit to wallet
      const creditPayload = {
        customer: data.customer.trim(),
        msisdn: data.msisdn.trim(),
        amount: parseFloat(data.amount).toFixed(2), // Ensure proper decimal format
        network: data.network.toUpperCase(),
        narration: data.narration || 'Credit MTN Customer',
        transaction_id: transactionId
      };
      console.log('📦 Credit wallet payload:', creditPayload);
      
      const creditResponse = await api.post("/api/v1/payments/credit-wallet", creditPayload);
      console.log('📦 Credit wallet response:', creditResponse.data);
      
      if (!creditResponse.data.success) {
        throw new Error(creditResponse.data.message || "Failed to process credit");
      }

      // Only if credit was successful, update the wallet
      const updatePayload = {
        transaction_id: transactionId,
        amount: data.amount.toString(),
        status: 'success'
      };
      console.log('📦 Wallet update payload:', updatePayload);
      
      return api.post("/api/v1/wallet/update-after-withdrawal", updatePayload);
    } catch (error: any) {
      console.error('Failed to process withdrawal:', error);
      
      // Enhanced error handling
      if (error.response?.data) {
        console.error('Server response data:', error.response.data);
        throw new Error(error.response.data.message || error.response.data.error || error.message);
      }
      
      throw error;
    }
  },
  getWalletBalance: () => api.get("/api/v1/wallet/balance"),
  
  // Name enquiry for mobile money
  nameEnquiry: (data: { msisdn: string; network: string }) => 
    api.post("/api/v1/wallet/name-enquiry", data),

  // Notifications
  getNotifications: () => api.get("/notifications"),
  markNotificationAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.patch("/notifications/mark-all-read"),

  // Comments
  getComments: () => api.get("/comments"),
  createComment: (data: any) => api.post("/comments", data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),

  // User profile
  getUserProfile: () => api.get("/user/profile"),
  updateUserProfile: (data: any) => api.put("/user/profile", data),
  updateUserProfileNew: (data: { name: string; email: string; phone: string; country: string }) => 
    api.put("/api/v1/user/update", data),
  updateUserPassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => 
    api.put("/api/v1/user/update-password", data),
}

// Campaign API endpoints
export const campaignApi = {
  getAll: () => api.get('/campaigns'),
  getAllCampaigns: () => api.get('/campaigns/all'),
  getRunning: () => api.get('/campaigns'),
  getTrending: () => api.get('/campaigns/trending'),
  getByCategory: (categoryId: number) => api.get(`/categories/${categoryId}/campaigns`),
  getById: (id: number) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post('/campaigns', data),
  donate: (campaignId: number, data: any) => api.post(`/campaigns/${campaignId}/donations`, data),
};

// Category API endpoints
export const categoryApi = {
  getAll: () => api.get('/categories'),
};

// Auth API endpoints
export const authApi = {
  login: (credentials: any) => api.post('/api/v1/login', credentials),
  register: (userData: any) => api.post('/api/v1/register', userData),
  logout: () => api.post('/api/v1/logout'),
  getUser: () => api.get('/api/v1/user'),
};

export default api
