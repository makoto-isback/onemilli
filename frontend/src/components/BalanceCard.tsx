import React from 'react';

interface BalanceCardProps {
  balance: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const formatBalance = (amount: number): string => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="w-full bg-[#F5E7C6] bold-outline rounded-3xl p-6 text-center bold-shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Your Balance</h2>
      <div className="text-3xl font-black text-[#FF6D1F]">
        {formatBalance(balance)} KYAT
      </div>
    </div>
  );
};

export default BalanceCard;
