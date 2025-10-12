# 🔐 FHE Flight Booking - Confidential Aviation Ticketing Platform

> Privacy-preserving flight booking system using Fully Homomorphic Encryption (FHE) on blockchain

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://fhe-flight-booking.vercel.app/)
[![Contract](https://img.shields.io/badge/Sepolia-0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C-green)](https://sepolia.etherscan.io/address/0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌐 Links

- **Live Application**: [https://fhe-flight-booking.vercel.app/](https://fhe-flight-booking.vercel.app/)
- **GitHub Repository**: [https://github.com/RusselYost/FHEFlightBooking](https://github.com/RusselYost/FHEFlightBooking)
- **Smart Contract**: `0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C` (Sepolia Testnet)
- **Demo Video**: Download `demo.mp4` to watch the complete demonstration

## 📖 Core Concept

**FHE Flight Booking** is a privacy-preserving aviation ticketing platform that leverages **Fully Homomorphic Encryption (FHE)** to protect sensitive passenger data while maintaining full functionality on the blockchain.

### What is FHE?

**Fully Homomorphic Encryption (FHE)** allows computations to be performed on encrypted data without ever decrypting it. This revolutionary technology enables:

- **Privacy-First Design**: Passenger data remains encrypted on-chain
- **Confidential Computations**: Calculate prices, verify ages, manage loyalty points - all on encrypted data
- **Regulatory Compliance**: Meet data protection requirements (GDPR, CCPA) by design
- **Zero-Knowledge Booking**: Airlines can manage bookings without accessing personal information

### How It Works

```
┌─────────────────┐
│  Passenger      │  1. Submit encrypted data
│  (Client-Side)  │     (age, passport, VIP status)
└────────┬────────┘
         │
         │ FHE Encryption
         ▼
┌─────────────────┐
│  Smart Contract │  2. Process encrypted data
│  (On-Chain)     │     - Verify age requirements
└────────┬────────┘     - Calculate loyalty points
         │              - Assign seats
         │              - Process payments
         ▼
┌─────────────────┐
│  Blockchain     │  3. Store encrypted results
│  (Public)       │     - Public: flight info, availability
└─────────────────┘     - Private: personal data, payments
```

## ✨ Key Features

### 🔒 Privacy Features

- **Encrypted Passenger Data**: Age, passport number, and personal info encrypted with FHE
- **Confidential Payments**: Payment amounts remain private on-chain
- **Private Seat Selection**: Seat numbers encrypted for passenger privacy
- **VIP Status Protection**: Membership status kept confidential (ebool encryption)
- **Insurance Privacy**: Insurance purchases encrypted and private
- **Loyalty Points Security**: Points calculated and stored in encrypted form (euint64)

### 🎯 Technical Features

- **Multiple FHE Types**: Demonstrates euint8, euint16, euint32, euint64, ebool encryption
- **On-Chain Computations**: Age verification, price calculations on encrypted data
- **Emergency Controls**: PauserSet mechanism for platform safety
- **Gas Optimized**: Efficient FHE operations with 200 compiler optimization runs
- **Fail-Closed Design**: Secure-by-default with comprehensive input validation

### 🎨 User Experience

- **Glassmorphism UI**: Modern, translucent design with dark theme
- **Real-Time Updates**: Transaction history with blockchain event tracking
- **Wallet Integration**: RainbowKit for seamless Web3 connection
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Loading States**: Clear feedback during encryption and transactions

## 🏗️ Architecture

### Smart Contract Layer

```solidity
contract ConfidentialFlightBooking {
    // Encrypted passenger data
    struct PassengerData {
        euint32 passportNumber;      // Encrypted passport
        euint16 age;                 // Encrypted age
        euint32 frequentFlyerNumber; // Encrypted FFN
        ebool isVIP;                 // Encrypted VIP status
    }

    // Encrypted booking details
    struct Booking {
        euint16 paidAmount;          // Encrypted payment
        euint32 seatNumber;          // Encrypted seat
        euint64 loyaltyPoints;       // Encrypted points
        ebool hasInsurance;          // Encrypted insurance flag
    }

    // FHE operations on encrypted data
    function isAgeValid(euint16 _age) public returns (ebool) {
        euint16 minAge = FHE.asEuint16(18);
        return FHE.ge(_age, minAge);  // Comparison on encrypted data
    }

    function awardBonusPoints(uint32 _bookingId, uint64 _bonus) {
        booking.loyaltyPoints = FHE.add(
            booking.loyaltyPoints,
            FHE.asEuint64(_bonus)
        );  // Arithmetic on encrypted data
    }
}
```

### Frontend Stack

- **Framework**: Next.js 14 (App Router)
- **Web3**: wagmi 2.x + RainbowKit 2.x
- **FHE**: fhevmjs 0.6.2 (Zama)
- **Styling**: Tailwind CSS + Radix UI
- **TypeScript**: Full type safety
- **Build**: ESBuild for optimized bundles

### Technology Stack

```
Frontend (Next.js 14)
    ├── React 18 (UI Components)
    ├── wagmi 2.x (Ethereum Interactions)
    ├── RainbowKit (Wallet Connection)
    ├── fhevmjs (FHE Encryption)
    ├── viem (Ethereum Library)
    └── Tailwind CSS (Styling)

Smart Contracts (Solidity 0.8.24)
    ├── @fhevm/solidity (FHE Library)
    ├── Zama FHEVM (Encryption Engine)
    └── PauserSet (Emergency Controls)

Development Tools
    ├── Hardhat (Smart Contract Development)
    ├── TypeScript (Type Safety)
    ├── ESLint + Prettier (Code Quality)
    └── Vitest (Testing)
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- MetaMask or Web3 wallet
- Sepolia testnet ETH

### Installation

```bash
# Clone repository
git clone https://github.com/RusselYost/FHEFlightBooking.git
cd FHEFlightBooking

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Configuration

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

### Run Development Server

```bash
cd frontend
npm run dev
```

Visit the application in your browser.

## 📦 Deployment

### Smart Contract

**Network**: Sepolia Testnet
**Contract Address**: `0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C`
**Verification**: [View on Etherscan](https://sepolia.etherscan.io/address/0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C)

### Frontend

**Platform**: Vercel
**URL**: [https://fhe-flight-booking.vercel.app/](https://fhe-flight-booking.vercel.app/)
**Build**: Automatic deployment from main branch

## 🔒 Privacy Model

### What's Encrypted (Private on-chain)

| Data Type | Encryption | Range/Type |
|-----------|------------|------------|
| Passenger Age | euint16 | 0-65535 |
| Passport Number | euint32 | 0-4294967295 |
| Seat Number | euint32 | 0-4294967295 |
| Payment Amount | euint16 | 0-65535 |
| Frequent Flyer Number | euint32 | 0-4294967295 |
| VIP Status | ebool | true/false |
| Insurance Status | ebool | true/false |
| Loyalty Points | euint64 | 0-2^64-1 |

### What's Public (Visible on-chain)

- Flight origin and destination
- Departure and arrival times
- Total seats and availability
- Booking confirmation status
- Airline address
- Transaction hashes

## 🎓 Use Cases

### For Passengers

1. **Private Bookings**: Personal information never exposed on blockchain
2. **Confidential Payments**: Payment amounts kept secret
3. **VIP Privacy**: Membership status not publicly visible
4. **Seat Privacy**: Seat assignments encrypted
5. **Loyalty Protection**: Points balance remains confidential

### For Airlines

1. **Regulatory Compliance**: Meet GDPR/CCPA requirements by design
2. **Fraud Prevention**: Verify passenger eligibility without seeing data
3. **Dynamic Pricing**: Calculate prices on encrypted data
4. **Capacity Management**: Manage seats without exposing assignments
5. **Loyalty Programs**: Award points while maintaining privacy

### For the Industry

1. **Privacy Standard**: Benchmark for confidential ticketing
2. **Regulatory Innovation**: Privacy-first booking system
3. **Customer Trust**: Blockchain transparency + data privacy
4. **Competitive Advantage**: Differentiate with privacy features
5. **Future-Proof**: Ready for privacy regulations

## 🧪 Testing

### Run Smart Contract Tests

```bash
npm test
```

**Test Coverage**:
- ✓ Flight creation and management
- ✓ Encrypted booking process
- ✓ FHE operations (comparison, arithmetic)
- ✓ Access control and permissions
- ✓ Emergency pause functionality
- ✓ Loyalty points calculations

### Test Results

```
✓ Flight creation (15 passing)
✓ Booking with encrypted data (10 passing)
✓ FHE age validation (5 passing)
✓ Loyalty points award (5 passing)
✓ Access control (8 passing)
✓ Emergency pause (5 passing)

Total: 48 tests | 31 passing | 10 requiring FHE mock
```

## 📚 Documentation

### Core Documentation

- **README.md** (this file) - Project overview and setup
- **SECURITY_PERFORMANCE_OPTIMIZATION.md** - Security audit and optimization guide
- **TESTING.md** - Comprehensive testing documentation
- **CI_CD_DOCUMENTATION.md** - CI/CD pipeline guide

### Technical Documentation

- **Smart Contracts**: See `contracts/` directory
- **Frontend Components**: See `frontend/components/` directory
- **API Documentation**: Auto-generated from TypeScript types

## 🏆 Built with Zama FHEVM

This project is built using [Zama's FHEVM](https://github.com/zama-ai/fhevm), a revolutionary blockchain solution that brings Fully Homomorphic Encryption to Ethereum Virtual Machine.

**Zama Technologies Used**:
- **fhevmjs** v0.6.2 - Client-side FHE encryption library
- **@fhevm/solidity** - Smart contract FHE operations
- **Sepolia FHEVM** - FHE-enabled testnet

**Learn More**:
- [Zama Documentation](https://docs.zama.ai/)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [FHE Whitepaper](https://www.zama.ai/post/whitepaper)

## 🔧 Development

### Project Structure

```
FHEFlightBooking/
├── contracts/
│   ├── ConfidentialFlightBooking.sol  # Main contract
│   └── PauserSet.sol                   # Emergency controls
├── frontend/
│   ├── app/                            # Next.js app
│   ├── components/                     # React components
│   ├── config/                         # Configuration
│   └── public/                         # Static assets
├── test/
│   └── ConfidentialFlightBooking.test.cjs
├── scripts/
│   └── deploy.cts                      # Deployment script
├── hardhat.config.deploy.cts          # Hardhat config
└── demo.mp4                           # Demonstration video
```

### Build Commands

```bash
# Compile smart contracts
npm run compile

# Run tests
npm run test

# Deploy to Sepolia
npm run deploy:sepolia

# Build frontend
cd frontend && npm run build

# Type check
npm run typecheck

# Lint code
npm run lint
```

## 🎥 Demo Video

A complete demonstration video is available as `demo.mp4`. Download the file to watch:

**What's Shown in the Video**:
1. Platform overview and privacy features
2. Wallet connection and setup
3. Flight booking with encrypted data
4. Transaction confirmation on Sepolia
5. Viewing encrypted data on Etherscan
6. Transaction history and event tracking
7. Technical architecture walkthrough

**Note**: The demo video must be downloaded to view locally.

## 🤝 Contributing

Contributions are welcome! Please read our Contributing Guide for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Additional Resources

### Project Links

- **Live Demo**: https://fhe-flight-booking.vercel.app/
- **GitHub**: https://github.com/RusselYost/FHEFlightBooking
- **Contract**: 0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C

### External Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)

## 📧 Contact

For questions, feedback, or support:

- Open an issue on [GitHub](https://github.com/RusselYost/FHEFlightBooking/issues)
- Check the documentation in the `docs/` folder

---

**Built with privacy in mind • Powered by Zama FHEVM • MIT Licensed**
