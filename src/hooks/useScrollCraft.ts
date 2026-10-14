/**
 * useScrollCraft — Thin React wrapper around the scroll-craft library.
 *
 * Usage:
 *   const sc = useScrollCraft()
 *   useEffect(() => {
 *     sc.reveal('.my-class', { delay: 100 })
 *     sc.counter('[data-count]', { duration: 1400 })
 *   }, [sc])
 *
 * The hook automatically calls sc.destroy() on unmount so all
 * IntersectionObservers and scroll listeners are cleaned up.
 */
import { useEffect, useRef } from 'react'
import { ScrollCraft } from 'scroll-craft'

export function useScrollCraft() {
  const scRef = useRef<ScrollCraft | null>(null)

  if (!scRef.current) {
    scRef.current = new ScrollCraft()
  }

  useEffect(() => {
    const sc = scRef.current!
    return () => {
      sc.destroy()
      scRef.current = new ScrollCraft() // fresh instance on re-mount
    }
  }, [])

  return scRef.current
}
