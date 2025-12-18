'use client'

import { LeaderboardEntry } from '../../types/firebase'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentPlayerId?: string
  maxEntries?: number
  showLiveIndicator?: boolean
}

export function Leaderboard({
  entries,
  currentPlayerId,
  maxEntries = 5,
  showLiveIndicator = true,
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxEntries)

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-400 text-yellow-900 border-2 border-yellow-500 font-black' // Gold
      case 1: return 'bg-gray-300 text-gray-700 border-2 border-gray-400 font-bold' // Silver
      case 2: return 'bg-amber-600 text-amber-100 border-2 border-amber-700 font-bold' // Bronze
      default: return 'bg-white text-black border-2 border-black'
    }
  }

  return (
    <div className="bg-white backdrop-blur-xl border-2 border-black rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b-2 border-black">
        <h2 className="text-xl font-bold text-black">Leaderboard</h2>
        {showLiveIndicator && (
          <div className="flex items-center gap-2 text-sm text-black">
            <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
            Live
          </div>
        )}
      </div>
      
      <div className="divide-y divide-black/10">
        {displayEntries.length === 0 ? (
          <div className="p-8 text-center text-black/50">
            No scores yet
          </div>
        ) : (
          displayEntries.map((entry, index) => (
            <div
              key={entry.playerId}
              className={`flex items-center justify-between p-4 transition-colors ${
                entry.playerId === currentPlayerId ? 'bg-black/10' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${getMedalColor(index)}
                `}>
                  {index + 1}
                </div>
                <div>
                  <span className={`font-bold ${
                    entry.playerId === currentPlayerId ? 'text-black' : 'text-black/80'
                  }`}>
                    {entry.playerName}
                  </span>
                  {entry.playerId === currentPlayerId && (
                    <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full font-bold">
                      YOU
                    </span>
                  )}
                </div>
              </div>
              <div className="font-mono font-bold text-black text-lg">
                {entry.score}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
