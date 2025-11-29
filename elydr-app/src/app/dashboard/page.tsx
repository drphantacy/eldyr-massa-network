'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useElydr } from '@/context/ElydrContext';
import { PetCard, CountdownTimer, EvolutionLog, YieldSourceCard, Modal } from '@/components';

type TabType = 'summary' | 'details';

type ModalState = {
  isOpen: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
};

export default function DashboardPage() {
  const { wallet, pets, currentPet, selectedPetId, selectPet, yieldSources, simulateEvolution, stakeToPet, unstakeFromPet, releasePet, refreshPetsFromChain, error, isLoading, isLoadingPets } = useElydr();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [stakingTab, setStakingTab] = useState<'stake' | 'unstake'>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isRefreshingEvolution, setIsRefreshingEvolution] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const handleEvolutionComplete = useCallback(async () => {
    setIsRefreshingEvolution(true);
    try {
      await refreshPetsFromChain();
    } finally {
      setIsRefreshingEvolution(false);
    }
  }, [refreshPetsFromChain]);

  const linkedYieldSource = yieldSources.find(
    (s) => s.id === currentPet?.linkedYieldSourceId
  );

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to stake',
      });
      return;
    }
    try {
      await stakeToPet(stakeAmount);
      setStakeAmount('');
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Stake Successful!',
        message: `Successfully staked ${stakeAmount} MAS to your Eldyr.`,
      });
    } catch (err) {
      console.error('Stake failed:', err);
    }
  };

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    if (!unstakeAmount || amount <= 0) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to unstake',
      });
      return;
    }
    if (amount > (currentPet?.stakedAmount || 0)) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Insufficient Stake',
        message: `You can only unstake up to ${(currentPet?.stakedAmount || 0).toFixed(2)} MAS`,
      });
      return;
    }
    try {
      const percentage = Math.round((amount / (currentPet?.stakedAmount || 1)) * 100);
      await unstakeFromPet(percentage);
      setUnstakeAmount('');
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Unstake Successful!',
        message: `Successfully unstaked approximately ${amount.toFixed(2)} MAS from your Eldyr.`,
      });
    } catch (err) {
      console.error('Unstake failed:', err);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Unstake Failed',
        message: err instanceof Error ? err.message : 'Failed to unstake. Please try again.',
      });
    }
  };

  const handleRelease = () => {
    setModalState({
      isOpen: true,
      type: 'warning',
      title: 'Release Pet?',
      message: 'Are you sure you want to release this pet? This action cannot be undone. All staked MAS will be returned to you.',
      confirmText: 'Release',
      showCancel: true,
      onConfirm: async () => {
        try {
          await releasePet();
          setModalState({
            isOpen: true,
            type: 'success',
            title: 'Pet Released',
            message: 'Your Eldyr has been released and all staked MAS has been returned.',
          });
        } catch (err) {
          console.error('Release failed:', err);
        }
      },
    });
  };

  // Show loader while checking blockchain when wallet is connected
  if (wallet.isConnected && isLoadingPets) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-2xl p-12 backdrop-blur-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-cosmic-800 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-mythic-purple border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Fetching Your Eldyrs...</h2>
            <p className="text-cosmic-400 max-w-md mx-auto">
              Loading your pets from the blockchain...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show connect wallet prompt if not connected
  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-2xl p-12 backdrop-blur-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-cosmic-800 rounded-2xl flex items-center justify-center">
              <span className="text-5xl">🔗</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-cosmic-400 mb-8 max-w-md mx-auto">
              Connect your wallet to view your Eldyrs dashboard.
            </p>
            <Link
              href="/mint"
              className="inline-block px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Connect & Mint
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state only after loading is complete and no pets found
  if (!currentPet) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-2xl p-12 backdrop-blur-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-cosmic-800 rounded-2xl flex items-center justify-center">
              <span className="text-5xl">🥚</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Eldyr Found</h2>
            <p className="text-cosmic-400 mb-8 max-w-md mx-auto">
              You haven&apos;t minted an Eldyr yet. Start your journey by minting an egg!
            </p>
            <Link
              href="/mint"
              className="inline-block px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Mint Your Eldyr
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-cosmic-400">Monitor your Eldyr&apos;s growth and evolution</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl px-6 py-3 backdrop-blur-sm">
              <CountdownTimer
                targetDate={currentPet.nextCheckAt}
                label="Next autonomous check"
                onComplete={handleEvolutionComplete}
                isRefreshing={isRefreshingEvolution}
              />
            </div>
            <button
              onClick={simulateEvolution}
              className="px-6 py-2 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Simulate Autonomous Growth
            </button>
          </div>
        </div>

        {error &&
         !error.includes('readonly call failed') &&
         !error.includes('Pet does not exist') &&
         !error.includes('VM Error') && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-red-300 text-sm">⚠️ {error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mb-6 bg-mythic-purple/20 border border-mythic-purple rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-mythic-cyan text-sm">⏳ Processing transaction... Please approve in your wallet.</span>
            </div>
          </div>
        )}

        {pets.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-cosmic-400 text-sm">Your Eldyrs:</span>
              <span className="text-mythic-cyan text-sm font-bold">{pets.length}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => selectPet(pet.id)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all ${
                    (selectedPetId === pet.id || (!selectedPetId && pet.id === pets[0]?.id))
                      ? 'bg-gradient-to-r from-mythic-purple/30 to-mythic-cyan/30 border-2 border-mythic-purple'
                      : 'bg-cosmic-800/50 border border-cosmic-700/50 hover:border-cosmic-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {pet.stage === 'egg' ? '🥚' : pet.stage === 'hatchling' ? '🐣' : pet.stage === 'young' ? '🐉' : pet.stage === 'mature' ? '🔥' : '⚡'}
                    </span>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">{pet.name}</div>
                      <div className="text-cosmic-400 text-xs capitalize">{pet.stage} • Lv.{pet.level}</div>
                    </div>
                  </div>
                </button>
              ))}
              <Link
                href="/mint"
                className="flex-shrink-0 px-4 py-3 rounded-xl bg-cosmic-800/30 border border-dashed border-cosmic-600 hover:border-mythic-purple transition-colors flex items-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span className="text-cosmic-400 text-sm">Mint New</span>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <PetCard pet={currentPet} yieldSource={linkedYieldSource} size="lg" />

            <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl backdrop-blur-sm">
              <div className="px-4 py-3 border-b border-cosmic-700/50 flex justify-between items-center">
                <h3 className="text-white font-bold">Staking</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-cosmic-400">Staked: </span>
                  <span className="text-mythic-cyan font-bold ml-2">{(currentPet.stakedAmount || 0).toFixed(2)} MAS</span>
                </div>
              </div>

              <div className="flex gap-2 px-4 pt-3">
                <button
                  onClick={() => setStakingTab('stake')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    stakingTab === 'stake'
                      ? 'bg-mythic-purple text-white'
                      : 'bg-cosmic-800 text-cosmic-400 hover:text-white'
                  }`}
                >
                  Stake
                </button>
                <button
                  onClick={() => setStakingTab('unstake')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    stakingTab === 'unstake'
                      ? 'bg-mythic-purple text-white'
                      : 'bg-cosmic-800 text-cosmic-400 hover:text-white'
                  }`}
                >
                  Unstake
                </button>
              </div>

              <div className="p-4">
                {stakingTab === 'stake' ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Amount to stake (MAS)"
                      className="w-full px-3 py-2 bg-cosmic-800 border border-cosmic-600 rounded-lg text-white placeholder-cosmic-500 focus:outline-none focus:border-mythic-purple"
                      step="0.01"
                      min="0"
                    />
                    <button
                      onClick={handleStake}
                      disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isLoading || isLoadingPets}
                      className="w-full py-2 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Staking...' : isLoadingPets ? 'Loading...' : 'Stake'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="Amount to unstake (MAS)"
                      className="w-full px-3 py-2 bg-cosmic-800 border border-cosmic-600 rounded-lg text-white placeholder-cosmic-500 focus:outline-none focus:border-mythic-purple"
                      step="0.01"
                      min="0"
                      max={currentPet.stakedAmount || 0}
                    />
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => setUnstakeAmount(((currentPet.stakedAmount || 0) * 0.25).toFixed(2))}
                        className="px-2 py-1 bg-cosmic-800 text-cosmic-400 rounded hover:text-white transition-colors"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => setUnstakeAmount(((currentPet.stakedAmount || 0) * 0.5).toFixed(2))}
                        className="px-2 py-1 bg-cosmic-800 text-cosmic-400 rounded hover:text-white transition-colors"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setUnstakeAmount(((currentPet.stakedAmount || 0) * 0.75).toFixed(2))}
                        className="px-2 py-1 bg-cosmic-800 text-cosmic-400 rounded hover:text-white transition-colors"
                      >
                        75%
                      </button>
                      <button
                        onClick={() => setUnstakeAmount((currentPet.stakedAmount || 0).toFixed(2))}
                        className="px-2 py-1 bg-cosmic-800 text-cosmic-400 rounded hover:text-white transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    <button
                      onClick={handleUnstake}
                      disabled={!currentPet.stakedAmount || currentPet.stakedAmount === 0 || isLoading || isLoadingPets || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                      className="w-full py-2 bg-cosmic-800 border border-cosmic-600 text-white font-medium rounded-lg hover:bg-cosmic-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Unstaking...' : isLoadingPets ? 'Loading...' : 'Unstake'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-white font-bold mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/battleground"
                  className="block w-full py-3 bg-cosmic-800 text-center text-white font-medium rounded-lg hover:bg-cosmic-700 transition-colors"
                >
                  Enter Battleground
                </Link>
                <button
                  onClick={handleRelease}
                  className="w-full py-3 bg-red-900/50 border border-red-700 text-red-300 font-medium rounded-lg hover:bg-red-900 transition-colors"
                >
                  Release Pet
                </button>
              </div>
            </div>

          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'summary'
                    ? 'bg-mythic-purple text-white'
                    : 'bg-cosmic-800 text-cosmic-400 hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-mythic-purple text-white'
                    : 'bg-cosmic-800 text-cosmic-400 hover:text-white'
                }`}
              >
                Details
              </button>
            </div>

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Stage</div>
                    <div className="text-white text-xl font-bold capitalize">{currentPet.stage}</div>
                  </div>
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Path</div>
                    <div className={`text-xl font-bold capitalize ${
                      currentPet.path === 'mythic' ? 'text-mythic-purple' :
                      currentPet.path === 'common' ? 'text-cosmic-300' : 'text-cosmic-500'
                    }`}>
                      {currentPet.path === 'undetermined' ? '???' : currentPet.path}
                    </div>
                  </div>
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Total Growth</div>
                    <div className="text-mythic-cyan text-xl font-bold">{currentPet.totalGrowthPoints}</div>
                  </div>
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Checks</div>
                    <div className="text-white text-xl font-bold">{currentPet.history.length}</div>
                  </div>
                </div>

                {linkedYieldSource && (
                  <div>
                    <h3 className="text-white font-bold mb-3">Linked Yield Source</h3>
                    <YieldSourceCard source={linkedYieldSource} isSelected />
                  </div>
                )}

                <EvolutionLog events={currentPet.history} initialLimit={5} />
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-white font-bold mb-4">Combat Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-cosmic-400">Power</span>
                        <span className="text-mythic-flame font-bold">{currentPet.power}</span>
                      </div>
                      <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mythic-flame to-red-400"
                          style={{ width: `${Math.min(currentPet.power * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-cosmic-400">Defense</span>
                        <span className="text-mythic-cyan font-bold">{currentPet.defense}</span>
                      </div>
                      <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mythic-cyan to-blue-400"
                          style={{ width: `${Math.min(currentPet.defense * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-cosmic-400">Agility</span>
                        <span className="text-mythic-gold font-bold">{currentPet.agility}</span>
                      </div>
                      <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mythic-gold to-yellow-400"
                          style={{ width: `${Math.min(currentPet.agility * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-white font-bold mb-4">Pet Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-cosmic-400 text-sm">Pet ID</div>
                      <div className="text-white font-mono">#{currentPet.id}</div>
                    </div>
                    <div>
                      <div className="text-cosmic-400 text-sm">Sprite Type</div>
                      <div className="text-white capitalize">{currentPet.spriteType}</div>
                    </div>
                    <div>
                      <div className="text-cosmic-400 text-sm">Level</div>
                      <div className="text-white">{currentPet.level}</div>
                    </div>
                    <div>
                      <div className="text-cosmic-400 text-sm">Minted At</div>
                      <div className="text-white text-sm">
                        {new Date(currentPet.mintedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <EvolutionLog events={currentPet.history} initialLimit={10} />
              </div>
            )}
          </div>
        </div>

      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
}
