import React, { useState, useEffect } from 'react';
import { ApiService, RoundData } from '../api';
import { LOTTERY_TEXT } from '../constants';
import HeaderCard from '../components/HeaderCard';
import BalanceCard from '../components/BalanceCard';
import RoundInfoCard from '../components/RoundInfoCard';
import BlockGridCard from '../components/BlockGridCard';
import QuantitySelector from '../components/QuantitySelector';
import BuyButton from '../components/BuyButton';

interface HomeProps {
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const Home: React.FC<HomeProps> = ({ balance, onBalanceUpdate }) => {
  const [round, setRound] = useState<RoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  useEffect(() => {
    loadRound();
    // Update round every 10 seconds
    const interval = setInterval(loadRound, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadRound = async () => {
    try {
      const roundData = await ApiService.getActiveRound();
      setRound(roundData);
    } catch (error) {
      console.error('Failed to load round:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeLeft = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount: number): string => {
    return (amount / 100).toFixed(2);
  };

  const handleBuyTickets = async () => {
    const totalCost = selectedAmount * 1000; // Each ticket costs 1000 KYAT
    if (!round || totalCost > balance) {
      alert('Insufficient balance');
      return;
    }

    setIsPlacingBet(true);
    try {
      await ApiService.placeBet(totalCost);
      const newBalance = await ApiService.getBalance();
      onBalanceUpdate(newBalance);
      await loadRound();
      alert('Tickets purchased successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to purchase tickets');
    } finally {
      setIsPlacingBet(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8">
        <div className="text-center">
          <div className="text-xl font-bold">Loading lottery round...</div>
        </div>
      </div>
    );
  }

  const timeLeft = round ? formatTimeLeft(round.timeLeftMs) : '00:00';
  const soldTickets = round ? `${Math.floor(round.totalPool / 1000)} / 1000` : '0 / 1000';
  const prizePool = round ? formatAmount(Math.floor(round.totalPool * 0.9)) : '0.00';

  const totalCost = selectedAmount * 1000; // Each ticket costs 1000 KYAT

  return (
    <div className="w-full flex flex-col">
      <HeaderCard />

      {round && (
        <>
          <RoundInfoCard
            timeLeft={timeLeft}
            soldTickets={soldTickets}
            prizePool={prizePool}
          />

          <div className="w-full relative">
            <BlockGridCard totalPool={round.totalPool} />
          </div>

          <div className="w-full bg-[#F5E7C6] bold-outline rounded-2xl p-3 mb-4">
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-[#222222]/30 rounded-sm"></div>
                <span className="font-bold">{LOTTERY_TEXT.available}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FF6D1F] border border-[#222222]/30 rounded-sm"></div>
                <span className="font-bold">{LOTTERY_TEXT.soldLabel}</span>
              </div>
            </div>
          </div>

          <QuantitySelector
            selected={selectedAmount}
            onSelect={setSelectedAmount}
          />

          <BuyButton
            onClick={handleBuyTickets}
            disabled={totalCost > balance || isPlacingBet}
            loading={isPlacingBet}
          />

          <BalanceCard balance={balance} />
        </>
      )}
    </div>
  );
};

export default Home;
