import React from 'react';
import { Flight } from '../types';
import FlightCard from './FlightCard';

interface FlightListProps {
  flights: Flight[];
  loading: boolean;
  onBook: (flightId: number) => void;
}

const FlightList: React.FC<FlightListProps> = ({ flights, loading, onBook }) => {
  if (loading) {
    return (
      <div className="bookings-section">
        <h2>Available Flights</h2>
        <div className="flights-grid">
          <p>Loading flights...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="bookings-section">
        <h2>Available Flights</h2>
        <div className="flights-grid">
          <p>No flights available. Add some flights first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-section">
      <h2>Available Flights</h2>
      <div className="flights-grid">
        {flights.map((flight) => (
          <FlightCard key={flight.flightId} flight={flight} onBook={onBook} />
        ))}
      </div>
    </div>
  );
};

export default FlightList;
