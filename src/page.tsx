'use client'

import { useAuth } from './contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { user, loading, isAdmin, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 gap-8 bg-white w-full">
      <h1 className="text-4xl md:text-5xl font-black text-black">
        KWIZZER
      </h1>
      
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {isAdmin ? (
          <>
            <Link to="/admin/quizzes">
              <button className="w-full py-4 bg-white border-2 border-black text-black text-lg font-bold rounded-xl hover:bg-black hover:text-white transition-all shadow-lg">
                Manage Quizzes
              </button>
            </Link>
            <Link to="/admin/quizzes/create">
              <button className="w-full py-4 bg-white border-2 border-black text-black text-lg font-bold rounded-xl hover:bg-black hover:text-white transition-all shadow-lg">
                Create Quiz
              </button>
            </Link>
          </>
        ) : (
          <Link to="/play/join">
            <button className="w-full py-4 bg-black text-white text-lg font-bold rounded-xl hover:bg-black/80 transition-all shadow-lg">
              Join Game
            </button>
          </Link>
        )}
        
        <button 
          onClick={signOut}
          className="w-full py-3 bg-transparent border-2 border-black text-black font-bold rounded-xl hover:bg-black/10 transition-all"
        >
          Sign Out
        </button>
      </div>
      <p className="text-sm text-black">
        Logged in as {user.displayName || user.email?.split('@')[0]} ({isAdmin ? 'Admin' : 'Player'})
      </p>
    </div>
  )
}
