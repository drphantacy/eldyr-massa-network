import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-cosmic-950 border-t border-cosmic-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-mythic-purple to-mythic-cyan rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-mythic-purple to-mythic-cyan bg-clip-text text-transparent">
                Elydr
              </span>
            </Link>
            <p className="text-cosmic-400 text-sm max-w-md">
              Autonomous mythical pets born from on-chain yield. Powered by Massa&apos;s
              revolutionary autonomous smart contracts.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mint" className="text-cosmic-400 hover:text-white text-sm transition-colors">
                  Mint Elydr
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-cosmic-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/battleground" className="text-cosmic-400 hover:text-white text-sm transition-colors">
                  Battleground
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://massa.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmic-400 hover:text-white text-sm transition-colors"
                >
                  Massa Network
                </a>
              </li>
              <li>
                <a
                  href="https://docs.massa.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmic-400 hover:text-white text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <span className="text-cosmic-500 text-sm">
                  Smart Contracts (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cosmic-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cosmic-500 text-sm">
            &copy; {new Date().getFullYear()} Elydr. Built on Massa.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-cosmic-500 text-xs">Powered by</span>
            <span className="text-mythic-cyan text-xs font-semibold">
              Autonomous Smart Contracts
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
