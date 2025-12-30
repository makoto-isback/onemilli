import React from 'react';
import { LOTTERY_TEXT } from '../constants';

interface RoundInfoCardProps {
  timeLeft: string;
  soldTickets: string;
  prizePool: string;
}

const RoundInfoCard: React.FC<RoundInfoCardProps> = ({ timeLeft, soldTickets, prizePool }) => {
  return (
    <div className="w-full bg-[#F5E7C6] bold-outline rounded-3xl p-5 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏳</span>
          <span className="font-bold">{LOTTERY_TEXT.timeLeft}</span>
        </div>
        <span className="font-black text-lg">{timeLeft}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎟</span>
          <span className="font-bold">Sold</span>
        </div>
        <span className="font-black text-lg">{soldTickets}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <span className="font-bold">{LOTTERY_TEXT.prize}</span>
        </div>
        <span className="font-black text-lg text-[#FF6D1F]">{prizePool}</span>
      </div>
    </div>
  );
};

export default RoundInfoCard;
