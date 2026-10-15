import { useEffect, useState } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    let frame = 0
    const totalFrames = 28
    let raf: number

    const animate = () => {
      frame++
      const progress = frame / totalFrames
      const scrambled = text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (i / text.length < progress) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')
      setDisplay(scrambled)
      if (frame < totalFrames) raf = requestAnimationFrame(animate)
      else setDisplay(text)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [text])

  return <span className={className}>{display}</span>
}
