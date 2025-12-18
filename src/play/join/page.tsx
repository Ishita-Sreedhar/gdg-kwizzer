'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { firestoreService } from '../../lib/firestore'
import { Game } from '../../types/firebase'

export default function JoinGamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [joinCode, setJoinCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [game, setGame] = useState<Game | null>(null)

  async function handleFindGame(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const foundGame = await firestoreService.getGameByJoinCode(joinCode.toUpperCase())
      if (!foundGame) {
        setError('Game not found. Check the code.')
        return
      }
      
      if (foundGame.phase === 'ended') {
        setError('This game has already ended.')
        return
      }
      
      setGame(foundGame)
    } catch (err: any) {
      setError(err.message || 'Failed to find game')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinGame(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!game || !user) return

      const playerData = {
        id: user.uid,
        name: playerName.trim() || user.displayName || user.email?.split('@')[0] || 'Player',
        score: 0,
        joinedAt: new Date()
      }

      await firestoreService.addPlayerToGame(game.id, playerData)
      navigate(`/play/game/${game.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to join game')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 gap-6 w-full">
        <h1 className="text-3xl font-black text-black">Join Game</h1>
        <p className="text-black/70">Please sign in first</p>
        <Link to="/auth/signin">
          <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
            Sign In
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 gap-6 w-full">
      <h1 className="text-3xl font-black text-black">Join Game</h1>

      {!game ? (
        <form onSubmit={handleFindGame} className="w-full max-w-xs flex flex-col gap-4">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="Enter Game PIN"
            maxLength={6}
            className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-black rounded-xl bg-transparent text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || joinCode.length < 4}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-lg font-bold rounded-xl transition-colors"
          >
            {loading ? 'Finding...' : 'Find Game'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoinGame} className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center py-4 border-2 border-black rounded-xl">
            <p className="text-sm text-black/60">Game PIN</p>
            <p className="text-3xl font-black text-black tracking-widest">{game.joinCode}</p>
          </div>

          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your Nickname"
            maxLength={15}
            className="w-full px-4 py-3 text-center text-lg font-medium border-2 border-black rounded-xl bg-transparent text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setGame(null); setJoinCode(''); setError(''); }}
              className="flex-1 py-3 border-2 border-black text-black font-bold rounded-xl hover:bg-black/10 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
            >
              {loading ? 'Joining...' : 'Join!'}
            </button>
          </div>
        </form>
      )}

      <Link to="/" className="text-black/50 hover:text-black text-sm transition-colors">
        ← Back to Home
      </Link>
    </div>
  )
}
