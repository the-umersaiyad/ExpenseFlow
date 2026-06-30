"use client"

import React, { useEffect, useRef } from "react"
import { animate, stagger } from "animejs"

export function AnimeFadeUp({
  children,
  delay = 0,
  stagger: staggerAmount = 100,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  stagger?: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.children

    animate(elements, {
      y: [20, 0],
      opacity: [0, 1],
      ease: "outExpo",
      duration: 800,
      delay: stagger(staggerAmount, { start: delay }),
    })
  }, [delay, staggerAmount])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
