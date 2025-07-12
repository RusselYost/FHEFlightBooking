/**
 * Smart Contract Verification Script
 * Verifies deployed contracts on Etherscan
 * Usage: node scripts/verify.js <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔍 Smart Contract Verification Tool\n");

    // Get contract address from command line or environment
    const contractAddress = process.argv[2] || process.env.VITE_CONTRACT_ADDRESS;

    if (!contractAddress) {
        console.error("❌ Error: Contract address not provided");
        console.log("\nUsage:");
        console.log("  node scripts/verify.js <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]");
        console.log("\nExample:");
        console.log("  node scripts/verify.js 0x1234...5678 0xabcd...ef01");
        console.log("\nOr set VITE_CONTRACT_ADDRESS in .env file");
        process.exit(1);
    }

    console.log("📍 Contract Address:", contractAddress);
    console.log("🌐 Network:", hre.network.name);

    // Check if Etherscan API key is set
    if (!process.env.ETHERSCAN_API_KEY) {
        console.error("\n❌ Error: ETHERSCAN_API_KEY not set in .env file");
        console.log("Please add your Etherscan API key to continue");
        process.exit(1);
    }

    // Get constructor arguments
    const constructorArgs = [];

    // PauserSet address for ConfidentialFlightBooking
    const pauserSetAddress = process.argv[3] || process.env.PAUSER_SET_ADDRESS;

    if (pauserSetAddress) {
        constructorArgs.push(pauserSetAddress);
        console.log("📝 Constructor Args:");
        console.log("   PauserSet Address:", pauserSetAddress);
    }

    try {
        console.log("\n🔄 Starting verification process...");
        console.log("⏳ This may take a few moments...\n");

        // Verify the contract
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });

        console.log("\n✅ Contract verified successfully!");
        console.log(`📋 View on Etherscan: https://${hre.network.name}.etherscan.io/address/${contractAddress}#code`);

        // Additional verification info
        console.log("\n📊 Verification Details:");
        console.log("   Network:", hre.network.name);
        console.log("   Contract:", contractAddress);
        console.log("   Compiler:", "v0.8.24");
        console.log("   Optimization:", "Enabled (200 runs)");
        console.log("   Via IR:", "true");

    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("\n✅ Contract is already verified!");
            console.log(`📋 View on Etherscan: https://${hre.network.name}.etherscan.io/address/${contractAddress}#code`);
        } else {
            console.error("\n❌ Verification failed:", error.message);
            console.log("\n💡 Troubleshooting tips:");
            console.log("1. Ensure the contract is deployed and has bytecode");
            console.log("2. Wait a few minutes after deployment before verifying");
            console.log("3. Check that constructor arguments match deployment");
            console.log("4. Verify Etherscan API key is valid");
            console.log("5. Check network configuration in hardhat.config");
            process.exit(1);
        }
    }

    // Verify PauserSet if needed
    if (pauserSetAddress && process.env.VERIFY_PAUSER === "true") {
        console.log("\n🔄 Verifying PauserSet contract...");
        try {
            await hre.run("verify:verify", {
                address: pauserSetAddress,
                constructorArguments: [],
            });
            console.log("✅ PauserSet verified successfully!");
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log("✅ PauserSet already verified");
            } else {
                console.log("⚠️  PauserSet verification failed:", error.message);
            }
        }
    }

    console.log("\n🎉 Verification process completed!");
}

// Execute verification
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
