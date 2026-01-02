import { telegramService } from './telegram';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses and auth errors
async function handleResponse(response: Response) {
  if (response.status === 401) {
    // Token expired or invalid, clear it
    localStorage.removeItem('auth_token');
    // Redirect to auth or reload
    window.location.reload();
    throw new Error('Authentication failed');
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response;
}

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
  static async authenticate(): Promise<string> {
    const initData = telegramService.getInitData();
    if (!initData) {
      throw new Error('No Telegram init data available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initData,
      }),
    });

    await handleResponse(response);
    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('auth_token', data.token);
      return data.token;
    }

    throw new Error('Authentication failed');
  }

  static async getBalance(): Promise<number> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    await handleResponse(response);
    const data = await response.json();
    return data.balance;
  }

  static async getActiveRound(): Promise<RoundData> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/lottery/round`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    await handleResponse(response);
    return await response.json();
  }

  static async placeBet(amount: number): Promise<BetResponse> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/lottery/bet`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    await handleResponse(response);
    return await response.json();
  }

  static async getTransactions(): Promise<Transaction[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/wallet/transactions`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    await handleResponse(response);
    const data = await response.json();
    return data.transactions;
  }

  static async requestDeposit(amount: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/wallet/deposit`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    await handleResponse(response);
    return await response.json();
  }

  static async requestWithdraw(amount: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    await handleResponse(response);
    return await response.json();
  }

  static async getRoundHistory() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/lottery/history`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    await handleResponse(response);
    return await response.json();
  }

  static logout() {
    localStorage.removeItem('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}
