import React, { useState } from 'react';
import { BookingFormData } from '../types';

interface BookFlightFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>;
  disabled: boolean;
  initialFlightId?: number;
}

const BookFlightForm: React.FC<BookFlightFormProps> = ({
  onSubmit,
  disabled,
  initialFlightId
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    flightId: initialFlightId || 1,
    passportNumber: 0,
    passengerName: '',
    passengerAge: 25,
    preferredSeat: 0,
    specialNeeds: false,
    paymentAmount: 0.1,
  });

  React.useEffect(() => {
    if (initialFlightId) {
      setFormData((prev) => ({ ...prev, flightId: initialFlightId }));
    }
  }, [initialFlightId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      flightId: 1,
      passportNumber: 0,
      passengerName: '',
      passengerAge: 25,
      preferredSeat: 0,
      specialNeeds: false,
      paymentAmount: 0.1,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="card">
      <h2>🎫 Book Flight</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="flightId">Flight ID</label>
          <input
            type="number"
            id="flightId"
            min="1"
            placeholder="1"
            value={formData.flightId}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="passportNumber">Passport Number (Encrypted)</label>
          <input
            type="number"
            id="passportNumber"
            placeholder="123456789"
            value={formData.passportNumber || ''}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="passengerName">Passenger Name (Encrypted)</label>
          <input
            type="text"
            id="passengerName"
            placeholder="John Doe"
            value={formData.passengerName}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="passengerAge">Age</label>
          <input
            type="number"
            id="passengerAge"
            min="1"
            max="120"
            placeholder="25"
            value={formData.passengerAge}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="preferredSeat">Preferred Seat Number</label>
          <input
            type="number"
            id="preferredSeat"
            min="0"
            placeholder="12 (optional)"
            value={formData.preferredSeat || ''}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              id="specialNeeds"
              checked={formData.specialNeeds}
              onChange={handleChange}
              disabled={disabled}
            />{' '}
            Special Assistance Required
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="paymentAmount">Payment Amount (ETH)</label>
          <input
            type="number"
            id="paymentAmount"
            step="0.001"
            min="0"
            placeholder="0.1"
            value={formData.paymentAmount}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        <button type="submit" className="btn" disabled={disabled}>
          Book Flight
        </button>
      </form>
    </div>
  );
};

export default BookFlightForm;
