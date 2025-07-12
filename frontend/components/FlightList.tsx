'use client';

import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { CONTRACTS, CONTRACT_ABI } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Plane, Calendar, Clock, Users, Loader2, RefreshCw, ArrowRight } from 'lucide-react';

interface Flight {
  id: number;
  origin: string;
  destination: string;
  departureTime: bigint;
  arrivalTime: bigint;
  totalSeats: number;
  availableSeats: number;
  isActive: boolean;
  airline: string;
}

export function FlightList() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  const loadFlights = async () => {
    if (!publicClient || !isConnected) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextFlightId = await publicClient.readContract({
        address: CONTRACTS.ConfidentialFlightBooking,
        abi: CONTRACT_ABI,
        functionName: 'nextFlightId',
      });

      const flightCount = Number(nextFlightId);
      const loadedFlights: Flight[] = [];

      for (let i = 0; i < flightCount; i++) {
        try {
          const flightInfo = (await publicClient.readContract({
            address: CONTRACTS.ConfidentialFlightBooking,
            abi: CONTRACT_ABI,
            functionName: 'getFlightInfo',
            args: [i],
          })) as readonly [string, string, bigint, bigint, number, number, boolean, `0x${string}`];

          if (flightInfo && flightInfo[6]) {
            loadedFlights.push({
              id: i,
              origin: flightInfo[0],
              destination: flightInfo[1],
              departureTime: flightInfo[2],
              arrivalTime: flightInfo[3],
              totalSeats: Number(flightInfo[4]),
              availableSeats: Number(flightInfo[5]),
              isActive: flightInfo[6],
              airline: flightInfo[7],
            });
          }
        } catch (err) {
          console.error(`Error loading flight ${i}:`, err);
        }
      }

      setFlights(loadedFlights);
    } catch (err) {
      console.error('Error loading flights:', err);
      setError('Failed to load flights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, [publicClient, isConnected]);

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (departure: bigint, arrival: bigint) => {
    const hours = (Number(arrival) - Number(departure)) / 3600;
    return `${hours.toFixed(1)}h`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center fade-in">
          <Loader2 className="w-12 h-12 mx-auto mb-4 spinner" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="glass-panel p-6 text-center" style={{
          borderColor: 'var(--error)',
          background: 'var(--error-soft)'
        }}>
          <p className="mb-4" style={{ color: 'var(--error)' }}>{error}</p>
          <button onClick={loadFlights} className="btn-glass btn-secondary-glass inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 fade-in">
        <div className="glass-panel p-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{
            background: 'rgba(148, 163, 184, 0.18)',
            border: '1px solid var(--color-border)'
          }}>
            <Plane className="w-10 h-10" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>No Flights Available</h3>
          <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
            There are currently no active flights. Check back soon or add a new flight if you're an airline.
          </p>
          <button onClick={loadFlights} className="btn-glass btn-secondary-glass inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Available Flights</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {flights.length} flight{flights.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button onClick={loadFlights} className="btn-glass btn-secondary-glass inline-flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Flight Cards */}
      <div className="grid gap-4">
        {flights.map((flight, index) => (
          <div
            key={flight.id}
            className="glass-panel p-6 fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Flight Route Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  {/* Origin */}
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {flight.origin}
                    </div>
                    <div className="text-xs md:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {formatDateTime(flight.departureTime)}
                    </div>
                  </div>

                  {/* Flight Path */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 relative h-px" style={{ background: 'var(--color-border)' }}>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full" style={{
                        background: 'var(--accent-soft)',
                        border: '1px solid var(--accent-border)'
                      }}>
                        <Plane className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full whitespace-nowrap" style={{
                      background: 'rgba(148, 163, 184, 0.18)',
                      color: 'var(--color-text-muted)'
                    }}>
                      {calculateDuration(flight.departureTime, flight.arrivalTime)}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {flight.destination}
                    </div>
                    <div className="text-xs md:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {formatDateTime(flight.arrivalTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight ID Badge */}
              <div className="text-right">
                <div className="badge-glass badge-encrypted mb-2">
                  FLIGHT #{flight.id}
                </div>
                <div className="text-xs address-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {flight.airline.slice(0, 6)}...{flight.airline.slice(-4)}
                </div>
              </div>
            </div>

            {/* Flight Details & Action */}
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-6 text-sm flex-wrap">
                {/* Seats */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ color: 'var(--color-text)' }}>
                    <strong style={{ color: flight.availableSeats > 0 ? 'var(--success)' : 'var(--error)' }}>
                      {flight.availableSeats}
                    </strong> / {flight.totalSeats} seats
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ color: 'var(--color-text)' }}>
                    {new Date(Number(flight.departureTime) * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                disabled={flight.availableSeats === 0}
                className="btn-glass btn-primary-glass inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {flight.availableSeats > 0 ? (
                  <>
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  'Sold Out'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
