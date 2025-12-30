import React, { useState } from 'react';
import { ApiService } from '../api';
import { telegramService } from '../telegram';

const WithdrawButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const amount = prompt('Enter withdrawal amount (KYAT):');
    if (!amount) return;

    const numAmount = parseInt(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ApiService.requestWithdraw(numAmount);
      alert(result.message);

      // Open Telegram support chat
      const supportUsername = 'your_support_username'; // Replace with your support username
      telegramService.openTelegramLink(`https://t.me/${supportUsername}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bold-outline transition-all bg-[#dc3545] text-white bold-shadow hover:bg-[#c82333] active:bold-shadow-active active:translate-x-0.5 active:translate-y-0.5"
      onClick={handleWithdraw}
      disabled={isLoading}
    >
      {isLoading ? '...' : '📤 Withdraw'}
    </button>
  );
};

export default WithdrawButton;
