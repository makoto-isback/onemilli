// import { retrieveLaunchParams } from '@telegram-apps/sdk';

// Telegram Web App types
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
          auth_date?: number;
          hash?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string) => void;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export class TelegramService {
  private static instance: TelegramService;
  private webApp: any = null;

  private constructor() {
    this.init();
  }

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private init() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;

      // Initialize the Web App
      this.webApp.ready();

      // Expand to full height
      this.webApp.expand();
    }
  }

  getInitData(): string {
    if (this.webApp) {
      return this.webApp.initData;
    }

    // Fallback for development - try to get from URL params
    try {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      return urlParams.get('tgWebAppData') || '';
    } catch {
      return '';
    }
  }

  getUser(): TelegramUser | null {
    if (this.webApp?.initDataUnsafe?.user) {
      return this.webApp.initDataUnsafe.user;
    }
    return null;
  }

  openTelegramLink(url: string) {
    if (this.webApp) {
      this.webApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  openLink(url: string) {
    if (this.webApp) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  close() {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  isInTelegram(): boolean {
    return !!this.webApp;
  }
}

export const telegramService = TelegramService.getInstance();
