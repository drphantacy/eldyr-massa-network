'use client';

import { Tournament, ElydrPet } from '@/types';
import { useState } from 'react';

interface TournamentCardProps {
  tournament: Tournament;
  pets?: ElydrPet[];
  enteredPetId?: string;
  onEnter?: (tournamentId: string, petId: string) => void;
}

const statusColors = {
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-cosmic-600/20 text-cosmic-400 border-cosmic-600/30',
};

export function TournamentCard({ tournament, pets = [], enteredPetId, onEnter }: TournamentCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const handleEnter = () => {
    setShowModal(true);
    setSelectedPetId(null);
  };

  const confirmEntry = () => {
    if (!selectedPetId) return;
    setShowModal(false);
    onEnter?.(tournament.id, selectedPetId);
  };

  const stageOrder: Record<string, number> = {
    egg: 0,
    hatchling: 1,
    young: 2,
    mature: 3,
    elder: 4,
  };

  const minStageLevel = stageOrder[tournament.minStage] || 0;

  const eligiblePets = pets.filter((pet) => {
    const petStageLevel = stageOrder[pet.stage] || 0;
    return petStageLevel >= minStageLevel;
  });

  const getStageEmoji = (stage: string) => {
    const emojis: Record<string, string> = {
      egg: '🥚',
      hatchling: '🐣',
      young: '🦅',
      mature: '🐉',
      elder: '👑',
    };
    return emojis[stage] || '🥚';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEnter = tournament.status === 'active' && !enteredPetId && eligiblePets.length > 0;

  return (
    <>
      <div className="card p-5 hover:border-mythic-purple/50 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-bold text-lg">{tournament.name}</h3>
            <span className={`badge border mt-1 ${statusColors[tournament.status]}`}>
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-mythic-gold font-bold">{tournament.rewardAmount}</div>
            <div className="stat-label">Prize Pool</div>
          </div>
        </div>

        <p className="text-cosmic-300 text-sm mb-4">{tournament.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="stat-box">
            <div className="stat-label">Min Stage</div>
            <div className="text-white text-sm capitalize">{tournament.minStage}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Path Required</div>
            <div className="text-white text-sm capitalize">{tournament.requiredPath || 'Any'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Entry Fee</div>
            <div className="text-white text-sm">{tournament.entryFee}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Participants</div>
            <div className="text-white text-sm">{tournament.participantsCount}/{tournament.maxParticipants}</div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted mb-4">
          <span>Starts: {formatDate(tournament.startTime)}</span>
          <span>Ends: {formatDate(tournament.endTime)}</span>
        </div>

        {canEnter ? (
          <button
            onClick={handleEnter}
            className="w-full py-2 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Enter Tournament
          </button>
        ) : enteredPetId ? (
          <button
            disabled
            className="w-full py-2 bg-green-600/20 text-green-400 font-medium rounded-lg border border-green-500/30"
          >
            Entered (Pet #{enteredPetId})
          </button>
        ) : tournament.status === 'upcoming' ? (
          <button
            disabled
            className="w-full py-2 bg-cosmic-800 text-cosmic-400 font-medium rounded-lg"
          >
            Coming Soon
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2 bg-cosmic-800 text-cosmic-500 font-medium rounded-lg"
          >
            Completed
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <h3 className="text-white text-xl font-bold mb-2">Select Pet for Tournament</h3>
            <p className="text-cosmic-300 mb-4">
              Choose which Elydr to enter in <span className="text-white">{tournament.name}</span>.
              Entry fee: <span className="text-mythic-gold">{tournament.entryFee}</span>
            </p>

            {eligiblePets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-cosmic-400">
                  You don&apos;t have any pets that meet the minimum stage requirement
                  (<span className="text-white capitalize">{tournament.minStage}</span>).
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
                {eligiblePets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedPetId === pet.id
                        ? 'border-mythic-purple bg-mythic-purple/10'
                        : 'border-cosmic-700 bg-cosmic-900/30 hover:border-cosmic-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getStageEmoji(pet.stage)}</div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium">{pet.name}</div>
                        <div className="text-cosmic-400 text-sm capitalize">
                          {pet.stage} • Level {pet.level}
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <div className="text-center">
                          <div className="text-mythic-flame font-bold">{pet.power}</div>
                          <div className="text-cosmic-500">PWR</div>
                        </div>
                        <div className="text-center">
                          <div className="text-mythic-cyan font-bold">{pet.defense}</div>
                          <div className="text-cosmic-500">DEF</div>
                        </div>
                        <div className="text-center">
                          <div className="text-mythic-gold font-bold">{pet.agility}</div>
                          <div className="text-cosmic-500">AGI</div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button
                onClick={confirmEntry}
                disabled={!selectedPetId}
                className="flex-1 btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
