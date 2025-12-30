import React, { useState } from 'react';
import { ApiService } from '../api';
import { telegramService } from '../telegram';

const DepositButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    const amount = prompt('Enter deposit amount (KYAT):');
    if (!amount) return;

    const numAmount = parseInt(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ApiService.requestDeposit(numAmount);
      alert(result.message);

      // Open Telegram support chat
      const supportUsername = 'your_support_username'; // Replace with your support username
      telegramService.openTelegramLink(`https://t.me/${supportUsername}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request deposit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bold-outline transition-all bg-[#28a745] text-white bold-shadow hover:bg-[#218838] active:bold-shadow-active active:translate-x-0.5 active:translate-y-0.5"
      onClick={handleDeposit}
      disabled={isLoading}
    >
      {isLoading ? '...' : '📥 Deposit'}
    </button>
  );
};

export default DepositButton;
