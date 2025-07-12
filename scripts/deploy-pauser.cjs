/**
 * Deployment script for PauserSet contract
 *
 * This script deploys the PauserSet immutable contract with configured pauser addresses
 * Updated for fhevm v0.5.0 breaking changes
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting PauserSet deployment...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deploying from address:", deployer.address);
    console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

    // Get pauser configuration from environment
    const numPausers = parseInt(process.env.NUM_PAUSERS || "0");

    if (numPausers === 0) {
        throw new Error("❌ NUM_PAUSERS not set in .env file. Please configure pauser addresses.");
    }

    // Collect all pauser addresses
    const pauserAddresses = [];
    for (let i = 0; i < numPausers; i++) {
        const pauserKey = `PAUSER_ADDRESS_${i}`;
        const pauserAddress = process.env[pauserKey];

        if (!pauserAddress) {
            throw new Error(`❌ ${pauserKey} not found in .env file`);
        }

        // Validate address
        if (!hre.ethers.isAddress(pauserAddress)) {
            throw new Error(`❌ Invalid address for ${pauserKey}: ${pauserAddress}`);
        }

        pauserAddresses.push(pauserAddress);
        console.log(`✅ Pauser ${i}: ${pauserAddress}`);
    }

    console.log(`\n📊 Total pausers configured: ${numPausers}`);
    console.log(`📝 Formula: NUM_PAUSERS = n_kms + n_copro`);
    console.log(`   where n_kms = number of registered KMS nodes`);
    console.log(`   and n_copro = number of registered coprocessors\n`);

    // Deploy PauserSet contract
    console.log("🔨 Deploying PauserSet contract...");
    const PauserSet = await hre.ethers.getContractFactory("PauserSet");
    const pauserSet = await PauserSet.deploy(pauserAddresses);

    await pauserSet.waitForDeployment();
    const pauserSetAddress = await pauserSet.getAddress();

    console.log("\n✅ PauserSet deployed successfully!");
    console.log("📍 Contract address:", pauserSetAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const deployedPauserCount = await pauserSet.pauserCount();
    console.log("✅ Pauser count:", deployedPauserCount.toString());

    // List all pausers
    console.log("\n📋 Configured pausers:");
    for (let i = 0; i < numPausers; i++) {
        const pauser = await pauserSet.getPauserAt(i);
        const isAuthorized = await pauserSet.isAuthorizedPauser(pauser);
        console.log(`   ${i}. ${pauser} - Authorized: ${isAuthorized}`);
    }

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        pauserSetAddress: pauserSetAddress,
        deployer: deployer.address,
        numPausers: numPausers,
        pauserAddresses: pauserAddresses,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber()
    };

    console.log("\n📄 Deployment Information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Instructions for next steps
    console.log("\n📝 Next Steps:");
    console.log("1. Update .env with the PauserSet address:");
    console.log(`   PAUSER_SET_ADDRESS=${pauserSetAddress}`);
    console.log("\n2. Deploy Gateway contract with this PauserSet address");
    console.log("3. Deploy Host contract with this PauserSet address");
    console.log("\n4. Verify the contract on Etherscan:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${pauserSetAddress} "${JSON.stringify(pauserAddresses)}"`);

    return pauserSetAddress;
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
