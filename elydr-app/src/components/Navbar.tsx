'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useElydr } from '@/context/ElydrContext';

export function Navbar() {
  const pathname = usePathname();
  const {
    wallet,
    connectWallet,
    disconnectWallet,
    isLoading,
    walletError,
  } = useElydr();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/mint', label: 'Mint' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/battleground', label: 'Battleground' },
  ];

  const handleConnect = async () => {
    await connectWallet();
  };

  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cosmic-950/80 backdrop-blur-md border-b border-cosmic-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-mythic-purple to-mythic-cyan rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-mythic-purple to-mythic-cyan bg-clip-text text-transparent">
              Elydr
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-cosmic-800 text-white'
                    : 'text-cosmic-300 hover:text-white hover:bg-cosmic-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {wallet.isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs text-cosmic-400">{wallet.networkName}</span>
                  <span className="text-sm text-white font-mono">{truncateAddress(wallet.address)}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-cosmic-800 hover:bg-cosmic-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-mythic-purple to-mythic-cyan hover:opacity-90 text-white text-sm font-medium rounded-lg transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>

                {walletError && (
                  <div className="absolute right-0 mt-2 w-64 bg-red-900/90 border border-red-700 rounded-xl p-3">
                    <p className="text-red-200 text-xs">{walletError}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button className="p-2 text-cosmic-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
