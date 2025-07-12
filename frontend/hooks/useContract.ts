import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, CONTRACT_ABI } from '@/config/contracts';
import { useCallback } from 'react';

export function useFlightBookingContract() {
  const { data: owner, isLoading: ownerLoading } = useReadContract({
    address: CONTRACTS.ConfidentialFlightBooking,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: nextFlightId } = useReadContract({
    address: CONTRACTS.ConfidentialFlightBooking,
    abi: CONTRACT_ABI,
    functionName: 'nextFlightId',
  });

  const { data: nextBookingId } = useReadContract({
    address: CONTRACTS.ConfidentialFlightBooking,
    abi: CONTRACT_ABI,
    functionName: 'nextBookingId',
  });

  const {
    writeContract,
    data: writeData,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError
  } = useWriteContract();

  const {
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
    isError: isTxError
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const addFlight = useCallback(async (
    origin: string,
    destination: string,
    departureTime: bigint,
    arrivalTime: bigint,
    totalSeats: number,
    basePrice: number
  ) => {
    try {
      await writeContract({
        address: CONTRACTS.ConfidentialFlightBooking,
        abi: CONTRACT_ABI,
        functionName: 'addFlight',
        args: [origin, destination, departureTime, arrivalTime, totalSeats, basePrice],
      });
    } catch (error) {
      console.error('Error adding flight:', error);
      throw error;
    }
  }, [writeContract]);

  const confirmBooking = useCallback(async (bookingId: number) => {
    try {
      await writeContract({
        address: CONTRACTS.ConfidentialFlightBooking,
        abi: CONTRACT_ABI,
        functionName: 'confirmBooking',
        args: [bookingId],
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }, [writeContract]);

  const cancelBooking = useCallback(async (bookingId: number) => {
    try {
      await writeContract({
        address: CONTRACTS.ConfidentialFlightBooking,
        abi: CONTRACT_ABI,
        functionName: 'cancelBooking',
        args: [bookingId],
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }, [writeContract]);

  return {
    owner,
    nextFlightId,
    nextBookingId,
    addFlight,
    confirmBooking,
    cancelBooking,
    isLoading: ownerLoading || isWritePending || isTxLoading,
    isSuccess: isTxSuccess,
    isError: isWriteError || isTxError,
    error: writeError,
    txHash: writeData,
  };
}

export function useFlight(flightId: number) {
  const { data: flightInfo, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.ConfidentialFlightBooking,
    abi: CONTRACT_ABI,
    functionName: 'getFlightInfo',
    args: [flightId],
  });

  return {
    flight: flightInfo ? {
      origin: flightInfo[0],
      destination: flightInfo[1],
      departureTime: flightInfo[2],
      arrivalTime: flightInfo[3],
      totalSeats: flightInfo[4],
      availableSeats: flightInfo[5],
      isActive: flightInfo[6],
      airline: flightInfo[7],
    } : null,
    isLoading,
    error,
    refetch,
  };
}
