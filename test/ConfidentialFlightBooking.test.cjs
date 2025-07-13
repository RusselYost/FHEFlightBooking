const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConfidentialFlightBooking", function () {
    let flightBooking;
    let pauserSet;
    let owner;
    let airline;
    let passenger1;
    let passenger2;
    let pauser;

    const TEST_FLIGHT = {
        origin: "New York",
        destination: "London",
        departureTime: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        arrivalTime: Math.floor(Date.now() / 1000) + 86400 + 28800, // 8 hours flight
        totalSeats: 100,
        basePrice: 500
    };

    const TEST_PASSENGER = {
        passportNumber: 123456789,
        encryptedName: "encrypted_john_doe",
        age: 30,
        preferredSeat: 15,
        hasSpecialNeeds: false,
        frequentFlyerNumber: 987654321,
        isVIP: true,
        hasInsurance: true
    };

    beforeEach(async function () {
        [owner, airline, passenger1, passenger2, pauser] = await ethers.getSigners();

        // Deploy PauserSet first
        const PauserSet = await ethers.getContractFactory("PauserSet");
        pauserSet = await PauserSet.deploy([pauser.address]);
        await pauserSet.waitForDeployment();

        // Deploy main contract with PauserSet
        const FlightBooking = await ethers.getContractFactory("ConfidentialFlightBooking");
        flightBooking = await FlightBooking.deploy(await pauserSet.getAddress());
        await flightBooking.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await flightBooking.owner()).to.equal(owner.address);
        });

        it("Should initialize flight and booking IDs to 1", async function () {
            expect(await flightBooking.nextFlightId()).to.equal(1);
            expect(await flightBooking.nextBookingId()).to.equal(1);
        });

        it("Should have correct PauserSet configured", async function () {
            const pauserSetAddress = await flightBooking.pauserSet();
            expect(pauserSetAddress).to.equal(await pauserSet.getAddress());
        });

        it("Should not be paused initially", async function () {
            expect(await flightBooking.paused()).to.equal(false);
        });

        it("Should revert with invalid PauserSet address", async function () {
            const FlightBooking = await ethers.getContractFactory("ConfidentialFlightBooking");
            await expect(
                FlightBooking.deploy(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid PauserSet address");
        });
    });

    describe("PauserSet Integration", function () {
        it("Should allow authorized pauser to pause contract", async function () {
            await flightBooking.connect(pauser).pause();
            expect(await flightBooking.paused()).to.equal(true);
        });

        it("Should allow authorized pauser to unpause contract", async function () {
            await flightBooking.connect(pauser).pause();
            await flightBooking.connect(pauser).unpause();
            expect(await flightBooking.paused()).to.equal(false);
        });

        it("Should revert when non-pauser tries to pause", async function () {
            await expect(
                flightBooking.connect(passenger1).pause()
            ).to.be.revertedWith("Pausable: Caller is not authorized pauser");
        });

        it("Should emit Paused event", async function () {
            await expect(flightBooking.connect(pauser).pause())
                .to.emit(flightBooking, "Paused")
                .withArgs(pauser.address);
        });

        it("Should emit Unpaused event", async function () {
            await flightBooking.connect(pauser).pause();
            await expect(flightBooking.connect(pauser).unpause())
                .to.emit(flightBooking, "Unpaused")
                .withArgs(pauser.address);
        });
    });

    describe("Flight Management", function () {
        it("Should add a new flight", async function () {
            const tx = await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            await expect(tx)
                .to.emit(flightBooking, "FlightAdded")
                .withArgs(1, TEST_FLIGHT.origin, TEST_FLIGHT.destination, airline.address);

            const flightInfo = await flightBooking.getFlightInfo(1);
            expect(flightInfo.origin).to.equal(TEST_FLIGHT.origin);
            expect(flightInfo.destination).to.equal(TEST_FLIGHT.destination);
            expect(flightInfo.totalSeats).to.equal(TEST_FLIGHT.totalSeats);
            expect(flightInfo.availableSeats).to.equal(TEST_FLIGHT.totalSeats);
            expect(flightInfo.airline).to.equal(airline.address);
        });

        it("Should fail with past departure time", async function () {
            const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
            await expect(
                flightBooking.connect(airline).addFlight(
                    TEST_FLIGHT.origin,
                    TEST_FLIGHT.destination,
                    pastTime,
                    pastTime + 28800,
                    TEST_FLIGHT.totalSeats,
                    TEST_FLIGHT.basePrice
                )
            ).to.be.revertedWith("Departure time must be in future");
        });

        it("Should fail with invalid arrival time", async function () {
            await expect(
                flightBooking.connect(airline).addFlight(
                    TEST_FLIGHT.origin,
                    TEST_FLIGHT.destination,
                    TEST_FLIGHT.departureTime,
                    TEST_FLIGHT.departureTime - 3600, // Earlier than departure
                    TEST_FLIGHT.totalSeats,
                    TEST_FLIGHT.basePrice
                )
            ).to.be.revertedWith("Invalid arrival time");
        });

        it("Should fail with zero seats", async function () {
            await expect(
                flightBooking.connect(airline).addFlight(
                    TEST_FLIGHT.origin,
                    TEST_FLIGHT.destination,
                    TEST_FLIGHT.departureTime,
                    TEST_FLIGHT.arrivalTime,
                    0, // Invalid
                    TEST_FLIGHT.basePrice
                )
            ).to.be.revertedWith("Invalid seat count");
        });

        it("Should update flight status", async function () {
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            await flightBooking.connect(airline).updateFlightStatus(1, false);
            const flightInfo = await flightBooking.getFlightInfo(1);
            expect(flightInfo.isActive).to.equal(false);
        });

        it("Should only allow airline or owner to update flight status", async function () {
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            await expect(
                flightBooking.connect(passenger1).updateFlightStatus(1, false)
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("Booking Management", function () {
        beforeEach(async function () {
            // Add a test flight
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );
        });

        it("Should create a booking with encrypted data", async function () {
            const tx = await flightBooking.connect(passenger1).bookFlight(
                1, // flightId
                TEST_PASSENGER.passportNumber,
                TEST_PASSENGER.encryptedName,
                TEST_PASSENGER.age,
                TEST_PASSENGER.preferredSeat,
                TEST_PASSENGER.hasSpecialNeeds,
                TEST_PASSENGER.frequentFlyerNumber,
                TEST_PASSENGER.isVIP,
                TEST_PASSENGER.hasInsurance,
                { value: TEST_FLIGHT.basePrice }
            );

            await expect(tx)
                .to.emit(flightBooking, "BookingCreated")
                .withArgs(1, 1, passenger1.address);

            await expect(tx)
                .to.emit(flightBooking, "LoyaltyPointsAwarded")
                .withArgs(1, passenger1.address);

            const bookingInfo = await flightBooking.getBookingInfo(1);
            expect(bookingInfo.flightId).to.equal(1);
            expect(bookingInfo.passenger).to.equal(passenger1.address);
            expect(bookingInfo.isConfirmed).to.equal(false);
            expect(bookingInfo.isCancelled).to.equal(false);
        });

        it("Should fail when contract is paused", async function () {
            await flightBooking.connect(pauser).pause();

            await expect(
                flightBooking.connect(passenger1).bookFlight(
                    1,
                    TEST_PASSENGER.passportNumber,
                    TEST_PASSENGER.encryptedName,
                    TEST_PASSENGER.age,
                    TEST_PASSENGER.preferredSeat,
                    TEST_PASSENGER.hasSpecialNeeds,
                    TEST_PASSENGER.frequentFlyerNumber,
                    TEST_PASSENGER.isVIP,
                    TEST_PASSENGER.hasInsurance,
                    { value: TEST_FLIGHT.basePrice }
                )
            ).to.be.revertedWith("Pausable: Contract is paused");
        });

        it("Should decrement available seats", async function () {
            await flightBooking.connect(passenger1).bookFlight(
                1,
                TEST_PASSENGER.passportNumber,
                TEST_PASSENGER.encryptedName,
                TEST_PASSENGER.age,
                TEST_PASSENGER.preferredSeat,
                TEST_PASSENGER.hasSpecialNeeds,
                TEST_PASSENGER.frequentFlyerNumber,
                TEST_PASSENGER.isVIP,
                TEST_PASSENGER.hasInsurance,
                { value: TEST_FLIGHT.basePrice }
            );

            const flightInfo = await flightBooking.getFlightInfo(1);
            expect(flightInfo.availableSeats).to.equal(TEST_FLIGHT.totalSeats - 1);
        });

        it("Should track passenger bookings", async function () {
            await flightBooking.connect(passenger1).bookFlight(
                1,
                TEST_PASSENGER.passportNumber,
                TEST_PASSENGER.encryptedName,
                TEST_PASSENGER.age,
                TEST_PASSENGER.preferredSeat,
                TEST_PASSENGER.hasSpecialNeeds,
                TEST_PASSENGER.frequentFlyerNumber,
                TEST_PASSENGER.isVIP,
                TEST_PASSENGER.hasInsurance,
                { value: TEST_FLIGHT.basePrice }
            );

            const bookings = await flightBooking.getPassengerBookings(passenger1.address);
            expect(bookings.length).to.equal(1);
            expect(bookings[0]).to.equal(1);
        });

        it("Should fail booking inactive flight", async function () {
            await flightBooking.connect(airline).updateFlightStatus(1, false);

            await expect(
                flightBooking.connect(passenger1).bookFlight(
                    1,
                    TEST_PASSENGER.passportNumber,
                    TEST_PASSENGER.encryptedName,
                    TEST_PASSENGER.age,
                    TEST_PASSENGER.preferredSeat,
                    TEST_PASSENGER.hasSpecialNeeds,
                    TEST_PASSENGER.frequentFlyerNumber,
                    TEST_PASSENGER.isVIP,
                    TEST_PASSENGER.hasInsurance,
                    { value: TEST_FLIGHT.basePrice }
                )
            ).to.be.revertedWith("Flight not active");
        });
    });

    describe("Booking Confirmation", function () {
        beforeEach(async function () {
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            await flightBooking.connect(passenger1).bookFlight(
                1,
                TEST_PASSENGER.passportNumber,
                TEST_PASSENGER.encryptedName,
                TEST_PASSENGER.age,
                TEST_PASSENGER.preferredSeat,
                TEST_PASSENGER.hasSpecialNeeds,
                TEST_PASSENGER.frequentFlyerNumber,
                TEST_PASSENGER.isVIP,
                TEST_PASSENGER.hasInsurance,
                { value: TEST_FLIGHT.basePrice }
            );
        });

        it("Should allow airline to confirm booking", async function () {
            const tx = await flightBooking.connect(airline).confirmBooking(1);

            await expect(tx)
                .to.emit(flightBooking, "BookingConfirmed")
                .withArgs(1);

            await expect(tx)
                .to.emit(flightBooking, "PaymentProcessed")
                .withArgs(1, passenger1.address);

            const bookingInfo = await flightBooking.getBookingInfo(1);
            expect(bookingInfo.isConfirmed).to.equal(true);
        });

        it("Should allow owner to confirm booking", async function () {
            await expect(flightBooking.connect(owner).confirmBooking(1))
                .to.emit(flightBooking, "BookingConfirmed")
                .withArgs(1);
        });

        it("Should not allow non-authorized to confirm", async function () {
            await expect(
                flightBooking.connect(passenger2).confirmBooking(1)
            ).to.be.revertedWith("Not authorized");
        });

        it("Should fail to confirm already confirmed booking", async function () {
            await flightBooking.connect(airline).confirmBooking(1);

            await expect(
                flightBooking.connect(airline).confirmBooking(1)
            ).to.be.revertedWith("Already confirmed");
        });
    });

    describe("Booking Cancellation", function () {
        beforeEach(async function () {
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            await flightBooking.connect(passenger1).bookFlight(
                1,
                TEST_PASSENGER.passportNumber,
                TEST_PASSENGER.encryptedName,
                TEST_PASSENGER.age,
                TEST_PASSENGER.preferredSeat,
                TEST_PASSENGER.hasSpecialNeeds,
                TEST_PASSENGER.frequentFlyerNumber,
                TEST_PASSENGER.isVIP,
                TEST_PASSENGER.hasInsurance,
                { value: TEST_FLIGHT.basePrice }
            );
        });

        it("Should allow passenger to cancel booking", async function () {
            const tx = await flightBooking.connect(passenger1).cancelBooking(1);

            await expect(tx)
                .to.emit(flightBooking, "BookingCancelled")
                .withArgs(1);

            await expect(tx)
                .to.emit(flightBooking, "RefundInitiated");

            const bookingInfo = await flightBooking.getBookingInfo(1);
            expect(bookingInfo.isCancelled).to.equal(true);
        });

        it("Should increment available seats on cancellation", async function () {
            await flightBooking.connect(passenger1).cancelBooking(1);

            const flightInfo = await flightBooking.getFlightInfo(1);
            expect(flightInfo.availableSeats).to.equal(TEST_FLIGHT.totalSeats);
        });

        it("Should fail when contract is paused", async function () {
            await flightBooking.connect(pauser).pause();

            await expect(
                flightBooking.connect(passenger1).cancelBooking(1)
            ).to.be.revertedWith("Pausable: Contract is paused");
        });

        it("Should not allow unauthorized cancellation", async function () {
            await expect(
                flightBooking.connect(passenger2).cancelBooking(1)
            ).to.be.revertedWith("Not authorized");
        });

        it("Should fail to cancel already cancelled booking", async function () {
            await flightBooking.connect(passenger1).cancelBooking(1);

            await expect(
                flightBooking.connect(passenger1).cancelBooking(1)
            ).to.be.revertedWith("Already cancelled");
        });

        it("Should fail to cancel confirmed booking", async function () {
            await flightBooking.connect(airline).confirmBooking(1);

            await expect(
                flightBooking.connect(passenger1).cancelBooking(1)
            ).to.be.revertedWith("Cannot cancel confirmed booking");
        });
    });

    describe("Access Control", function () {
        it("Should only allow owner to withdraw funds", async function () {
            await expect(
                flightBooking.connect(passenger1).withdrawFunds()
            ).to.be.revertedWith("Not authorized");
        });

        it("Should only allow owner to check balance", async function () {
            await expect(
                flightBooking.connect(passenger1).getContractBalance()
            ).to.be.revertedWith("Not authorized");
        });

        it("Should allow owner to award bonus points", async function () {
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            await flightBooking.connect(passenger1).bookFlight(
                1,
                TEST_PASSENGER.passportNumber,
                TEST_PASSENGER.encryptedName,
                TEST_PASSENGER.age,
                TEST_PASSENGER.preferredSeat,
                TEST_PASSENGER.hasSpecialNeeds,
                TEST_PASSENGER.frequentFlyerNumber,
                TEST_PASSENGER.isVIP,
                TEST_PASSENGER.hasInsurance,
                { value: TEST_FLIGHT.basePrice }
            );

            await expect(
                flightBooking.connect(owner).awardBonusPoints(1, 500)
            ).to.not.be.reverted;
        });

        it("Should not allow non-owner to award bonus points", async function () {
            await expect(
                flightBooking.connect(passenger1).awardBonusPoints(1, 500)
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple bookings", async function () {
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            for (let i = 0; i < 5; i++) {
                await flightBooking.connect(passenger1).bookFlight(
                    1,
                    TEST_PASSENGER.passportNumber + i,
                    TEST_PASSENGER.encryptedName,
                    TEST_PASSENGER.age,
                    0, // Auto-assign seat
                    TEST_PASSENGER.hasSpecialNeeds,
                    TEST_PASSENGER.frequentFlyerNumber,
                    TEST_PASSENGER.isVIP,
                    TEST_PASSENGER.hasInsurance,
                    { value: TEST_FLIGHT.basePrice }
                );
            }

            const bookings = await flightBooking.getPassengerBookings(passenger1.address);
            expect(bookings.length).to.equal(5);
        });

        it("Should check seat availability", async function () {
            await flightBooking.connect(airline).addFlight(
                TEST_FLIGHT.origin,
                TEST_FLIGHT.destination,
                TEST_FLIGHT.departureTime,
                TEST_FLIGHT.arrivalTime,
                TEST_FLIGHT.totalSeats,
                TEST_FLIGHT.basePrice
            );

            const available = await flightBooking.checkSeatAvailability(1, 50);
            expect(available).to.equal(true);

            await flightBooking.connect(passenger1).bookFlight(
                1,
                TEST_PASSENGER.passportNumber,
                TEST_PASSENGER.encryptedName,
                TEST_PASSENGER.age,
                50,
                TEST_PASSENGER.hasSpecialNeeds,
                TEST_PASSENGER.frequentFlyerNumber,
                TEST_PASSENGER.isVIP,
                TEST_PASSENGER.hasInsurance,
                { value: TEST_FLIGHT.basePrice }
            );

            const notAvailable = await flightBooking.checkSeatAvailability(1, 50);
            expect(notAvailable).to.equal(false);
        });
    });
});
