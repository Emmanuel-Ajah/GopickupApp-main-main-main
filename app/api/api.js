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
export const createOrder = (data) => API.post("/orders", data);
export const getMyOrders = () => API.get("/orders/myorders");
export const trackOrder = (id) => API.get(`/orders/${id}`);
