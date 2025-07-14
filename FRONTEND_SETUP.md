# Frontend Setup Guide - Confidential Flight Booking

## 🎯 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Web3**: wagmi + RainbowKit
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (Headless)
- **Build**: ESBuild (via Next.js)
- **Deployment**: Vercel
- **Network**: Sepolia Testnet

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # Web3 providers
│   └── globals.css         # Global styles
├── components/
│   ├── FlightList.tsx      # Flight listing component
│   ├── AddFlightForm.tsx   # Add flight form
│   ├── TransactionHistory.tsx # Transaction history
│   └── ui/                 # Radix UI components
│       ├── tabs.tsx
│       ├── dialog.tsx
│       ├── toast.tsx
│       └── button.tsx
├── hooks/
│   ├── useContract.ts      # Contract interaction hooks
│   └── useTransactionHistory.ts # Transaction history hook
├── config/
│   ├── contracts.ts        # Contract addresses & ABI
│   └── wagmi.ts           # wagmi configuration
├── lib/
│   └── utils.ts           # Utility functions
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── .env.local             # Environment variables
```

---

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x604923E8D9d7938DE98Dd5aE193d6eea0336206A
NEXT_PUBLIC_PAUSER_SET_ADDRESS=0x89101063912C3e471dA0ead7142BD430f423de2D
```

Get WalletConnect Project ID from: https://cloud.walletconnect.com

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 📝 Key Component Files

### components/ui/tabs.tsx

```typescript
'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

### components/FlightList.tsx

```typescript
'use client';

import { useFlightBookingContract, useFlight } from '@/hooks/useContract';
import { Loader2, Plane, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

function FlightCard({ flightId }: { flightId: number }) {
  const { flight, isLoading, refetch } = useFlight(flightId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!flight) return null;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Plane className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {flight.origin} → {flight.destination}
            </h3>
            <p className="text-sm text-gray-600">Flight #{flightId}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            flight.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {flight.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(Number(flight.departureTime) * 1000), 'MMM dd, HH:mm')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span>
            {Number(flight.availableSeats)}/{Number(flight.totalSeats)} seats
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-600">Operated by</span>
        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
          {flight.airline.slice(0, 6)}...{flight.airline.slice(-4)}
        </span>
      </div>
    </div>
  );
}

export function FlightList() {
  const { nextFlightId, isLoading } = useFlightBookingContract();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalFlights = nextFlightId ? Number(nextFlightId) - 1 : 0;

  if (totalFlights === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plane className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Flights Available</h3>
        <p className="text-gray-600">
          Be the first to add a flight to the system
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Available Flights</h2>
        <span className="text-sm text-gray-600">{totalFlights} flights found</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: totalFlights }, (_, i) => i + 1).map((flightId) => (
          <FlightCard key={flightId} flightId={flightId} />
        ))}
      </div>
    </div>
  );
}
```

### components/AddFlightForm.tsx

```typescript
'use client';

import { useState } from 'react';
import { useFlightBookingContract } from '@/hooks/useContract';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Loader2, Plane, Check, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';

export function AddFlightForm() {
  const { address } = useAccount();
  const { addFlight, isLoading, isSuccess, isError, error } = useFlightBookingContract();
  const { addPendingTransaction, updateTransactionStatus } = useTransactionHistory();

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    totalSeats: '',
    basePrice: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const departure = new Date(`${formData.departureDate}T${formData.departureTime}`);
      const arrival = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);

      const hash = await addFlight(
        formData.origin,
        formData.destination,
        BigInt(Math.floor(departure.getTime() / 1000)),
        BigInt(Math.floor(arrival.getTime() / 1000)),
        parseInt(formData.totalSeats),
        parseInt(formData.basePrice)
      );

      if (hash && address) {
        addPendingTransaction({
          hash,
          type: 'FlightAdded',
          from: address,
        });
      }

      // Reset form on success
      setFormData({
        origin: '',
        destination: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        totalSeats: '',
        basePrice: '',
      });
    } catch (err) {
      console.error('Failed to add flight:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plane className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Add New Flight</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Origin</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., NYC"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Destination</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., LAX"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Departure Date</label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Departure Time</label>
            <input
              type="time"
              value={formData.departureTime}
              onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Arrival Date</label>
            <input
              type="date"
              value={formData.arrivalDate}
              onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Arrival Time</label>
            <input
              type="time"
              value={formData.arrivalTime}
              onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Seats</label>
            <input
              type="number"
              value={formData.totalSeats}
              onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 180"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Base Price (wei)</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1000"
              min="0"
              required
            />
          </div>
        </div>

        {isError && error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error.message || 'Failed to add flight'}</span>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Flight added successfully!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Adding Flight...' : 'Add Flight'}
        </button>
      </form>
    </div>
  );
}
```

### components/TransactionHistory.tsx

```typescript
'use client';

import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { format } from 'date-fns';
import { ExternalLink, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { NETWORK_CONFIG } from '@/config/contracts';

export function TransactionHistory() {
  const { transactions, isLoading } = useTransactionHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Transaction History</h3>
        <p className="text-gray-600">
          Your transactions will appear here once you start interacting with the contract
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.hash} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {tx.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                  {tx.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {tx.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="font-semibold">{tx.type}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : tx.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {tx.flightId && <div>Flight ID: {tx.flightId}</div>}
                  {tx.bookingId && <div>Booking ID: {tx.bookingId}</div>}
                  <div>{format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm:ss')}</div>
                </div>
              </div>
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs font-mono text-gray-500 break-all">
                {tx.hash}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### lib/utils.ts

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 🚀 Vercel Deployment

### 1. Create `vercel.json` in frontend directory

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod
```

### 3. Configure Environment Variables in Vercel Dashboard

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_PAUSER_SET_ADDRESS`

---

## ✨ Features Implemented

### ✅ Core Features
- [x] RainbowKit wallet connection
- [x] wagmi for contract interactions
- [x] TypeScript for type safety
- [x] Tailwind CSS for styling
- [x] Radix UI headless components

### ✅ Loading States
- [x] Skeleton loaders for flight cards
- [x] Spinner for transaction submissions
- [x] Loading indicators throughout UI
- [x] Pending transaction states

### ✅ Error Handling
- [x] Contract error messages display
- [x] Transaction failure handling
- [x] Form validation errors
- [x] Network error handling
- [x] User-friendly error messages

### ✅ Transaction History
- [x] Real-time transaction tracking
- [x] Event log parsing
- [x] LocalStorage persistence
- [x] Transaction status updates
- [x] Etherscan links
- [x] Filtered by user address

### ✅ UI/UX
- [x] Responsive design
- [x] Modern gradient backgrounds
- [x] Smooth animations
- [x] Hover effects
- [x] Tab navigation
- [x] Status badges
- [x] Icon integration (lucide-react)

---

## 📱 Responsive Design

The frontend is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid

---

## 🔧 Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🌐 Live Demo

After deployment, your app will be live at:
- **Vercel**: `https://your-project.vercel.app`

---

## 📄 License

MIT License

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
**Network**: Sepolia Testnet
