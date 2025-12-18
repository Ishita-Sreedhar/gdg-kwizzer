'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { firestoreService } from '../../lib/firestore'
import { Button, Card, Spinner } from '../../components/ui'
import type { Quiz } from '../../types/firebase'

export default function QuizzesPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }

    const loadQuizzes = async () => {
      try {
        const userQuizzes = await firestoreService.getQuizzesByCreator(user!.uid)
        setQuizzes(userQuizzes)
      } catch (error) {
        console.error('Error loading quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuizzes()
  }, [isAdmin, navigate, user])

  const handleDelete = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    try {
      await firestoreService.deleteQuiz(quizId)
      setQuizzes(quizzes.filter(q => q.id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Spinner size="lg" />
        <p className="mt-4 text-black">Loading quizzes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-black">My Quizzes</h1>
            <p className="text-black mt-1">Manage and host your quiz games</p>
          </div>
          <div className="flex gap-3">
            <Link to="/">
              <Button size="sm">← Back</Button>
            </Link>
            <Link to="/admin/quizzes/create">
              <Button size="sm">+ Create Quiz</Button>
            </Link>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <Card variant="bordered" padding="lg" className="text-center">
            <div className="py-8 px-8">
              <h2 className="text-xl font-bold text-black mb-4">No quizzes yet</h2>
              <p className="text-black mb-8 max-w-md mx-auto">
                Create your first quiz to get started with hosting games.
              </p>
              <Link to="/admin/quizzes/create">
                <Button>Create Your First Quiz</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} variant="default" padding="lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black mb-2">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="text-black mb-3">{quiz.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-black">
                      <span>{quiz.questions.length} questions</span>
                      <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/quizzes/${quiz.id}`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                    <Link to={`/admin/host?quiz=${quiz.id}`}>
                      <Button size="sm">Host</Button>
                    </Link>
                    <Button 
                      size="sm" 
                      className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 hover:border-2"
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
