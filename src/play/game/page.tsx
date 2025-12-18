'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { firestoreService } from '../../lib/firestore'
import { useGame, useLeaderboard } from '../../hooks/useGame'
import { Quiz, Player } from '../../types/firebase'
import { Button, Card, Spinner } from '../../components/ui'
import { QuestionText, OptionButton, Leaderboard } from '../../components/game'

export default function GamePage() {
  const { user } = useAuth()
  const params = useParams()
  const navigate = useNavigate()
  const gameId = params.gameId as string
  
  const { game, players, loading: gameLoading } = useGame(gameId)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Move all hooks to the top level - always called unconditionally
  const leaderboard = useLeaderboard(gameId)

  useEffect(() => {
    async function loadQuiz() {
      if (!game) return
      
      try {
        const quizData = await firestoreService.getQuiz(String(game.quizId))
        setQuiz(quizData)
        
        const player = players.find(p => p.id === user?.uid)
        setCurrentPlayer(player || null)
      } catch (error) {
        console.error('Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [game?.quizId, user?.uid]) // Only fetch quiz when quizId or user changes

  // Reset answer state when question changes to a new question
  useEffect(() => {
    if (game?.phase === 'questionLive' && quiz) {
      // Only reset if this is a new question (different from current)
      const currentQuestionIndex = game.currentQuestionIndex
      if (currentQuestionIndex !== undefined) {
        setSelectedAnswer(null)
        setAnswerSubmitted(false)
      }
    }
  }, [game?.currentQuestionIndex]) // Only depend on question index changing

  // Calculate time left from server-side timer
  const timeLeft = game?.timeLeft || 0

  async function submitAnswer() {
    if (selectedAnswer === null || !game || !user || answerSubmitted || !quiz) return

    try {
      await firestoreService.submitAnswer(game.id, game.currentQuestionIndex, {
        playerId: user.uid,
        questionIndex: game.currentQuestionIndex,
        selectedOption: selectedAnswer,
        answeredAt: new Date(),
        isCorrect: selectedAnswer === quiz.questions[game.currentQuestionIndex].correctAnswer
      })
      setAnswerSubmitted(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  if (loading || gameLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!game || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="default" padding="lg" className="text-center">
          <h2 className="text-xl text-black mb-4">Game not found</h2>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-black text-white rounded">
            Back to Home
          </button>
        </Card>
      </div>
    )
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="default" padding="lg" className="text-center">
          <h2 className="text-xl text-black mb-4">Not in game</h2>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-black text-white rounded">
            Back to Home
          </button>
        </Card>
      </div>
    )
  }

  // Lobby Phase
  if (game.phase === 'lobby') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <Card variant="default" padding="lg" className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-black mb-6">Game Lobby</h1>
          
          {/* Player's name prominently displayed */}
          {currentPlayer && (
            <div className="mb-8">
              <div className="text-4xl font-bold text-black mb-2">
                Welcome, {currentPlayer.name}!
              </div>
              <div className="text-lg text-black/70 mb-4">
                You're in the game and ready to play!
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-black mb-2">Game Code: <span className="font-bold text-2xl">{game.joinCode}</span></p>
            <p className="text-black mb-4">Players Joined: <span className="font-bold">{players.length}</span></p>
          </div>
          
          {/* Waiting message */}
          <div className="text-center">
            <p className="text-black/70 font-medium">
              Waiting for admin to start the game...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Question Phase
  if (game.phase === 'questionLive') {
    // Add null checks for quiz and question
    if (!quiz || !quiz.questions || game.currentQuestionIndex === undefined || game.currentQuestionIndex >= quiz.questions.length) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card variant="default" padding="lg" className="text-center">
            <h2 className="text-xl text-black mb-4">Loading question...</h2>
          </Card>
        </div>
      )
    }
    
    const question = quiz.questions[game.currentQuestionIndex]
    
    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-black mb-2">Question {game.currentQuestionIndex + 1}</h1>
            <div className="text-2xl font-bold text-black mb-4">
              Time: {timeLeft}s
            </div>
          </div>
          
          <QuestionText text={question.text} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {question.options.map((option, index) => (
              <OptionButton
                key={index}
                index={index}
                text={option}
                selected={selectedAnswer === index}
                onClick={() => !answerSubmitted && setSelectedAnswer(index)}
                disabled={answerSubmitted}
              />
            ))}
          </div>
          
          {selectedAnswer !== null && !answerSubmitted && (
            <div className="mt-6 text-center">
              <Button onClick={submitAnswer} className="w-full max-w-xs">
                Submit Answer
              </Button>
            </div>
          )}
          
          {answerSubmitted && (
            <div className="mt-6 text-center">
              <p className="text-black font-bold">Answer submitted!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Results Phase
  if (game.phase === 'results') {
    // Add null checks for quiz and question
    if (!quiz || !quiz.questions || game.currentQuestionIndex === undefined || game.currentQuestionIndex >= quiz.questions.length) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card variant="default" padding="lg" className="text-center">
            <h2 className="text-xl text-black mb-4">Loading results...</h2>
          </Card>
        </div>
      )
    }
    
    const question = quiz.questions[game.currentQuestionIndex]
    const isCorrect = selectedAnswer === question.correctAnswer
    const didAnswer = selectedAnswer !== null
    
    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="max-w-2xl mx-auto">
          {/* Result Feedback Banner */}
          <div className={`mb-6 p-4 rounded-xl text-center ${
            !didAnswer 
              ? 'bg-gray-100 border-2 border-gray-300' 
              : isCorrect 
                ? 'bg-green-50 border-2 border-green-500' 
                : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className={`text-3xl font-black mb-1 ${
              !didAnswer ? 'text-gray-600' : isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {!didAnswer ? "Time's Up!" : isCorrect ? 'Correct!' : '✗ Wrong'}
            </div>
            <p className={`text-sm ${
              !didAnswer ? 'text-gray-500' : isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {!didAnswer 
                ? "You didn't answer in time" 
                : isCorrect 
                  ? 'Great job! You got it right!' 
                  : 'Better luck next time!'}
            </p>
          </div>
          
          {/* Question Card with Answer */}
          <Card variant="default" padding="lg" className="mb-6">
            <div className="text-sm text-black/50 font-medium mb-2">
              Question {game.currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <h2 className="text-xl font-bold text-black mb-4">{question.text}</h2>
            
            {/* Correct Answer Display */}
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">Correct Answer</div>
              <div className="text-lg font-bold text-green-700">
                {question.options[question.correctAnswer]}
              </div>
            </div>
            
            {/* Show user's answer if they answered wrong */}
            {didAnswer && !isCorrect && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mt-3">
                <div className="text-sm text-red-500 font-medium mb-1">Your Answer</div>
                <div className="text-lg font-bold text-red-600">
                  {question.options[selectedAnswer]}
                </div>
              </div>
            )}
          </Card>
          
          {/* Show leaderboard */}
          <Leaderboard entries={leaderboard} />
          
          <div className="mt-6 text-center">
            <p className="text-black/50 text-sm">Waiting for next question...</p>
          </div>
        </div>
      </div>
    )
  }

  // Game Over Phase
  if (game.phase === 'ended') {
    // Find current user's rank and score from leaderboard
    const userEntry = leaderboard.find(entry => entry.playerId === user?.uid)
    const userRank = userEntry?.rank || 0
    const userScore = userEntry?.score || 0
    
    // Handle edge cases for rank display
    const getRankDisplay = (rank: number) => {
      if (rank === 0) return "Not ranked"
      if (rank === 1) return "1st"
      if (rank === 2) return "2nd" 
      if (rank === 3) return "3rd"
      return `#${rank}`
    }
    
    // Handle edge cases for message
    const getResultMessage = (rank: number, score: number, playerName: string) => {
      if (rank === 0 && score === 0) {
        return `${playerName}, you didn't score any points this round.`
      }
      if (rank === 0) {
        return `${playerName}, thanks for playing!`
      }
      if (score === 0) {
        return `${playerName}, you finished ${getRankDisplay(rank)} with no points. Better luck next time!`
      }
      return `${playerName}, you finished ${getRankDisplay(rank)} place with ${score} points!`
    }
    
    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8 text-center">Game Over!</h1>
          
          {/* User's Results Card */}
          <Card variant="default" padding="lg" className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Your Results</h2>
            <div className="flex justify-center items-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">
                  {userRank > 0 ? `#${userRank}` : "—"}
                </div>
                <div className="text-black/70">Your Rank</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">{userScore}</div>
                <div className="text-black/70">Your Points</div>
              </div>
            </div>
            <div className="text-lg text-black">
              {getResultMessage(userRank, userScore, currentPlayer?.name || "Player")}
            </div>
          </Card>
          
          {/* Full Leaderboard - only show if there are entries */}
          {leaderboard.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4 text-center">Final Leaderboard</h2>
              <Leaderboard entries={leaderboard} showLiveIndicator={false} />
            </div>
          )}
          
          {/* Show message if no leaderboard data */}
          {leaderboard.length === 0 && (
            <div className="mb-8 text-center">
              <p className="text-black/70">No leaderboard data available</p>
            </div>
          )}
          
          <div className="text-center">
            <Button onClick={() => navigate('/')} className="w-full max-w-xs">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card variant="default" padding="lg" className="text-center">
        <h2 className="text-xl text-black mb-4">Unknown game phase</h2>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-black text-white rounded">
          Back to Home
        </button>
      </Card>
    </div>
  )
}
