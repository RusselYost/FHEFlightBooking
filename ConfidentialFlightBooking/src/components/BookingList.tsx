import React from 'react';
import { Booking, Flight } from '../types';
import BookingCard from './BookingCard';

interface BookingListProps {
  bookings: Array<{ booking: Booking; flight: Flight }>;
  loading: boolean;
  connected: boolean;
  onCancel: (bookingId: number) => void;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, loading, connected, onCancel }) => {
  if (!connected) {
    return (
      <div className="bookings-section">
        <h2>My Bookings</h2>
        <div id="bookingsGrid">
          <p>Connect wallet to view your bookings</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bookings-section">
        <h2>My Bookings</h2>
        <div id="bookingsGrid">
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bookings-section">
        <h2>My Bookings</h2>
        <div id="bookingsGrid">
          <p>You have no bookings yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-section">
      <h2>My Bookings</h2>
      <div id="bookingsGrid">
        {bookings.map(({ booking, flight }) => (
          <BookingCard
            key={booking.bookingId}
            booking={booking}
            flight={flight}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
};

export default BookingList;
