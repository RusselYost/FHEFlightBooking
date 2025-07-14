# Contract Addresses - ConfidentialFlightBooking

## 📍 Deployed Contracts

### Sepolia Testnet

#### Main Contract: ConfidentialFlightBooking
```
Address: 0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
Network: Sepolia
Chain ID: 11155111
 
Version: 2.0.0
fhevm Version: 0.9.0-1
```

**Etherscan**: https://sepolia.etherscan.io/address/0x604923E8D9d7938DE98Dd5aE193d6eea0336206A

**Features**:
- ✅ Fully Homomorphic Encryption (FHE)
- ✅ Encrypted flight booking
- ✅ Encrypted passenger data (passport, age, FFN)
- ✅ Encrypted payments and seat selection
- ✅ Encrypted loyalty points and VIP status
- ✅ PauserSet integration for emergency controls

#### PauserSet Contract
```
Address: 0x89101063912C3e471dA0ead7142BD430f423de2D
Network: Sepolia
Chain ID: 11155111
Deployment Date: 2025-10-23
```

**Etherscan**: https://sepolia.etherscan.io/address/0x89101063912C3e471dA0ead7142BD430f423de2D

**Features**:
- ✅ Immutable pauser address management
- ✅ Emergency pause/unpause functionality
- ✅ Support for multiple authorized pausers

---

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
# Deployed Contract Addresses
VITE_CONTRACT_ADDRESS=0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
PAUSER_SET_ADDRESS=0x89101063912C3e471dA0ead7142BD430f423de2D

# Network Configuration
RPC_URL=https://blockchain.googleapis.com/v1/projects/logical-iridium-334603/locations/asia-east1/endpoints/ethereum-sepolia/rpc?key=AIzaSyA6HJzZ_EdQvqT18XTK5tQ80IRCJNItynk
CHAIN_ID=11155111

# Deployer Account
PRIVATE_KEY=0xb069c07133e7eb0a0f3bc458b7bfaab47964d3dd3b16b07f772dfeee281090c1

# Pauser Configuration
NUM_PAUSERS=1
PAUSER_ADDRESS_0=0xcADde9D41770706e353E14f2585ffd03358D7813
```

### Frontend Configuration (JavaScript)
```javascript
// public/config.js
export const CONTRACT_ADDRESS = '0x604923E8D9d7938DE98Dd5aE193d6eea0336206A';
export const PAUSER_SET_ADDRESS = '0x89101063912C3e471dA0ead7142BD430f423de2D';
export const NETWORK = 'sepolia';
export const CHAIN_ID = 11155111;
export const GATEWAY_URL = 'https://gateway.zama.ai';
```

### Frontend Configuration (TypeScript)
```typescript
// src/config/contracts.ts
export const CONTRACTS = {
  ConfidentialFlightBooking: '0x604923E8D9d7938DE98Dd5aE193d6eea0336206A',
  PauserSet: '0x89101063912C3e471dA0ead7142BD430f423de2D'
} as const;

export const NETWORK_CONFIG = {
  name: 'sepolia',
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
  blockExplorer: 'https://sepolia.etherscan.io'
} as const;
```

---

## 🌐 Zama FHE Infrastructure (Sepolia)

These are pre-deployed by Zama and configured in the contracts:

```
ACL Address:             0x687820221192C5B662b25367F70076A37bc79b6c
FHEVMExecutor Address:   0x848B0066793BcC60346Da1F49049357399B8D595
KMSVerifier Address:     0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
InputVerifier Address:   0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
```

**Gateway URL**: https://gateway.zama.ai

---

## 👤 Deployment Account

```
Address: 0xcADde9D41770706e353E14f2585ffd03358D7813
Role: Contract Owner & Pauser
Balance: ~0.0517 SepoliaETH (post-deployment)
```

---

## 📊 Contract Information

### ConfidentialFlightBooking

**Owner**: 0xcADde9D41770706e353E14f2585ffd03358D7813

**Initial State**:
- Next Flight ID: 1
- Next Booking ID: 1
- Total Flights: 0
- Total Bookings: 0

**Contract Size**: 9.936 KiB (optimized)

**Key Functions**:
- `addFlight(origin, destination, departureTime, arrivalTime, totalSeats, basePrice)`
- `bookFlight(flightId, passportNumber, name, age, seat, ...)`
- `confirmBooking(bookingId)`
- `cancelBooking(bookingId)`
- `awardBonusPoints(bookingId, points)`
- `isAgeValid(age)` - FHE comparison

### PauserSet

**Pauser Count**: 1

**Authorized Pausers**:
1. 0xcADde9D41770706e353E14f2585ffd03358D7813

**Contract Size**: 0.769 KiB

**Key Functions**:
- `isPauser(address)` - Check if address is authorized pauser
- `getAllPausers()` - Get all pauser addresses
- `getPauserCount()` - Get total number of pausers

---

## 🔗 Quick Links

### Etherscan
- **Main Contract**: https://sepolia.etherscan.io/address/0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
- **PauserSet**: https://sepolia.etherscan.io/address/0x89101063912C3e471dA0ead7142BD430f423de2D
- **Deployer Account**: https://sepolia.etherscan.io/address/0xcADde9D41770706e353E14f2585ffd03358D7813

### Project
- **Repository**: https://github.com/RusselYost/ConfidentialFlightBooking
- **Live Demo**: https://confidential-flight-booking.vercel.app

### Documentation
- **README.md**: Project overview and features
- **DEPLOYMENT_GUIDE.md**: Complete deployment instructions
- **SCRIPTS_REFERENCE.md**: Script usage reference
- **DEPLOYMENT_SUCCESS.md**: Detailed deployment report

---

## 🧪 Testing Commands

### Check Contract Status
```bash
# Using custom script
node scripts/test-status.cjs

# Expected output:
# Owner: 0xcADde9D41770706e353E14f2585ffd03358D7813
# Next Flight ID: 1
# Next Booking ID: 1
# ✅ Contract is operational!
```

### Interact with Contract
```bash
# Using Hardhat console
npx hardhat console --network sepolia

# In console:
const contract = await ethers.getContractAt(
  "ConfidentialFlightBooking",
  "0x604923E8D9d7938DE98Dd5aE193d6eea0336206A"
);

const owner = await contract.owner();
console.log("Owner:", owner);
```

### Add Test Flight
```javascript
// Example: Add a test flight
const tx = await contract.addFlight(
  "NYC",                    // origin
  "LAX",                    // destination
  Date.now() + 86400000,    // departure (24h from now)
  Date.now() + 90000000,    // arrival (25h from now)
  180,                      // totalSeats
  500                       // basePrice (will be encrypted)
);
await tx.wait();
console.log("Flight added!");
```

---

## 📝 Verification Commands

### Verify on Etherscan

```bash
# Verify PauserSet
npx hardhat verify --network sepolia \
  0x89101063912C3e471dA0ead7142BD430f423de2D \
  "[\"0xcADde9D41770706e353E14f2585ffd03358D7813\"]" \
  --config hardhat.config.deploy.cts

# Verify ConfidentialFlightBooking
npx hardhat verify --network sepolia \
  0x604923E8D9d7938DE98Dd5aE193d6eea0336206A \
  0x89101063912C3e471dA0ead7142BD430f423de2D \
  --config hardhat.config.deploy.cts
```

**Note**: Requires `ETHERSCAN_API_KEY` in `.env` file

---

## 🔐 Security Information

### Access Control
- **Contract Owner**: Can add flights, award bonus points, withdraw funds
- **Airlines**: Can confirm/cancel their own flight bookings
- **Pausers**: Can pause/unpause the contract in emergencies
- **Passengers**: Can book and cancel their own bookings

### Emergency Controls
The contract can be paused by authorized pausers in case of:
- Security vulnerabilities discovered
- Smart contract bugs detected
- Regulatory requirements
- System maintenance

When paused:
- ❌ No new bookings can be made
- ❌ No cancellations allowed
- ✅ View functions still work
- ✅ Can be unpaused by pausers

---

## 📅 Deployment Timeline

**2025-10-23**
- ✅ Project upgraded to fhevm v0.9.0-1
- ✅ Contract API updated for compatibility
- ✅ Hardhat TypeScript environment configured
- ✅ Contracts compiled successfully
- ✅ PauserSet deployed to Sepolia
- ✅ ConfidentialFlightBooking deployed to Sepolia
- ✅ Deployment verified and tested
- ✅ Documentation updated

---

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated**: 2025-10-23
**Contract Version**: 2.0.0
**fhevm Version**: 0.9.0-1
**Network**: Sepolia Testnet
