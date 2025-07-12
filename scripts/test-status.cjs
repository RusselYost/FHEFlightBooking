/**
 * Simple status check without Hardhat runtime
 */

const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    console.log("📊 Contract Status Check\n");

    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const rpcUrl = process.env.RPC_URL;

    if (!contractAddress) {
        console.error("❌ VITE_CONTRACT_ADDRESS not set in .env");
        process.exit(1);
    }

    // Connect to provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Simple ABI for the functions we need
    const abi = [
        "function owner() view returns (address)",
        "function nextFlightId() view returns (uint32)",
        "function nextBookingId() view returns (uint32)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log("🔗 Network: sepolia");
    console.log("📍 Contract:", contractAddress);

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

        console.log("\n✅ Contract is operational!");
        console.log("\n🔗 View on Etherscan:");
        console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
