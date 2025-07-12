import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';

export interface Transaction {
  hash: string;
  type: 'FlightAdded' | 'BookingCreated' | 'BookingConfirmed' | 'BookingCancelled';
  timestamp: number;
  flightId?: number;
  bookingId?: number;
  from: string;
  status: 'pending' | 'success' | 'failed';
}

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();
  const { address } = useAccount();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!publicClient || !address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Load from localStorage
        const stored = localStorage.getItem(`tx_history_${address}`);
        if (stored) {
          setTransactions(JSON.parse(stored));
        }

        // Get recent blocks
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock - 1000n; // Last ~1000 blocks

        // Fetch FlightAdded events
        const flightAddedLogs = await publicClient.getLogs({
          address: CONTRACTS.ConfidentialFlightBooking,
          event: {
            type: 'event',
            name: 'FlightAdded',
            inputs: [
              { indexed: true, name: 'flightId', type: 'uint32' },
              { indexed: false, name: 'origin', type: 'string' },
              { indexed: false, name: 'destination', type: 'string' },
              { indexed: false, name: 'airline', type: 'address' },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        });

        // Fetch BookingCreated events
        const bookingCreatedLogs = await publicClient.getLogs({
          address: CONTRACTS.ConfidentialFlightBooking,
          event: {
            type: 'event',
            name: 'BookingCreated',
            inputs: [
              { indexed: true, name: 'bookingId', type: 'uint32' },
              { indexed: true, name: 'flightId', type: 'uint32' },
              { indexed: true, name: 'passenger', type: 'address' },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        });

        // Process and combine transactions
        const allTxs: Transaction[] = [];

        for (const log of flightAddedLogs) {
          if (log.address.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({ blockHash: log.blockHash! });
            allTxs.push({
              hash: log.transactionHash!,
              type: 'FlightAdded',
              timestamp: Number(block.timestamp) * 1000,
              flightId: Number(log.topics[1]),
              from: address,
              status: 'success',
            });
          }
        }

        for (const log of bookingCreatedLogs) {
          if (log.address.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({ blockHash: log.blockHash! });
            allTxs.push({
              hash: log.transactionHash!,
              type: 'BookingCreated',
              timestamp: Number(block.timestamp) * 1000,
              bookingId: Number(log.topics[1]),
              flightId: Number(log.topics[2]),
              from: address,
              status: 'success',
            });
          }
        }

        // Sort by timestamp descending
        allTxs.sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(allTxs);

        // Save to localStorage
        localStorage.setItem(`tx_history_${address}`, JSON.stringify(allTxs));
      } catch (error) {
        console.error('Error loading transaction history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [publicClient, address]);

  const addPendingTransaction = (tx: Omit<Transaction, 'timestamp' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      timestamp: Date.now(),
      status: 'pending',
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);

    if (address) {
      localStorage.setItem(`tx_history_${address}`, JSON.stringify(updated));
    }
  };

  const updateTransactionStatus = (hash: string, status: 'success' | 'failed') => {
    const updated = transactions.map((tx) =>
      tx.hash === hash ? { ...tx, status } : tx
    );
    setTransactions(updated);

    if (address) {
      localStorage.setItem(`tx_history_${address}`, JSON.stringify(updated));
    }
  };

  return {
    transactions,
    isLoading,
    addPendingTransaction,
    updateTransactionStatus,
  };
}
