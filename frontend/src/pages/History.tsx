import React, { useState, useEffect } from 'react';
import { ApiService } from '../api';
import HeaderCard from '../components/HeaderCard';

interface RoundHistory {
  id: string;
  totalPool: number;
  winner: {
    username: string;
    winnings: number;
  } | null;
  betCount: number;
  endedAt: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await ApiService.getRoundHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number): string => {
    return (amount / 100).toFixed(2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8">
        <div className="text-center">
          <div className="text-xl font-bold">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <HeaderCard />

      <div className="w-full mb-4">
        <h2 className="text-center text-2xl font-black pixel-font mb-6">Lottery History</h2>
      </div>

      {history.length === 0 ? (
        <div className="w-full bg-[#F5E7C6] bold-outline rounded-3xl p-8 text-center bold-shadow">
          <div className="text-lg text-[#666]">No completed rounds yet</div>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {history.map((round) => (
            <div key={round.id} className="w-full bg-[#F5E7C6] bold-outline rounded-3xl p-5 bold-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-lg font-black">
                    Pool: {formatAmount(round.totalPool)} KYAT
                  </div>
                  <div className="text-sm text-[#666]">
                    {round.betCount} bets • {formatDate(round.endedAt)}
                  </div>
                </div>
                {round.winner ? (
                  <div className="text-right">
                    <div className="text-sm text-[#666]">Winner</div>
                    <div className="font-bold">@{round.winner.username}</div>
                    <div className="text-sm text-[#28a745] font-bold">
                      +{formatAmount(round.winner.winnings)} KYAT
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-[#666]">
                    No winner
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
