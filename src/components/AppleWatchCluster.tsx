import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Mail, Users } from 'lucide-react'
import { TeamMemberEntity } from '../entities/TeamMemberEntity'

// ─────────────────────────────────────────────────────────────────────────────
// TUNABLE CONSTANTS (Ring Spacing, Hover Intent, Easing & Scale Dynamics)
// ─────────────────────────────────────────────────────────────────────────────
// 1. Ring Spacing: distance between concentric rings as multiple of base diameter
export const RING_SPACING_RATIO = 1.18         // Tune spacing between rings (e.g. 1.18 = 18% air gap)

// 2. Hover Card Timing Delays
export const HOVER_INTENT_DELAY_MS = 80        // Short hover intent delay before card opens (in ms)
export const CLOSE_GRACE_DELAY_MS = 250        // Grace delay after leaving bubble/card before closing (in ms)

// 3. Cluster Sizing & Scale Profile (Center is ~1.6x of outermost ring)
export const CLUSTER_FILL_PERCENT = 0.70       // Target idle cluster diameter as % of container shorter side (~70%)
export const IDLE_CENTER_SCALE = 1.25          // Scale of center bubble (Ring 0) at idle
export const IDLE_RING1_SCALE = 1.00           // Scale of Ring 1 bubbles at idle
export const IDLE_EDGE_SCALE = 0.78            // Scale of outermost ring bubbles at idle (1.25 / 0.78 = 1.60x)

// 4. Fisheye Lens Dynamics
export const HOVER_MIN_SCALE = 0.72            // Minimum bubble scale when cursor is far
export const HOVER_MAX_SCALE = 1.36            // Maximum bubble scale directly under cursor
export const LENS_RADIUS_MULTIPLE = 2.1        // Lens radius R as multiple of base bubble diameter
export const DISPLACEMENT_FACTOR = 0.36        // Push-out displacement factor away from focal point

// 5. Focal Point & Bubble Easing Speed
// Raised by ~1.5x from original 0.35 to 0.52 so lens keeps up with cursor while retaining smooth bounce
export const FOCAL_EASING_SPEED = 0.52         // Focal point tracking speed (original: 0.35, 1.5x: 0.52)
export const LERP_SPEED = 0.14                 // Smoothness factor per frame for bubble scales & positions

interface AppleWatchClusterProps {
  members: TeamMemberEntity[]
  onSelectMember: (member: TeamMemberEntity) => void
}

interface NodeState {
  member: TeamMemberEntity
  ring: number
  baseX: number
  baseY: number
  currentX: number
  currentY: number
  targetX: number
  targetY: number
  initialScale: number
  currentScale: number
  targetScale: number
  isLead: boolean
}

interface ActiveCardState {
  member: TeamMemberEntity
  left: number
  top: number
  isLeftAligned: boolean
}

const LinkedinIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

export const AppleWatchCluster: React.FC<AppleWatchClusterProps> = ({
  members,
  onSelectMember,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 600,
  })

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Container measurement via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          setContainerSize({ width: rect.width, height: rect.height })
        }
      }
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // TRUE CONCENTRIC CIRCULAR BASE LAYOUT
  // Concentric interlocking rings with sunflower offset. Bubble 0 at center (0, 0).
  // Partial outer rings are spread evenly across the full 360 degrees.
  // ───────────────────────────────────────────────────────────────────────────
  const layout = useMemo(() => {
    const total = members.length
    if (total === 0) {
      return { nodes: [], baseBubbleSize: 80, ringSpacing: 94, lensRadius: 160, clusterDiameter: 200 }
    }

    const lead = members.find(m => m.isLead) || members[0]
    const otherMembers = members.filter(m => m.id !== lead.id)

    const shorterSide = Math.min(containerSize.width, containerSize.height)

    // Single member case (e.g. Faculty tab): show one large centered bubble
    if (total === 1) {
      const singleBubbleSize = Math.max(140, Math.min(240, Math.round(shorterSide * 0.42)))
      return {
        nodes: [
          {
            member: lead,
            ring: 0,
            baseX: 0,
            baseY: 0,
            currentX: 0,
            currentY: 0,
            targetX: 0,
            targetY: 0,
            initialScale: 1.0,
            currentScale: 1.0,
            targetScale: 1.0,
            isLead: true,
          },
        ],
        baseBubbleSize: singleBubbleSize,
        ringSpacing: singleBubbleSize,
        lensRadius: singleBubbleSize * LENS_RADIUS_MULTIPLE,
        clusterDiameter: singleBubbleSize,
      }
    }

    // Determine number of concentric rings needed
    const ringCount = total <= 7 ? 1 : total <= 19 ? 2 : 3

    // Scale bubble diameter from container shorter side (~70% on desktop, ~80% on mobile)
    const fillPercent = shorterSide < 520 ? 0.80 : CLUSTER_FILL_PERCENT
    const targetClusterDiameter = shorterSide * fillPercent
    const denominator = 2 * ringCount * RING_SPACING_RATIO + IDLE_EDGE_SCALE
    const rawBubbleSize = Math.round(targetClusterDiameter / denominator)
    const baseBubbleSize = Math.max(50, Math.min(130, rawBubbleSize))
    const ringSpacing = Math.round(baseBubbleSize * RING_SPACING_RATIO)
    const lensRadius = baseBubbleSize * LENS_RADIUS_MULTIPLE
    const clusterDiameter = Math.round(2 * (ringCount * ringSpacing + (baseBubbleSize * IDLE_EDGE_SCALE) / 2))

    // Build raw circular positions
    const rawPositions: {
      member: TeamMemberEntity
      ring: number
      x: number
      y: number
      initialScale: number
      isLead: boolean
    }[] = []

    // Ring 0: Center bubble (Slot 0, Lead)
    rawPositions.push({
      member: lead,
      ring: 0,
      x: 0,
      y: 0,
      initialScale: IDLE_CENTER_SCALE,
      isLead: true,
    })

    let memberIndex = 0
    for (let k = 1; k <= ringCount; k++) {
      const remaining = otherMembers.length - memberIndex
      if (remaining <= 0) break

      const ringCapacity = 6 * k
      const countInRing = Math.min(remaining, ringCapacity)
      const radius = k * ringSpacing

      // Determine rotation offset for sunflower interlocking
      const ringOffset = k === 1
        ? -Math.PI / 2
        : -Math.PI / 2 + Math.PI / countInRing

      // Idle scale for this ring
      const idleScale = k === 1
        ? (total <= 7 ? IDLE_EDGE_SCALE : IDLE_RING1_SCALE)
        : IDLE_EDGE_SCALE

      // Place bubbles evenly spaced around the full 360 degrees
      for (let j = 0; j < countInRing; j++) {
        const angle = ringOffset + (j / countInRing) * 2 * Math.PI
        rawPositions.push({
          member: otherMembers[memberIndex],
          ring: k,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          initialScale: idleScale,
          isLead: false,
        })
        memberIndex++
      }
    }

    // Re-center on centroid so cluster is centered at (0, 0)
    let sumX = 0
    let sumY = 0
    rawPositions.forEach(p => {
      sumX += p.x
      sumY += p.y
    })
    const cx = sumX / total
    const cy = sumY / total

    const nodes: NodeState[] = rawPositions.map(p => {
      const px = Math.round((p.x - cx) * 10) / 10
      const py = Math.round((p.y - cy) * 10) / 10
      return {
        member: p.member,
        ring: p.ring,
        baseX: px,
        baseY: py,
        currentX: px,
        currentY: py,
        targetX: px,
        targetY: py,
        initialScale: p.initialScale,
        currentScale: p.initialScale,
        targetScale: p.initialScale,
        isLead: p.isLead,
      }
    })

    return { nodes, baseBubbleSize, ringSpacing, lensRadius, clusterDiameter }
  }, [members, containerSize])

  // Mutable animation state references to prevent React re-renders during RAF loop
  const nodesRef = useRef<NodeState[]>(layout.nodes)
  useEffect(() => {
    nodesRef.current = layout.nodes
  }, [layout.nodes])

  // Track DOM node elements for direct transform updates (zero layout thrashing)
  const nodeElementsRef = useRef<Map<string, HTMLDivElement>>(new Map())

  // Focal point state
  const targetFocalRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentFocalRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const isInteractingRef = useRef<boolean>(false)

  // ───────────────────────────────────────────────────────────────────────────
  // DYNAMIC HOVER CARD & SEAMLESS FISHEYE TRACKING
  // Physics runs continuously; hover card smoothly tracks active bubble in 60fps loop
  // ───────────────────────────────────────────────────────────────────────────
  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const [activeCardMember, setActiveCardMember] = useState<ActiveCardState | null>(null)
  const activeMemberIdRef = useRef<string | null>(null)

  // Open card for a member (physics continues dynamically without freezing)
  const openCardForMember = useCallback((member: TeamMemberEntity) => {
    const node = nodesRef.current.find(n => n.member.id === member.id)
    if (!node) return

    activeMemberIdRef.current = member.id

    const baseBubbleSize = layout.baseBubbleSize
    const currentScale = node.currentScale
    const renderedRadius = (baseBubbleSize * currentScale) / 2

    const cardWidth = 232
    const cardHeight = 144
    const overlap = 8

    const halfW = containerSize.width / 2
    const halfH = containerSize.height / 2

    let cardLeft: number
    let isLeftAligned = false
    if (node.currentX >= 0) {
      cardLeft = node.currentX - renderedRadius - cardWidth + overlap
      if (cardLeft < -halfW + 16) {
        cardLeft = node.currentX + renderedRadius - overlap
        isLeftAligned = false
      } else {
        isLeftAligned = true
      }
    } else {
      cardLeft = node.currentX + renderedRadius - overlap
      if (cardLeft + cardWidth > halfW - 16) {
        cardLeft = node.currentX - renderedRadius - cardWidth + overlap
        isLeftAligned = true
      } else {
        isLeftAligned = false
      }
    }

    let cardTop = node.currentY - cardHeight / 2
    const minTop = -halfH + 16
    const maxTop = halfH - cardHeight - 16
    cardTop = Math.max(minTop, Math.min(maxTop, cardTop))

    setActiveCardMember({
      member,
      left: Math.round(cardLeft),
      top: Math.round(cardTop),
      isLeftAligned,
    })
  }, [layout.baseBubbleSize, containerSize])

  // Close card
  const closeCard = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current)
      hoverIntentTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setActiveCardMember(null)
    activeMemberIdRef.current = null
  }, [])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // PHYSICS ENGINE: Radial Fisheye Distortion (Continuous 60FPS fluid motion)
  // ───────────────────────────────────────────────────────────────────────────
  const updatePhysics = useCallback(() => {
    const nodes = nodesRef.current
    if (nodes.length <= 1) return

    const baseBubbleSize = layout.baseBubbleSize
    const lensRadius = layout.lensRadius

    // Ease focal point toward cursor (or back to center on leave)
    const focalLerp = isInteractingRef.current ? FOCAL_EASING_SPEED : 0.08
    currentFocalRef.current.x += (targetFocalRef.current.x - currentFocalRef.current.x) * focalLerp
    currentFocalRef.current.y += (targetFocalRef.current.y - currentFocalRef.current.y) * focalLerp

    const fx = currentFocalRef.current.x
    const fy = currentFocalRef.current.y

    // Radial distortion from focal point
    if (!isInteractingRef.current && Math.abs(fx) < 0.5 && Math.abs(fy) < 0.5) {
      // At true idle: target is pure un-distorted concentric circular lattice
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        node.targetX = node.baseX
        node.targetY = node.baseY
        node.targetScale = node.initialScale
      }
    } else {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const dx = node.baseX - fx
        const dy = node.baseY - fy
        const dist = Math.sqrt(dx * dx + dy * dy)

        let scale = HOVER_MIN_SCALE
        let dispMagnitude = 0

        if (dist < lensRadius) {
          const u = dist / lensRadius
          const falloff = 0.5 * (1 + Math.cos(u * Math.PI))
          scale = HOVER_MIN_SCALE + (HOVER_MAX_SCALE - HOVER_MIN_SCALE) * falloff
          dispMagnitude = (scale - HOVER_MIN_SCALE) * DISPLACEMENT_FACTOR * (1 - u) * lensRadius
        }

        node.targetScale = scale

        if (dist > 0.001) {
          node.targetX = node.baseX + (dx / dist) * dispMagnitude
          node.targetY = node.baseY + (dy / dist) * dispMagnitude
        } else {
          node.targetX = node.baseX
          node.targetY = node.baseY
        }
      }
    }

    // Clamp inside container bounds and Lerp smoothly
    const boundsHalfW = containerSize.width * 0.46
    const boundsHalfH = containerSize.height * 0.44

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const nodeR = (baseBubbleSize * node.targetScale) / 2
      node.targetX = Math.max(-boundsHalfW + nodeR, Math.min(boundsHalfW - nodeR, node.targetX))
      node.targetY = Math.max(-boundsHalfH + nodeR, Math.min(boundsHalfH - nodeR, node.targetY))

      node.currentX += (node.targetX - node.currentX) * LERP_SPEED
      node.currentY += (node.targetY - node.currentY) * LERP_SPEED
      node.currentScale += (node.targetScale - node.currentScale) * LERP_SPEED

      // Direct transform update
      const el = nodeElementsRef.current.get(node.member.id)
      if (el) {
        const tx = Math.round(node.currentX * 10) / 10
        const ty = Math.round(node.currentY * 10) / 10
        const sc = Math.round(node.currentScale * 1000) / 1000
        el.style.transform = `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), 0px) scale(${sc})`
      }
    }

    // Smoothly track active bubble with hover card during full cursor travel
    if (activeMemberIdRef.current && cardRef.current) {
      const activeNode = nodes.find(n => n.member.id === activeMemberIdRef.current)
      if (activeNode) {
        const renderedRadius = (baseBubbleSize * activeNode.currentScale) / 2
        const cardWidth = 232
        const cardHeight = 144
        const overlap = 8
        const halfW = containerSize.width / 2
        const halfH = containerSize.height / 2

        let cardLeft: number
        if (activeNode.currentX >= 0) {
          cardLeft = activeNode.currentX - renderedRadius - cardWidth + overlap
          if (cardLeft < -halfW + 16) {
            cardLeft = activeNode.currentX + renderedRadius - overlap
          }
        } else {
          cardLeft = activeNode.currentX + renderedRadius - overlap
          if (cardLeft + cardWidth > halfW - 16) {
            cardLeft = activeNode.currentX - renderedRadius - cardWidth + overlap
          }
        }

        let cardTop = activeNode.currentY - cardHeight / 2
        cardTop = Math.max(-halfH + 16, Math.min(halfH - cardHeight - 16, cardTop))

        cardRef.current.style.transform = `translate3d(calc(50% + ${Math.round(cardLeft)}px), calc(50% + ${Math.round(cardTop)}px), 0px)`
      }
    }
  }, [layout, containerSize])

  // 60fps RAF Loop
  useEffect(() => {
    if (prefersReducedMotion) return

    let animId: number
    const loop = () => {
      updatePhysics()
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [updatePhysics, prefersReducedMotion])

  // Container interaction handlers: continuous distortion tracking across full cursor travel
  const handleContainerMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    isInteractingRef.current = true
    targetFocalRef.current = { x, y }
  }, [])

  const handleContainerMouseLeave = useCallback(() => {
    if (!activeMemberIdRef.current) {
      isInteractingRef.current = false
      targetFocalRef.current = { x: 0, y: 0 }
    }
  }, [])

  // Touch handlers for mobile: allows touch-action: pan-y page scrolling
  const handleContainerTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      const x = touch.clientX - rect.left - rect.width / 2
      const y = touch.clientY - rect.top - rect.height / 2

      isInteractingRef.current = true
      targetFocalRef.current = { x, y }
    }
  }, [])

  const handleContainerTouchEnd = useCallback(() => {
    if (!activeMemberIdRef.current) {
      isInteractingRef.current = false
      targetFocalRef.current = { x: 0, y: 0 }
    }
  }, [])

  // Bubble hover handlers with Intent (80ms) and Grace Delay (250ms)
  const handleMemberMouseEnter = (member: TeamMemberEntity) => {
    if (activeMemberIdRef.current === member.id) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      return
    }

    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current)
    }

    hoverIntentTimerRef.current = setTimeout(() => {
      openCardForMember(member)
    }, HOVER_INTENT_DELAY_MS)
  }

  const handleMemberMouseLeave = (member: TeamMemberEntity) => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current)
      hoverIntentTimerRef.current = null
    }

    if (activeMemberIdRef.current === member.id) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      closeTimerRef.current = setTimeout(() => {
        closeCard()
      }, CLOSE_GRACE_DELAY_MS)
    }
  }

  // Card hover handlers: keep open while pointer is on the card
  const handleCardMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    // Keep focal point smoothly focused on the active member while interacting with the card
    if (activeMemberIdRef.current) {
      const node = nodesRef.current.find(n => n.member.id === activeMemberIdRef.current)
      if (node) {
        targetFocalRef.current = { x: node.baseX, y: node.baseY }
      }
    }
  }

  const handleCardMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      closeCard()
    }, CLOSE_GRACE_DELAY_MS)
  }

  // Touch & Click handler: on tap, open card; tap outside closes
  const handleBubbleClick = (member: TeamMemberEntity) => {
    if (activeMemberIdRef.current === member.id) {
      onSelectMember(member)
    } else {
      openCardForMember(member)
    }
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      closeCard()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      closeCard()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('')
  }

  return (
    <div
      className="w-full relative select-none font-sans"
      onKeyDown={handleKeyDown}
    >
      {/* ── Fixed-Size Responsive Container (touch-action: pan-y preserves vertical scroll) ── */}
      <div
        ref={containerRef}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
        onTouchMove={handleContainerTouchMove}
        onTouchEnd={handleContainerTouchEnd}
        onClick={handleContainerClick}
        style={{ touchAction: 'pan-y' }}
        className="w-full h-[min(70vh,660px)] min-h-[460px] rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm relative overflow-hidden ft-dotted-grid flex items-center justify-center cursor-crosshair focus:outline-hidden"
        role="region"
        aria-label="Interactive Team Bubble Grid"
      >
        {/* Soft Ambient Radial Glow Behind the Cluster */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-300 z-5"
          style={{
            left: '50%',
            top: '50%',
            width: `${layout.clusterDiameter * 1.08}px`,
            height: `${layout.clusterDiameter * 1.08}px`,
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(107, 70, 193, 0.08) 0%, rgba(235, 94, 40, 0.05) 55%, transparent 72%)',
          }}
        />

        {/* Faint Concentric Circular Guides (Visualizes True Round Outline) */}
        {layout.nodes.length > 1 && (
          <>
            <div
              className="absolute rounded-full pointer-events-none z-5 transition-all duration-300"
              style={{
                left: '50%',
                top: '50%',
                width: `${layout.clusterDiameter}px`,
                height: `${layout.clusterDiameter}px`,
                transform: 'translate(-50%, -50%)',
                border: '1px dashed rgba(107, 70, 193, 0.16)',
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none z-5 transition-all duration-300"
              style={{
                left: '50%',
                top: '50%',
                width: `${layout.ringSpacing * 2}px`,
                height: `${layout.ringSpacing * 2}px`,
                transform: 'translate(-50%, -50%)',
                border: '1px dotted rgba(235, 94, 40, 0.12)',
              }}
            />
          </>
        )}

        {/* Soft edge vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 68%, rgba(227,224,230,0.45) 92%, rgba(227,224,230,0.85) 100%)',
          }}
        />

        {/* Member Count Badge (Top Right) */}
        <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[var(--bg-surface)]/95 border border-[var(--border-hairline)] shadow-xs text-xs pointer-events-none">
          <span className="text-[10px] font-bold text-[var(--accent-purple)] uppercase flex items-center gap-1.5 font-mono">
            <Users className="w-3 h-3" />
            <span>{members.length} {members.length === 1 ? 'Member' : 'Members'}</span>
          </span>
        </div>

        {/* ── Transformed Plane: Render Bubble Avatars (Centered at 50%, 50%) ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {layout.nodes.map(node => {
            const { member, isLead } = node
            const isHovered = activeCardMember?.member.id === member.id

            return (
              <div
                key={member.id}
                ref={el => {
                  if (el) nodeElementsRef.current.set(member.id, el)
                  else nodeElementsRef.current.delete(member.id)
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${layout.baseBubbleSize}px`,
                  height: `${layout.baseBubbleSize}px`,
                  transform: `translate3d(calc(-50% + ${node.currentX}px), calc(-50% + ${node.currentY}px), 0px) scale(${node.currentScale})`,
                  willChange: 'transform',
                  zIndex: isHovered ? 80 : isLead ? 30 : 20,
                }}
                tabIndex={0}
                role="button"
                aria-label={`${member.name}, ${member.role}`}
                onMouseEnter={() => handleMemberMouseEnter(member)}
                onMouseLeave={() => handleMemberMouseLeave(member)}
                onClick={() => handleBubbleClick(member)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openCardForMember(member)
                  }
                }}
                className="group select-none pointer-events-auto cursor-pointer focus:outline-hidden"
              >
                {/* Circular Avatar Bubble Tile */}
                <div
                  className={`w-full h-full rounded-full p-[2.5px] transition-shadow duration-150 shadow-md ${
                    isLead
                      ? 'bg-gradient-to-tr from-[var(--accent-orange)] via-[var(--accent-purple)] to-[var(--accent-orange)] shadow-lg ring-2 ring-[var(--accent-orange)]/50'
                      : isHovered
                      ? 'bg-gradient-to-tr from-[var(--accent-orange)] to-[var(--accent-purple)] shadow-xl ring-2 ring-[var(--accent-orange)]/60'
                      : 'bg-[var(--bg-surface)] border-2 border-[var(--border-hairline)] hover:border-[var(--accent-orange)]'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[var(--accent-purple)] relative flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold font-mono select-none">
                      {getInitials(member.name)}
                    </span>
                    {member.image && (
                      <img
                        src={member.image}
                        alt={`${member.name} - ${member.role}`}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        loading="lazy"
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Dedicated Sibling Hover Card Layer (Never clipped, zero dead zone) ── */}
        <div className="absolute inset-0 pointer-events-none z-50">
          <AnimatePresence>
            {activeCardMember && (
              <div
                ref={cardRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: `translate3d(calc(50% + ${activeCardMember.left}px), calc(50% + ${activeCardMember.top}px), 0px)`,
                  width: '232px',
                  pointerEvents: 'auto',
                  zIndex: 90,
                  willChange: 'transform',
                }}
                onMouseMove={e => e.stopPropagation()}
              >
                <motion.div
                  key={activeCardMember.member.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  className="p-3.5 rounded-[6px] bg-[var(--bg-surface)]/98 backdrop-blur-md border border-[var(--border-hairline)] shadow-2xl text-left cursor-default hover:border-[var(--accent-orange)] transition-colors relative"
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Invisible Hover-Bridge Extension to guarantee 100% gapless mouse travel */}
                  <div
                    className="absolute inset-y-0 pointer-events-auto"
                    style={{
                      [activeCardMember.isLeftAligned ? 'right' : 'left']: '-16px',
                      width: '20px',
                    }}
                    aria-hidden="true"
                  />

                  {/* Role Badge */}
                  <div className="text-[9.5px] font-mono font-bold text-[var(--accent-orange)] uppercase tracking-wider mb-0.5">
                    {activeCardMember.member.role}
                  </div>

                  {/* Name */}
                  <div className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight font-head">
                    {activeCardMember.member.name}
                  </div>

                  {/* Department */}
                  <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5 line-clamp-1">
                    {activeCardMember.member.department}
                  </div>

                  {/* Research Focus */}
                  {activeCardMember.member.researchFocus && (
                    <div className="mt-1.5 text-[10px] font-medium text-[var(--accent-purple)] bg-[var(--accent-purple-light)] py-0.5 px-2 rounded-[2px] leading-tight line-clamp-2">
                      {activeCardMember.member.researchFocus}
                    </div>
                  )}

                  {/* Tenure */}
                  {activeCardMember.member.tenure && (
                    <div className="text-[10px] text-[var(--text-subtle)] font-mono mt-1">
                      Tenure: {activeCardMember.member.tenure}
                    </div>
                  )}

                  {/* Actions (LinkedIn, Email, View Card) */}
                  <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-[var(--border-hairline)]">
                    <div className="flex items-center gap-1.5">
                      {activeCardMember.member.hasLinkedIn() && (
                        <a
                          href={activeCardMember.member.getLinkedInUrl()!}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn Profile"
                          onClick={e => e.stopPropagation()}
                          className="w-6.5 h-6.5 rounded-[2px] bg-[var(--bg-page)] hover:bg-[var(--accent-orange)] text-[var(--text-muted)] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <LinkedinIcon className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {activeCardMember.member.hasEmail() && (
                        <a
                          href={activeCardMember.member.getEmailFallback()!}
                          title="Email member"
                          onClick={e => e.stopPropagation()}
                          className="w-6.5 h-6.5 rounded-[2px] bg-[var(--bg-page)] hover:bg-[var(--accent-purple)] text-[var(--text-muted)] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <Mail className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMember(activeCardMember.member)
                        closeCard()
                      }}
                      className="text-[10.5px] font-semibold text-[var(--accent-orange)] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Card</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AppleWatchCluster
