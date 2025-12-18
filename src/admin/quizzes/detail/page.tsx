'use client'

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { firestoreService } from '../../../lib/firestore'
import { Quiz, Question } from '../../../types/firebase'
import { Button, Card, Spinner, EditableText } from '../../../components/ui'

export default function QuizDetailPage() {
  const { isAdmin } = useAuth()
  const params = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get quizId from URL params
  const quizId = params.quizId as string

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }

    async function loadQuiz() {
      if (!quizId) {
        setError('Quiz ID not found')
        setLoading(false)
        return
      }

      try {
        const quizData = await firestoreService.getQuiz(quizId)
        setQuiz(quizData)
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, isAdmin, navigate])

  const handleUpdateQuiz = async (field: keyof Quiz, value: any) => {
    if (!quiz) return
    try {
      await firestoreService.updateQuiz(quiz.id, { [field]: value })
      setQuiz({ ...quiz, [field]: value })
    } catch (err) {
      console.error('Failed to update quiz:', err)
      alert('Failed to update quiz. Please try again.')
    }
  }

  const handleUpdateQuestion = async (questionIndex: number, updates: Partial<Question>) => {
    if (!quiz) return
    
    const updatedQuestions = [...quiz.questions]
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      ...updates
    }

    try {
      await firestoreService.updateQuiz(quiz.id, { questions: updatedQuestions })
      setQuiz({ ...quiz, questions: updatedQuestions })
    } catch (err) {
      console.error('Failed to update question:', err)
      alert('Failed to update question. Please try again.')
    }
  }

  const handleUpdateOption = async (questionIndex: number, optionIndex: number, newValue: string) => {
    if (!quiz) return

    const updatedQuestions = [...quiz.questions]
    const updatedOptions = [...updatedQuestions[questionIndex].options]
    updatedOptions[optionIndex] = newValue
    
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    }

    try {
      await firestoreService.updateQuiz(quiz.id, { questions: updatedQuestions })
      setQuiz({ ...quiz, questions: updatedQuestions })
    } catch (err) {
      console.error('Failed to update option:', err)
      alert('Failed to update option. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
        <p className="ml-4 text-black/70">Loading quiz...</p>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card variant="default" padding="lg" className="text-center max-w-md">
          <h2 className="text-xl font-bold text-black mb-4">Error</h2>
          <p className="text-black mb-6">{error || 'Quiz not found'}</p>
          <Link to="/admin/quizzes">
            <Button>Back to Quizzes</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-1 w-full max-w-3xl">
            <EditableText
              value={quiz.title}
              onSave={(val) => handleUpdateQuiz('title', val)}
              className="mb-2"
              textClassName="text-3xl font-black"
              label="Quiz Title"
            />
            <EditableText
              value={quiz.description || ''}
              onSave={(val) => handleUpdateQuiz('description', val)}
              className="mt-2"
              multiline
              label="Description"
              placeholder="Add a description..."
            />
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/admin/quizzes">
              <Button size="sm">← Back</Button>
            </Link>
            <Link to={`/admin/host?quiz=${quiz.id}`}>
              <Button size="sm">Host Quiz</Button>
            </Link>
            <Button 
              size="sm"
              className={`bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 hover:border-2`}
              onClick={() => {
                if (confirm('Are you sure you want to delete this quiz?')) {
                  firestoreService.deleteQuiz(quiz.id).then(() => {
                    navigate('/admin/quizzes')
                  }).catch((err: Error) => {
                    alert('Failed to delete quiz: ' + err.message)
                  })
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Questions */}
        <div className="grid gap-6">
          {/* Questions Preview */}
          <Card variant="default" padding="lg">
            <h2 className="text-xl font-bold text-black mb-4">Questions ({quiz.questions.length})</h2>
            <div className="space-y-8">
              {quiz.questions.map((question, qIndex) => (
                <div key={question.id || qIndex} className="border-black pl-6 py-2">
                  <div className="mb-4">
                    <h3 className="font-semibold text-black mb-2 text-sm uppercase tracking-wider opacity-50">
                      Question {qIndex + 1}
                    </h3>
                    <EditableText
                      value={question.text}
                      onSave={(val) => handleUpdateQuestion(qIndex, { text: val })}
                      textClassName="text-lg font-bold"
                      multiline
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => {
                      const colors = [
                        { bg: 'bg-red-500', border: 'border-red-500', label: 'Red' },
                        { bg: 'bg-green-500', border: 'border-green-500', label: 'Green' },
                        { bg: 'bg-blue-500', border: 'border-blue-500', label: 'Blue' },
                        { bg: 'bg-yellow-500', border: 'border-yellow-500', label: 'Yellow' }
                      ]
                      const color = colors[oIndex] || colors[0]
                      const isCorrect = oIndex === question.correctAnswer
                      
                      return (
                        <div key={oIndex} className="flex items-center gap-3 group">
                          <div 
                            className={`w-6 h-6 rounded-md bg-white ${color.border} border-2 flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-50 transition-colors ${isCorrect ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                            onClick={() => handleUpdateQuestion(qIndex, { correctAnswer: oIndex })}
                            title={`Click to set ${color.label} as correct answer`}
                          >
                            {isCorrect && (
                              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className={`w-2 h-8 rounded-full ${color.bg}`} />
                          <div className="flex-1">
                            <EditableText
                              value={option}
                              onSave={(val) => handleUpdateOption(qIndex, oIndex, val)}
                              label={color.label}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex gap-4 text-sm text-black/60">
                    <div className="flex items-center gap-2">
                      <span>Time Limit:</span>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={question.timeLimit || 30}
                        onChange={(e) => {
                          const limit = parseInt(e.target.value)
                          if (!isNaN(limit) && limit > 0) {
                            handleUpdateQuestion(qIndex, { timeLimit: limit })
                          }
                        }}
                        className="w-16 px-2 py-1 text-center border-2 border-black/30 rounded-lg bg-white text-black font-medium focus:outline-none focus:border-black"
                      />
                      <span>seconds</span>
                    </div>
                  </div>
                  {/* Divider */}
                  {qIndex < quiz.questions.length - 1 && (
                    <div className="h-px bg-black/20 mt-6 mb-6" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
