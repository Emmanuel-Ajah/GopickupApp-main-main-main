import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://backend.gopickup.com.ng/api";

const API = axios.create({
  baseURL: BASE_URL,
});

// attach token automatically
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const googleLogin = (data) => API.post("/auth/google", data);

// Orders
export const createOrder = (orderData) => API.post("/orders", orderData);
export const getMyOrders = () => API.get("/orders/myorders");
export const trackOrder = (trackingId) => API.get(`/orders/${trackingId}`);

// Admin Orders
export const getAdminOrders = () => API.get("/orders");
export const negotiateOrder = (orderId, data) => API.patch(`/orders/${orderId}/negotiate`, data);

// Reviews
export const createReview = (reviewData) => API.post("/reviews", reviewData);
export const getMyReviews = () => API.get("/reviews/my");

// Messages
export const sendMessage = (messageData) => API.post("/messages", messageData);
export const getMessages = (otherUserId) => API.get(`/messages/${otherUserId}`);
