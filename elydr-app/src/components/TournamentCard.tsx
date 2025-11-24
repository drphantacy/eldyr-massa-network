'use client';

import { Tournament } from '@/types';
import { useState } from 'react';

interface TournamentCardProps {
  tournament: Tournament;
  onEnter?: (tournamentId: string) => void;
}

const statusColors = {
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-cosmic-600/20 text-cosmic-400 border-cosmic-600/30',
};

export function TournamentCard({ tournament, onEnter }: TournamentCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [entered, setEntered] = useState(false);

  const handleEnter = () => {
    setShowModal(true);
  };

  const confirmEntry = () => {
    setEntered(true);
    setShowModal(false);
    onEnter?.(tournament.id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEnter = tournament.status === 'active' && !entered;

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
        ) : entered ? (
          <button
            disabled
            className="w-full py-2 bg-green-600/20 text-green-400 font-medium rounded-lg border border-green-500/30"
          >
            Entered
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
          <div className="modal-content">
            <h3 className="text-white text-xl font-bold mb-2">Enter Tournament</h3>
            <p className="text-cosmic-300 mb-4">
              You&apos;re about to enter <span className="text-white">{tournament.name}</span>.
              This will cost <span className="text-mythic-gold">{tournament.entryFee}</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={confirmEntry} className="flex-1 btn-primary py-2 px-4">
                Confirm Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
