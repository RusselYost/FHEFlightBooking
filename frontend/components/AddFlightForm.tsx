'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useFlightBookingContract } from '@/hooks/useContract';
import { Button } from '@/components/ui/button';
import { Loader2, Plane, AlertCircle, CheckCircle, PlaneTakeoff } from 'lucide-react';

export function AddFlightForm() {
  const { address, isConnected } = useAccount();
  const { addFlight, isLoading, isSuccess, isError, error, owner } = useFlightBookingContract();

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    totalSeats: '',
    basePrice: '',
  });

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: '' });

    try {
      const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
      const arrivalDateTime = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);

      const departureTimestamp = BigInt(Math.floor(departureDateTime.getTime() / 1000));
      const arrivalTimestamp = BigInt(Math.floor(arrivalDateTime.getTime() / 1000));

      if (departureTimestamp >= arrivalTimestamp) {
        setSubmitStatus({
          type: 'error',
          message: 'Arrival time must be after departure time',
        });
        return;
      }

      if (departureTimestamp <= BigInt(Math.floor(Date.now() / 1000))) {
        setSubmitStatus({
          type: 'error',
          message: 'Departure time must be in the future',
        });
        return;
      }

      await addFlight(
        formData.origin,
        formData.destination,
        departureTimestamp,
        arrivalTimestamp,
        parseInt(formData.totalSeats),
        parseInt(formData.basePrice)
      );

      setSubmitStatus({
        type: 'success',
        message: 'Flight added successfully! Transaction confirmed.',
      });

      setFormData({
        origin: '',
        destination: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        totalSeats: '',
        basePrice: '',
      });
    } catch (err: any) {
      console.error('Error adding flight:', err);
      setSubmitStatus({
        type: 'error',
        message: err?.message || 'Failed to add flight. Please try again.',
      });
    }
  };

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  if (!isConnected) {
    return (
      <div className="glass-panel p-8 text-center fade-in">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-border)'
        }}>
          <Plane className="w-8 h-8" style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Connect Your Wallet</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Please connect your wallet to add flights
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="glass-panel p-8 text-center fade-in" style={{
        borderColor: 'var(--warning)',
        background: 'var(--warning-soft)'
      }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
          background: 'rgba(243, 177, 59, 0.24)',
          border: '1px solid var(--warning)'
        }}>
          <AlertCircle className="w-8 h-8" style={{ color: 'var(--warning)' }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Airline Access Only</h3>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Only authorized airlines can add flights. Your address is not registered as an airline operator.
        </p>
        <p className="text-sm address-mono" style={{ color: 'var(--color-text-muted)' }}>
          Contract owner: {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-border)'
        }}>
          <PlaneTakeoff className="w-6 h-6" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Add New Flight</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Fill in the flight details below</p>
        </div>
      </div>

      {/* Status Message */}
      {submitStatus.type && (
        <div
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{
            background: submitStatus.type === 'success' ? 'var(--success-soft)' : 'var(--error-soft)',
            border: `1px solid ${submitStatus.type === 'success' ? 'rgba(43, 195, 123, 0.28)' : 'var(--error)'}`
          }}
        >
          {submitStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--success)' }} />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--error)' }} />
          )}
          <p
            className="text-sm"
            style={{ color: submitStatus.type === 'success' ? 'var(--success)' : 'var(--error)' }}
          >
            {submitStatus.message}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Origin
            </label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="e.g., LAX"
              required
              maxLength={10}
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Destination
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g., JFK"
              required
              maxLength={10}
              className="input-glass"
            />
          </div>
        </div>

        {/* Departure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Departure Date
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Departure Time
            </label>
            <input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              required
              className="input-glass"
            />
          </div>
        </div>

        {/* Arrival */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Arrival Date
            </label>
            <input
              type="date"
              name="arrivalDate"
              value={formData.arrivalDate}
              onChange={handleChange}
              required
              min={formData.departureDate || new Date().toISOString().split('T')[0]}
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Arrival Time
            </label>
            <input
              type="time"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleChange}
              required
              className="input-glass"
            />
          </div>
        </div>

        {/* Capacity & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Total Seats
            </label>
            <input
              type="number"
              name="totalSeats"
              value={formData.totalSeats}
              onChange={handleChange}
              placeholder="e.g., 180"
              required
              min="1"
              max="1000"
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Base Price (Wei)
            </label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              placeholder="e.g., 100000000000000"
              required
              min="0"
              className="input-glass"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-glass btn-primary-glass w-full py-3 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 spinner" />
              Adding Flight...
            </>
          ) : (
            <>
              <Plane className="w-4 h-4" />
              Add Flight
            </>
          )}
        </button>
      </form>
    </div>
  );
}
