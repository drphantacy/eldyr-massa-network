'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useElydr } from '@/context/ElydrContext';
import { CountdownTimer, YieldSourceCard, PetCard } from '@/components';

type MintStep = 'connect' | 'mint' | 'link' | 'complete';

export default function MintPage() {
  const router = useRouter();
  const {
    wallet,
    connectWallet,
    currentPet,
    mintPet,
    linkYieldSource,
    yieldSources,
    isLoading,
  } = useElydr();

  const [step, setStep] = useState<MintStep>(() => {
    if (!wallet.isConnected) return 'connect';
    if (!currentPet) return 'mint';
    if (!currentPet.linkedYieldSourceId) return 'link';
    return 'complete';
  });
  const [selectedYieldSource, setSelectedYieldSource] = useState<string | null>(null);
  const [mintingState, setMintingState] = useState<'idle' | 'minting' | 'success'>('idle');

  const handleConnect = () => {
    connectWallet();
    setTimeout(() => setStep('mint'), 1000);
  };

  const handleMint = async () => {
    setMintingState('minting');
    try {
      await mintPet();
      setMintingState('success');
      setStep('link');
    } catch (error) {
      console.error('Mint error:', error);
      setMintingState('idle');
    }
  };

  const handleLinkYield = () => {
    if (!selectedYieldSource) return;
    linkYieldSource(selectedYieldSource);
    setStep('complete');
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Mint Your Elydr</h1>
          <p className="text-cosmic-400 max-w-lg mx-auto">
            Create your own mythical pet on Massa. Each Elydr starts as an egg, ready to evolve
            based on your DeFi yield.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-12">
          {['connect', 'mint', 'link', 'complete'].map((s, i) => {
            const stepIndex = ['connect', 'mint', 'link', 'complete'].indexOf(step);
            const isActive = s === step;
            const isComplete = i < stepIndex;

            return (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-mythic-purple text-white ring-4 ring-mythic-purple/30'
                      : 'bg-cosmic-800 text-cosmic-500'
                  }`}
                >
                  {isComplete ? '✓' : i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 md:w-20 h-1 ${
                      isComplete ? 'bg-green-500' : 'bg-cosmic-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
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
                Connect your Massa wallet to start minting your Elydr.
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
              <h2 className="text-2xl font-bold text-white mb-2">Mint Your Elydr Egg</h2>
              <p className="text-cosmic-400 mb-4 max-w-md mx-auto">
                Each Elydr egg is unique. What creature hatches depends on how you nurture it with yield!
              </p>

              <div className="inline-block bg-cosmic-800/50 rounded-lg px-4 py-2 mb-8">
                <span className="text-cosmic-400 text-sm">Connected: </span>
                <span className="text-white font-mono">{wallet.address}</span>
              </div>

              {mintingState === 'minting' ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-mythic-purple border-t-transparent rounded-full animate-spin" />
                  <p className="text-cosmic-300">Minting your Elydr...</p>
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

          {step === 'link' && currentPet && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Link a Yield Source</h2>
                <p className="text-cosmic-400 max-w-md mx-auto">
                  Your Elydr feeds on DeFi yield. Higher and more consistent APY leads to mythic evolutions!
                </p>
              </div>

              <div className="max-w-xs mx-auto mb-8">
                <PetCard pet={currentPet} showStats={false} />
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
                  disabled={!selectedYieldSource}
                  className="px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Link Yield Source
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && currentPet && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center animate-glow">
                <span className="text-5xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Elydr is Ready!</h2>
              <p className="text-cosmic-400 mb-8 max-w-md mx-auto">
                Your Elydr egg is now linked to a yield source. The autonomous contracts will check every 30 minutes to award growth points.
              </p>

              <div className="max-w-sm mx-auto mb-8">
                <PetCard
                  pet={currentPet}
                  yieldSource={yieldSources.find((s) => s.id === currentPet.linkedYieldSourceId)}
                />
              </div>

              <div className="flex justify-center mb-8">
                <CountdownTimer targetDate={currentPet.nextCheckAt} label="Next evolution check" />
              </div>

              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity btn-glow"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-cosmic-900/30 border border-cosmic-700/30 rounded-xl p-6">
          <h3 className="text-white font-bold mb-2">How It Works</h3>
          <ul className="text-cosmic-400 text-sm space-y-1">
            <li>• Connect your Massa wallet (MassaStation, Bearby, or MetaMask Snap)</li>
            <li>• Mint an Elydr egg NFT on the Massa blockchain</li>
            <li>• Link a DeFi yield source to fuel your pet&apos;s evolution</li>
            <li>• Autonomous smart contracts check yield every 30 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
