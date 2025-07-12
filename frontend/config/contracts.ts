/**
 * Smart Contract Configuration
 * Confidential Flight Booking System
 */

export const CONTRACTS = {
  ConfidentialFlightBooking: '0x604923E8D9d7938DE98Dd5aE193d6eea0336206A' as `0x${string}`,
  PauserSet: '0x89101063912C3e471dA0ead7142BD430f423de2D' as `0x${string}`,
} as const;

export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
  blockExplorer: 'https://sepolia.etherscan.io',
} as const;

export const CONTRACT_ABI = [
  {
    inputs: [{ name: '_pauserSet', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextFlightId',
    outputs: [{ name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextBookingId',
    outputs: [{ name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_origin', type: 'string' },
      { name: '_destination', type: 'string' },
      { name: '_departureTime', type: 'uint256' },
      { name: '_arrivalTime', type: 'uint256' },
      { name: '_totalSeats', type: 'uint16' },
      { name: '_basePrice', type: 'uint16' },
    ],
    name: 'addFlight',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint32' }],
    name: 'flights',
    outputs: [
      { name: 'flightId', type: 'uint32' },
      { name: 'origin', type: 'string' },
      { name: 'destination', type: 'string' },
      { name: 'departureTime', type: 'uint256' },
      { name: 'arrivalTime', type: 'uint256' },
      { name: 'totalSeats', type: 'uint16' },
      { name: 'availableSeats', type: 'uint16' },
      { name: 'basePrice', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'airline', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_flightId', type: 'uint32' }],
    name: 'getFlightInfo',
    outputs: [
      { name: 'origin', type: 'string' },
      { name: 'destination', type: 'string' },
      { name: 'departureTime', type: 'uint256' },
      { name: 'arrivalTime', type: 'uint256' },
      { name: 'totalSeats', type: 'uint16' },
      { name: 'availableSeats', type: 'uint16' },
      { name: 'isActive', type: 'bool' },
      { name: 'airline', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_bookingId', type: 'uint32' }],
    name: 'confirmBooking',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_bookingId', type: 'uint32' }],
    name: 'cancelBooking',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'flightId', type: 'uint32' },
      { indexed: false, name: 'origin', type: 'string' },
      { indexed: false, name: 'destination', type: 'string' },
      { indexed: false, name: 'airline', type: 'address' },
    ],
    name: 'FlightAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'bookingId', type: 'uint32' },
      { indexed: true, name: 'flightId', type: 'uint32' },
      { indexed: true, name: 'passenger', type: 'address' },
    ],
    name: 'BookingCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'bookingId', type: 'uint32' }],
    name: 'BookingConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'bookingId', type: 'uint32' }],
    name: 'BookingCancelled',
    type: 'event',
  },
] as const;
