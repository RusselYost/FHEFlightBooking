export interface Flight {
  flightId: number;
  origin: string;
  destination: string;
  departureTime: number;
  arrivalTime: number;
  totalSeats: number;
  availableSeats: number;
  isActive: boolean;
  airline: string;
}

export interface Booking {
  bookingId: number;
  flightId: number;
  passenger: string;
  bookingTime: number;
  isConfirmed: boolean;
  isCancelled: boolean;
}

export interface BookingFormData {
  flightId: number;
  passportNumber: number;
  passengerName: string;
  passengerAge: number;
  preferredSeat: number;
  specialNeeds: boolean;
  paymentAmount: number;
}

export interface FlightFormData {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  basePrice: number;
}

export interface MessageState {
  text: string;
  type: 'error' | 'success' | 'info';
}
