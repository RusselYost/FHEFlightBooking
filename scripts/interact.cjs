/**
 * Smart Contract Interaction Script
 * Provides interactive tools to test and interact with deployed contracts
 * Usage: node scripts/interact.js [COMMAND] [ARGS]
 */

const hre = require("hardhat");
require("dotenv").config();

// Available commands
const COMMANDS = {
    status: "Check contract status and basic info",
    addFlight: "Add a new flight (admin only)",
    listFlights: "List all available flights",
    getBooking: "Get booking details by ID",
    getFlightBookings: "Get all bookings for a flight",
    stats: "Display contract statistics",
    owner: "Check contract owner",
    help: "Show this help message"
};

async function getContract() {
    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;

    if (!contractAddress) {
        throw new Error("VITE_CONTRACT_ADDRESS not set in .env file");
    }

    const contract = await hre.ethers.getContractAt(
        "ConfidentialFlightBooking",
        contractAddress
    );

    return contract;
}

async function checkStatus() {
    console.log("📊 Contract Status Check\n");

    const contract = await getContract();
    const [signer] = await hre.ethers.getSigners();

    console.log("🔗 Network:", hre.network.name);
    console.log("📍 Contract:", await contract.getAddress());
    console.log("👤 Your Address:", signer.address);

    try {
        const owner = await contract.owner();
        const nextFlightId = await contract.nextFlightId();
        const nextBookingId = await contract.nextBookingId();

        console.log("\n📋 Contract Information:");
        console.log("   Owner:", owner);
        console.log("   Next Flight ID:", nextFlightId.toString());
        console.log("   Next Booking ID:", nextBookingId.toString());
        console.log("   Total Flights:", (Number(nextFlightId) - 1).toString());
        console.log("   Total Bookings:", (Number(nextBookingId) - 1).toString());

        // Check if current signer is owner
        const isOwner = signer.address.toLowerCase() === owner.toLowerCase();
        console.log("\n🔐 Access Level:", isOwner ? "Admin (Owner)" : "User");

    } catch (error) {
        console.error("\n❌ Error fetching status:", error.message);
    }
}

async function addFlight() {
    console.log("✈️  Add New Flight\n");

    const contract = await getContract();
    const [signer] = await hre.ethers.getSigners();

    // Check if signer is owner
    const owner = await contract.owner();
    if (signer.address.toLowerCase() !== owner.toLowerCase()) {
        console.error("❌ Error: Only contract owner can add flights");
        console.log("Current owner:", owner);
        console.log("Your address:", signer.address);
        return;
    }

    // Example flight data
    const flightNumber = process.argv[3] || "FL" + Date.now().toString().slice(-6);
    const priceInWei = hre.ethers.parseEther(process.argv[4] || "0.1");
    const capacity = parseInt(process.argv[5] || "150");

    console.log("Flight Details:");
    console.log("   Flight Number:", flightNumber);
    console.log("   Price:", hre.ethers.formatEther(priceInWei), "ETH");
    console.log("   Capacity:", capacity);

    console.log("\n⏳ Submitting transaction...");

    try {
        const tx = await contract.addFlight(flightNumber, priceInWei, capacity);
        console.log("📤 Transaction sent:", tx.hash);

        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();

        console.log("✅ Flight added successfully!");
        console.log("   Block:", receipt.blockNumber);
        console.log("   Gas Used:", receipt.gasUsed.toString());

        // Get the flight ID from event
        const nextFlightId = await contract.nextFlightId();
        const flightId = Number(nextFlightId) - 1;
        console.log("   Flight ID:", flightId);

    } catch (error) {
        console.error("❌ Transaction failed:", error.message);
    }
}

async function listFlights() {
    console.log("📋 Available Flights\n");

    const contract = await getContract();
    const nextFlightId = await contract.nextFlightId();
    const totalFlights = Number(nextFlightId) - 1;

    if (totalFlights === 0) {
        console.log("No flights available yet.");
        return;
    }

    console.log(`Found ${totalFlights} flight(s):\n`);

    for (let i = 1; i <= totalFlights; i++) {
        try {
            const flight = await contract.flights(i);

            console.log(`Flight ID ${i}:`);
            console.log(`   Flight Number: ${flight.flightNumber}`);
            console.log(`   Price: ${hre.ethers.formatEther(flight.price)} ETH`);
            console.log(`   Capacity: ${flight.capacity}`);
            console.log(`   Available: ${flight.isAvailable ? "Yes" : "No"}`);
            console.log("");
        } catch (error) {
            console.log(`Flight ID ${i}: Error fetching data`);
        }
    }
}

async function getBooking() {
    const bookingId = parseInt(process.argv[3]);

    if (!bookingId || isNaN(bookingId)) {
        console.error("❌ Error: Please provide a valid booking ID");
        console.log("Usage: node scripts/interact.js getBooking <BOOKING_ID>");
        return;
    }

    console.log(`🎫 Booking Details (ID: ${bookingId})\n`);

    const contract = await getContract();

    try {
        const booking = await contract.bookings(bookingId);

        console.log("Booking Information:");
        console.log("   Passenger:", booking.passenger);
        console.log("   Flight ID:", booking.flightId.toString());
        console.log("   Status:", booking.isActive ? "Active" : "Cancelled");
        console.log("   Timestamp:", new Date(Number(booking.timestamp) * 1000).toLocaleString());

        // Try to get flight details
        try {
            const flight = await contract.flights(booking.flightId);
            console.log("\nFlight Information:");
            console.log("   Flight Number:", flight.flightNumber);
            console.log("   Price:", hre.ethers.formatEther(flight.price), "ETH");
        } catch (e) {
            console.log("\n⚠️  Could not fetch flight details");
        }

    } catch (error) {
        console.error("❌ Error fetching booking:", error.message);
    }
}

async function getFlightBookings() {
    const flightId = parseInt(process.argv[3]);

    if (!flightId || isNaN(flightId)) {
        console.error("❌ Error: Please provide a valid flight ID");
        console.log("Usage: node scripts/interact.js getFlightBookings <FLIGHT_ID>");
        return;
    }

    console.log(`📋 Bookings for Flight ID: ${flightId}\n`);

    const contract = await getContract();

    try {
        // Get flight info first
        const flight = await contract.flights(flightId);
        console.log("Flight Information:");
        console.log("   Flight Number:", flight.flightNumber);
        console.log("   Price:", hre.ethers.formatEther(flight.price), "ETH");
        console.log("   Capacity:", flight.capacity.toString());
        console.log("");

        // Get all bookings and filter by flight ID
        const nextBookingId = await contract.nextBookingId();
        let activeBookings = 0;

        console.log("Bookings:");
        for (let i = 1; i < nextBookingId; i++) {
            const booking = await contract.bookings(i);
            if (Number(booking.flightId) === flightId && booking.isActive) {
                activeBookings++;
                console.log(`   Booking ${i}: ${booking.passenger} (${new Date(Number(booking.timestamp) * 1000).toLocaleDateString()})`);
            }
        }

        console.log(`\nTotal Active Bookings: ${activeBookings}`);
        console.log(`Remaining Capacity: ${Number(flight.capacity) - activeBookings}`);

    } catch (error) {
        console.error("❌ Error fetching flight bookings:", error.message);
    }
}

async function displayStats() {
    console.log("📊 Contract Statistics\n");

    const contract = await getContract();

    try {
        const nextFlightId = await contract.nextFlightId();
        const nextBookingId = await contract.nextBookingId();
        const totalFlights = Number(nextFlightId) - 1;
        const totalBookings = Number(nextBookingId) - 1;

        console.log("Overall Statistics:");
        console.log("   Total Flights:", totalFlights);
        console.log("   Total Bookings:", totalBookings);

        // Count active bookings
        let activeBookings = 0;
        for (let i = 1; i < nextBookingId; i++) {
            const booking = await contract.bookings(i);
            if (booking.isActive) activeBookings++;
        }

        console.log("   Active Bookings:", activeBookings);
        console.log("   Cancelled Bookings:", totalBookings - activeBookings);

        // Calculate average bookings per flight
        if (totalFlights > 0) {
            console.log("   Avg Bookings/Flight:", (activeBookings / totalFlights).toFixed(2));
        }

    } catch (error) {
        console.error("❌ Error fetching statistics:", error.message);
    }
}

async function checkOwner() {
    console.log("👤 Contract Ownership\n");

    const contract = await getContract();
    const [signer] = await hre.ethers.getSigners();

    const owner = await contract.owner();

    console.log("Contract Owner:", owner);
    console.log("Your Address:", signer.address);
    console.log("You are owner:", signer.address.toLowerCase() === owner.toLowerCase() ? "Yes ✅" : "No ❌");
}

function showHelp() {
    console.log("🛠️  Contract Interaction Tool\n");
    console.log("Available Commands:");
    console.log("");

    Object.entries(COMMANDS).forEach(([cmd, desc]) => {
        console.log(`  ${cmd.padEnd(20)} - ${desc}`);
    });

    console.log("\nUsage Examples:");
    console.log("  node scripts/interact.js status");
    console.log("  node scripts/interact.js addFlight FL123 0.5 200");
    console.log("  node scripts/interact.js listFlights");
    console.log("  node scripts/interact.js getBooking 1");
    console.log("  node scripts/interact.js getFlightBookings 1");
    console.log("  node scripts/interact.js stats");
    console.log("");
}

async function main() {
    const command = process.argv[2] || "help";

    console.log("🔗 Confidential Flight Booking - Contract Interaction\n");

    try {
        switch (command.toLowerCase()) {
            case "status":
                await checkStatus();
                break;
            case "addflight":
                await addFlight();
                break;
            case "listflights":
                await listFlights();
                break;
            case "getbooking":
                await getBooking();
                break;
            case "getflightbookings":
                await getFlightBookings();
                break;
            case "stats":
                await displayStats();
                break;
            case "owner":
                await checkOwner();
                break;
            case "help":
                showHelp();
                break;
            default:
                console.log(`❌ Unknown command: ${command}\n`);
                showHelp();
        }
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

// Execute
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
