import React, { useState } from 'react';
import { FlightFormData } from '../types';

interface AddFlightFormProps {
  onSubmit: (data: FlightFormData) => Promise<void>;
  disabled: boolean;
}

const AddFlightForm: React.FC<AddFlightFormProps> = ({ onSubmit, disabled }) => {
  const [formData, setFormData] = useState<FlightFormData>({
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: 180,
    basePrice: 0.1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      totalSeats: 180,
      basePrice: 0.1,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="card">
      <h2>🛫 Add Flight</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="origin">Origin Airport</label>
          <input
            type="text"
            id="origin"
            placeholder="e.g., New York JFK"
            value={formData.origin}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="destination">Destination Airport</label>
          <input
            type="text"
            id="destination"
            placeholder="e.g., London LHR"
            value={formData.destination}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="departureTime">Departure Time</label>
          <input
            type="datetime-local"
            id="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="arrivalTime">Arrival Time</label>
          <input
            type="datetime-local"
            id="arrivalTime"
            value={formData.arrivalTime}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="totalSeats">Total Seats</label>
          <input
            type="number"
            id="totalSeats"
            min="1"
            max="400"
            placeholder="180"
            value={formData.totalSeats}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="basePrice">Base Price (ETH)</label>
          <input
            type="number"
            id="basePrice"
            step="0.001"
            min="0"
            placeholder="0.1"
            value={formData.basePrice}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <button type="submit" className="btn" disabled={disabled}>
          Add Flight
        </button>
      </form>
    </div>
  );
};

export default AddFlightForm;
