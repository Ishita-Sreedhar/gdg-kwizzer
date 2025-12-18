'use client'

import { Check, X } from 'lucide-react'

interface OptionButtonProps {
  index: number
  text: string
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  showResult?: boolean
  isCorrect?: boolean
  className?: string
}

const OPTION_COLORS = [
  { 
    bg: 'bg-red-500', 
    hover: 'hover:bg-red-600', 
    border: 'border-red-700', 
    active: 'active:bg-red-700',
    shadow: 'shadow-red-500/30',
    text: 'text-white'
  },
  { 
    bg: 'bg-blue-500', 
    hover: 'hover:bg-blue-600', 
    border: 'border-blue-700', 
    active: 'active:bg-blue-700',
    shadow: 'shadow-blue-500/30',
    text: 'text-white'
  },
  { 
    bg: 'bg-yellow-500', 
    hover: 'hover:bg-yellow-600', 
    border: 'border-yellow-700', 
    active: 'active:bg-yellow-700',
    shadow: 'shadow-yellow-500/30',
    text: 'text-black'
  },
  { 
    bg: 'bg-green-500', 
    hover: 'hover:bg-green-600', 
    border: 'border-green-700', 
    active: 'active:bg-green-700',
    shadow: 'shadow-green-500/30',
    text: 'text-white'
  },
]

const OPTION_SHAPES = ['◆', '●', '▲', '■']

export function OptionButton({ 
  index, 
  text, 
  onClick, 
  disabled = false, 
  selected = false,
  showResult = false,
  isCorrect = false,
  className = ''
}: OptionButtonProps) {
  const color = OPTION_COLORS[index % 4]
  const shape = OPTION_SHAPES[index % 4]

  let opacityClass = 'opacity-100'
  let borderClass = 'border-b-4'
  if (showResult) {
    if (isCorrect) {
      opacityClass = 'opacity-100 ring-4 ring-white scale-[1.02]'
    } else if (selected) {
      opacityClass = 'opacity-100 ring-4 ring-white/50'
    } else {
      opacityClass = 'opacity-40 grayscale'
    }
  } else if (selected) {
    opacityClass = 'opacity-100 ring-4 ring-white scale-[1.02]'
    borderClass = 'border-b-4 border-2 border-black' // Add black outline when selected
  } else if (disabled) {
    opacityClass = 'opacity-50 cursor-not-allowed'
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        relative w-full h-full min-h-[100px] md:min-h-[160px] p-6 rounded-xl
        flex flex-col items-center justify-center gap-4
        transition-all duration-200
        ${color.bg} 
        ${!disabled && !showResult ? color.hover : ''}
        ${!disabled && !showResult ? color.active : ''}
        ${borderClass} ${color.border}
        shadow-lg ${color.shadow}
        ${color.text} font-bold
        ${opacityClass}
        ${className}
      `}
    >
      {/* Shape Icon */}
      <div className="absolute top-4 left-4 text-2xl md:text-3xl opacity-50">
        {shape}
      </div>

      {/* Option Text */}
      <span className="text-xl md:text-3xl text-center leading-tight wrap-break-word w-full shadow-black drop-shadow-md">
        {text}
      </span>

      {/* Result Indicator Icon */}
      {showResult && (
        <div className="absolute top-4 right-4">
          {isCorrect ? (
            <div className="bg-black rounded-full p-1 shadow-md">
              <Check className="w-6 h-6 text-white" />
            </div>
          ) : selected ? (
             <div className="bg-white rounded-full p-1 shadow-md border-2 border-black">
              <X className="w-6 h-6 text-black" />
            </div>
          ) : null}
        </div>
      )}
    </button>
  )
}
