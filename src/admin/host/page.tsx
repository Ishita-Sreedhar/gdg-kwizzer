'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { firestoreService } from '../../lib/firestore'
import { Quiz, Game } from '../../types/firebase'
import { useGame } from '../../hooks/useGame'
import { Button, Card } from '../../components/ui'
import { GameTimer } from '../../lib/gameTimer'

function HostPageContent() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quizId = searchParams.get('quiz') || searchParams.get('quizId')
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingGame, setCreatingGame] = useState(false)
  const [error, setError] = useState('')

  // Get real-time game data if we have a gameId
  const { game: liveGame } = useGame(gameId || '')
  const game = liveGame

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }

    async function loadQuiz() {
      if (!quizId || !user) {
        setLoading(false)
        return
      }
      
      try {
        const quizData = await firestoreService.getQuiz(quizId)
        if (!quizData || quizData.createdBy !== user.uid) {
          setError('Quiz not found or access denied')
          return
        }
        setQuiz(quizData)
      } catch (err) {
        setError('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, user, isAdmin, navigate])

  async function createGame() {
    if (!quiz || !user) return
    
    setCreatingGame(true)
    setError('')

    try {
      const code = generateJoinCode()
      const gameData: Omit<Game, 'id' | 'startedAt' | 'endedAt'> = {
        joinCode: code,
        quizId: quiz.id,
        hostId: user.uid,
        phase: 'lobby',
        currentQuestionIndex: 0,
        settings: {
          questionTimeLimit: 30,
          showLeaderboard: true,
          autoProgress: false
        }
      }

      const gameId = await firestoreService.createGame(gameData)
      setGameId(gameId)
    } catch (err: any) {
      setError(err.message || 'Failed to create game')
    } finally {
      setCreatingGame(false)
    }
  }

  function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full flex items-center justify-center">
        <Card variant="default" padding="lg" className="text-center">
          <h2 className="text-xl text-black mb-4">
            {error || 'Quiz not found'}
          </h2>
          <Link to="/admin/quizzes">
            <Button variant="outline">
              Back to Quizzes
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (game) {
    return <GameHost game={game} quiz={quiz} />
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-black">Host Game</h1>
            <p className="text-black/60 mt-1">Set up and launch your quiz</p>
          </div>
          <Link to="/admin/quizzes">
            <Button size="sm">← Back</Button>
          </Link>
        </div>

        {/* Quiz Info Card */}
        <Card variant="default" padding="lg" className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {quiz.title}
              </h2>
              {quiz.description && (
                <p className="text-black/60 mb-4">{quiz.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-black/5 px-3 py-1 rounded-full border border-black/20">
                  {quiz.questions.length} questions
                </span>
                <span className="bg-black/5 px-3 py-1 rounded-full border border-black/20">
                  By {user?.displayName || user?.email}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Game Settings Card */}
        <Card variant="default" padding="lg" className="mb-8">
          <h3 className="text-lg font-bold text-black mb-4">Game Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-black/10">
              <div>
                <span className="text-black font-medium">Question Time Limit</span>
                <p className="text-sm text-black/50">Time per question</p>
              </div>
              <span className="text-black font-bold bg-black/5 px-3 py-1 rounded-lg">30s</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-black/10">
              <div>
                <span className="text-black font-medium">Show Leaderboard</span>
                <p className="text-sm text-black/50">Display rankings after each question</p>
              </div>
              <span className="text-black font-bold bg-black/5 px-3 py-1 rounded-lg">Yes</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="text-black font-medium">Auto Progress</span>
                <p className="text-sm text-black/50">Automatically move to next question</p>
              </div>
              <span className="text-black font-bold bg-black/5 px-3 py-1 rounded-lg">No</span>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {/* Create Game Button */}
        <button
          onClick={createGame}
          disabled={creatingGame}
          className="w-full py-4 text-lg font-semibold rounded-sm bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {creatingGame ? 'Creating Game...' : 'Create Game'}
        </button>
      </div>
    </div>
  )
}

import { QuestionText } from '../../components/game/QuestionText'
import { OptionButton } from '../../components/game/OptionButton'
import { Leaderboard } from '../../components/game/Leaderboard'
import { useLeaderboard } from '../../hooks/useGame'

function GameHost({ game, quiz }: { game: Game; quiz: Quiz }) {
  const { game: liveGame, players } = useGame(game.id)
  const leaderboardData = useLeaderboard(game.id)
  const [startingGame, setStartingGame] = useState(false)
  const [newPlayerId, setNewPlayerId] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // Use live game data if available, otherwise fall back to static game data
  const currentGame = liveGame || game

  // Create leaderboard from players if no leaderboard data exists yet
  const leaderboard = leaderboardData.length > 0 
    ? leaderboardData 
    : players
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((p, i) => ({
          playerId: p.id,
          playerName: p.name,
          score: p.score || 0,
          rank: i + 1
        }))

  useEffect(() => {
    // Track when new players join for animation
    if (players.length > 0) {
      const latestPlayer = players[players.length - 1]
      setNewPlayerId(latestPlayer.id)
      
      // Clear animation after 1 second
      const timer = setTimeout(() => setNewPlayerId(null), 1000)
      return () => clearTimeout(timer)
    }
  }, [players])

  // Calculate time left from server-side timer
  const timeLeft = currentGame.timeLeft || 0

  // Show answer when timer runs out
  useEffect(() => {
    if (currentGame.phase === 'questionLive' && timeLeft === 0) {
      setShowAnswer(true)
    } else if (currentGame.phase === 'results') {
      setShowAnswer(false)
    }
  }, [currentGame.phase, timeLeft])

  async function startGame() {
    if (startingGame) return
    setStartingGame(true)
    try {
      console.log('[GameHost] Starting game:', game.id)
      
      // Get the time limit for the first question
      const firstQuestion = quiz.questions[0]
      const timeLimit = firstQuestion?.timeLimit || 30
      
      // Start server-side timer
      await GameTimer.startQuestionTimer(game.id, timeLimit)
      
      console.log('[GameHost] Game started successfully with server-side timer')
    } catch (error) {
      console.error('[GameHost] Failed to start game:', error)
    } finally {
      setStartingGame(false)
    }
  }

  // Calculate points based on answer speed
  function calculatePoints(answerTime: Date | any, questionStartTime: Date | any, timeLimit: number): number {
    // Convert Firestore Timestamps to Date if needed
    const answerDate = answerTime?.toDate ? answerTime.toDate() : new Date(answerTime)
    const startDate = questionStartTime?.toDate ? questionStartTime.toDate() : new Date(questionStartTime)
    
    const answerDuration = answerDate.getTime() - startDate.getTime()
    const maxTime = timeLimit * 1000 // Convert to milliseconds
    
    // Base points for correct answer
    const basePoints = 100
    
    // Time bonus: faster answers get more points
    // If answered instantly (0ms), get full bonus of 50 points
    // If answered at the last second, get 0 bonus points
    const timeRatio = Math.max(0, Math.min(1, 1 - (answerDuration / maxTime)))
    const timeBonus = Math.round(timeRatio * 50)
    
    return basePoints + timeBonus
  }

  async function handleShowResults() {
    if (processing) return
    setProcessing(true)
    try {
      console.log('[GameHost] Showing results')
      
      // Get fresh player data to avoid stale scores
      const currentPlayers = await firestoreService.getGamePlayers(game.id)
      
      // Calculate scores based on answers
      const answers = await firestoreService.getQuestionAnswers(game.id, currentGame.currentQuestionIndex)
      const question = quiz.questions[currentGame.currentQuestionIndex]
      
      // Get question start time from game data or use current time as fallback
      const questionStartTime = currentGame.questionStartTime || new Date(Date.now() - (question.timeLimit || 30) * 1000)
      
      // Update player scores with time-based points
      for (const answer of answers) {
        if (answer.selectedOption === question.correctAnswer) {
          const player = currentPlayers.find(p => p.id === answer.playerId)
          if (player) {
            const points = calculatePoints(answer.answeredAt, questionStartTime, question.timeLimit || 30)
            const newScore = (player.score || 0) + points
            await firestoreService.updatePlayerScore(game.id, answer.playerId, newScore)
            console.log(`[GameHost] Player ${player.name} earned ${points} points (base: 100, time bonus: ${points - 100})`)
          }
        }
      }

      // Fetch updated players after score updates and build leaderboard
      const updatedPlayers = await firestoreService.getGamePlayers(game.id)
      const leaderboardEntries = updatedPlayers
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((p, i) => ({
          playerId: p.id,
          playerName: p.name,
          score: p.score || 0,
          rank: i + 1
        }))
      
      console.log('[GameHost] Updating leaderboard with entries:', leaderboardEntries)
      await firestoreService.updateLeaderboard(game.id, leaderboardEntries)
      await firestoreService.updateGame(game.id, { phase: 'results' })
    } catch (error) {
      console.error('[GameHost] Error showing results:', error)
    } finally {
      setProcessing(false)
    }
  }

  async function handleNextQuestion() {
    if (processing) return
    setProcessing(true)
    try {
      const nextIndex = currentGame.currentQuestionIndex + 1
      if (nextIndex >= quiz.questions.length) {
        // Game ended
        await firestoreService.updateGame(game.id, { phase: 'ended' })
      } else {
        // Next question - start server-side timer
        const nextQuestion = quiz.questions[nextIndex]
        const timeLimit = nextQuestion?.timeLimit || 30
        
        await firestoreService.updateGame(game.id, { 
          phase: 'questionLive', 
          currentQuestionIndex: nextIndex
        })
        
        // Start server-side timer for next question
        await GameTimer.startQuestionTimer(game.id, timeLimit)
      }
    } catch (error) {
      console.error('[GameHost] Error moving to next question:', error)
    } finally {
      setProcessing(false)
    }
  }

  // --- Display Logic for Different Phases ---

  if (currentGame.phase === 'questionLive' || currentGame.phase === 'results') {
    const currentQuestion = quiz.questions[currentGame.currentQuestionIndex]
    const showResults = currentGame.phase === 'results'

    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-black font-black text-2xl">
              {showResults ? 'Results' : 'Question'} {currentGame.currentQuestionIndex + 1}
              <span className="text-black/50 font-medium text-lg ml-2">/ {quiz.questions.length}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {!showResults && (
              <div className={`text-3xl font-black px-4 py-2 rounded-xl border-2 ${timeLeft <= 5 ? 'text-black bg-black/10 border-black animate-pulse' : 'text-black bg-black/5 border-black'}`}>
                {timeLeft}s
              </div>
            )}
            <div className="text-black font-mono text-sm bg-black/10 px-3 py-1 rounded-lg border border-black">
              Code: {game.joinCode}
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Question & Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Display */}
            <QuestionText 
              text={currentQuestion.text}
            />

            {/* Show Correct Answer when time ends */}
            {showAnswer && (
              <div className="bg-black/5 border-2 border-black rounded-xl p-4 text-center">
                <p className="text-sm text-black/70 mb-2">Correct Answer:</p>
                <p className="text-lg font-bold text-black">
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </p>
              </div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <OptionButton
                  key={index}
                  index={index}
                  text={option}
                  disabled={true}
                  showResult={showResults || showAnswer}
                  isCorrect={index === currentQuestion.correctAnswer}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center bg-black/5 rounded-xl p-4 border-2 border-black">
              <div className="text-black/70">
                <span className="text-black font-bold">{players.length}</span> players connected
              </div>
              
              <div className="flex gap-3">
                {!showResults ? (
                  <button
                    onClick={handleShowResults}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-black hover:bg-black/10 font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'End Question & Show Results'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-black hover:bg-black/10 font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {processing ? 'Loading...' : 
                      currentGame.currentQuestionIndex + 1 >= quiz.questions.length 
                        ? 'End Game' 
                        : 'Next Question →'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard 
              entries={leaderboard} 
              maxEntries={100}
              showLiveIndicator={true}
            />
          </div>
        </div>
      </div>
    )
  }

  if (currentGame.phase === 'ended') {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-black mb-2">Game Ended!</h1>
            <p className="text-black/60">Thanks for hosting!</p>
          </div>
          
          {/* Show final leaderboard with gold/silver/bronze */}
          <div className="mb-8">
            <Leaderboard 
              entries={leaderboard} 
              maxEntries={100}
              showLiveIndicator={false}
            />
          </div>
          
          <Link to="/admin/quizzes">
            <Button variant="outline" className="w-full">Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    )
  }

  // --- Lobby View (Default) ---
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full">
      <div className="w-full">
        <Card variant="default" padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black">
              Game Lobby
            </h1>
            
            <div className="text-6xl font-bold text-black mb-2 font-mono tracking-wider">
              {game.joinCode}
            </div>
            <p className="text-black mb-6">
              Players should enter this code to join
            </p>
          </div>

          <div className="border-t border-black pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-black">
                Players ({players.length})
              </h3>
              {players.length > 0 && (
                <span className="text-sm text-black font-bold px-2 py-0.5 bg-black/10 rounded-full border border-black">
                  ● LIVE
                </span>
              )}
            </div>
            
            {players.length === 0 ? (
              <div className="text-center py-12 bg-black/5 rounded-xl border-2 border-dashed border-black">
                <div className="text-black mb-2 text-lg">
                  No players yet...
                </div>
                <div className="text-black text-sm">
                  Waiting for players to join
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 py-2">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all duration-500
                      ${newPlayerId === player.id 
                        ? 'bg-black/10 border-black scale-105 shadow-lg' 
                        : 'bg-white border-black hover:bg-black/5'
                      }
                      border
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold shadow-sm border border-black bg-white
                    `}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-medium truncate">
                        {player.name}
                      </div>
                      {newPlayerId === player.id && (
                        <div className="text-black text-xs">
                          Joined!
                        </div>
                      )}
                    </div>

                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4 border-black pt-6">
            <Button
              onClick={startGame}
              className="flex-1 text-lg py-4 shadow-lg transition-all active:scale-[0.98]"
              variant="outline"
              disabled={players.length === 0 || startingGame}
            >
              {startingGame ? (
                'Starting Game...'
              ) : (
                'Start Game'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function HostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>}>
      <HostPageContent />
    </Suspense>
  )
}
