import React from 'react';
import { Booking, Flight } from '../types';

interface BookingCardProps {
  booking: Booking;
  flight: Flight;
  onCancel: (bookingId: number) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, flight, onCancel }) => {
  const bookingDate = new Date(booking.bookingTime * 1000);

  let statusClass = 'status ';
  let statusText = '';

  if (booking.isCancelled) {
    statusClass += 'booked';
    statusText = 'Cancelled';
  } else if (booking.isConfirmed) {
    statusClass += 'available';
    statusText = 'Confirmed';
  } else {
    statusClass += 'booked';
    statusText = 'Pending';
  }

  return (
    <div className="booking-card">
      <div className="booking-header">
        <div className="booking-id">Booking #{booking.bookingId}</div>
        <div className={statusClass}>{statusText}</div>
      </div>
      <div className="flight-details">
        <div className="detail-item">
          <span className="detail-label">Route</span>
          <span className="detail-value">
            {flight.origin} → {flight.destination}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Flight ID</span>
          <span className="detail-value">#{booking.flightId}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Booked On</span>
          <span className="detail-value">{bookingDate.toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status</span>
          <span className="detail-value">{statusText}</span>
        </div>
      </div>
      {!booking.isCancelled && !booking.isConfirmed && (
        <button className="btn" onClick={() => onCancel(booking.bookingId)}>
          Cancel Booking
        </button>
      )}
    </div>
  );
};

export default BookingCard;
