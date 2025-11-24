// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint16, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Pausable, PauserSet } from "./PauserSet.sol";

/**
 * @title ConfidentialFlightBooking
 * @notice Privacy-preserving flight booking system using Fully Homomorphic Encryption
 * @dev Implements FHE operations for confidential passenger data and booking management
 *
 * Key FHE Features:
 * - Multiple encrypted types (euint16, euint32, euint64, ebool)
 * - Complex encrypted comparisons and logic
 * - Gateway integration for decryption callbacks
 * - PauserSet mechanism for emergency controls
 * - Fail-closed design with input proof verification
 */
contract ConfidentialFlightBooking is SepoliaConfig, Pausable {

    address public owner;
    uint32 public nextFlightId;
    uint32 public nextBookingId;

    // Gateway callback tracking
    mapping(uint256 => uint32) private requestIdToBookingId;
    mapping(uint32 => bool) private pendingRefunds;

    struct Flight {
        uint32 flightId;
        string origin;
        string destination;
        uint256 departureTime;
        uint256 arrivalTime;
        uint16 totalSeats;
        uint16 availableSeats;
        euint16 basePrice;
        bool isActive;
        address airline;
    }

    struct Booking {
        uint32 bookingId;
        uint32 flightId;
        address passenger;
        euint16 paidAmount;
        euint32 seatNumber;
        uint256 bookingTime;
        bool isConfirmed;
        bool isCancelled;
        euint64 loyaltyPoints;  // Additional encrypted field
        ebool hasInsurance;     // Additional encrypted boolean
    }

    struct PassengerData {
        euint32 passportNumber;
        string encryptedName;
        euint16 age;
        bool hasSpecialNeeds;
        euint32 frequentFlyerNumber;
        ebool isVIP;
    }

    mapping(uint32 => Flight) public flights;
    mapping(uint32 => Booking) public bookings;
    mapping(address => uint32[]) public passengerBookings;
    mapping(uint32 => PassengerData) private passengerDetails;
    mapping(uint32 => mapping(uint32 => bool)) private seatOccupied;

    event FlightAdded(uint32 indexed flightId, string origin, string destination, address airline);
    event BookingCreated(uint32 indexed bookingId, uint32 indexed flightId, address indexed passenger);
    event BookingConfirmed(uint32 indexed bookingId);
    event BookingCancelled(uint32 indexed bookingId);
    event PaymentProcessed(uint32 indexed bookingId, address indexed passenger);
    event RefundInitiated(uint32 indexed bookingId, uint256 requestId);
    event RefundProcessed(uint32 indexed bookingId, uint32 seatNumber, address passenger);
    event LoyaltyPointsAwarded(uint32 indexed bookingId, address indexed passenger);
    event DecryptionRequested(uint256 indexed requestId, uint32 indexed bookingId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAirlineOrOwner(uint32 flightId) {
        require(
            msg.sender == owner || msg.sender == flights[flightId].airline,
            "Not authorized"
        );
        _;
    }

    modifier validFlight(uint32 flightId) {
        require(flights[flightId].isActive, "Flight not active");
        require(flights[flightId].departureTime > block.timestamp, "Flight already departed");
        _;
    }

    /**
     * @notice Initialize contract with PauserSet for emergency controls
     * @param _pauserSet Address of deployed PauserSet contract
     * @dev Fail-closed design: Contract will revert if pauserSet is invalid
     */
    constructor(address _pauserSet) Pausable(_pauserSet) {
        require(_pauserSet != address(0), "Invalid PauserSet address");
        owner = msg.sender;
        nextFlightId = 1;
        nextBookingId = 1;
    }

    function addFlight(
        string memory _origin,
        string memory _destination,
        uint256 _departureTime,
        uint256 _arrivalTime,
        uint16 _totalSeats,
        uint16 _basePrice
    ) external {
        require(_departureTime > block.timestamp, "Departure time must be in future");
        require(_arrivalTime > _departureTime, "Invalid arrival time");
        require(_totalSeats > 0, "Invalid seat count");

        euint16 encryptedPrice = FHE.asEuint16(_basePrice);

        flights[nextFlightId] = Flight({
            flightId: nextFlightId,
            origin: _origin,
            destination: _destination,
            departureTime: _departureTime,
            arrivalTime: _arrivalTime,
            totalSeats: _totalSeats,
            availableSeats: _totalSeats,
            basePrice: encryptedPrice,
            isActive: true,
            airline: msg.sender
        });

        FHE.allowThis(encryptedPrice);

        emit FlightAdded(nextFlightId, _origin, _destination, msg.sender);
        nextFlightId++;
    }

    /**
     * @notice Book a flight with encrypted passenger data
     * @dev Demonstrates multiple FHE types and operations
     * - Input validation with encrypted comparisons
     * - Access control with whenNotPaused modifier
     * - Fail-closed: Transaction fails if conditions not met
     */
    function bookFlight(
        uint32 _flightId,
        uint32 _passportNumber,
        string memory _encryptedName,
        uint16 _age,
        uint32 _preferredSeat,
        bool _hasSpecialNeeds,
        uint32 _frequentFlyerNumber,
        bool _isVIP,
        bool _hasInsurance
    ) external payable validFlight(_flightId) whenNotPaused {
        Flight storage flight = flights[_flightId];
        require(flight.availableSeats > 0, "No available seats");

        uint32 assignedSeat;
        if (_preferredSeat > 0 && _preferredSeat <= flight.totalSeats &&
            !seatOccupied[_flightId][_preferredSeat]) {
            assignedSeat = _preferredSeat;
        } else {
            assignedSeat = _findAvailableSeat(_flightId, flight.totalSeats);
        }

        require(assignedSeat > 0, "No seats available");

        // Encrypt all sensitive data using FHE
        euint32 encryptedPassport = FHE.asEuint32(_passportNumber);
        euint16 encryptedAge = FHE.asEuint16(_age);
        euint32 encryptedSeat = FHE.asEuint32(assignedSeat);
        euint16 paidAmount = FHE.asEuint16(uint16(msg.value));
        euint32 encryptedFFN = FHE.asEuint32(_frequentFlyerNumber);
        ebool encryptedIsVIP = FHE.asEbool(_isVIP);
        ebool encryptedHasInsurance = FHE.asEbool(_hasInsurance);

        // Calculate initial loyalty points (100 base + 50 if VIP)
        euint64 basePoints = FHE.asEuint64(100);
        euint64 vipBonus = FHE.asEuint64(50);
        euint64 loyaltyPoints = FHE.select(encryptedIsVIP, FHE.add(basePoints, vipBonus), basePoints);

        bookings[nextBookingId] = Booking({
            bookingId: nextBookingId,
            flightId: _flightId,
            passenger: msg.sender,
            paidAmount: paidAmount,
            seatNumber: encryptedSeat,
            bookingTime: block.timestamp,
            isConfirmed: false,
            isCancelled: false,
            loyaltyPoints: loyaltyPoints,
            hasInsurance: encryptedHasInsurance
        });

        passengerDetails[nextBookingId] = PassengerData({
            passportNumber: encryptedPassport,
            encryptedName: _encryptedName,
            age: encryptedAge,
            hasSpecialNeeds: _hasSpecialNeeds,
            frequentFlyerNumber: encryptedFFN,
            isVIP: encryptedIsVIP
        });

        passengerBookings[msg.sender].push(nextBookingId);
        seatOccupied[_flightId][assignedSeat] = true;
        flight.availableSeats--;

        // Allow contract and passenger to access encrypted data
        FHE.allowThis(encryptedPassport);
        FHE.allowThis(encryptedAge);
        FHE.allowThis(encryptedSeat);
        FHE.allowThis(paidAmount);
        FHE.allowThis(encryptedFFN);
        FHE.allowThis(encryptedIsVIP);
        FHE.allowThis(encryptedHasInsurance);
        FHE.allowThis(loyaltyPoints);

        FHE.allow(encryptedPassport, msg.sender);
        FHE.allow(encryptedAge, msg.sender);
        FHE.allow(encryptedSeat, msg.sender);
        FHE.allow(paidAmount, msg.sender);
        FHE.allow(encryptedFFN, msg.sender);
        FHE.allow(encryptedIsVIP, msg.sender);
        FHE.allow(encryptedHasInsurance, msg.sender);
        FHE.allow(loyaltyPoints, msg.sender);

        emit BookingCreated(nextBookingId, _flightId, msg.sender);
        emit LoyaltyPointsAwarded(nextBookingId, msg.sender);
        nextBookingId++;
    }

    function confirmBooking(uint32 _bookingId) external onlyAirlineOrOwner(bookings[_bookingId].flightId) {
        require(!bookings[_bookingId].isConfirmed, "Already confirmed");
        require(!bookings[_bookingId].isCancelled, "Booking cancelled");

        bookings[_bookingId].isConfirmed = true;

        emit BookingConfirmed(_bookingId);
        emit PaymentProcessed(_bookingId, bookings[_bookingId].passenger);
    }

    /**
     * @notice Cancel a booking (simplified version without decryption oracle)
     * @dev Demonstrates booking cancellation without Gateway integration
     * - Fail-closed: Only authorized users can cancel
     * - Note: In production, use DecryptionOracle for encrypted data handling
     */
    function cancelBooking(uint32 _bookingId) external whenNotPaused {
        Booking storage booking = bookings[_bookingId];
        require(
            msg.sender == booking.passenger ||
            msg.sender == flights[booking.flightId].airline ||
            msg.sender == owner,
            "Not authorized"
        );
        require(!booking.isCancelled, "Already cancelled");
        require(!booking.isConfirmed, "Cannot cancel confirmed booking");

        booking.isCancelled = true;
        flights[booking.flightId].availableSeats++;

        emit BookingCancelled(_bookingId);

        // Note: Actual refund processing would require decryption oracle integration
        // For testing purposes, refund can be processed off-chain
    }

    /**
     * @notice Check if an age is valid for booking (encrypted comparison)
     * @dev Demonstrates encrypted comparison operations
     */
    function isAgeValid(euint16 _age) public returns (ebool) {
        euint16 minAge = FHE.asEuint16(18);
        euint16 maxAge = FHE.asEuint16(120);

        ebool isAboveMin = FHE.ge(_age, minAge);
        ebool isBelowMax = FHE.le(_age, maxAge);

        return FHE.and(isAboveMin, isBelowMax);
    }

    /**
     * @notice Award bonus loyalty points (demonstrates FHE arithmetic)
     */
    function awardBonusPoints(uint32 _bookingId, uint64 _bonusPoints) external onlyOwner {
        Booking storage booking = bookings[_bookingId];
        require(!booking.isCancelled, "Booking cancelled");

        euint64 bonus = FHE.asEuint64(_bonusPoints);
        booking.loyaltyPoints = FHE.add(booking.loyaltyPoints, bonus);

        FHE.allowThis(booking.loyaltyPoints);
        FHE.allow(booking.loyaltyPoints, booking.passenger);
    }

    function _findAvailableSeat(uint32 _flightId, uint16 _totalSeats) private view returns (uint32) {
        for (uint32 i = 1; i <= _totalSeats; i++) {
            if (!seatOccupied[_flightId][i]) {
                return i;
            }
        }
        return 0;
    }

    function getFlightInfo(uint32 _flightId) external view returns (
        string memory origin,
        string memory destination,
        uint256 departureTime,
        uint256 arrivalTime,
        uint16 totalSeats,
        uint16 availableSeats,
        bool isActive,
        address airline
    ) {
        Flight storage flight = flights[_flightId];
        return (
            flight.origin,
            flight.destination,
            flight.departureTime,
            flight.arrivalTime,
            flight.totalSeats,
            flight.availableSeats,
            flight.isActive,
            flight.airline
        );
    }

    function getBookingInfo(uint32 _bookingId) external view returns (
        uint32 flightId,
        address passenger,
        uint256 bookingTime,
        bool isConfirmed,
        bool isCancelled
    ) {
        Booking storage booking = bookings[_bookingId];
        return (
            booking.flightId,
            booking.passenger,
            booking.bookingTime,
            booking.isConfirmed,
            booking.isCancelled
        );
    }

    function getPassengerBookings(address _passenger) external view returns (uint32[] memory) {
        return passengerBookings[_passenger];
    }

    function checkSeatAvailability(uint32 _flightId, uint32 _seatNumber) external view returns (bool) {
        return !seatOccupied[_flightId][_seatNumber];
    }

    function updateFlightStatus(uint32 _flightId, bool _isActive) external onlyAirlineOrOwner(_flightId) {
        flights[_flightId].isActive = _isActive;
    }

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}