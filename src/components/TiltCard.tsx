import React from 'react'
import OptimizedTiltCard from '@/components/ui/optimized-tilt-card'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltMaxAngleX?: number
  tiltMaxAngleY?: number
  scale?: number
  glareEnable?: boolean
  glareMaxOpacity?: number
  glareColor?: string
  glareBorderRadius?: string
  perspective?: number
}

export default function TiltCard({
  children,
  className = '',
}: TiltCardProps) {
  return (
    <OptimizedTiltCard className={`h-full ${className}`}>
      {children}
    </OptimizedTiltCard>
  )
}
