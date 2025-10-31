// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialFlightBooking is SepoliaConfig {

    address public owner;
    uint32 public nextFlightId;
    uint32 public nextBookingId;

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
    }

    struct PassengerData {
        euint32 passportNumber;
        string encryptedName;
        euint16 age;
        bool hasSpecialNeeds;
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

    constructor() {
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

    function bookFlight(
        uint32 _flightId,
        uint32 _passportNumber,
        string memory _encryptedName,
        uint16 _age,
        uint32 _preferredSeat,
        bool _hasSpecialNeeds
    ) external payable validFlight(_flightId) {
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

        euint32 encryptedPassport = FHE.asEuint32(_passportNumber);
        euint16 encryptedAge = FHE.asEuint16(_age);
        euint32 encryptedSeat = FHE.asEuint32(assignedSeat);
        euint16 paidAmount = FHE.asEuint16(uint16(msg.value));

        bookings[nextBookingId] = Booking({
            bookingId: nextBookingId,
            flightId: _flightId,
            passenger: msg.sender,
            paidAmount: paidAmount,
            seatNumber: encryptedSeat,
            bookingTime: block.timestamp,
            isConfirmed: false,
            isCancelled: false
        });

        passengerDetails[nextBookingId] = PassengerData({
            passportNumber: encryptedPassport,
            encryptedName: _encryptedName,
            age: encryptedAge,
            hasSpecialNeeds: _hasSpecialNeeds
        });

        passengerBookings[msg.sender].push(nextBookingId);
        seatOccupied[_flightId][assignedSeat] = true;
        flight.availableSeats--;

        FHE.allowThis(encryptedPassport);
        FHE.allowThis(encryptedAge);
        FHE.allowThis(encryptedSeat);
        FHE.allowThis(paidAmount);

        FHE.allow(encryptedPassport, msg.sender);
        FHE.allow(encryptedAge, msg.sender);
        FHE.allow(encryptedSeat, msg.sender);
        FHE.allow(paidAmount, msg.sender);

        emit BookingCreated(nextBookingId, _flightId, msg.sender);
        nextBookingId++;
    }

    function confirmBooking(uint32 _bookingId) external onlyAirlineOrOwner(bookings[_bookingId].flightId) {
        require(!bookings[_bookingId].isConfirmed, "Already confirmed");
        require(!bookings[_bookingId].isCancelled, "Booking cancelled");

        bookings[_bookingId].isConfirmed = true;

        emit BookingConfirmed(_bookingId);
        emit PaymentProcessed(_bookingId, bookings[_bookingId].passenger);
    }

    function cancelBooking(uint32 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        require(
            msg.sender == booking.passenger ||
            msg.sender == flights[booking.flightId].airline ||
            msg.sender == owner,
            "Not authorized"
        );
        require(!booking.isCancelled, "Already cancelled");

        booking.isCancelled = true;
        flights[booking.flightId].availableSeats++;

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(booking.seatNumber);
        FHE.requestDecryption(cts, this.processCancellation.selector);

        emit BookingCancelled(_bookingId);
    }

    function processCancellation(
        uint256 requestId,
        uint32 seatNumber,
        bytes[] memory signatures
    ) external {
        bytes memory decryptedValues = abi.encode(seatNumber);
        bytes memory packedSignatures = "";
        for (uint256 i = 0; i < signatures.length; i++) {
            packedSignatures = abi.encodePacked(packedSignatures, signatures[i]);
        }
        FHE.checkSignatures(requestId, decryptedValues, packedSignatures);
        // Process refund and free up seat
        // TODO: Implement refund logic and seat freeing
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