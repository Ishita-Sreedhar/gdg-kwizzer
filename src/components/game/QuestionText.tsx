'use client'

interface QuestionTextProps {
  text: string
  timeLimit?: number
  questionNumber?: number
  totalQuestions?: number
}

export function QuestionText({ 
  text, 
  timeLimit, 
  questionNumber,
  totalQuestions 
}: QuestionTextProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-4 px-2">
        {questionNumber !== undefined && totalQuestions !== undefined && (
          <span className="text-black font-medium bg-black/10 px-3 py-1 rounded-full text-sm border border-black">
            {questionNumber} / {totalQuestions}
          </span>
        )}
        
        {timeLimit !== undefined && (
          <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-black">
            <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
            <span className="text-black font-bold text-sm">
              {timeLimit}s
            </span>
          </div>
        )}
      </div>

      <div className="bg-white text-black p-8 md:p-12 rounded-2xl shadow-xl text-center min-h-[200px] flex items-center justify-center">
        <h2 className="text-2xl md:text-4xl font-bold leading-tight">
          {text}
        </h2>
      </div>
    </div>
  )
}
