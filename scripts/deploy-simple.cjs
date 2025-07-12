/**
 * Simplified deployment script for ConfidentialFlightBooking
 * Deploys PauserSet and main contract without fhevm plugin issues
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting deployment...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deploying from address:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Step 1: Deploy PauserSet
    console.log("📦 Step 1: Deploying PauserSet...");
    const pauserAddress = deployer.address;
    const PauserSet = await hre.ethers.getContractFactory("PauserSet");
    const pauserSet = await PauserSet.deploy([pauserAddress]);

    await pauserSet.waitForDeployment();
    const pauserSetAddress = await pauserSet.getAddress();

    console.log("✅ PauserSet deployed to:", pauserSetAddress);
    console.log("   Pauser address:", pauserAddress);

    // Wait a bit
    console.log("\n⏳ Waiting 5 seconds before deploying main contract...\n");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Deploy ConfidentialFlightBooking
    console.log("📦 Step 2: Deploying ConfidentialFlightBooking...");
    const ConfidentialFlightBooking = await hre.ethers.getContractFactory("ConfidentialFlightBooking");
    const flightBooking = await ConfidentialFlightBooking.deploy(pauserSetAddress);

    await flightBooking.waitForDeployment();
    const contractAddress = await flightBooking.getAddress();

    console.log("✅ ConfidentialFlightBooking deployed to:", contractAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const owner = await flightBooking.owner();
    const nextFlightId = await flightBooking.nextFlightId();
    const nextBookingId = await flightBooking.nextBookingId();

    console.log("   Owner:", owner);
    console.log("   Next Flight ID:", nextFlightId.toString());
    console.log("   Next Booking ID:", nextBookingId.toString());

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("Network:", hre.network.name);
    console.log("Deployer:", deployer.address);
    console.log("PauserSet:", pauserSetAddress);
    console.log("ConfidentialFlightBooking:", contractAddress);
    console.log("=".repeat(60));

    console.log("\n📝 Next Steps:");
    console.log("1. Update .env file:");
    console.log(`   PAUSER_SET_ADDRESS=${pauserSetAddress}`);
    console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("\n2. Verify contracts on Etherscan:");
    console.log(`   npx hardhat verify --network sepolia ${pauserSetAddress} "[\\"${pauserAddress}\\"]" --config hardhat.config.deploy.cts`);
    console.log(`   npx hardhat verify --network sepolia ${contractAddress} ${pauserSetAddress} --config hardhat.config.deploy.cts`);
    console.log("\n3. Test the deployment:");
    console.log("   npm run contract:status");

    return {
        pauserSetAddress,
        contractAddress,
        deployer: deployer.address
    };
}

main()
    .then((result) => {
        console.log("\n✅ Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
