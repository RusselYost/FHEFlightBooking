# Scripts Quick Reference Guide

## 📚 Overview

Quick reference for all deployment and management scripts in the Confidential Flight Booking project.

## 🚀 NPM Scripts

### Compilation & Testing
```bash
npm run compile      # Compile smart contracts
npm test            # Run test suite
```

### Deployment
```bash
npm run deploy              # Deploy main contract to Sepolia
npm run deploy:pauser       # Deploy PauserSet contract
npm run deploy:gateway      # Deploy Gateway contract
npm run deploy:all          # Deploy all contracts sequentially
```

### Contract Management
```bash
npm run verify              # Verify contract on Etherscan
npm run interact            # Launch interactive contract tool
npm run simulate            # Run contract simulations
npm run contract:status     # Quick status check
npm run contract:list       # List all flights
npm run contract:stats      # Display statistics
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🔧 Script Details

### 1. deploy.js

**Location**: `scripts/deploy.js`

**Purpose**: Deploy ConfidentialFlightBooking contract

**Usage**:
```bash
npm run deploy
# or
npx hardhat run scripts/deploy.js --network sepolia
```

**Requirements**:
- PAUSER_SET_ADDRESS in .env
- Wallet with Sepolia ETH
- RPC_URL configured

**Output**:
- Contract address
- Deployment transaction
- Initial state verification
- Next steps instructions

---

### 2. verify.js

**Location**: `scripts/verify.js`

**Purpose**: Verify contracts on Etherscan

**Usage**:
```bash
# Method 1: Using environment variables
npm run verify

# Method 2: With arguments
node scripts/verify.js <CONTRACT_ADDRESS> <PAUSER_SET_ADDRESS>

# Example
node scripts/verify.js 0x604923E8D9d7938DE98Dd5aE193d6eea0336206A 0x89101063912C3e471dA0ead7142BD430f423de2D
```

**Requirements**:
- ETHERSCAN_API_KEY in .env
- Contract deployed and mined
- Constructor arguments (if any)

**Output**:
- Verification status
- Etherscan link
- Compilation details

---

### 3. interact.js

**Location**: `scripts/interact.js`

**Purpose**: Interactive contract management

**Usage**:
```bash
node scripts/interact.js <COMMAND> [ARGS]
```

#### Commands

##### status
```bash
node scripts/interact.js status
npm run contract:status
```
**Output**:
- Network information
- Contract address
- Owner details
- Flight/booking counts
- Access level

##### addFlight
```bash
node scripts/interact.js addFlight <FLIGHT_NUMBER> <PRICE_ETH> <CAPACITY>

# Examples
node scripts/interact.js addFlight FL001 0.1 150
node scripts/interact.js addFlight NYC-LAX 0.25 180
```
**Requirements**:
- Owner privileges
- Valid flight data

**Output**:
- Transaction hash
- Flight ID
- Gas used

##### listFlights
```bash
node scripts/interact.js listFlights
npm run contract:list
```
**Output**:
- All flights with details
- Availability status
- Pricing information

##### getBooking
```bash
node scripts/interact.js getBooking <BOOKING_ID>

# Example
node scripts/interact.js getBooking 1
```
**Output**:
- Passenger address
- Flight details
- Booking status
- Timestamp

##### getFlightBookings
```bash
node scripts/interact.js getFlightBookings <FLIGHT_ID>

# Example
node scripts/interact.js getFlightBookings 1
```
**Output**:
- All bookings for flight
- Active booking count
- Remaining capacity

##### stats
```bash
node scripts/interact.js stats
npm run contract:stats
```
**Output**:
- Total flights
- Total bookings
- Active/cancelled counts
- Average metrics

##### owner
```bash
node scripts/interact.js owner
```
**Output**:
- Contract owner address
- Your address
- Ownership status

##### help
```bash
node scripts/interact.js help
```
**Output**:
- Available commands
- Usage examples

---

### 4. simulate.js

**Location**: `scripts/simulate.js`

**Purpose**: Simulate real-world scenarios

**Usage**:
```bash
node scripts/simulate.js <SCENARIO> [OPTIONS]
npm run simulate <SCENARIO>
```

#### Scenarios

##### basic
```bash
node scripts/simulate.js basic
npm run simulate basic
```
**Simulates**:
- Add single flight
- Check availability
- Booking workflow overview

**Duration**: ~30 seconds

##### stress
```bash
node scripts/simulate.js stress [NUM_FLIGHTS]

# Examples
node scripts/simulate.js stress        # 5 flights (default)
node scripts/simulate.js stress 10     # 10 flights
node scripts/simulate.js stress 50     # 50 flights
```
**Simulates**:
- Multiple flight additions
- Transaction throughput
- Gas usage analysis

**Duration**: ~1-5 minutes (depends on count)

##### cancellation
```bash
node scripts/simulate.js cancellation
```
**Simulates**:
- Flight setup
- Booking creation
- Cancellation workflow
- Refund process

**Duration**: ~1 minute

##### full
```bash
node scripts/simulate.js full
```
**Simulates**:
- Complete system workflow
- Multiple flights and users
- Various operations
- Statistics display

**Duration**: ~2 minutes

**Phases**:
1. Setup flights (3+ flights)
2. Display available flights
3. Booking simulation
4. Statistics overview

##### help
```bash
node scripts/simulate.js help
```
**Output**:
- Available scenarios
- Usage examples

---

## 📋 Common Workflows

### First Time Deployment

```bash
# 1. Setup
npm install
cp .env.example .env
# Edit .env with your configuration

# 2. Compile & Test
npm run compile
npm test

# 3. Deploy
npm run deploy:pauser    # Deploy PauserSet first
# Copy address to .env as PAUSER_SET_ADDRESS

npm run deploy           # Deploy main contract
# Copy address to .env as VITE_CONTRACT_ADDRESS

# 4. Verify
npm run verify

# 5. Test
npm run contract:status
node scripts/interact.js addFlight TEST001 0.1 150
npm run contract:list
```

### Adding Test Data

```bash
# Add multiple flights
node scripts/interact.js addFlight NYC-LAX 0.15 180
node scripts/interact.js addFlight LON-PAR 0.08 150
node scripts/interact.js addFlight TOK-SYD 0.25 200
node scripts/interact.js addFlight DXB-SIN 0.20 250

# Verify
npm run contract:list
npm run contract:stats
```

### Running Simulations

```bash
# Quick test
node scripts/simulate.js basic

# Add many flights
node scripts/simulate.js stress 20

# Full workflow
node scripts/simulate.js full

# Check results
npm run contract:stats
```

### Troubleshooting

```bash
# Check status
npm run contract:status

# Verify deployment
node scripts/verify.js

# Check ownership
node scripts/interact.js owner

# View all flights
npm run contract:list

# Get statistics
npm run contract:stats
```

### Production Deployment

```bash
# 1. Final testing
npm test
npm run simulate full

# 2. Build frontend
npm run build

# 3. Deploy to hosting
vercel deploy --prod
# or
netlify deploy --prod

# 4. Update documentation
# Edit README.md with production addresses
```

## 🔍 Script Arguments Reference

### deploy.js
- No arguments required
- Uses environment variables

### verify.js
```
Argument 1: CONTRACT_ADDRESS (optional if in .env)
Argument 2: PAUSER_SET_ADDRESS (optional if in .env)
```

### interact.js
```
Command: status, addFlight, listFlights, etc.

addFlight:
  Argument 1: Flight number (string)
  Argument 2: Price in ETH (number)
  Argument 3: Capacity (integer)

getBooking:
  Argument 1: Booking ID (integer)

getFlightBookings:
  Argument 1: Flight ID (integer)
```

### simulate.js
```
Scenario: basic, stress, cancellation, full, help

stress:
  Argument 1: Number of flights (integer, default: 5)
```

## 🌐 Environment Variables

Required for scripts:

```bash
# Network
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x...

# Contracts
VITE_CONTRACT_ADDRESS=0x...
PAUSER_SET_ADDRESS=0x...
GATEWAY_CONTRACT_ADDRESS=0x...
KMS_GENERATION_ADDRESS=0x...

# Verification
ETHERSCAN_API_KEY=...
```

## 📊 Output Examples

### Status Check
```
🔗 Network: sepolia
📍 Contract: 0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
👤 Your Address: 0xcADde9D41770706e353E14f2585ffd03358D7813

📋 Contract Information:
   Owner: 0xcADde9D41770706e353E14f2585ffd03358D7813
   Next Flight ID: 5
   Next Booking ID: 12
   Total Flights: 4
   Total Bookings: 11

🔐 Access Level: Admin (Owner)
```

### Flight List
```
Found 3 flight(s):

Flight ID 1:
   Flight Number: NYC-LAX
   Price: 0.15 ETH
   Capacity: 180
   Available: Yes

Flight ID 2:
   Flight Number: LON-PAR
   Price: 0.08 ETH
   Capacity: 150
   Available: Yes

Flight ID 3:
   Flight Number: TOK-SYD
   Price: 0.25 ETH
   Capacity: 200
   Available: Yes
```

### Statistics
```
Overall Statistics:
   Total Flights: 3
   Total Bookings: 8
   Active Bookings: 7
   Cancelled Bookings: 1
   Avg Bookings/Flight: 2.33
```

## 💡 Tips & Best Practices

1. **Always check status first**
   ```bash
   npm run contract:status
   ```

2. **Use simulations for testing**
   ```bash
   node scripts/simulate.js basic
   ```

3. **Verify after deployment**
   ```bash
   npm run verify
   ```

4. **Monitor gas usage**
   - Check transaction receipts
   - Use contract sizer during compile

5. **Keep .env updated**
   - Add addresses after deployment
   - Never commit to git

6. **Use npm scripts when available**
   - Shorter commands
   - Consistent usage

7. **Test on testnet first**
   - Use Sepolia for testing
   - Get free test ETH from faucets

## 🔗 Quick Links

- **Contract**: https://sepolia.etherscan.io/address/0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
- **PauserSet**: https://sepolia.etherscan.io/address/0x89101063912C3e471dA0ead7142BD430f423de2D
- **Frontend**: https://confidential-flight-booking.vercel.app
- **Repository**: https://github.com/RusselYost/ConfidentialFlightBooking
- **Documentation**: See DEPLOYMENT_GUIDE.md

---

**Last Updated**: 2025-10-23
**Project Version**: 2.0.0
**fhevm Version**: 0.9.0-1
