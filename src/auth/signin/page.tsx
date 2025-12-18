'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 gap-6 w-full">
      <h1 className="text-4xl font-black text-black">Sign In</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 border-2 border-black rounded-xl bg-transparent text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 border-2 border-black rounded-xl bg-transparent text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="w-full max-w-xs flex items-center gap-3">
        <div className="flex-1 h-px bg-black/20"></div>
        <span className="text-black/50 text-sm">or</span>
        <div className="flex-1 h-px bg-black/20"></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full max-w-xs py-3 border-2 border-black text-black font-bold rounded-xl hover:bg-black/10 transition-colors"
      >
        Sign in with Google
      </button>

      <p className="text-black/60 text-sm">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="text-blue-500 hover:underline font-bold">
          Sign up
        </Link>
      </p>
    </div>
  )
}
