import React from 'react';
import { Flight } from '../types';

interface FlightCardProps {
  flight: Flight;
  onBook: (flightId: number) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onBook }) => {
  const departureDate = new Date(flight.departureTime * 1000);
  const arrivalDate = new Date(flight.arrivalTime * 1000);

  return (
    <div className="flight-card">
      <div className="flight-header">
        <div className="route">
          {flight.origin} → {flight.destination}
        </div>
        <div className={`status ${flight.availableSeats > 0 ? 'available' : 'booked'}`}>
          {flight.availableSeats}/{flight.totalSeats} available
        </div>
      </div>
      <div className="flight-details">
        <div className="detail-item">
          <span className="detail-label">Flight ID</span>
          <span className="detail-value">#{flight.flightId}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Airline</span>
          <span className="detail-value">{flight.airline.slice(0, 8)}...</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Departure</span>
          <span className="detail-value">{departureDate.toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Arrival</span>
          <span className="detail-value">{arrivalDate.toLocaleString()}</span>
        </div>
      </div>
      {flight.availableSeats > 0 ? (
        <button className="btn" onClick={() => onBook(flight.flightId)}>
          Book This Flight
        </button>
      ) : (
        <button className="btn" disabled>
          Fully Booked
        </button>
      )}
    </div>
  );
};

export default FlightCard;
