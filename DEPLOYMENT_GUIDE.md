# Confidential Flight Booking - Deployment Guide

## 📋 Overview

Complete guide for deploying and managing the Confidential Flight Booking smart contract using Hardhat framework.

## 🛠️ Technology Stack

### Core Technologies
- **Hardhat v2.19.0**: Development framework
- **TypeScript v5.3.3**: Type-safe configuration
- **Solidity v0.8.24**: Smart contract language
- **fhevm v0.5.0**: Fully Homomorphic Encryption
- **Ethers.js v6.7.1**: Blockchain interaction

### Development Tools
- **TypeChain**: Generate TypeScript types
- **Hardhat Toolbox**: Testing & deployment utilities
- **Contract Sizer**: Monitor contract size
- **ts-node**: TypeScript execution

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/RusselYost/ConfidentialFlightBooking.git
cd ConfidentialFlightBooking

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file in project root:

```bash
# Network Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# Contract Addresses (will be filled after deployment)
VITE_CONTRACT_ADDRESS=
PAUSER_SET_ADDRESS=
GATEWAY_CONTRACT_ADDRESS=
KMS_GENERATION_ADDRESS=

# Etherscan Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeChain types
- Create artifacts in `/artifacts`
- Report contract sizes

### 4. Run Tests

```bash
npm test
```

Execute comprehensive test suite covering:
- Contract deployment
- Flight management functions
- Booking operations
- Access control mechanisms
- Edge cases and error handling

## 📦 Deployment Scripts

### 1. Deploy Script (`scripts/deploy.js`)

**Purpose**: Deploy main ConfidentialFlightBooking contract

**Usage**:
```bash
# Deploy to Sepolia
npm run deploy

# Deploy to specific network
npx hardhat run scripts/deploy.js --network sepolia
```

**Features**:
- Validates environment configuration
- Checks for PauserSet dependency
- Logs deployment information
- Provides next steps guidance
- Saves deployment metadata

**Output**:
- Contract address
- Deployment transaction hash
- Owner address
- Initial contract state
- Configuration checklist

### 2. Verification Script (`scripts/verify.js`)

**Purpose**: Verify deployed contracts on Etherscan

**Usage**:
```bash
# Using command line arguments
node scripts/verify.js <CONTRACT_ADDRESS> <PAUSER_SET_ADDRESS>

# Using environment variables
node scripts/verify.js

# Using npm script
npm run verify
```

**Features**:
- Automatic Etherscan verification
- Constructor argument handling
- Already-verified detection
- Error troubleshooting guidance
- Multiple contract support

**Requirements**:
- ETHERSCAN_API_KEY in .env
- Contract deployed and mined
- Correct constructor arguments

### 3. Interaction Script (`scripts/interact.js`)

**Purpose**: Interactive contract management and testing

**Usage**:
```bash
# Quick status check
npm run contract:status

# List all flights
npm run contract:list

# Display statistics
npm run contract:stats

# General interaction
node scripts/interact.js <COMMAND> [ARGS]
```

**Available Commands**:

#### `status`
Check contract status and basic information
```bash
node scripts/interact.js status
```
Shows:
- Network and contract address
- Your wallet address
- Owner information
- Next flight/booking IDs
- Total counts
- Access level

#### `addFlight`
Add new flight (admin only)
```bash
node scripts/interact.js addFlight <FLIGHT_NUMBER> <PRICE_ETH> <CAPACITY>

# Example
node scripts/interact.js addFlight FL123 0.5 200
```
Requires:
- Owner privileges
- Valid flight number
- Price in ETH
- Capacity > 0

#### `listFlights`
Display all available flights
```bash
node scripts/interact.js listFlights
```
Shows:
- Flight ID
- Flight number
- Price in ETH
- Capacity
- Availability status

#### `getBooking`
Get booking details by ID
```bash
node scripts/interact.js getBooking <BOOKING_ID>

# Example
node scripts/interact.js getBooking 1
```
Shows:
- Passenger address
- Flight ID
- Booking status
- Timestamp
- Related flight info

#### `getFlightBookings`
Get all bookings for specific flight
```bash
node scripts/interact.js getFlightBookings <FLIGHT_ID>

# Example
node scripts/interact.js getFlightBookings 1
```
Shows:
- Flight information
- All active bookings
- Remaining capacity

#### `stats`
Display contract statistics
```bash
node scripts/interact.js stats
```
Shows:
- Total flights
- Total bookings
- Active bookings
- Cancelled bookings
- Average bookings per flight

#### `owner`
Check contract ownership
```bash
node scripts/interact.js owner
```
Shows:
- Contract owner address
- Your address
- Ownership status

### 4. Simulation Script (`scripts/simulate.js`)

**Purpose**: Simulate real-world usage scenarios

**Usage**:
```bash
node scripts/simulate.js <SCENARIO> [OPTIONS]

# Or using npm
npm run simulate <SCENARIO>
```

**Available Scenarios**:

#### `basic`
Basic flight booking simulation
```bash
node scripts/simulate.js basic
```
Demonstrates:
- Adding a single flight
- Checking flight availability
- Booking workflow overview
- Encrypted booking requirements

#### `stress`
Stress test with multiple flights
```bash
node scripts/simulate.js stress [NUM_FLIGHTS]

# Example: Add 10 flights
node scripts/simulate.js stress 10
```
Tests:
- Multiple flight additions
- Transaction throughput
- Gas usage patterns
- System performance

#### `cancellation`
Booking and cancellation flow
```bash
node scripts/simulate.js cancellation
```
Demonstrates:
- Flight setup for cancellation
- Cancellation workflow
- Refund process
- Admin cancellation capabilities

#### `full`
Complete system simulation
```bash
node scripts/simulate.js full
```
Includes:
- Multiple flight setup (3+ flights)
- Various flight configurations
- User interaction simulation
- Booking workflow demonstration
- System statistics
- Complete end-to-end flow

## 📊 Complete Deployment Workflow

### Step-by-Step Process

#### Step 1: Prerequisites
- [x] Node.js v16+ installed
- [x] Git installed
- [x] Wallet with Sepolia ETH
- [x] Infura/Alchemy account
- [x] Etherscan API key

#### Step 2: Project Setup
```bash
# Clone and install
git clone https://github.com/RusselYost/ConfidentialFlightBooking.git
cd ConfidentialFlightBooking
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values
```

#### Step 3: Development
```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Check contract sizes
# (automatically done during compile)
```

#### Step 4: Deployment (Testnet)
```bash
# 1. Deploy PauserSet (if needed)
npm run deploy:pauser
# Copy PAUSER_SET_ADDRESS to .env

# 2. Deploy main contract
npm run deploy
# Copy CONTRACT_ADDRESS to .env as VITE_CONTRACT_ADDRESS

# 3. Verify contracts
npm run verify
```

#### Step 5: Testing & Validation
```bash
# Check deployment status
npm run contract:status

# Add test flights
node scripts/interact.js addFlight TEST001 0.1 150
node scripts/interact.js addFlight TEST002 0.2 200

# List flights
npm run contract:list

# Run basic simulation
node scripts/simulate.js basic

# Run full simulation
node scripts/simulate.js full
```

#### Step 6: Frontend Integration
```bash
# Update frontend config
# Edit public/config.js or src/config/contracts.ts

export const CONTRACT_ADDRESS = '0x...'; // Your deployed address
export const NETWORK = 'sepolia';

# Build frontend
npm run build

# Test locally
npm run preview
```

#### Step 7: Production Deployment
```bash
# Deploy to Vercel/Netlify
vercel deploy --prod

# Or using Netlify
netlify deploy --prod
```

## 🔧 Configuration Files

### hardhat.config.ts

TypeScript-based Hardhat configuration:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhevm/hardhat-plugin";
import "@typechain/hardhat";
import "hardhat-contract-sizer";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true
    }
  },
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### tsconfig.json

TypeScript compiler configuration for Hardhat:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["./scripts/**/*", "./test/**/*", "./hardhat.config.ts"]
}
```

### package.json Scripts

```json
{
  "scripts": {
    "compile": "hardhat compile",
    "deploy": "hardhat run scripts/deploy.js --network sepolia",
    "deploy:all": "npm run deploy:pauser && npm run deploy",
    "test": "hardhat test",
    "verify": "node scripts/verify.js",
    "interact": "node scripts/interact.js",
    "simulate": "node scripts/simulate.js",
    "contract:status": "node scripts/interact.js status",
    "contract:list": "node scripts/interact.js listFlights",
    "contract:stats": "node scripts/interact.js stats"
  }
}
```

## 🌐 Network Information

### Sepolia Testnet

- **Network**: Sepolia
- **Chain ID**: 11155111
- **Currency**: SepoliaETH (test ETH)
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com
  - https://faucet.sepolia.dev

### Current Deployment

- **Contract Address**: `0x604923E8D9d7938DE98Dd5aE193d6eea0336206A`
- **PauserSet Address**: `0x89101063912C3e471dA0ead7142BD430f423de2D`
- **Etherscan**: [View Contract](https://sepolia.etherscan.io/address/0x604923E8D9d7938DE98Dd5aE193d6eea0336206A)
- **Network**: Sepolia Testnet
- **Deployment Date**: 2025-10-23
- **Version**: 2.0.0 (fhevm v0.9.0-1)

## 🔍 Troubleshooting

### Common Issues

#### 1. Deployment Fails
**Error**: "Insufficient funds for gas"
```bash
# Solution: Get testnet ETH from faucet
# Visit: https://sepoliafaucet.com
```

#### 2. Verification Fails
**Error**: "Contract source code already verified"
```bash
# This is actually success - contract is already verified
# View on Etherscan to confirm
```

#### 3. TypeScript Errors
**Error**: "Cannot find module 'hardhat/config'"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Script Execution Fails
**Error**: "VITE_CONTRACT_ADDRESS not set"
```bash
# Solution: Add to .env file
echo "VITE_CONTRACT_ADDRESS=0x..." >> .env
```

### Debug Commands

```bash
# Check Hardhat configuration
npx hardhat config

# List available tasks
npx hardhat help

# Clean and recompile
npx hardhat clean
npm run compile

# Check account balance
npx hardhat run scripts/check-balance.js --network sepolia

# Dry run deployment
npx hardhat run scripts/deploy.js --network hardhat
```

## 📚 Additional Resources

### Documentation
- [Hardhat Docs](https://hardhat.org/docs)
- [fhevm Documentation](https://docs.zama.ai/fhevm)
- [Ethers.js Docs](https://docs.ethers.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Project Links
- **Live Demo**: https://confidential-flight-booking.vercel.app
- **Repository**: https://github.com/RusselYost/ConfidentialFlightBooking
- **Contract**: https://sepolia.etherscan.io/address/0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
- **PauserSet**: https://sepolia.etherscan.io/address/0x89101063912C3e471dA0ead7142BD430f423de2D

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Node.js v16+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env`)
- [ ] Wallet funded with testnet ETH
- [ ] Contracts compile successfully
- [ ] Tests passing

### Deployment
- [ ] PauserSet deployed (if needed)
- [ ] Main contract deployed to Sepolia
- [ ] Deployment transaction confirmed
- [ ] Contract address saved to .env
- [ ] Deployment details documented

### Post-Deployment
- [ ] Contract verified on Etherscan
- [ ] Test interactions successful
- [ ] Frontend configuration updated
- [ ] Basic simulation run successfully
- [ ] Documentation updated
- [ ] Frontend deployed

### Production Ready
- [ ] Full test suite passing
- [ ] Security audit completed (if applicable)
- [ ] Gas optimization reviewed
- [ ] User documentation complete
- [ ] Support channels established

## 🔐 Security Notes

1. **Never commit `.env` file** to version control
2. **Use separate wallets** for mainnet and testnet
3. **Test thoroughly** on testnet before mainnet deployment
4. **Verify contracts** on Etherscan for transparency
5. **Monitor gas prices** before deploying
6. **Keep private keys secure** - use hardware wallets for mainnet
7. **Review all transactions** before signing
8. **Implement timelock** for critical functions on mainnet

---

**Need Help?** Open an issue on GitHub or contact the development team.
