import React from 'react';
import { LOTTERY_TEXT } from '../constants';

interface BuyButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const BuyButton: React.FC<BuyButtonProps> = ({
  onClick,
  disabled = false,
  loading = false
}) => {
  return (
    <button
      className={`
        w-full bg-[#FF6D1F] text-white bold-outline rounded-3xl py-4 text-2xl font-black bold-shadow
        active:bold-shadow-active active:translate-x-0.5 active:translate-y-0.5 transition-all mb-8
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e55a1a]'}
      `}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Placing Bet...' : LOTTERY_TEXT.placeBet}
    </button>
  );
};

export default BuyButton;
