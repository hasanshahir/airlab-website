import React from 'react'
import Tilt from 'react-parallax-tilt'

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
  tiltMaxAngleX = 8,
  tiltMaxAngleY = 8,
  scale = 1.02,
  glareEnable = true,
  glareMaxOpacity = 0.18,
  glareColor = 'var(--primary)',
  glareBorderRadius = '16px',
  perspective = 1000,
}: TiltCardProps) {
  return (
    <Tilt
      tiltMaxAngleX={tiltMaxAngleX}
      tiltMaxAngleY={tiltMaxAngleY}
      scale={scale}
      glareEnable={glareEnable}
      glareMaxOpacity={glareMaxOpacity}
      glareColor={glareColor}
      glarePosition="all"
      glareBorderRadius={glareBorderRadius}
      perspective={perspective}
      transitionSpeed={400}
      className={`h-full ${className}`}
    >
      {children}
    </Tilt>
  )
}
