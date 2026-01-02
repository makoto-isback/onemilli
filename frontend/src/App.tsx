import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApiService } from './api';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import History from './pages/History';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Telegram WebApp and wait for ready
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        console.log('Telegram WebApp ready');
      } else {
        console.warn('Telegram WebApp not detected - running in browser mode');
      }

      // Check if already authenticated
      if (ApiService.isAuthenticated()) {
        // Load initial balance
        try {
          const userBalance = await ApiService.getBalance();
          setBalance(userBalance);
        } catch (error) {
          console.warn('Failed to load balance:', error);
        }
      } else if (!authAttempted) {
        // Try to authenticate with Telegram only once after WebApp is ready
        setAuthAttempted(true);
        try {
          await ApiService.authenticate();
          const userBalance = await ApiService.getBalance();
          setBalance(userBalance);
        } catch (error) {
          console.error('Authentication failed:', error);
          console.warn('Running in demo mode - authentication failed');
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
      // Allow app to continue even if initialization fails
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative">
        <div className="text-center">
          <div className="text-2xl font-bold">Loading...</div>
        </div>
      </div>
    );
  }

  // App renders regardless of authentication status
  // Telegram WebApp is initialized in initializeApp()

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center p-4 max-w-md mx-auto relative">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                balance={balance}
                onBalanceUpdate={updateBalance}
              />
            }
          />
          <Route
            path="/wallet"
            element={
              <Wallet
                balance={balance}
                onBalanceUpdate={updateBalance}
              />
            }
          />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Navigation */}
        <nav className="fixed bottom-4 left-4 right-4 bg-[#FAF3E1] bold-outline rounded-3xl p-3 bold-shadow">
          <div className="flex justify-around">
            <a href="/" className="flex flex-col items-center text-[#222222] no-underline">
              <span className="text-2xl">🎲</span>
              <span className="text-xs font-bold mt-1">Lottery</span>
            </a>
            <a href="/history" className="flex flex-col items-center text-[#222222] no-underline">
              <span className="text-2xl">📊</span>
              <span className="text-xs font-bold mt-1">History</span>
            </a>
          </div>
        </nav>

        {/* Decorative background bottom safe area spacing */}
        <div className="h-20 w-full"></div>
      </div>
    </Router>
  );
}

export default App;
