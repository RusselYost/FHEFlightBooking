export const CONTRACT_ADDRESS = "0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C";

export const CONTRACT_ABI = [
  // Flight Management Functions
  "function addFlight(string memory _origin, string memory _destination, uint256 _departureTime, uint256 _arrivalTime, uint16 _totalSeats, uint16 _basePrice) external",
  "function getFlightInfo(uint32 _flightId) external view returns (string memory origin, string memory destination, uint256 departureTime, uint256 arrivalTime, uint16 totalSeats, uint16 availableSeats, bool isActive, address airline)",
  "function updateFlightStatus(uint32 _flightId, bool _isActive) external",

  // Booking Functions
  "function bookFlight(uint32 _flightId, uint32 _passportNumber, string memory _encryptedName, uint16 _age, uint32 _preferredSeat, bool _hasSpecialNeeds) external payable",
  "function confirmBooking(uint32 _bookingId) external",
  "function cancelBooking(uint32 _bookingId) external",

  // View Functions
  "function getBookingInfo(uint32 _bookingId) external view returns (uint32 flightId, address passenger, uint256 bookingTime, bool isConfirmed, bool isCancelled)",
  "function getPassengerBookings(address _passenger) external view returns (uint32[] memory)",
  "function checkSeatAvailability(uint32 _flightId, uint32 _seatNumber) external view returns (bool)",
  "function nextFlightId() external view returns (uint32)",
  "function nextBookingId() external view returns (uint32)",

  // Events
  "event FlightAdded(uint32 indexed flightId, string origin, string destination, address airline)",
  "event BookingCreated(uint32 indexed bookingId, uint32 indexed flightId, address indexed passenger)",
  "event BookingConfirmed(uint32 indexed bookingId)",
  "event BookingCancelled(uint32 indexed bookingId)",
  "event PaymentProcessed(uint32 indexed bookingId, address indexed passenger)"
];
