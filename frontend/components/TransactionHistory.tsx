'use client';

import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Loader2, ExternalLink, Clock, CheckCircle, XCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TransactionHistory() {
  const { transactions, isLoading } = useTransactionHistory();

  const getStatusIcon = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} />;
      case 'success':
        return <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />;
      case 'failed':
        return <XCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'success':
        return 'badge-success';
      case 'failed':
        return 'badge-glass';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FlightAdded':
        return 'Flight Added';
      case 'BookingCreated':
        return 'Booking Created';
      case 'BookingConfirmed':
        return 'Booking Confirmed';
      case 'BookingCancelled':
        return 'Booking Cancelled';
      default:
        return type;
    }
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center fade-in">
          <Loader2 className="w-12 h-12 mx-auto mb-4 spinner" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading transaction history...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 fade-in">
        <div className="glass-panel p-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{
            background: 'rgba(148, 163, 184, 0.18)',
            border: '1px solid var(--color-border)'
          }}>
            <History className="w-10 h-10" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>No Transactions Yet</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Your transaction history will appear here once you start interacting with the platform
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Transaction History</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          View all your recent transactions and their status
        </p>
      </div>

      {/* Transaction Cards */}
      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <div
            key={tx.hash}
            className="glass-panel p-6 fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* Left: Icon + Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="mt-1">{getStatusIcon(tx.status)}</div>

                <div className="flex-1 min-w-0">
                  {/* Type and Status */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                      {getTypeLabel(tx.type)}
                    </h3>
                    <span className={`badge-glass ${getStatusBadge(tx.status)}`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Transaction:
                      </span>
                      <code className="address-mono px-2 py-1 rounded" style={{
                        background: 'rgba(148, 163, 184, 0.18)',
                        color: 'var(--color-text)'
                      }}>
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      </code>
                    </div>

                    {tx.flightId !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>
                          Flight ID:
                        </span>
                        <span style={{ color: 'var(--color-text)' }}>{tx.flightId}</span>
                      </div>
                    )}

                    {tx.bookingId !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>
                          Booking ID:
                        </span>
                        <span style={{ color: 'var(--color-text)' }}>{tx.bookingId}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Time:
                      </span>
                      <span style={{ color: 'var(--color-text)' }}>{formatDateTime(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: View Button */}
              <button
                onClick={() =>
                  window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')
                }
                className="btn-glass btn-secondary-glass inline-flex items-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
