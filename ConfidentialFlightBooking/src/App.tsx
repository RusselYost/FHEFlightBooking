import React, { useState, useCallback, useRef } from 'react';
import { parseEther } from 'ethers';
import Header from './components/Header';
import ConnectionStatus from './components/ConnectionStatus';
import PrivacyNotice from './components/PrivacyNotice';
import Message from './components/Message';
import AddFlightForm from './components/AddFlightForm';
import BookFlightForm from './components/BookFlightForm';
import FlightList from './components/FlightList';
import BookingList from './components/BookingList';
import { useWallet } from './hooks/useWallet';
import { useFlights } from './hooks/useFlights';
import { useBookings } from './hooks/useBookings';
import { FlightFormData, BookingFormData, MessageState } from './types';
import './App.css';

function App() {
  const { contract, userAccount, connected, error: walletError } = useWallet();
  const { flights, loading: flightsLoading, refreshFlights } = useFlights(contract, connected);
  const { bookings, loading: bookingsLoading, refreshBookings } = useBookings(
    contract,
    userAccount,
    connected
  );
  const [message, setMessage] = useState<MessageState | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<number | undefined>(undefined);
  const bookFormRef = useRef<HTMLDivElement>(null);

  const showMessage = useCallback((text: string, type: 'error' | 'success' | 'info') => {
    setMessage({ text, type });
  }, []);

  const handleAddFlight = async (data: FlightFormData) => {
    try {
      if (!contract) {
        showMessage('Contract not connected. Please deploy contract first.', 'error');
        return;
      }

      const departureTime = Math.floor(new Date(data.departureTime).getTime() / 1000);
      const arrivalTime = Math.floor(new Date(data.arrivalTime).getTime() / 1000);
      const basePrice = Math.floor(data.basePrice * 1000);

      if (departureTime <= Date.now() / 1000) {
        showMessage('Departure time must be in the future', 'error');
        return;
      }

      if (arrivalTime <= departureTime) {
        showMessage('Arrival time must be after departure time', 'error');
        return;
      }

      showMessage('Adding flight...', 'info');

      const tx = await contract.addFlight(
        data.origin,
        data.destination,
        departureTime,
        arrivalTime,
        data.totalSeats,
        basePrice
      );

      await tx.wait();
      showMessage('Flight added successfully!', 'success');
      await refreshFlights();
    } catch (error: any) {
      console.error('Error adding flight:', error);
      showMessage(`Failed to add flight: ${error.message}`, 'error');
    }
  };

  const handleBookFlight = async (data: BookingFormData) => {
    try {
      if (!contract) {
        showMessage('Contract not connected. Please deploy contract first.', 'error');
        return;
      }

      showMessage('Processing booking...', 'info');

      const tx = await contract.bookFlight(
        data.flightId,
        data.passportNumber,
        data.passengerName,
        data.passengerAge,
        data.preferredSeat || 0,
        data.specialNeeds,
        {
          value: parseEther(data.paymentAmount.toString()),
        }
      );

      await tx.wait();
      showMessage('Flight booked successfully! Booking confirmation pending.', 'success');
      await refreshFlights();
      await refreshBookings();
      setSelectedFlightId(undefined);
    } catch (error: any) {
      console.error('Error booking flight:', error);
      showMessage(`Failed to book flight: ${error.message}`, 'error');
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      if (!contract) {
        showMessage('Contract not connected', 'error');
        return;
      }

      if (!window.confirm('Are you sure you want to cancel this booking?')) {
        return;
      }

      showMessage('Cancelling booking...', 'info');

      const tx = await contract.cancelBooking(bookingId);
      await tx.wait();

      showMessage('Booking cancelled successfully!', 'success');
      await refreshBookings();
      await refreshFlights();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      showMessage(`Failed to cancel booking: ${error.message}`, 'error');
    }
  };

  const handleBookFlightClick = (flightId: number) => {
    setSelectedFlightId(flightId);
    bookFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (walletError) {
      showMessage(walletError, 'error');
    }
  }, [walletError, showMessage]);

  // Auto-refresh flights every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshFlights();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshFlights]);

  return (
    <div className="container">
      <Header />
      <ConnectionStatus connected={connected} userAccount={userAccount} />
      <Message message={message} onClose={() => setMessage(null)} />
      <PrivacyNotice />

      <div className="main-content">
        <AddFlightForm onSubmit={handleAddFlight} disabled={!connected} />
        <div ref={bookFormRef}>
          <BookFlightForm
            onSubmit={handleBookFlight}
            disabled={!connected}
            initialFlightId={selectedFlightId}
          />
        </div>
      </div>

      <FlightList flights={flights} loading={flightsLoading} onBook={handleBookFlightClick} />
      <BookingList
        bookings={bookings}
        loading={bookingsLoading}
        connected={connected}
        onCancel={handleCancelBooking}
      />
    </div>
  );
}

export default App;
