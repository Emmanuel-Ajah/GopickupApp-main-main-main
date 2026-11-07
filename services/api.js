import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const debuggerHost = Constants.expoConfig?.hostUri;
const devHost = debuggerHost ? debuggerHost.split(":")[0] : "127.0.0.1";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? `http://${devHost}:5050/api` : "https://backend.gopickup.com.ng/api");

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// attach token automatically
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired or invalid session tokens automatically
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid session
      await AsyncStorage.multiRemove(["token", "user"]);
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const verifyOtp = (data) => API.post("/auth/verify-otp", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const googleLogin = (data) => API.post("/auth/google", data);
export const getAdminUsers = () => API.get("/auth/users");
export const toggleUserBan = (userId) => API.patch(`/auth/users/${userId}/ban`);

// Orders
export const createOrder = (orderData) => API.post("/orders", orderData);
export const getMyOrders = () => API.get("/orders/myorders");
export const trackOrder = (trackingId) => API.get(`/orders/track/${encodeURIComponent(trackingId)}`);

// Admin Orders
export const getAdminOrders = () => API.get("/orders");
export const negotiateOrder = (orderId, data) => API.patch(`/orders/${orderId}/negotiate`, data);

// Reviews
export const createReview = (reviewData) => API.post("/reviews", reviewData);
export const getMyReviews = () => API.get("/reviews/my");

// Messages
export const sendMessage = (messageData) => API.post("/messages", messageData);
export const getMessages = (otherUserId) => API.get(`/messages/${otherUserId}`);
export const markMessagesAsRead = (otherUserId) => API.patch(`/messages/read/${otherUserId}`);
export const getAdminConversations = () => API.get("/messages/conversations");
export const deleteMessage = (id) => API.delete(`/messages/${id}`);

export const getSupport = () => API.get("/auth/support");
export const acceptQuote = (id) => API.patch(`/orders/${id}/accept`);
export const recordPayment = (id, data) => API.post(`/orders/${id}/pay`, data);

export const getMe = () => API.get('/auth/me');
export const updateMe = (data) => API.patch('/auth/me', data);
export const deleteMe = () => API.delete('/auth/me');
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Notifications
export const getMyNotifications = () => API.get('/notifications');
export const markNotificationAsRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.patch('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

