import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { Booking, Flight } from '../types';

export const useBookings = (
  contract: Contract | null,
  userAccount: string | null,
  connected: boolean
) => {
  const [bookings, setBookings] = useState<Array<{ booking: Booking; flight: Flight }>>([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!contract || !userAccount || !connected) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      const bookingIds = await contract.getPassengerBookings(userAccount);
      const bookingList: Array<{ booking: Booking; flight: Flight }> = [];

      for (const bookingId of bookingIds) {
        try {
          const bookingInfo = await contract.getBookingInfo(bookingId);
          const [flightId, passenger, bookingTime, isConfirmed, isCancelled] = bookingInfo;

          const flightInfo = await contract.getFlightInfo(flightId);
          const [
            origin,
            destination,
            departureTime,
            arrivalTime,
            totalSeats,
            availableSeats,
            isActive,
            airline,
          ] = flightInfo;

          const booking: Booking = {
            bookingId: Number(bookingId),
            flightId: Number(flightId),
            passenger,
            bookingTime: Number(bookingTime),
            isConfirmed,
            isCancelled,
          };

          const flight: Flight = {
            flightId: Number(flightId),
            origin,
            destination,
            departureTime: Number(departureTime),
            arrivalTime: Number(arrivalTime),
            totalSeats: Number(totalSeats),
            availableSeats: Number(availableSeats),
            isActive,
            airline,
          };

          bookingList.push({ booking, flight });
        } catch (error) {
          console.error(`Error loading booking ${bookingId}:`, error);
        }
      }

      setBookings(bookingList);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, userAccount, connected]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return { bookings, loading, refreshBookings: loadBookings };
};
