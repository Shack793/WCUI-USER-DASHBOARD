import axios from "axios"
import axiosInstance from './axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 120000, // 2 minutes timeout for payment operations
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Use the shared axiosInstance from lib/axios.ts
const apiInstance = axiosInstance;

// API endpoints
export const dashboardAPI = {
  // Dashboard stats
  getDashboardStats: () => api.get("/api/v1/dashboard/stats"),

  // Dashboard campaigns
  getDashboardCampaigns: () => api.get("/api/v1/dashboard/campaigns"),

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
  updateCampaign: (slug: string, data: FormData | any) => {
    // Handle FormData for file uploads
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {}
    return api.post(`/api/v1/campaigns/${slug}`, data, config)
  },
  updateCampaign: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete(`/campaigns/${id}`),
  boostCampaign: (campaignId: number, data: { plan_id: number; payment_method_id: number }) =>
    api.post(`/api/v1/boost-campaign/${campaignId}`, data),
  getBoostPlans: () => api.get("/api/v1/boost-plans"),
  getPaymentMethods: () => api.get("/api/v1/payment-methods/public"),


  // Contributions
  getContributions: () => api.get("/contributions"),
  createContribution: (data: any) => api.post("/contributions", data),

  // Withdrawals
  getWithdrawals: () => api.get("/withdrawals"),
  requestWithdrawal: (data: any) => api.post("/withdrawals", data),

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
}

// Campaign API endpoints
export const campaignApi = {
  getAll: () => apiInstance.get('/campaigns'),
  getAllCampaigns: () => apiInstance.get('/campaigns/all'),
  getRunning: () => apiInstance.get('/campaigns'),
  getTrending: () => apiInstance.get('/campaigns/trending'),
  getByCategory: (categoryId: number) => apiInstance.get(`/categories/${categoryId}/campaigns`),
  getById: (id: number) => apiInstance.get(`/campaigns/${id}`),
  create: (data: any) => apiInstance.post('/campaigns', data),
  donate: (campaignId: number, data: any) => apiInstance.post(`/campaigns/${campaignId}/donations`, data),
};

// Category API endpoints
export const categoryApi = {
  getAll: () => apiInstance.get('/categories'),
};

// Auth API endpoints
export const authApi = {
  login: (credentials: any) => apiInstance.post('/login', credentials),
  register: (userData: any) => apiInstance.post('/register', userData),
  logout: () => apiInstance.post('/logout'),
  getUser: () => apiInstance.get('/user'),
};

export default api
