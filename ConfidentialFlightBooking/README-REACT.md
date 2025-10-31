# PrivateAir - Confidential Flight Booking (React Version)

A modern React application for confidential flight booking using FHE (Fully Homomorphic Encryption) technology. This application provides secure and private flight booking with zero-knowledge privacy guarantees.

## Features

- **Modern React Architecture**: Built with React 18, TypeScript, and Vite
- **Confidential Data**: Passenger information encrypted using FHE technology
- **Real-time Updates**: Auto-refresh flights every 30 seconds
- **Responsive Design**: Works on desktop and mobile devices
- **Type Safety**: Full TypeScript support for better code quality
- **Component-Based**: Modular component structure for maintainability

## Technology Stack

- **React 18.2**: Modern UI library
- **TypeScript 5.2**: Type-safe development
- **Vite 5**: Lightning-fast build tool
- **ethers.js 6.7**: Ethereum interaction
- **@fhevm/sdk 0.3**: FHE encryption operations
- **CSS3**: Modern styling with gradients and animations

## Project Structure

```
ConfidentialFlightBooking/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # App header
│   │   ├── ConnectionStatus.tsx    # Wallet connection status
│   │   ├── PrivacyNotice.tsx       # Privacy information
│   │   ├── Message.tsx             # Toast messages
│   │   ├── AddFlightForm.tsx       # Flight creation form
│   │   ├── BookFlightForm.tsx      # Flight booking form
│   │   ├── FlightCard.tsx          # Individual flight card
│   │   ├── FlightList.tsx          # List of flights
│   │   ├── BookingCard.tsx         # Individual booking card
│   │   └── BookingList.tsx         # List of bookings
│   ├── hooks/
│   │   ├── useWallet.ts            # Wallet connection hook
│   │   ├── useFlights.ts           # Flights data hook
│   │   └── useBookings.ts          # Bookings data hook
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── constants/
│   │   └── contract.ts             # Contract ABI and address
│   ├── App.tsx                     # Main application component
│   ├── App.css                     # Application styles
│   ├── main.tsx                    # React entry point
│   └── vite-env.d.ts              # Vite type declarations
├── contracts/
│   └── ConfidentialFlightBooking.sol
├── public/
│   └── legacy/                     # Original HTML/JS files
│       ├── index.html
│       └── app.js
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
└── README-REACT.md                 # This file
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Update contract address:

Edit `src/constants/contract.ts` and update `CONTRACT_ADDRESS` with your deployed contract address.

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

### For Airlines (Flight Operators)

1. **Connect Wallet**: Click the connection status to connect your MetaMask wallet
2. **Add Flight**: Fill in the "Add Flight" form with:
   - Origin and destination airports
   - Departure and arrival times
   - Total seats available
   - Base price in ETH

### For Passengers

1. **Connect Wallet**: Connect your MetaMask wallet
2. **Browse Flights**: View available flights in the "Available Flights" section
3. **Book Flight**: Click "Book This Flight" or fill the form with:
   - Flight ID
   - Passport number (encrypted)
   - Passenger name (encrypted)
   - Age
   - Preferred seat (optional)
   - Special assistance needs
   - Payment amount in ETH
4. **View Bookings**: Check your bookings in "My Bookings" section
5. **Cancel Booking**: Cancel pending bookings if needed

## Smart Contract Integration

The application integrates with the `ConfidentialFlightBooking` smart contract deployed on the blockchain. Key functions:

- `addFlight()`: Add new flights
- `bookFlight()`: Book a flight with encrypted passenger data
- `getFlightInfo()`: Retrieve flight information
- `getPassengerBookings()`: Get user's bookings
- `cancelBooking()`: Cancel a booking

## Privacy Features

- **Encrypted Passenger Data**: Names and passport numbers are encrypted
- **Confidential Seat Assignment**: Seat numbers encrypted on-chain
- **Private Payment Amounts**: Payment details protected
- **Zero-Knowledge Proofs**: Verify bookings without revealing details

## Differences from Original HTML Version

### Architecture
- **Component-Based**: Modular React components vs monolithic HTML
- **Type Safety**: TypeScript for better code quality
- **State Management**: React hooks for centralized state
- **Build System**: Vite for optimized production builds

### Features
- **Auto-Refresh**: Automatic flight updates every 30 seconds
- **Better UX**: Smooth scrolling to booking form
- **Error Handling**: Improved error messages and validation
- **Responsive**: Better mobile experience

### Code Organization
- Separated concerns (UI, logic, types, constants)
- Reusable custom hooks
- Independent components
- Better maintainability

## Browser Compatibility

- Chrome/Edge: Latest versions
- Firefox: Latest versions
- Safari: Latest versions
- Requires MetaMask or compatible Web3 wallet

## Troubleshooting

### "Contract not connected" error
- Ensure the contract address in `src/constants/contract.ts` is correct
- Verify the contract is deployed on the current network

### "Please install MetaMask" error
- Install MetaMask browser extension
- Ensure it's enabled for this site

### Transactions failing
- Check you have enough ETH for gas fees
- Verify you're on the correct network
- Ensure the flight has available seats

## Future Enhancements

- [ ] Integration with @fhevm/sdk for client-side encryption
- [ ] Advanced search and filtering
- [ ] Flight status updates
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Flight recommendations

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check the original README.md for contract deployment
- Review the Solidity contract in `contracts/`
- Check the legacy implementation in `public/legacy/`

## Credits

Built with ❤️ using React, TypeScript, and FHE technology for privacy-preserving flight bookings.
