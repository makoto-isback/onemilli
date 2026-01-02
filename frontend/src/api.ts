import axios from 'axios'

const RAW_BASE_URL = (import.meta as any).env?.VITE_API_URL

if (!RAW_BASE_URL) {
  throw new Error('VITE_API_URL is not defined')
}

export const API_BASE_URL = RAW_BASE_URL.endsWith('/api')
  ? RAW_BASE_URL
  : `${RAW_BASE_URL}/api`

console.log('🔍 FRONTEND API DEBUG:');
console.log('  RAW_BASE_URL:', RAW_BASE_URL);
console.log('  API_BASE_URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🚀 API REQUEST:', config.method?.toUpperCase(), config.url);
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('auth_token');
      // Redirect to auth or reload
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  success: boolean;
  token: string;
}

export interface BalanceResponse {
  balance: number;
}

export interface RoundData {
  id: string;
  totalPool: number;
  betCount: number;
  endTime: string;
  timeLeftMs: number;
  bets: Array<{
    id: string;
    userId: string;
    username?: string;
    amount: number;
    createdAt: string;
  }>;
}

export interface BetResponse {
  success: boolean;
  bet: {
    id: string;
    amount: number;
    roundId: string;
    createdAt: string;
  };
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  note?: string;
}

export class ApiService {
  private static authAttempted = false;

  static async authenticate(): Promise<string> {
    if (this.authAttempted) {
      throw new Error('Authentication already attempted');
    }
    this.authAttempted = true;

    // Use ONLY window.Telegram.WebApp.initData - raw string, no modification
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) {
      console.error('❌ No Telegram initData available');
      throw new Error('No Telegram init data available');
    }

    // Log raw initData for exact backend comparison
    console.log('🔐 TELEGRAM INITDATA - RAW STRING TO SEND:');
    console.log('Full initData:', initData);
    console.log('initData type:', typeof initData);
    console.log('initData length:', initData.length);

    const response = await api.post<AuthResponse>('/auth/telegram', {
      initData,  // Send raw initData string directly - NO MODIFICATION
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      return response.data.token;
    }

    throw new Error('Authentication failed');
  }

  static async getBalance(): Promise<number> {
    const response = await api.get<BalanceResponse>('/wallet/balance');
    return response.data.balance;
  }

  static async getActiveRound(): Promise<RoundData> {
    const response = await api.get<RoundData>('/lottery/round');
    return response.data;
  }

  static async placeBet(amount: number): Promise<BetResponse> {
    const response = await api.post<BetResponse>('/lottery/bet', { amount });
    return response.data;
  }

  static async getTransactions(): Promise<Transaction[]> {
    const response = await api.get<{ transactions: Transaction[] }>('/wallet/transactions');
    return response.data.transactions;
  }

  static async requestDeposit(amount: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/wallet/deposit', { amount });
    return response.data;
  }

  static async requestWithdraw(amount: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/wallet/withdraw', { amount });
    return response.data;
  }

  static async getRoundHistory() {
    const response = await api.get('/lottery/history');
    return response.data;
  }

  static logout() {
    localStorage.removeItem('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}
