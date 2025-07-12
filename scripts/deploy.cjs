/**
 * Main deployment script for ConfidentialFlightBooking
 * Updated for fhevm v0.5.0 with new security features
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting ConfidentialFlightBooking deployment...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deploying from address:", deployer.address);
    console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

    // Check for required environment variables
    console.log("🔍 Checking configuration...");
    const kmsGenerationAddress = process.env.KMS_GENERATION_ADDRESS;
    const gatewayAddress = process.env.GATEWAY_CONTRACT_ADDRESS;

    if (!kmsGenerationAddress) {
        console.warn("⚠️  KMS_GENERATION_ADDRESS not set in .env");
    } else {
        console.log("✅ KMS Generation Address:", kmsGenerationAddress);
    }

    if (!gatewayAddress) {
        console.warn("⚠️  GATEWAY_CONTRACT_ADDRESS not set in .env");
    } else {
        console.log("✅ Gateway Address:", gatewayAddress);
    }

    // Check if PauserSet is deployed
    const pauserSetAddress = process.env.PAUSER_SET_ADDRESS;
    if (!pauserSetAddress) {
        console.error("\n❌ PAUSER_SET_ADDRESS not found in .env file");
        console.log("Please deploy PauserSet first using: npm run deploy:pauser");
        process.exit(1);
    }
    console.log("✅ Using PauserSet at:", pauserSetAddress);

    // Deploy main contract
    console.log("\n🔨 Deploying ConfidentialFlightBooking contract...");
    const ConfidentialFlightBooking = await hre.ethers.getContractFactory("ConfidentialFlightBooking");
    const contract = await ConfidentialFlightBooking.deploy(pauserSetAddress);

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("\n✅ ConfidentialFlightBooking deployed successfully!");
    console.log("📍 Contract address:", contractAddress);

    // Verify initial state
    console.log("\n🔍 Verifying deployment...");
    const owner = await contract.owner();
    const nextFlightId = await contract.nextFlightId();
    const nextBookingId = await contract.nextBookingId();

    console.log("✅ Contract owner:", owner);
    console.log("✅ Next flight ID:", nextFlightId.toString());
    console.log("✅ Next booking ID:", nextBookingId.toString());

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: contractAddress,
        deployer: deployer.address,
        owner: owner,
        kmsGenerationAddress: kmsGenerationAddress || "not_set",
        gatewayAddress: gatewayAddress || "not_set",
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        fhevmVersion: "v0.5.0",
        features: {
            transactionInputReRandomization: true,
            newGatewayAPI: true,
            pauserSetSupport: true
        }
    };

    console.log("\n📄 Deployment Information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Instructions for next steps
    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend config.js with the contract address:");
    console.log(`   CONTRACT_ADDRESS: "${contractAddress}"`);
    console.log("\n2. Update .env file:");
    console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("\n3. If not already done, deploy PauserSet contract:");
    console.log("   npm run deploy:pauser");
    console.log("\n4. Verify the contract on Etherscan:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
    console.log("\n5. Review MIGRATION_GUIDE.md for breaking changes from fhevm v0.5.0");

    // Feature reminders
    console.log("\n🔐 Security Features (fhevm v0.5.0):");
    console.log("✅ Transaction input re-randomization enabled (sIND-CPAD security)");
    console.log("✅ All inputs are re-encrypted before FHE operations");
    console.log("✅ This is transparent to users - no code changes needed");

    console.log("\n⚠️  Breaking Changes:");
    console.log("- Gateway check... functions replaced with is... functions");
    console.log("- KMS_MANAGEMENT renamed to KMS_GENERATION");
    console.log("- PauserSet contract required for pause functionality");
    console.log("- See MIGRATION_GUIDE.md for full details");

    return contractAddress;
}

// Execute deployment
main()
    .then((address) => {
        console.log("\n✅ Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
