import React, { useState, useEffect } from 'react';
import { ApiService, Transaction } from '../api';
import HeaderCard from '../components/HeaderCard';
import BalanceCard from '../components/BalanceCard';
import DepositButton from '../components/DepositButton';
import WithdrawButton from '../components/WithdrawButton';

interface WalletProps {
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ balance }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const txns = await ApiService.getTransactions();
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load transactions:', error);
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

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'DEPOSIT': return '📥';
      case 'WITHDRAW': return '📤';
      case 'BET': return '🎲';
      case 'WIN': return '🏆';
      case 'ADMIN': return '⚙️';
      default: return '💰';
    }
  };

  const getAmountColor = (type: string): string => {
    if (type === 'DEPOSIT' || type === 'WIN') return '#28a745';
    if (type === 'WITHDRAW' || type === 'BET') return '#dc3545';
    return '#000000';
  };

  return (
    <div className="w-full flex flex-col">
      <HeaderCard />

      <BalanceCard balance={balance} />

      <div className="w-full bg-[#FAF3E1] bold-outline rounded-3xl p-5 mb-4 bold-shadow">
        <h3 className="text-lg font-bold mb-4">Wallet Actions</h3>
        <div className="flex gap-3">
          <DepositButton />
          <WithdrawButton />
        </div>
        <div className="text-xs text-[#666] mt-3">
          Deposits and withdrawals require manual processing by support.
          Please contact support after requesting.
        </div>
      </div>

      <div className="w-full bg-[#F5E7C6] bold-outline rounded-3xl p-5 mb-4 bold-shadow">
        <h3 className="text-lg font-bold mb-4">Transaction History</h3>

        {isLoading ? (
          <div className="text-center py-4">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-[#666] py-4">
            No transactions yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex justify-between items-center p-3 bg-[#FAF3E1] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getTransactionIcon(txn.type)}
                  </span>
                  <div>
                    <div className="font-bold">{txn.type}</div>
                    <div className="text-xs text-[#666]">
                      {formatDate(txn.createdAt)}
                    </div>
                    {txn.note && (
                      <div className="text-xs text-[#666]">
                        {txn.note}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="font-bold"
                  style={{ color: getAmountColor(txn.type) }}
                >
                  {txn.amount > 0 ? '+' : ''}{formatAmount(txn.amount)} KYAT
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
