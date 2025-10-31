import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { Flight } from '../types';

export const useFlights = (contract: Contract | null, connected: boolean) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFlights = useCallback(async () => {
    if (!contract || !connected) {
      setFlights([]);
      return;
    }

    try {
      setLoading(true);
      const nextFlightId = await contract.nextFlightId();
      const flightList: Flight[] = [];

      for (let i = 1; i < Number(nextFlightId); i++) {
        try {
          const flightInfo = await contract.getFlightInfo(i);
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

          if (isActive) {
            flightList.push({
              flightId: i,
              origin,
              destination,
              departureTime: Number(departureTime),
              arrivalTime: Number(arrivalTime),
              totalSeats: Number(totalSeats),
              availableSeats: Number(availableSeats),
              isActive,
              airline,
            });
          }
        } catch (error) {
          console.error(`Error loading flight ${i}:`, error);
        }
      }

      setFlights(flightList);
    } catch (error) {
      console.error('Error loading flights:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, connected]);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  return { flights, loading, refreshFlights: loadFlights };
};
