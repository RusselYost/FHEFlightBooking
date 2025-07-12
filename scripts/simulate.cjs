/**
 * Contract Simulation Script
 * Simulates real-world usage scenarios for testing
 * Usage: node scripts/simulate.js [SCENARIO]
 */

const hre = require("hardhat");
require("dotenv").config();

const SCENARIOS = {
    basic: "Basic flight booking simulation",
    stress: "Stress test with multiple bookings",
    cancellation: "Booking and cancellation flow",
    full: "Full scenario with multiple flights and users",
    help: "Show available scenarios"
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

// Helper function to wait
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Basic scenario: Add flight and make booking
async function basicScenario() {
    console.log("🎯 Scenario: Basic Flight Booking\n");

    const contract = await getContract();
    const [owner, user1] = await hre.ethers.getSigners();

    console.log("👤 Owner:", owner.address);
    console.log("👤 User 1:", user1.address);

    try {
        // Step 1: Add a flight
        console.log("\n📝 Step 1: Adding flight...");
        const flightNumber = "SIM" + Date.now().toString().slice(-6);
        const price = hre.ethers.parseEther("0.05");
        const capacity = 150;

        const tx1 = await contract.addFlight(flightNumber, price, capacity);
        await tx1.wait();
        console.log("✅ Flight added:", flightNumber);

        const nextFlightId = await contract.nextFlightId();
        const flightId = Number(nextFlightId) - 1;
        console.log("   Flight ID:", flightId);

        // Step 2: Check flight availability
        console.log("\n📝 Step 2: Checking flight availability...");
        const flight = await contract.flights(flightId);
        console.log("✅ Flight details:");
        console.log("   Number:", flight.flightNumber);
        console.log("   Price:", hre.ethers.formatEther(flight.price), "ETH");
        console.log("   Capacity:", flight.capacity.toString());
        console.log("   Available:", flight.isAvailable);

        // Step 3: Make a booking (would require FHE encryption in real scenario)
        console.log("\n📝 Step 3: Making booking...");
        console.log("⚠️  Note: This is a simulation. Real booking requires FHE encryption.");
        console.log("   In production, use the frontend with fhevmjs for encrypted bookings.");

        // Get initial stats
        const nextBookingId = await contract.nextBookingId();
        console.log("   Current booking ID:", nextBookingId.toString());

        console.log("\n✅ Basic scenario completed!");
        console.log("   To make encrypted bookings, use the web interface.");

    } catch (error) {
        console.error("❌ Scenario failed:", error.message);
    }
}

// Stress test scenario
async function stressScenario() {
    console.log("🎯 Scenario: Stress Test with Multiple Flights\n");

    const contract = await getContract();
    const [owner] = await hre.ethers.getSigners();

    console.log("👤 Owner:", owner.address);

    const numFlights = parseInt(process.argv[3] || "5");
    console.log(`📊 Adding ${numFlights} flights...\n`);

    try {
        for (let i = 0; i < numFlights; i++) {
            const flightNumber = `STRESS${i.toString().padStart(3, '0')}`;
            const price = hre.ethers.parseEther((Math.random() * 0.5 + 0.1).toFixed(3));
            const capacity = Math.floor(Math.random() * 100) + 100;

            console.log(`Flight ${i + 1}/${numFlights}:`);
            console.log(`   Number: ${flightNumber}`);
            console.log(`   Price: ${hre.ethers.formatEther(price)} ETH`);
            console.log(`   Capacity: ${capacity}`);

            const tx = await contract.addFlight(flightNumber, price, capacity);
            await tx.wait();
            console.log(`   ✅ Added (tx: ${tx.hash.slice(0, 10)}...)\n`);

            // Small delay between transactions
            await sleep(1000);
        }

        console.log("✅ Stress test completed!");

        // Display statistics
        const nextFlightId = await contract.nextFlightId();
        console.log("\n📊 Final Statistics:");
        console.log("   Total Flights:", Number(nextFlightId) - 1);

    } catch (error) {
        console.error("❌ Stress test failed:", error.message);
    }
}

// Cancellation scenario
async function cancellationScenario() {
    console.log("🎯 Scenario: Booking Cancellation Flow\n");

    const contract = await getContract();
    const [owner] = await hre.ethers.getSigners();

    console.log("This scenario demonstrates the cancellation workflow:");
    console.log("1. Flight admin adds a flight");
    console.log("2. User books a ticket (via web interface with FHE)");
    console.log("3. User or admin cancels the booking");
    console.log("4. Refund is processed (if applicable)\n");

    try {
        // Add a flight for cancellation testing
        console.log("📝 Step 1: Adding cancellable flight...");
        const flightNumber = "CANCEL" + Date.now().toString().slice(-4);
        const price = hre.ethers.parseEther("0.1");
        const capacity = 100;

        const tx = await contract.addFlight(flightNumber, price, capacity);
        await tx.wait();
        console.log("✅ Flight added:", flightNumber);

        const nextFlightId = await contract.nextFlightId();
        const flightId = Number(nextFlightId) - 1;

        console.log("\n📝 Step 2: User booking simulation");
        console.log("   Flight ID:", flightId);
        console.log("   ⚠️  Actual booking requires FHE encryption via web interface");

        console.log("\n📝 Step 3: Cancellation process");
        console.log("   To cancel a booking:");
        console.log("   - User: Call cancelBooking(bookingId) via web interface");
        console.log("   - Admin: Can cancel flights with cancelFlight(flightId)");

        // Check if admin can cancel flight
        const contractOwner = await contract.owner();
        const isOwner = owner.address.toLowerCase() === contractOwner.toLowerCase();

        if (isOwner) {
            console.log("\n📝 Step 4: Admin cancelling flight (demonstration)...");
            // Note: Actual cancellation would affect existing bookings
            console.log("   ⚠️  In production, ensure all bookings are handled before cancelling");
        }

        console.log("\n✅ Cancellation scenario overview completed!");
        console.log("   Use the web interface for complete booking/cancellation workflow");

    } catch (error) {
        console.error("❌ Scenario failed:", error.message);
    }
}

// Full scenario with multiple operations
async function fullScenario() {
    console.log("🎯 Scenario: Full System Simulation\n");

    const contract = await getContract();
    const [owner, user1, user2, user3] = await hre.ethers.getSigners();

    console.log("👥 Participants:");
    console.log("   Owner:", owner.address);
    console.log("   User 1:", user1.address);
    console.log("   User 2:", user2.address);
    console.log("   User 3:", user3.address);

    try {
        // Phase 1: Setup flights
        console.log("\n" + "=".repeat(60));
        console.log("📋 PHASE 1: Setting up flights");
        console.log("=".repeat(60));

        const flights = [
            { number: "NYC-LAX", price: "0.15", capacity: 180 },
            { number: "LON-PAR", price: "0.08", capacity: 150 },
            { number: "TOK-SYD", price: "0.25", capacity: 200 }
        ];

        for (const flightData of flights) {
            console.log(`\n✈️  Adding flight ${flightData.number}...`);
            const tx = await contract.addFlight(
                flightData.number,
                hre.ethers.parseEther(flightData.price),
                flightData.capacity
            );
            await tx.wait();
            console.log(`   ✅ Added (${flightData.price} ETH, capacity: ${flightData.capacity})`);
            await sleep(500);
        }

        // Phase 2: Display available flights
        console.log("\n" + "=".repeat(60));
        console.log("📋 PHASE 2: Available flights");
        console.log("=".repeat(60));

        const nextFlightId = await contract.nextFlightId();
        const totalFlights = Number(nextFlightId) - 1;

        console.log(`\n${totalFlights} flight(s) available:\n`);
        for (let i = 1; i <= totalFlights; i++) {
            const flight = await contract.flights(i);
            console.log(`Flight ${i}:`);
            console.log(`   Number: ${flight.flightNumber}`);
            console.log(`   Price: ${hre.ethers.formatEther(flight.price)} ETH`);
            console.log(`   Capacity: ${flight.capacity}`);
            console.log(`   Available: ${flight.isAvailable ? "Yes" : "No"}`);
            console.log("");
        }

        // Phase 3: Booking simulation
        console.log("=".repeat(60));
        console.log("📋 PHASE 3: Booking simulation");
        console.log("=".repeat(60));

        console.log("\n⚠️  Note: Actual bookings require FHE encryption");
        console.log("Users would book via web interface with encrypted passenger details\n");

        console.log("Simulated booking flow:");
        console.log("1. User selects flight");
        console.log("2. User enters encrypted passenger details");
        console.log("3. User submits booking with payment");
        console.log("4. Contract processes encrypted booking");
        console.log("5. Booking confirmation issued");

        // Phase 4: Statistics
        console.log("\n" + "=".repeat(60));
        console.log("📊 PHASE 4: System statistics");
        console.log("=".repeat(60));

        const nextBookingId = await contract.nextBookingId();

        console.log("\nSystem Overview:");
        console.log("   Total Flights:", totalFlights);
        console.log("   Total Bookings:", Number(nextBookingId) - 1);
        console.log("   Network:", hre.network.name);
        console.log("   Contract:", await contract.getAddress());

        console.log("\n✅ Full scenario simulation completed!");
        console.log("\n💡 Next steps:");
        console.log("   1. Use the web interface for encrypted bookings");
        console.log("   2. Test with real users on testnet");
        console.log("   3. Monitor gas costs and optimize");
        console.log("   4. Implement additional features as needed");

    } catch (error) {
        console.error("❌ Full scenario failed:", error.message);
    }
}

function showHelp() {
    console.log("🎬 Contract Simulation Tool\n");
    console.log("Available Scenarios:");
    console.log("");

    Object.entries(SCENARIOS).forEach(([name, desc]) => {
        console.log(`  ${name.padEnd(15)} - ${desc}`);
    });

    console.log("\nUsage Examples:");
    console.log("  node scripts/simulate.js basic");
    console.log("  node scripts/simulate.js stress 10");
    console.log("  node scripts/simulate.js cancellation");
    console.log("  node scripts/simulate.js full");
    console.log("");
}

async function main() {
    const scenario = process.argv[2] || "help";

    console.log("🎬 Confidential Flight Booking - Simulation Tool\n");

    // Check if contract is deployed
    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    if (!contractAddress && scenario !== "help") {
        console.error("❌ Error: VITE_CONTRACT_ADDRESS not set in .env file");
        console.log("Please deploy the contract first: npm run deploy");
        process.exit(1);
    }

    try {
        switch (scenario.toLowerCase()) {
            case "basic":
                await basicScenario();
                break;
            case "stress":
                await stressScenario();
                break;
            case "cancellation":
                await cancellationScenario();
                break;
            case "full":
                await fullScenario();
                break;
            case "help":
                showHelp();
                break;
            default:
                console.log(`❌ Unknown scenario: ${scenario}\n`);
                showHelp();
        }
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

// Execute simulation
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
