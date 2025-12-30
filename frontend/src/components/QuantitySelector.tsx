import React from 'react';
import { LOTTERY_TEXT } from '../constants';

interface QuantitySelectorProps {
  selected: number;
  onSelect: (amount: number) => void;
  options?: number[];
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  selected,
  onSelect,
  options = [1, 3, 5, 10]
}) => {
  return (
    <div className="w-full mb-4">
      <div className="text-center mb-3">
        <span className="font-bold text-lg">{LOTTERY_TEXT.quantity}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className={`
              py-3 px-4 rounded-2xl font-bold text-lg bold-outline transition-all
              ${selected === amount
                ? 'bg-[#FF6D1F] text-white bold-shadow'
                : 'bg-[#FAF3E1] text-[#222222] bold-shadow hover:bg-[#F5E7C6]'
              }
              active:bold-shadow-active active:translate-x-0.5 active:translate-y-0.5
            `}
          >
            {amount}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuantitySelector;
