class ConfidentialFlightBooking {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAccount = null;

        this.contractAddress = "0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C"; // Update with your deployed contract address
        this.contractABI = [
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

        this.init();
    }

    async init() {
        await this.connectWallet();
        this.setupEventListeners();
        await this.loadFlights();
        await this.loadUserBookings();
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                this.provider = new ethers.BrowserProvider(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.signer = await this.provider.getSigner();
                this.userAccount = await this.signer.getAddress();

                if (this.contractAddress !== "0x") {
                    this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
                } else {
                    this.showError("Please deploy the contract first and update the contract address in the code.");
                }

                this.updateConnectionStatus(true);
                console.log("Connected to wallet:", this.userAccount);
            } else {
                this.showError("Please install MetaMask to use this application");
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.error("Error connecting to wallet:", error);
            this.showError("Failed to connect to wallet");
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        const textElement = document.getElementById('connectionText');

        if (connected) {
            statusElement.className = 'connection-status connected';
            textElement.textContent = `Connected: ${this.userAccount ? this.userAccount.slice(0, 6) + '...' + this.userAccount.slice(-4) : 'Connected'}`;
        } else {
            statusElement.className = 'connection-status disconnected';
            textElement.textContent = 'Disconnected';
        }
    }

    setupEventListeners() {
        // Add Flight Form
        document.getElementById('addFlightForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addFlight();
        });

        // Book Flight Form
        document.getElementById('bookFlightForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.bookFlight();
        });

        // Auto-refresh flights every 30 seconds
        setInterval(() => {
            this.loadFlights();
        }, 30000);
    }

    async addFlight() {
        try {
            if (!this.contract) {
                this.showError("Contract not connected. Please deploy contract first.");
                return;
            }

            const origin = document.getElementById('origin').value;
            const destination = document.getElementById('destination').value;
            const departureTime = new Date(document.getElementById('departureTime').value).getTime() / 1000;
            const arrivalTime = new Date(document.getElementById('arrivalTime').value).getTime() / 1000;
            const totalSeats = parseInt(document.getElementById('totalSeats').value);
            const basePrice = Math.floor(parseFloat(document.getElementById('basePrice').value) * 1000); // Convert ETH to price units

            if (departureTime <= Date.now() / 1000) {
                this.showError("Departure time must be in the future");
                return;
            }

            if (arrivalTime <= departureTime) {
                this.showError("Arrival time must be after departure time");
                return;
            }

            this.showMessage("Adding flight...", 'info');

            const tx = await this.contract.addFlight(
                origin,
                destination,
                departureTime,
                arrivalTime,
                totalSeats,
                basePrice
            );

            await tx.wait();
            this.showSuccess("Flight added successfully!");
            document.getElementById('addFlightForm').reset();
            await this.loadFlights();

        } catch (error) {
            console.error("Error adding flight:", error);
            this.showError("Failed to add flight: " + error.message);
        }
    }

    async bookFlight() {
        try {
            if (!this.contract) {
                this.showError("Contract not connected. Please deploy contract first.");
                return;
            }

            const flightId = parseInt(document.getElementById('flightId').value);
            const passportNumber = parseInt(document.getElementById('passportNumber').value);
            const passengerName = document.getElementById('passengerName').value;
            const passengerAge = parseInt(document.getElementById('passengerAge').value);
            const preferredSeat = parseInt(document.getElementById('preferredSeat').value) || 0;
            const specialNeeds = document.getElementById('specialNeeds').checked;
            const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);

            this.showMessage("Processing booking...", 'info');

            const tx = await this.contract.bookFlight(
                flightId,
                passportNumber,
                passengerName, // In production, this would be encrypted client-side
                passengerAge,
                preferredSeat,
                specialNeeds,
                {
                    value: ethers.parseEther(paymentAmount.toString())
                }
            );

            await tx.wait();
            this.showSuccess("Flight booked successfully! Booking confirmation pending.");
            document.getElementById('bookFlightForm').reset();
            await this.loadFlights();
            await this.loadUserBookings();

        } catch (error) {
            console.error("Error booking flight:", error);
            this.showError("Failed to book flight: " + error.message);
        }
    }

    async loadFlights() {
        try {
            if (!this.contract) {
                document.getElementById('flightsGrid').innerHTML = '<p>Contract not connected. Please deploy contract first.</p>';
                return;
            }

            const nextFlightId = await this.contract.nextFlightId();
            const flightsGrid = document.getElementById('flightsGrid');

            if (Number(nextFlightId) === 1) {
                flightsGrid.innerHTML = '<p>No flights available. Add some flights first!</p>';
                return;
            }

            let flightsHTML = '';

            for (let i = 1; i < Number(nextFlightId); i++) {
                try {
                    const flightInfo = await this.contract.getFlightInfo(i);
                    const [origin, destination, departureTime, arrivalTime, totalSeats, availableSeats, isActive, airline] = flightInfo;

                    if (!isActive) continue;

                    const departureDate = new Date(departureTime * 1000);
                    const arrivalDate = new Date(arrivalTime * 1000);

                    flightsHTML += `
                        <div class="flight-card">
                            <div class="flight-header">
                                <div class="route">${origin} → ${destination}</div>
                                <div class="status ${availableSeats > 0 ? 'available' : 'booked'}">
                                    ${availableSeats}/${totalSeats} available
                                </div>
                            </div>
                            <div class="flight-details">
                                <div class="detail-item">
                                    <span class="detail-label">Flight ID</span>
                                    <span class="detail-value">#${i}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Airline</span>
                                    <span class="detail-value">${airline.slice(0, 8)}...</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Departure</span>
                                    <span class="detail-value">${departureDate.toLocaleString()}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Arrival</span>
                                    <span class="detail-value">${arrivalDate.toLocaleString()}</span>
                                </div>
                            </div>
                            ${availableSeats > 0 ?
                                `<button class="btn" onclick="flightBooking.fillBookingForm(${i})">Book This Flight</button>` :
                                `<button class="btn" disabled>Fully Booked</button>`
                            }
                        </div>
                    `;
                } catch (error) {
                    console.error(`Error loading flight ${i}:`, error);
                }
            }

            flightsGrid.innerHTML = flightsHTML || '<p>No active flights available.</p>';

        } catch (error) {
            console.error("Error loading flights:", error);
            document.getElementById('flightsGrid').innerHTML = '<p>Error loading flights.</p>';
        }
    }

    async loadUserBookings() {
        try {
            if (!this.contract || !this.userAccount) {
                document.getElementById('bookingsGrid').innerHTML = '<p>Connect wallet to view your bookings</p>';
                return;
            }

            const bookingIds = await this.contract.getPassengerBookings(this.userAccount);
            const bookingsGrid = document.getElementById('bookingsGrid');

            if (bookingIds.length === 0) {
                bookingsGrid.innerHTML = '<p>You have no bookings yet.</p>';
                return;
            }

            let bookingsHTML = '';

            for (let bookingId of bookingIds) {
                try {
                    const bookingInfo = await this.contract.getBookingInfo(bookingId);
                    const [flightId, passenger, bookingTime, isConfirmed, isCancelled] = bookingInfo;

                    const flightInfo = await this.contract.getFlightInfo(flightId);
                    const [origin, destination] = flightInfo;

                    const bookingDate = new Date(bookingTime * 1000);

                    let statusClass = 'status ';
                    let statusText = '';

                    if (isCancelled) {
                        statusClass += 'booked';
                        statusText = 'Cancelled';
                    } else if (isConfirmed) {
                        statusClass += 'available';
                        statusText = 'Confirmed';
                    } else {
                        statusClass += 'booked';
                        statusText = 'Pending';
                    }

                    bookingsHTML += `
                        <div class="booking-card">
                            <div class="booking-header">
                                <div class="booking-id">Booking #${bookingId}</div>
                                <div class="${statusClass}">${statusText}</div>
                            </div>
                            <div class="flight-details">
                                <div class="detail-item">
                                    <span class="detail-label">Route</span>
                                    <span class="detail-value">${origin} → ${destination}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Flight ID</span>
                                    <span class="detail-value">#${flightId}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Booked On</span>
                                    <span class="detail-value">${bookingDate.toLocaleString()}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Status</span>
                                    <span class="detail-value">${statusText}</span>
                                </div>
                            </div>
                            ${!isCancelled && !isConfirmed ?
                                `<button class="btn" onclick="flightBooking.cancelBooking(${bookingId})">Cancel Booking</button>` :
                                ''
                            }
                        </div>
                    `;
                } catch (error) {
                    console.error(`Error loading booking ${bookingId}:`, error);
                }
            }

            bookingsGrid.innerHTML = bookingsHTML;

        } catch (error) {
            console.error("Error loading user bookings:", error);
            document.getElementById('bookingsGrid').innerHTML = '<p>Error loading bookings.</p>';
        }
    }

    fillBookingForm(flightId) {
        document.getElementById('flightId').value = flightId;
        document.getElementById('bookFlightForm').scrollIntoView({ behavior: 'smooth' });
    }

    async cancelBooking(bookingId) {
        try {
            if (!this.contract) {
                this.showError("Contract not connected");
                return;
            }

            if (confirm("Are you sure you want to cancel this booking?")) {
                this.showMessage("Cancelling booking...", 'info');

                const tx = await this.contract.cancelBooking(bookingId);
                await tx.wait();

                this.showSuccess("Booking cancelled successfully!");
                await this.loadUserBookings();
                await this.loadFlights();
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
            this.showError("Failed to cancel booking: " + error.message);
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message, .info-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;

        if (type === 'error') {
            messageDiv.className = 'error-message';
        } else if (type === 'success') {
            messageDiv.className = 'success-message';
        } else {
            messageDiv.className = 'success-message'; // Use success style for info
        }

        // Insert at the top of the container
        const container = document.querySelector('.container');
        const header = container.querySelector('.header');
        container.insertBefore(messageDiv, header.nextSibling);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the application
const flightBooking = new ConfidentialFlightBooking();

// Handle wallet account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            flightBooking.updateConnectionStatus(false);
        } else {
            await flightBooking.connectWallet();
            await flightBooking.loadUserBookings();
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });
}