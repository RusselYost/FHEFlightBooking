# Confidential Flight Booking - Frontend

A modern, privacy-focused flight booking platform built with Next.js 14, TypeScript, and Web3 technologies.

## Features

✅ **Wallet Integration** - Connect with MetaMask, WalletConnect, and other popular wallets via RainbowKit
✅ **Flight Management** - View available flights with real-time seat availability
✅ **Airline Dashboard** - Add new flights (owner-only access)
✅ **Transaction History** - Track all your blockchain interactions
✅ **Loading States** - Comprehensive loading indicators for better UX
✅ **Error Handling** - Graceful error messages and recovery options
✅ **Fully Encrypted** - Passenger data protected with FHE (Fully Homomorphic Encryption)
✅ **Mobile Responsive** - Beautiful UI on all devices
✅ **TypeScript** - Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Web3**: wagmi 2.9 + viem 2.13 + RainbowKit 2.1
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI (Headless components)
- **Icons**: Lucide React
- **Network**: Sepolia Testnet

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx             # Main application page
│   ├── providers.tsx        # Web3 provider configuration
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   ├── FlightList.tsx       # Flight listing component
│   ├── AddFlightForm.tsx    # Add flight form (airline only)
│   └── TransactionHistory.tsx # Transaction history viewer
├── hooks/
│   ├── useContract.ts       # Contract interaction hooks
│   └── useTransactionHistory.ts # Transaction tracking
├── config/
│   ├── contracts.ts         # Contract addresses & ABI
│   └── wagmi.ts             # wagmi configuration
├── lib/
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## Deployment Information

### Contracts (Sepolia Testnet)

- **ConfidentialFlightBooking**: `0x604923E8D9d7938DE98Dd5aE193d6eea0336206A`
- **PauserSet**: `0x89101063912C3e471dA0ead7142BD430f423de2D`
- **Network**: Sepolia (Chain ID: 11155111)
- **Block Explorer**: https://sepolia.etherscan.io/

### Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Contract Addresses (already configured)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
NEXT_PUBLIC_PAUSER_SET_ADDRESS=0x89101063912C3e471dA0ead7142BD430f423de2D

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
```

## Getting Started

### Prerequisites

- Node.js 20.12.1 or higher (recommended: 22.10.0 LTS)
- npm 10.5.0 or higher
- MetaMask or another Web3 wallet

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your WalletConnect Project ID
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Lint

```bash
npm run lint
```

## Vercel Deployment

This project is configured for Vercel deployment from the repository root:

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
   - Install Command: `cd frontend && npm install`

3. **Environment Variables**
   Add these in Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
   NEXT_PUBLIC_PAUSER_SET_ADDRESS=0x89101063912C3e471dA0ead7142BD430f423de2D
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_NETWORK_NAME=sepolia
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `your-project.vercel.app`

## Usage

### For Passengers

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Browse Flights**: View available flights in the "Flights" tab
3. **Book Flight**: Click "Book Now" on desired flight (requires encrypted passenger data)
4. **Track History**: View your transactions in the "History" tab

### For Airlines (Contract Owner)

1. **Connect Wallet**: Must be the contract owner address
2. **Add Flights**: Go to "Add Flight" tab
3. **Fill Details**: Enter flight information
   - Origin & Destination (airport codes)
   - Departure & Arrival times
   - Total seats
   - Base price (in Wei)
4. **Submit**: Confirm transaction in your wallet
5. **Verify**: Check Etherscan for transaction confirmation

## Features in Detail

### Flight List Component

- Real-time flight data from blockchain
- Seat availability tracking
- Duration calculation
- Interactive flight cards
- Refresh functionality

### Add Flight Form

- Owner-only access control
- Date/time validation
- Future departure time enforcement
- Arrival after departure validation
- Transaction confirmation feedback

### Transaction History

- Event log parsing from blockchain
- FlightAdded, BookingCreated events
- Transaction status indicators
- Direct Etherscan links
- LocalStorage persistence

### Loading States

- Skeleton screens
- Spinner indicators
- Transaction pending states
- Block confirmation tracking

### Error Handling

- Network error recovery
- Transaction failure messages
- Wallet connection errors
- Form validation errors

## Smart Contract Integration

The frontend interacts with the ConfidentialFlightBooking smart contract through:

- **Read Operations**: Flight info, owner, seat availability
- **Write Operations**: Add flights, create bookings, confirm/cancel bookings
- **Events**: FlightAdded, BookingCreated, BookingConfirmed, BookingCancelled

All passenger data is encrypted using Fully Homomorphic Encryption (FHE) before being stored on-chain.

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Brave
- Safari (limited Web3 support)

## Security Notes

- Never share your private keys or seed phrases
- Always verify contract addresses before transactions
- Use Sepolia testnet for development/testing
- Keep your WalletConnect Project ID secure

## Troubleshooting

### Wallet Not Connecting

1. Check MetaMask is installed and unlocked
2. Ensure you're on Sepolia network
3. Refresh the page and try again

### Transaction Failing

1. Check you have sufficient Sepolia ETH
2. Verify you're the contract owner (for adding flights)
3. Check gas price and transaction parameters

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check [GitHub Issues](../../issues)
- Review [Contract Documentation](../README.md)
- Consult [Deployment Guide](../DEPLOYMENT_GUIDE.md)

---

Built with ❤️ using Next.js, TypeScript, wagmi & RainbowKit
