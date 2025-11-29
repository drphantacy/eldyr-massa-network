'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useElydr } from '@/context/ElydrContext';
import { CountdownTimer, YieldSourceCard, PetCard, StepIndicator } from '@/components';
import { EXPLORER_URL } from '@/lib/contract';

type MintStep = 'connect' | 'mint' | 'link' | 'complete';

export default function MintPage() {
  const router = useRouter();
  const {
    wallet,
    connectWallet,
    pets,
    currentPet,
    mintPet,
    linkYieldSource,
    refreshPetsFromChain,
    yieldSources,
    isLoading,
    contractAddress,
    network,
  } = useElydr();

  const [step, setStep] = useState<MintStep>('connect');
  const [selectedYieldSource, setSelectedYieldSource] = useState<string | null>(null);
  const [mintingState, setMintingState] = useState<'idle' | 'minting' | 'success'>('idle');
  const [isLinking, setIsLinking] = useState(false);
  const [isRefreshingEvolution, setIsRefreshingEvolution] = useState(false);
  const [justMintedPetId, setJustMintedPetId] = useState<string | null>(null);

  const handleEvolutionComplete = useCallback(async () => {
    setIsRefreshingEvolution(true);
    try {
      await refreshPetsFromChain();
    } finally {
      setIsRefreshingEvolution(false);
    }
  }, [refreshPetsFromChain]);

  const justMintedPet = justMintedPetId ? pets.find(p => p.id === justMintedPetId) : null;

  // Determine which pet to show in link/complete steps
  const activePet = justMintedPet || (currentPet && !currentPet.linkedYieldSourceId ? currentPet : null);

  useEffect(() => {
    if (!wallet.isConnected) {
      setStep('connect');
    } else if (justMintedPetId) {
      // User just minted in this session
      if (justMintedPet && !justMintedPet.linkedYieldSourceId) {
        setStep('link');
      } else if (justMintedPet && justMintedPet.linkedYieldSourceId) {
        setStep('complete');
      } else {
        setStep('mint');
      }
    } else if (currentPet && !currentPet.linkedYieldSourceId) {
      // Has an existing pet without linked yield source
      setStep('link');
    } else {
      // All pets linked or no pets - show mint
      setStep('mint');
    }
  }, [wallet.isConnected, justMintedPetId, justMintedPet, currentPet]);

  const handleConnect = () => {
    connectWallet();
  };

  const handleMint = async () => {
    setMintingState('minting');
    try {
      const petId = await mintPet();
      setJustMintedPetId(petId);
      setMintingState('success');
    } catch (error) {
      console.error('Mint error:', error);
      setMintingState('idle');
    }
  };

  const handleMintAnother = () => {
    setJustMintedPetId(null);
    setMintingState('idle');
    setSelectedYieldSource(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkYield = async () => {
    if (!selectedYieldSource) return;
    setIsLinking(true);

    const maxRetries = 5;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await linkYieldSource(selectedYieldSource);
        setIsLinking(false);
        return;
      } catch (error) {
        lastError = error as Error;
        console.log(`Link attempt ${attempt}/${maxRetries} failed, retrying...`);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    setIsLinking(false);
    console.error('Failed to link yield source after all retries:', lastError);
    throw lastError;
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Mint Your Eldyr</h1>
          <p className="text-cosmic-400 max-w-lg mx-auto">
            Create your own mythical pet on Massa. Each Eldyr starts as an egg, ready to evolve
            based on your DeFi yield.
          </p>
        </div>

        <div className="mb-12">
          <StepIndicator steps={['connect', 'mint', 'link', 'complete']} currentStep={step} />
        </div>

        <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-2xl p-8 backdrop-blur-sm">
          {step === 'connect' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-cosmic-800 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-mythic-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-cosmic-400 mb-8 max-w-md mx-auto">
                Connect your Massa wallet to start minting your Eldyr.
              </p>
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
              <p className="text-cosmic-600 text-sm mt-4">
                Supports MassaStation, Bearby, and MetaMask Snap
              </p>
            </div>
          )}

          {step === 'mint' && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center animate-float">
                <span className="text-5xl">🥚</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Mint Your Eldyr Egg</h2>
              <p className="text-cosmic-400 mb-4 max-w-md mx-auto">
                Each Eldyr egg is unique. What creature hatches depends on how you nurture it with yield!
              </p>

              <div className="inline-block bg-cosmic-800/50 rounded-lg px-4 py-2 mb-8 group cursor-pointer text-center">
                <span className="text-cosmic-400 text-sm">Connected: </span>
                <span className="text-white font-mono text-sm relative">
                  <span className="invisible">{wallet.address}</span>
                  <span className="absolute inset-0 group-hover:opacity-0">{wallet.address?.slice(0, 24)}<span className="tracking-widest">xxxxxx</span>{wallet.address?.slice(30)}</span>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100">{wallet.address}</span>
                </span>
              </div>

              {mintingState === 'minting' ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-mythic-purple border-t-transparent rounded-full animate-spin" />
                  <p className="text-cosmic-300">Minting your Eldyr...</p>
                  <p className="text-cosmic-500 text-sm mt-2">Waiting for chain confirmation</p>
                </div>
              ) : mintingState === 'success' ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-400 font-bold">Mint Successful!</p>
                </div>
              ) : (
                <button
                  onClick={handleMint}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 btn-glow"
                >
                  Mint Egg
                </button>
              )}

              <div className="mt-8 p-4 bg-cosmic-800/30 rounded-lg">
                <p className="text-cosmic-500 text-sm">
                  <span className="text-mythic-gold">Cost:</span> 0.1 MAS •
                  <span className="text-mythic-cyan ml-2">Gas:</span> ~0.001 MAS
                </p>
              </div>
            </div>
          )}

          {step === 'link' && activePet && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Link a Yield Source</h2>
                <p className="text-cosmic-400 max-w-md mx-auto">
                  Your Eldyr feeds on DeFi yield. Higher and more consistent APY leads to mythic evolutions!
                </p>
              </div>

              <div className="max-w-xs mx-auto mb-8">
                <PetCard pet={activePet} showStats={false} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {yieldSources.map((source) => (
                  <YieldSourceCard
                    key={source.id}
                    source={source}
                    isSelected={selectedYieldSource === source.id}
                    onSelect={setSelectedYieldSource}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleLinkYield}
                  disabled={!selectedYieldSource || isLinking}
                  className="px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLinking ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Linking...
                    </span>
                  ) : (
                    'Link Yield Source'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && justMintedPet && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center animate-glow">
                <span className="text-5xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Eldyr is Ready!</h2>
              <p className="text-cosmic-400 mb-8 max-w-md mx-auto">
                Your Eldyr egg is now linked to a yield source. The autonomous contracts will check every 3 minutes to award growth points.
              </p>

              <div className="max-w-sm mx-auto mb-8">
                <PetCard
                  pet={justMintedPet}
                  yieldSource={yieldSources.find((s) => s.id === justMintedPet.linkedYieldSourceId)}
                />
              </div>

              <div className="flex justify-center mb-8">
                <CountdownTimer
                  targetDate={justMintedPet.nextCheckAt}
                  label="Next evolution check"
                  onComplete={handleEvolutionComplete}
                  isRefreshing={isRefreshingEvolution}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleContinue}
                  className="px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity btn-glow"
                >
                  Continue to Dashboard
                </button>
                <button
                  onClick={handleMintAnother}
                  className="px-8 py-4 bg-cosmic-800 border border-cosmic-600 text-white font-bold rounded-xl hover:bg-cosmic-700 transition-colors"
                >
                  Mint Another Egg
                </button>
              </div>

              {pets.length > 1 && (
                <p className="text-cosmic-400 text-sm mt-4">
                  You have {pets.length} Eldyrs in your collection
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-cosmic-900/30 border border-cosmic-700/30 rounded-xl p-6">
          <h3 className="text-white font-bold mb-2">How It Works</h3>
          <ul className="text-cosmic-400 text-sm space-y-1">
            <li>• Connect your Massa wallet (MassaStation, Bearby, or MetaMask Snap)</li>
            <li>• Mint an Eldyr egg NFT on the Massa blockchain</li>
            <li>• Link a DeFi yield source to fuel your pet&apos;s evolution</li>
            <li>• Autonomous smart contracts check yield every 3 minutes</li>
          </ul>

          <div className="mt-4 pt-4 border-t border-cosmic-700/30">
            <p className="text-cosmic-500 text-xs">
              <span className="text-cosmic-400">Network:</span> {network}
            </p>
            <p className="text-cosmic-500 text-xs mt-1">
              <span className="text-cosmic-400">Contract:</span>{' '}
              <a
                href={`${EXPLORER_URL}/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mythic-cyan hover:underline font-mono"
              >
                {contractAddress.slice(0, 12)}...{contractAddress.slice(-8)}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
