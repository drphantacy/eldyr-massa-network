import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar, Footer } from '@/components';
import { ElydrProvider } from '@/context/ElydrContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Eldyr - Autonomous Mythical Pets on Massa',
  description:
    'Mint, grow, and battle mythical pets powered by DeFi yield and Massa autonomous smart contracts.',
  keywords: ['Massa', 'NFT', 'DeFi', 'Autonomous', 'Web3', 'Blockchain', 'Pets'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-cosmic-950 text-white antialiased`}>
        <ElydrProvider>
          <div className="min-h-screen flex flex-col cosmic-bg stars">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </ElydrProvider>
      </body>
    </html>
  );
}
