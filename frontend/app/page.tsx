'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { FlightList } from '@/components/FlightList';
import { AddFlightForm } from '@/components/AddFlightForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Lock, Shield, Zap } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b-0 rounded-none">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              boxShadow: '0 4px 12px rgba(109, 110, 255, 0.3)'
            }}>
              <Plane className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                Confidential Flight Booking
              </h1>
              <p className="text-xs md:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Privacy-preserving with FHE encryption
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <ConnectButton />
          </div>
        </div>
        {/* Mobile wallet button */}
        <div className="md:hidden px-4 pb-4">
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {!isConnected ? (
          <div className="max-w-3xl mx-auto text-center py-12 md:py-20 fade-in">
            <div className="glass-panel p-8 md:p-12">
              {/* Icon */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-border)'
              }}>
                <Plane className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Welcome to Confidential Flight Booking
              </h2>
              <p className="text-base md:text-lg mb-8" style={{ color: 'var(--color-text-muted)' }}>
                Connect your wallet to start booking flights with complete privacy using Fully Homomorphic Encryption
              </p>

              {/* Connect Button */}
              <div className="mb-10">
                <ConnectButton />
              </div>

              {/* Features */}
              <div className="pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="stat-card-glass fade-in">
                    <div className="flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="stat-label">FHE Encrypted</div>
                    <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                      Passenger Data
                    </div>
                  </div>
                  <div className="stat-card-glass fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-center mb-3">
                      <Shield className="w-6 h-6" style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="stat-label">Sepolia Testnet</div>
                    <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                      Deployed
                    </div>
                  </div>
                  <div className="stat-card-glass fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-center mb-3">
                      <Zap className="w-6 h-6" style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="stat-label">100% Private</div>
                    <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                      Bookings
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <span className="badge-encrypted">FHE POWERED</span>
                <span className="badge-success">LIVE ON SEPOLIA</span>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="flights" className="space-y-6 fade-in">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 glass-panel p-1">
              <TabsTrigger value="flights" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white rounded-full transition-all">
                Flights
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white rounded-full transition-all">
                Add Flight
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white rounded-full transition-all">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flights" className="space-y-4">
              <FlightList />
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="max-w-2xl mx-auto">
                <AddFlightForm />
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel rounded-none mt-20 py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <p className="mb-2">
            Confidential Flight Booking System • Built with Next.js, TypeScript, wagmi & RainbowKit
          </p>
          <p className="address-mono" style={{ color: 'var(--color-text-muted)' }}>
            Contract: 0x604923E8D9d7938DE98Dd5aE193d6eea0336206A (Sepolia)
          </p>
        </div>
      </footer>
    </div>
  );
}
